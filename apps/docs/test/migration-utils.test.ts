import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applyThemePatch, defaultTheme } from '@btdesign/tokens';
import { parseMigrationAudit, parseThemeImport } from '../src/studio/migration-utils.ts';
import { auditProject } from '../../../scripts/migrate-audit.mjs';

test('Ant theme imports only recognized values and reports lossy conversion', () => {
  const result = parseThemeImport(
    JSON.stringify({
      theme: {
        token: {
          colorPrimary: '#abc',
          borderRadius: 30.2,
          fontFamily: 'Inter, sans-serif',
          boxShadow: 'none',
        },
      },
    }),
  );
  assert.equal(result.format, 'Ant Design JSON');
  assert.deepEqual(result.patch, { primary: '#AABBCC', radius: 20, font: 'inter' });
  assert.equal(result.mappings[0].source, 'theme.token.colorPrimary');
  assert.equal(result.mappings[0].before, '"#abc"');
  assert.equal(result.mappings[0].after, '"#AABBCC"');
  assert.ok(result.warnings.some((item) => item.includes('boxShadow')));
  assert.ok(result.warnings.some((item) => item.includes('30') || item.includes('20')));
  assert.ok(result.warnings.some((item) => item.includes('字体预设')));
  assert.ok(!('name' in result.patch));
  assert.ok(!('density' in result.patch));
});

test('Ant enterprise tokens map light semantic colors and both control heights before apply', () => {
  const result = parseThemeImport(
    JSON.stringify({
      token: {
        colorPrimary: '#2563EB',
        borderRadius: 12,
        colorBgBase: '#F9FAF7',
        colorText: '#202520',
        controlHeight: 40,
      },
    }),
  );
  assert.deepEqual(result.patch, {
    primary: '#2563EB',
    radius: 12,
    semantic: { light: { background: '#F9FAF7', text: '#202520' } },
    components: { button: { height: 40 }, input: { height: 40 } },
  });
  assert.equal(result.mappings.length, 6);
  assert.deepEqual(
    result.mappings
      .filter((item) => item.source === 'token.controlHeight')
      .map((item) => item.target),
    ['components.button.height', 'components.input.height'],
  );
  assert.ok(result.warnings.some((item) => item.includes('仅映射到浅色模式')));
  assert.equal(result.patch.semantic?.dark, undefined);
  assert.ok(!result.warnings.some((item) => item.includes('未识别')));
});

test('Ant semantic-only config preserves existing dark colors, component radius and unrelated overrides on merge', () => {
  const result = parseThemeImport(
    JSON.stringify({
      theme: {
        token: {
          colorBgBase: '#fff',
          colorBgContainer: '#fafafa',
          colorText: '#123456',
          colorTextSecondary: '#678',
          colorBorder: '#abc',
          controlHeight: 44,
          colorBgElevated: '#fff',
        },
      },
    }),
  );
  assert.equal(result.format, 'Ant Design JSON');
  assert.deepEqual(result.patch.semantic, {
    light: {
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#123456',
      muted: '#667788',
      border: '#AABBCC',
    },
  });
  assert.ok(result.warnings.some((item) => item.includes('theme.token.colorBgElevated 未识别')));
  const base = {
    ...defaultTheme,
    semantic: { dark: { background: '#101010', text: '#FFFFFF' } },
    components: { button: { radius: 5 }, input: { radius: 3 }, card: { padding: 24 } },
  };
  const merged = applyThemePatch(base, result.patch);
  assert.deepEqual(merged.semantic?.dark, base.semantic.dark);
  assert.deepEqual(merged.components, {
    button: { radius: 5, height: 44 },
    input: { radius: 3, height: 44 },
    card: { padding: 24 },
  });
  const locked = applyThemePatch(base, result.patch, { locked: ['semantic', 'components'] });
  assert.deepEqual(locked.semantic, base.semantic);
  assert.deepEqual(locked.components, base.components);
});

test('Ant control heights are bounded and unsafe semantic/height values stay unapplied', () => {
  const bounded = parseThemeImport('{"controlHeight":80}');
  assert.deepEqual(bounded.patch, {
    components: { button: { height: 56 }, input: { height: 56 } },
  });
  assert.equal(bounded.warnings.filter((item) => item.includes('已调整为 56')).length, 1);
  const invalid = parseThemeImport(
    JSON.stringify({
      token: {
        colorPrimary: '#123456',
        colorBgBase: 'url(javascript:alert(1))',
        colorText: '#1234',
        controlHeight: '40px',
      },
    }),
  );
  assert.deepEqual(invalid.patch, { primary: '#123456' });
  assert.ok(invalid.warnings.some((item) => item.includes('colorBgBase 未导入')));
  assert.ok(invalid.warnings.some((item) => item.includes('colorText 未导入')));
  assert.equal(invalid.warnings.filter((item) => item.includes('controlHeight 未导入')).length, 1);
});

test('BTDESIGN JSON retains semantic modes and component overrides, never imports incoming lock policy', () => {
  const result = parseThemeImport(
    JSON.stringify({
      schemaVersion: 1,
      theme: {
        name: ' Company ',
        primary: '#123456',
        semantic: {
          light: { background: '#fff', border: 'url(javascript:alert(1))' },
          dark: { text: '#eee' },
        },
        components: { button: { height: 2 }, card: { padding: 40 } },
      },
      policy: { locked: [] },
    }),
  );
  assert.deepEqual(result.patch, {
    name: 'Company',
    primary: '#123456',
    semantic: { light: { background: '#FFFFFF' }, dark: { text: '#EEEEEE' } },
    components: { button: { height: 28 }, card: { padding: 40 } },
  });
  assert.ok(result.warnings.some((item) => item.includes('锁定')));
  assert.ok(result.warnings.some((item) => item.includes('border')));
  assert.equal('policy' in result.patch, false);
  assert.equal('radius' in result.patch, false);
});

test('CSS declarations map exact values and disclose light-mode scope and unknown tokens', () => {
  const result = parseThemeImport(
    ':root { /* brand */ --primary: #156; --radius: 6.5px; --background:#fff; --foreground:#123456; --unknown: 12px; }',
  );
  assert.deepEqual(result.patch, {
    primary: '#115566',
    radius: 7,
    semantic: { light: { background: '#FFFFFF', text: '#123456' } },
  });
  assert.deepEqual(
    result.mappings.find((row) => row.source === '--radius'),
    { source: '--radius', target: 'radius', before: '"6.5px"', after: '7' },
  );
  assert.ok(result.warnings.some((item) => item.includes('--unknown')));
  assert.ok(result.warnings.some((item) => item.includes('浅色')));
});

test('unsupported colors, custom fonts, empty config, JS source and malformed CSS cannot become theme fields', () => {
  for (const input of [
    '',
    '{}',
    '[]',
    'export default { primary: "#123456" }',
    '{"primary":"url(javascript:alert(1))"}',
    '{"fontFamily":"Custom Company Font"}',
    ':root { --primary: #fff; } .dark { --primary: #000; }',
    '--primary: #fff; alert(1)',
    '--primary: #fff; --f-primary: #000;',
    '{"schemaVersion":2,"primary":"#123456"}',
    'x'.repeat(65537),
  ])
    assert.throws(() => parseThemeImport(input), undefined, input.slice(0, 80));
  const result = parseThemeImport(
    '{"__proto__":{"polluted":true},"primary":"#123456","onClick":"alert(1)"}',
  );
  assert.deepEqual(result.patch, { primary: '#123456' });
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.ok(result.warnings.some((item) => item.includes('__proto__')));
  assert.ok(result.warnings.some((item) => item.includes('onClick')));
});

test('browser report parser accepts actual CLI reports and their five status types', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'btdesign-report-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(
    path.join(root, 'App.tsx'),
    "import { Button, Table, DatePicker } from 'antd';\nimport 'antd/dist/reset.css';\nconst lazy = import('antd');\nthrow new Error('must not run');",
  );
  await fs.writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ dependencies: { antd: '^6.0.0' } }),
  );
  const report = await auditProject(root, 'react');
  const parsed = parseMigrationAudit(JSON.stringify(report));
  assert.deepEqual(parsed, report);
  assert.equal(parsed.summary.scannedFiles, 1);
  assert.equal(parsed.findings.length, 5);
  for (const status of ['candidate', 'partial', 'unsupported', 'unresolved', 'infrastructure'])
    assert.ok(parsed.findings.some((row) => row.status === status));
});

test('report validation rejects invented success states, altered counts and malformed record types', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'btdesign-invalid-report-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, 'App.tsx'), "import { Button } from 'antd';");
  const original = await auditProject(root, 'react');
  const mutations = [
    (r: typeof original) => {
      r.mode = 'migrated';
    },
    (r: typeof original) => {
      r.framework = ['react'];
    },
    (r: typeof original) => {
      r.summary.candidate = 100;
    },
    (r: typeof original) => {
      r.summary.importFindings = 0;
    },
    (r: typeof original) => {
      r.findings[0].automaticReplacement = true;
    },
    (r: typeof original) => {
      r.findings[0].status = 'success';
    },
    (r: typeof original) => {
      r.findings[0].target = ['Button'];
    },
    (r: typeof original) => {
      r.findings[0].target = 'DatePicker';
    },
    (r: typeof original) => {
      r.findings[0].line = 0;
    },
    (r: typeof original) => {
      r.findings[0].issues = [{ html: '<script>alert(1)</script>' }];
    },
    (r: typeof original) => {
      r.generatedAt = 'not a date';
    },
  ];
  for (const mutate of mutations) {
    const modified = structuredClone(original);
    mutate(modified);
    assert.throws(() => parseMigrationAudit(JSON.stringify(modified)), /格式不匹配/);
  }
  assert.throws(() => parseMigrationAudit('{}'));
  assert.throws(() => parseMigrationAudit('export default {}'));
  assert.throws(() => parseMigrationAudit('x'.repeat(2 * 1024 * 1024 + 1)), /2 MiB/);
});

test('a zero-finding report remains valid data without suggesting migration completion', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'btdesign-empty-report-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(
    path.join(root, 'App.vue'),
    '<template><el-button>Save</el-button></template>',
  );
  const result = parseMigrationAudit(JSON.stringify(await auditProject(root, 'vue')));
  assert.equal(result.findings.length, 0);
  assert.ok(result.warnings.some((item) => item.includes('自动导入')));
  assert.ok(result.limitations.some((item) => item.includes('未检测到导入不代表迁移完成')));
});

test('granular component geometry imports from JSON and CSS without resetting other rules', () => {
  const json = parseThemeImport(
    JSON.stringify({
      components: {
        field: { gap: 10, labelSize: 14 },
        table: { cellPadding: 16, rowHeight: 60 },
      },
    }),
  );
  assert.deepEqual(json.patch.components, {
    field: { gap: 10, labelSize: 14 },
    table: { cellPadding: 16, rowHeight: 60 },
  });
  assert.deepEqual(json.warnings, []);
  const css = parseThemeImport(
    ':root { --f-field-gap: 10px; --f-table-cell-padding: 16px; --f-table-row-height: 60px; }',
  );
  assert.deepEqual(css.patch.components, {
    field: { gap: 10 },
    table: { cellPadding: 16, rowHeight: 60 },
  });
  const bounded = parseThemeImport('--f-field-label-size: 99px;');
  assert.equal(bounded.patch.components?.field?.labelSize, 16);
  assert.equal(bounded.warnings.length, 1);
});

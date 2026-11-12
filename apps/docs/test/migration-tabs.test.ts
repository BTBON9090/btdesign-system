import test from 'node:test';
import assert from 'node:assert/strict';
import { parseThemeImport } from '../src/studio/migration-utils';
import { applyThemePatch, createTheme, defaultTheme, themeToCSS } from '@btdesign/tokens';

const expected = { minHeight: 40, paddingInline: 20, gap: 8, fontSize: 16, iconGap: 10 };
const declarations =
  '--f-tabs-min-height:40px;--f-tabs-padding-inline:20px;--f-tabs-gap:8px;--f-tabs-font-size:16px;--f-tabs-icon-gap:10px;';
test('Tabs fields are discovered from geometry for JSON and CSS with identical values', () => {
  const json = parseThemeImport(JSON.stringify({ components: { tabs: expected } }));
  const css = parseThemeImport(`:root { ${declarations} }`);
  assert.deepEqual(json.patch.components?.tabs, expected);
  assert.deepEqual(css.patch.components, json.patch.components);
  assert.deepEqual(json.warnings, []);
  assert.deepEqual(css.warnings, []);
  assert.equal(css.mappings.length, 5);
  assert.deepEqual(
    css.mappings.map((m) => m.target),
    Object.keys(expected).map((key) => `components.tabs.${key}`),
  );
  const updated = applyThemePatch(defaultTheme, css.patch);
  assert.equal(createTheme(updated)['--f-tabs-min-height'], '40px');
  assert.deepEqual(
    applyThemePatch(defaultTheme, css.patch, { locked: ['components'] }),
    defaultTheme,
  );
});
test('Tabs CSS values clamp identically and unsupported or duplicate declarations fail safely', () => {
  const result = parseThemeImport(
    '--f-tabs-min-height:0px;--f-tabs-padding-inline:99px;--f-tabs-gap:-1px;--f-tabs-font-size:99px;--f-tabs-icon-gap:99px;',
  );
  assert.deepEqual(result.patch.components?.tabs, {
    minHeight: 24,
    paddingInline: 32,
    gap: 0,
    fontSize: 20,
    iconGap: 16,
  });
  assert.equal(result.warnings.length, 5);
  assert.throws(() => parseThemeImport('--f-tabs-gap:8px;--f-tabs-gap:9px;'), /重复定义/);
  const partial = parseThemeImport('--f-tabs-gap:1rem;--f-tabs-font-size:16px;');
  assert.deepEqual(partial.patch.components?.tabs, { fontSize: 16 });
  assert.match(partial.warnings[0], /尺寸需使用 px/);
});
test('full generated stylesheet is not accepted, but a single root block of tokens imports', () => {
  const theme = applyThemePatch(defaultTheme, { components: { tabs: expected } });
  const css = themeToCSS(theme);
  assert.throws(() => parseThemeImport(css), /仅提供变量声明|暂不导入选择器/);
  const extracted = `:root { ${Object.entries(createTheme(theme))
    .filter(([key]) => key.startsWith('--f-tabs-'))
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')} }`;
  assert.deepEqual(parseThemeImport(extracted).patch.components?.tabs, expected);
});

test('steps sizes import explicitly; inherited CSS warns instead of silently overwriting an existing rule', () => {
  const explicit = parseThemeImport('--f-steps-standard-marker:44px;');
  assert.equal(explicit.patch.components?.steps?.markerSize, 44);
  const inherited = parseThemeImport('--f-button-height:50px;--f-steps-standard-marker:initial;');
  assert.equal(inherited.patch.components?.button?.height, 50);
  assert.equal(inherited.patch.components?.steps, undefined);
  assert.match(inherited.warnings.join(' '), /不会清除现有覆盖/);
});

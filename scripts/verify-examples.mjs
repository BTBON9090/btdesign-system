import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

// Validate the actual code delivered by the component workbench against built packages.
// No source fixtures, copied implementation assertions, network calls or package mutation.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { catalog, componentCode, defaultDemoOptions } = await tsImport(
  '../apps/docs/src/catalog.ts',
  import.meta.url,
);
const { enterpriseCatalog } = await tsImport(
  '../apps/docs/src/enterprise-catalog.ts',
  import.meta.url,
);
const enterpriseIds = new Set(enterpriseCatalog.map((component) => component.id));
const multipleIds = new Set(['toggle-group', 'tree', 'tree-select', 'cascader', 'org-picker']);
const cascadeIds = new Set(['tree', 'tree-select', 'org-picker']);
const directory = mkdtempSync(join(root, '.btdesign-examples-'));
const totals = { react: 0, vue: 0 };
function runCompiler(bin, config) {
  const result = spawnSync(process.execPath, [bin, '-p', config, '--pretty', 'false'], {
    cwd: directory,
    encoding: 'utf8',
    timeout: 120_000,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${result.stdout ?? ''}${result.stderr ?? ''}`);
}
try {
  mkdirSync(join(directory, 'react'));
  mkdirSync(join(directory, 'vue'));
  for (const component of catalog) {
    const defaults = {
      ...defaultDemoOptions,
      variant: component.id === 'alert' ? 'info' : component.id === 'badge' ? 'default' : 'primary',
    };
    const variants = [['default', defaults]];
    if (enterpriseIds.has(component.id) && component.id !== 'list')
      variants.push(['disabled', { ...defaultDemoOptions, state: 'disabled' }]);
    if (multipleIds.has(component.id))
      variants.push(['multiple', { ...defaultDemoOptions, multiple: true }]);
    if (cascadeIds.has(component.id))
      variants.push(['cascade', { ...defaultDemoOptions, multiple: true, cascade: true }]);
    if (component.id === 'data-table')
      variants.push(['loading', { ...defaultDemoOptions, state: 'loading' }]);
    for (const framework of ['react', 'vue']) {
      const seen = new Set();
      for (const [variant, options] of variants) {
        const source = componentCode(component.id, framework, options);
        assert.ok(source, `${component.id}/${framework}/${variant} must produce example code`);
        if (seen.has(source)) continue;
        seen.add(source);
        const filename = `${component.id}-${variant}.${framework === 'react' ? 'tsx' : 'vue'}`;
        writeFileSync(join(directory, framework, filename), source);
        totals[framework]++;
        if (framework === 'vue') {
          const { descriptor, errors } = parse(source, { filename });
          assert.deepEqual(errors, [], `${filename}: SFC parse`);
          assert.ok(
            descriptor.scriptSetup && descriptor.template,
            `${filename}: requires script and template`,
          );
          const id = `example-${component.id}-${variant}`;
          const script = compileScript(descriptor, { id });
          const template = compileTemplate({
            id,
            filename,
            source: descriptor.template.content,
            compilerOptions: { bindingMetadata: script.bindings },
          });
          assert.deepEqual(template.errors, [], `${filename}: template compile`);
        }
      }
    }
  }
  const compilerOptions = {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  };
  writeFileSync(
    join(directory, 'react.json'),
    JSON.stringify({
      compilerOptions: { ...compilerOptions, jsx: 'react-jsx', types: ['react'] },
      include: ['react/**/*.tsx'],
    }),
  );
  writeFileSync(
    join(directory, 'vue.json'),
    JSON.stringify({ compilerOptions, include: ['vue/**/*.vue'] }),
  );
  runCompiler(require.resolve('typescript/bin/tsc'), 'react.json');
  runCompiler(require.resolve('vue-tsc/bin/vue-tsc.js'), 'vue.json');
  console.log(
    `PASS: ${catalog.length} component families; ${totals.react} React examples and ${totals.vue} Vue SFC examples compile with strict types and no skipLibCheck.`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}

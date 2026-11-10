import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Rebuild tarballs unless the caller has just built them. Never publishes packages.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', timeout: 180_000 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed`);
}
const flags = new Set(process.argv.slice(2));
for (const flag of flags)
  assert.ok(['--skip-pack', '--offline'].includes(flag), `Unknown argument: ${flag}`);
if (!flags.has('--skip-pack')) run(npm, ['run', 'pack:libs'], root);

const downloads = join(root, 'apps/docs/public/downloads');
const manifest = JSON.parse(readFileSync(join(downloads, 'manifest.json'), 'utf8'));
const names = ['@forma-ui/tokens', '@forma-ui/react', '@forma-ui/vue'];
assert.deepEqual(
  manifest.map((entry) => entry.name).sort(),
  [...names].sort(),
  'Manifest must contain exactly the three libraries',
);
const tarballs = manifest.map((entry) => {
  assert.equal(entry.file, basename(entry.file), 'Manifest paths must be local filenames');
  assert.ok(entry.file.endsWith('.tgz'));
  return join(downloads, entry.file);
});

// Pin direct dependencies to versions installed by npm ci. A fresh CI cache may
// contain tarballs without registry metadata, so allow normal metadata resolution.
// --offline remains available for environments with a populated npm cache.
const dependencyNames = [
  'react',
  'react-dom',
  'vue',
  '@vue/server-renderer',
  'typescript',
  '@types/react',
  '@types/react-dom',
];
const dependencies = dependencyNames.map(
  (name) => `${name}@${require(`${name}/package.json`).version}`,
);
assert.match(require('react/package.json').version, /^19\./, 'Smoke project targets React 19');
assert.match(require('vue/package.json').version, /^3\./, 'Smoke project targets Vue 3');

const temp = mkdtempSync(join(tmpdir(), 'forma-package-smoke-'));
try {
  writeFileSync(
    join(temp, 'package.json'),
    JSON.stringify({ name: 'forma-isolated-consumer', private: true, type: 'module' }, null, 2),
  );
  run(
    npm,
    [
      'install',
      flags.has('--offline') ? '--offline' : '--prefer-offline',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      ...tarballs,
      ...dependencies,
    ],
    temp,
  );
  writeFileSync(
    join(temp, 'smoke.mjs'),
    `
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import * as tokens from '@forma-ui/tokens';
import * as react from '@forma-ui/react';
import * as vue from '@forma-ui/vue';

const expectedNames = ['Button','Input','Textarea','Select','Checkbox','Switch','Badge','Card','Alert','Tabs','Dialog','Avatar','Separator','Table','Skeleton','Progress'];
for (const name of expectedNames) {
  assert.ok(react[name], 'Missing React export ' + name);
  assert.ok(vue[name], 'Missing Vue export ' + name);
}
const theme = tokens.applyThemePatch(tokens.defaultTheme, { primary: '#2458B8', components: {button: {height: 44}} }, {locked: []});
assert.equal(tokens.createTheme(theme, 'dark')['--f-button-height'], '44px');
assert.match(tokens.themeToCSS(theme), /data-theme="dark"/);
assert.match(renderToStaticMarkup(createElement(react.Button, {variant: 'secondary'}, 'React package')), /f-button--secondary/);
assert.match(renderToStaticMarkup(createElement(react.Input, {value: 'React input', readOnly: true})), /value="React input"/);
assert.match(await renderToString(createSSRApp({render: () => h(vue.Button, {}, () => 'Vue package')})), /Vue package/);
assert.match(await renderToString(createSSRApp({render: () => h(vue.Input, {value: 'Vue native value'})})), /value="Vue native value"/);
const css = readFileSync(fileURLToPath(import.meta.resolve('@forma-ui/tokens/styles.css')), 'utf8');
assert.match(css, /--f-primary/);
assert.ok(css.includes('.f-dialog'));
assert.match(css, /--f-button-height/);
for (const name of ['@forma-ui/tokens', '@forma-ui/react', '@forma-ui/vue']) {
  const entryUrl = import.meta.resolve(name);
  const packageUrl = new URL('../package.json', entryUrl);
  const pkg = JSON.parse(readFileSync(packageUrl, 'utf8'));
  assert.equal(pkg.name, name);
  const declaration = readFileSync(new URL(pkg.types, packageUrl), 'utf8');
  assert.ok(declaration.length > 0, name + ' must ship declarations');
  assert.equal(pkg.exports['.'].types, pkg.types, name + ' must expose declarations through exports');
  if (name !== '@forma-ui/tokens') {
    assert.equal(pkg.dependencies['@forma-ui/tokens'], ${JSON.stringify(manifest.find((entry) => entry.name === '@forma-ui/tokens').version)});
    const probe = new URL('__forma-smoke.mjs', packageUrl);
    writeFileSync(probe, 'export { defaultTheme } from "@forma-ui/tokens";');
    assert.equal((await import(probe.href)).defaultTheme, tokens.defaultTheme, 'All adapters must share the local token package');
  }
}
console.log('PASS: 16 React + 16 Vue exports, SSR, native input values, token overrides, CSS export, declarations, shared local token dependency.');
`,
  );
  writeFileSync(
    join(temp, 'smoke.tsx'),
    `
import { createElement, type CSSProperties } from 'react';
import { h } from 'vue';
import { Button, Input, type ButtonProps } from '@forma-ui/react';
import { Button as VueButton, Input as VueInput } from '@forma-ui/vue';
import { createTheme, applyThemePatch, defaultTheme, type ThemeConfig, type ThemePolicy } from '@forma-ui/tokens';
import '@forma-ui/tokens/styles.css';

const policy: ThemePolicy = {locked: ['primary']};
const theme: ThemeConfig = applyThemePatch(defaultTheme, {components: {button: {height: 44}}}, policy);
const style = createTheme(theme, 'dark') as CSSProperties;
const buttonProps: ButtonProps = {variant: 'secondary', size: 'sm'};
const reactExample = <section style={style}><Button {...buttonProps}>React</Button><Input value="test" readOnly /></section>;
const vueExample = h(VueButton, {variant: 'secondary'}, () => 'Vue');
const vueInput = h(VueInput, {modelValue: 'test', 'onUpdate:modelValue': (value: string) => { void value; }});
void [createElement, reactExample, vueExample, vueInput];
`,
  );
  writeFileSync(
    join(temp, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        },
        include: ['smoke.tsx'],
      },
      null,
      2,
    ),
  );
  run(process.execPath, ['smoke.mjs'], temp);
  run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], temp);
  console.log('PASS: clean consumer typecheck without skipLibCheck.');
  console.log('Verified dependency versions:', dependencies.join(', '));
} finally {
  rmSync(temp, { recursive: true, force: true });
}

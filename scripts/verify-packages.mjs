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
const names = ['@btdesign/tokens', '@btdesign/react', '@btdesign/vue'];
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
import * as tokens from '@btdesign/tokens';
import * as react from '@btdesign/react';
import * as vue from '@btdesign/vue';

const expectedNames = ['Button','Input','Textarea','Select','Checkbox','Switch','Badge','Card','Alert','Tabs','Dialog','Avatar','Separator','Table','Skeleton','Progress','Field','InputGroup','InputAddon','RadioGroup','NumberInput','Breadcrumb','Pagination','EmptyState','Spinner','CardHeader','CardTitle','CardDescription','CardContent','CardFooter','TableCaption','TableHeader','TableBody','TableFooter','TableRow','TableHead','TableCell'];
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
const reactField = renderToStaticMarkup(createElement(react.Field, {id: 'react-budget', label: '预算', description: '每月限额', error: '请确认预算', required: true}, createElement(react.InputGroup, {}, createElement(react.InputAddon, {}, '¥'), createElement(react.NumberInput, {name: 'budget', value: 12.5, min: 0, max: 20, step: 0.5, controlSize: 'sm'}))));
assert.match(reactField, /for="react-budget"/);
assert.match(reactField, /aria-describedby="react-budget-description react-budget-error"/);
assert.match(reactField, /aria-invalid="true"/);
assert.match(reactField, /value="12.5"/);
assert.match(reactField, /f-control--sm/);
const vueField = await renderToString(createSSRApp({render: () => h(vue.Field, {id: 'vue-budget', label: '预算', description: '每月限额', error: '请确认预算', required: true}, {default: () => h(vue.InputGroup, {}, {default: () => [h(vue.InputAddon, {}, () => '¥'), h(vue.NumberInput, {name: 'budget', modelValue: 12.5, min: 0, max: 20, step: 0.5, controlSize: 'sm'})]})})}));
assert.match(vueField, /for="vue-budget"/);
assert.match(vueField, /aria-describedby="vue-budget-description vue-budget-error"/);
assert.match(vueField, /aria-invalid="true"/);
assert.match(vueField, /value="12.5"/);
assert.match(vueField, /f-control--sm/);
assert.match(renderToStaticMarkup(createElement(react.Pagination, {page: 2, total: 35, pageSize: 10})), /aria-current="page"/);
assert.match(await renderToString(createSSRApp({render: () => h(vue.Pagination, {page: 2, total: 35, pageSize: 10})})), /aria-current="page"/);
const reactTable = renderToStaticMarkup(createElement(react.Table, {}, createElement(react.TableCaption, {}, '成员'), createElement(react.TableHeader, {}, createElement(react.TableRow, {}, createElement(react.TableHead, {}, '姓名'))), createElement(react.TableBody, {}, createElement(react.TableRow, {}, createElement(react.TableCell, {}, '林晓')))));
assert.match(reactTable, /<caption[^>]*>成员/);
assert.match(reactTable, /scope="col"/);
const vueTable = await renderToString(createSSRApp({render: () => h(vue.Table, {}, {default: () => [h(vue.TableCaption, {}, () => '成员'), h(vue.TableHeader, {}, () => h(vue.TableRow, {}, () => h(vue.TableHead, {}, () => '姓名'))), h(vue.TableBody, {}, () => h(vue.TableRow, {}, () => h(vue.TableCell, {}, () => '林晓')))]})}));
assert.match(vueTable, /<caption[^>]*>成员/);
assert.match(vueTable, /scope="col"/);
const css = readFileSync(fileURLToPath(import.meta.resolve('@btdesign/tokens/styles.css')), 'utf8');
assert.match(css, /--f-primary/);
assert.ok(css.includes('.f-dialog'));
assert.match(css, /--f-button-height/);
for (const selector of ['.f-field', '.f-input-group', '.f-number-input', '.f-pagination']) assert.ok(css.includes(selector), 'Missing shared style ' + selector);
for (const name of ['@btdesign/tokens', '@btdesign/react', '@btdesign/vue']) {
  const entryUrl = import.meta.resolve(name);
  const packageUrl = new URL('../package.json', entryUrl);
  const pkg = JSON.parse(readFileSync(packageUrl, 'utf8'));
  assert.equal(pkg.name, name);
  const declaration = readFileSync(new URL(pkg.types, packageUrl), 'utf8');
  assert.ok(declaration.length > 0, name + ' must ship declarations');
  assert.equal(pkg.exports['.'].types, pkg.types, name + ' must expose declarations through exports');
  if (name !== '@btdesign/tokens') {
    assert.equal(pkg.dependencies['@btdesign/tokens'], ${JSON.stringify(manifest.find((entry) => entry.name === '@btdesign/tokens').version)});
    const probe = new URL('__forma-smoke.mjs', packageUrl);
    writeFileSync(probe, 'export { defaultTheme } from "@btdesign/tokens";');
    assert.equal((await import(probe.href)).defaultTheme, tokens.defaultTheme, 'All adapters must share the local token package');
  }
}
console.log('PASS: ' + expectedNames.length + ' exports per framework, composed Field/Table SSR, numeric inputs, pagination, token overrides, CSS, declarations and shared local token dependency.');
`,
  );
  writeFileSync(
    join(temp, 'smoke.tsx'),
    `
import { createElement, type CSSProperties } from 'react';
import { h } from 'vue';
import { Button, Input, Field, InputGroup, InputAddon, NumberInput, Pagination, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell, type ButtonProps, type NumberInputProps, type PaginationProps } from '@btdesign/react';
import { Button as VueButton, Input as VueInput, Field as VueField, InputGroup as VueInputGroup, InputAddon as VueInputAddon, NumberInput as VueNumberInput, Pagination as VuePagination, Card as VueCard, CardHeader as VueCardHeader, CardTitle as VueCardTitle, CardDescription as VueCardDescription, CardContent as VueCardContent, CardFooter as VueCardFooter, Table as VueTable, TableCaption as VueTableCaption, TableHeader as VueTableHeader, TableBody as VueTableBody, TableRow as VueTableRow, TableHead as VueTableHead, TableCell as VueTableCell } from '@btdesign/vue';
import { createTheme, applyThemePatch, defaultTheme, type ThemeConfig, type ThemePolicy } from '@btdesign/tokens';
import '@btdesign/tokens/styles.css';

const policy: ThemePolicy = {locked: ['primary']};
const theme: ThemeConfig = applyThemePatch(defaultTheme, {components: {button: {height: 44}}}, policy);
const style = createTheme(theme, 'dark') as CSSProperties;
const buttonProps: ButtonProps = {variant: 'secondary', size: 'sm'};
const reactExample = <section style={style}><Button {...buttonProps}>React</Button><Input value="test" readOnly /></section>;
const vueExample = h(VueButton, {variant: 'secondary'}, () => 'Vue');
const vueInput = h(VueInput, {modelValue: 'test', 'onUpdate:modelValue': (value: string) => { void value; }});
const numberProps: NumberInputProps = {value: 12.5, min: 0, max: 20, step: 0.5, controlSize: 'sm', onValueChange: next => { const result: number | '' = next; void result; }};
const paginationProps: PaginationProps = {page: 2, total: 35, pageSize: 10, onPageChange: page => { const result: number = page; void result; }};
const reactComposition = <Card><CardHeader><CardTitle>预算</CardTitle><CardDescription>团队配置</CardDescription></CardHeader><CardContent><Field id="budget" label="预算" description="每月额度" error="请确认" required><InputGroup><InputAddon>¥</InputAddon><NumberInput {...numberProps} /></InputGroup></Field><Input size={24} controlSize="lg" invalid /></CardContent><CardFooter><Pagination {...paginationProps} /></CardFooter></Card>;
const reactTable = <Table><TableCaption>成员</TableCaption><TableHeader><TableRow><TableHead scope="col">姓名</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={2}>林晓</TableCell></TableRow></TableBody></Table>;
const vueComposition = h(VueCard, {}, {default: () => [h(VueCardHeader, {}, () => [h(VueCardTitle, {}, () => '预算'), h(VueCardDescription, {}, () => '团队配置')]), h(VueCardContent, {}, () => h(VueField, {id: 'budget', label: '预算', description: '每月额度', error: '请确认', required: true}, () => h(VueInputGroup, {}, () => [h(VueInputAddon, {}, () => '¥'), h(VueNumberInput, {modelValue: 12.5, min: 0, max: 20, step: 0.5, controlSize: 'sm', 'onUpdate:modelValue': (next: number | '') => { void next; }})]))), h(VueCardFooter, {}, () => h(VuePagination, {page: 2, total: 35, pageSize: 10, 'onUpdate:page': (page: number) => { void page; }}))]});
const vueTable = h(VueTable, {}, () => [h(VueTableCaption, {}, () => '成员'), h(VueTableHeader, {}, () => h(VueTableRow, {}, () => h(VueTableHead, {scope: 'col'}, () => '姓名'))), h(VueTableBody, {}, () => h(VueTableRow, {}, () => h(VueTableCell, {colSpan: 2}, () => '林晓')))]);
void [createElement, reactExample, vueExample, vueInput, reactComposition, reactTable, vueComposition, vueTable];
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

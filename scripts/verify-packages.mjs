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
const names = ['@btdesign/engine', '@btdesign/tokens', '@btdesign/react', '@btdesign/vue'];
assert.deepEqual(
  manifest.map((entry) => entry.name).sort(),
  [...names].sort(),
  'Manifest must contain exactly the four libraries',
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
import * as engine from '@btdesign/engine';
import * as react from '@btdesign/react';
import * as vue from '@btdesign/vue';

const expectedNames = ['Button','Input','Textarea','Select','Checkbox','Switch','Badge','Card','Alert','Tabs','Dialog','Avatar','Separator','Table','Skeleton','Progress','Field','InputGroup','InputAddon','RadioGroup','NumberInput','Breadcrumb','Pagination','EmptyState','Spinner','CardHeader','CardTitle','CardDescription','CardContent','CardFooter','TableCaption','TableHeader','TableBody','TableFooter','TableRow','TableHead','TableCell','Form','FormField','FormSection','FormActions','Calendar','DatePicker','DateRangePicker','Radio','CheckboxGroup','ToggleGroup','Segmented','ButtonGroup','List','ListItem','ListItemContent','ListItemActions','FileList','Tree','TreeSelect','Cascader','OrgPicker','Transfer','SidebarNav','TopNav','DropdownMenu','DataTable','AvatarGroup','PasswordInput','SearchInput','Slider','TimePicker','Collapse','Tag','Descriptions','Timeline','Comment','InputTag','Steps','Statistic','Tooltip','AutoComplete','Image','Carousel','PageHeader','Rate','Anchor','Popover','Mention','BackTop','Upload','ResizeBox'];
for (const name of expectedNames) {
  assert.ok(react[name], 'Missing React export ' + name);
  assert.ok(vue[name], 'Missing Vue export ' + name);
}
assert.deepEqual(Object.keys(react).sort(), [...expectedNames].sort(), 'React public component exports');
assert.deepEqual(Object.keys(vue).sort(), [...expectedNames, 'BTDESIGNPlugin'].sort(), 'Vue public component exports and plugin');
assert.equal(expectedNames.length, 88);
assert.equal(engine.parseDate('2026-02-30'), null);
assert.equal(engine.addMonths('2024-01-31', 1), '2024-02-29');
assert.deepEqual(engine.validateValues({email: ''}, {email: {required: true}}), {email: '请填写此项'});
const theme = tokens.applyThemePatch(tokens.defaultTheme, { primary: '#2458B8', components: {button: {height: 44}, tree: {rowHeight: 48}, calendar: {cellSize: 40}, form: {gap: 24}} }, {locked: []});
assert.equal(tokens.createTheme(theme, 'dark')['--f-button-height'], '44px');
assert.equal(tokens.createTheme(theme, 'dark')['--f-tree-row-height'], '48px');
assert.equal(tokens.createTheme(theme, 'light')['--f-calendar-cell-size'], '40px');
assert.equal(tokens.createTheme(theme, 'light')['--f-form-gap'], '24px');
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
const nodes = [{key:'company',label:'公司',children:[{key:'lin',label:'林晓'},{key:'alex',label:'Alex'}]}];
const columns = [{key:'name',title:'名称'},{key:'metrics',title:'指标',children:[{key:'budget',title:'预算',sortable:true},{key:'status',title:'状态'}]}];
const rows = [{id:'d1',name:'设计',budget:20,status:'active',children:[{id:'p1',name:'品牌升级',budget:10,status:'active'}]}];
const reactForm = renderToStaticMarkup(createElement(react.Form, {initialValues:{email:'team@example.com'}}, createElement(react.FormSection,{title:'成员资料'},createElement(react.FormField,{name:'email',label:'工作邮箱',required:true,type:'email'}),createElement(react.FormActions,{},createElement(react.Button,{type:'submit'},'提交')))));
const vueForm = await renderToString(createSSRApp({render:()=>h(vue.Form,{initialValues:{email:'team@example.com'}},()=>h(vue.FormSection,{title:'成员资料'},()=>[h(vue.FormField,{name:'email',label:'工作邮箱',required:true,type:'email'}),h(vue.FormActions,{},()=>h(vue.Button,{type:'submit'},()=> '提交'))]))}));
for (const markup of [reactForm,vueForm]) { assert.match(markup, /<form/); assert.match(markup, /<fieldset/); assert.match(markup, /value="team@example.com"/); assert.match(markup, /type="submit"/); }
for (const markup of [renderToStaticMarkup(createElement(react.Calendar,{month:'2026-11',value:'2026-11-10'})), await renderToString(createSSRApp({render:()=>h(vue.Calendar,{month:'2026-11',modelValue:'2026-11-10'})}))]) { assert.match(markup,/role="grid"/); assert.match(markup,/2026-11-10/); }
for (const markup of [renderToStaticMarkup(createElement(react.Tree,{nodes,multiple:true,cascade:true,value:['lin'],expandedKeys:['company']})),await renderToString(createSSRApp({render:()=>h(vue.Tree,{nodes,multiple:true,cascade:true,modelValue:['lin'],expandedKeys:['company']})}))]) { assert.match(markup,/role="tree"/); assert.match(markup,/aria-checked="mixed"/); assert.match(markup,/林晓/); }
for (const markup of [renderToStaticMarkup(createElement(react.DataTable,{columns,data:rows,caption:'企业预算',expandedKeys:['d1'],selectable:true,searchable:true})),await renderToString(createSSRApp({render:()=>h(vue.DataTable,{columns,data:rows,caption:'企业预算',expandedKeys:['d1'],selectable:true,searchable:true})}))]) { assert.match(markup,/<caption[^>]*>企业预算/); assert.match(markup,/colspan="2"/i); assert.match(markup,/rowspan="2"/i); assert.match(markup,/品牌升级/); }
const css = readFileSync(fileURLToPath(import.meta.resolve('@btdesign/tokens/styles.css')), 'utf8');
assert.match(css, /--f-primary/);
assert.ok(css.includes('.f-dialog'));
assert.match(css, /--f-button-height/);
for (const selector of ['.f-field', '.f-input-group', '.f-number-input', '.f-pagination', '.f-form', '.f-calendar', '.f-tree', '.f-data-table']) assert.ok(css.includes(selector), 'Missing shared style ' + selector);
for (const name of ['@btdesign/engine', '@btdesign/tokens', '@btdesign/react', '@btdesign/vue']) {
  const entryUrl = import.meta.resolve(name);
  const packageUrl = new URL('../package.json', entryUrl);
  const pkg = JSON.parse(readFileSync(packageUrl, 'utf8'));
  assert.equal(pkg.name, name);
  const declaration = readFileSync(new URL(pkg.types, packageUrl), 'utf8');
  assert.ok(declaration.length > 0, name + ' must ship declarations');
  assert.equal(pkg.exports['.'].types, pkg.types, name + ' must expose declarations through exports');
  if (name === '@btdesign/engine') assert.deepEqual(Object.keys(pkg.dependencies ?? {}), [], 'The engine must not depend on rendering frameworks or tokens');
  if (name === '@btdesign/react' || name === '@btdesign/vue') {
    assert.equal(pkg.dependencies['@btdesign/tokens'], ${JSON.stringify(manifest.find((entry) => entry.name === '@btdesign/tokens').version)});
    assert.equal(pkg.dependencies['@btdesign/engine'], ${JSON.stringify(manifest.find((entry) => entry.name === '@btdesign/engine').version)});
    const probe = new URL('__forma-smoke.mjs', packageUrl);
    writeFileSync(probe, 'export { defaultTheme } from "@btdesign/tokens"; export { validateValues } from "@btdesign/engine";');
    assert.equal((await import(probe.href)).defaultTheme, tokens.defaultTheme, 'All adapters must share the local token package');
    assert.equal((await import(probe.href)).validateValues, engine.validateValues, 'All adapters must share the local engine package');
  }
}
console.log('PASS: ' + expectedNames.length + ' exports per framework, Form/Calendar/Tree/DataTable SSR, engine behavior, token overrides, CSS, declarations and shared engine/token dependencies.');
`,
  );
  writeFileSync(
    join(temp, 'smoke.tsx'),
    `
import { createElement, type CSSProperties } from 'react';
import { h } from 'vue';
import { Button, Input, Field, InputGroup, InputAddon, NumberInput, Pagination, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell, type ButtonProps, type NumberInputProps, type PaginationProps } from '@btdesign/react';
import { Button as VueButton, Input as VueInput, Field as VueField, InputGroup as VueInputGroup, InputAddon as VueInputAddon, NumberInput as VueNumberInput, Pagination as VuePagination, Card as VueCard, CardHeader as VueCardHeader, CardTitle as VueCardTitle, CardDescription as VueCardDescription, CardContent as VueCardContent, CardFooter as VueCardFooter, Table as VueTable, TableCaption as VueTableCaption, TableHeader as VueTableHeader, TableBody as VueTableBody, TableRow as VueTableRow, TableHead as VueTableHead, TableCell as VueTableCell } from '@btdesign/vue';
import { Form, FormField, FormSection, FormActions, Calendar, DatePicker, Tree, DataTable } from '@btdesign/react';
import { Form as VueForm, FormField as VueFormField, Calendar as VueCalendar, DatePicker as VueDatePicker, Tree as VueTree, DataTable as VueDataTable } from '@btdesign/vue';
import { validateValues, parseDate, type FormValues, type FormRules, type TreeNode, type DataColumn } from '@btdesign/engine';
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
const rules: FormRules = {email: [{required:true},{type:'email'}]};
const nodes: TreeNode[] = [{key:'company',label:'公司',children:[{key:'lin',label:'林晓'}]}];
const columns: DataColumn[] = [{key:'name',title:'名称'},{key:'metrics',title:'指标',children:[{key:'budget',title:'预算',sortable:true}]}];
const rows = [{id:'p1',name:'品牌规范',budget:20}];
const reactEnterprise = <Form initialValues={{email:'team@example.com'}} rules={rules} onSubmit={(values:FormValues)=>{void values;}}><FormSection title="成员"><FormField name="email" label="邮箱" type="email" required /><FormField name="owner" label="负责人">{field=><Tree nodes={nodes} value={String(field.value ?? '')} onValueChange={field.setValue} />}</FormField></FormSection><FormActions><Button type="submit">提交</Button></FormActions></Form>;
const reactDate = <DatePicker value="2026-11-10" onValueChange={date=>{const selected:string=date;void selected;}} disabledDate={date=>date==='2026-11-11'} />;
const reactCalendar = <Calendar month="2026-11" weekStartsOn={1} />;
const reactData = <DataTable columns={columns} data={rows} selectable selectedKeys={['p1']} onSelectionChange={keys=>{const selected:string[]=keys;void selected;}} onCellChange={event=>{const changed:unknown=event.value;if(typeof changed==='string') changed.trim();}} />;
const vueEnterprise = h(VueForm, {initialValues:{email:'team@example.com'},rules,onSubmit:(values:FormValues)=>{void values;}},()=>h(VueFormField,{name:'email',label:'邮箱',type:'email',required:true}));
const vueDate = h(VueDatePicker,{modelValue:'2026-11-10','onUpdate:modelValue':(date:string)=>{void date;}});
const vueCalendar = h(VueCalendar,{month:'2026-11',weekStartsOn:1});
const vueTree = h(VueTree,{nodes,multiple:true,modelValue:['lin'],'onUpdate:modelValue':(value:string|string[])=>{void value;}});
const vueData = h(VueDataTable,{columns,data:rows,selectable:true,selectedKeys:['p1'],'onUpdate:selectedKeys':(keys:string[])=>{void keys;},'onCell-change':(event:{key:string;column:string;value:unknown})=>{if(typeof event.value==='string') event.value.trim();}});
void [validateValues,parseDate,reactEnterprise,reactDate,reactCalendar,reactData,vueEnterprise,vueDate,vueCalendar,vueTree,vueData];
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

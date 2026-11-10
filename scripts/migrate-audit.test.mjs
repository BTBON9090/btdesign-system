import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditProject, reportMarkdown } from './migrate-audit.mjs';

async function fixture(t, files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'forma-migration-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    const absolute = path.join(root, name);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, content);
  }
  return root;
}

test('AST detects aliased candidates and unsupported imports without executing code or reading comments as imports', async (t) => {
  const source = `import { Button as Action, Table, DatePicker, type ButtonProps } from 'antd';
import type { FormInstance } from 'antd';
import { DialogContent } from '@/components/ui/dialog';
// import { Upload } from 'antd';
const source = "import { Menu } from 'antd'";
throw new Error('This file must never execute');
export default () => <Action type="primary">Save</Action>;`;
  const root = await fixture(t, {
    'src/App.tsx': source,
    'package.json': JSON.stringify({ dependencies: { antd: '^6.0.0' } }),
  });
  const report = await auditProject(root, 'react');
  assert.equal(await fs.readFile(path.join(root, 'src/App.tsx'), 'utf8'), source);
  assert.equal(report.findings.length, 4);
  assert.equal(report.findings.find((item) => item.local === 'Action').target, 'Button');
  assert.equal(report.findings.find((item) => item.imported === 'Table').status, 'partial');
  assert.equal(report.findings.find((item) => item.imported === 'DatePicker').status, 'partial');
  assert.equal(report.findings.find((item) => item.imported === 'DialogContent').target, 'Dialog');
  assert.equal(report.dependencies[0].library, 'antd');
  assert.ok(report.findings.every((item) => item.automaticReplacement === false));
});

test('Vue script imports preserve source line numbers and disclose auto-import gaps', async (t) => {
  const root = await fixture(t, {
    'src/Page.vue': `<template>\n<el-button>Save</el-button>\n</template>\n<script setup lang="ts">\nimport { ElButton, ElDatePicker } from 'element-plus';\nimport { Switch } from '@arco-design/web-vue';\n</script>`,
  });
  const report = await auditProject(root, 'vue');
  assert.equal(report.findings.find((item) => item.imported === 'ElButton').line, 5);
  assert.equal(report.findings.find((item) => item.imported === 'ElButton').target, 'Button');
  assert.equal(report.findings.find((item) => item.imported === 'ElDatePicker').status, 'partial');
  assert.ok(report.warnings.some((item) => item.includes('自动导入')));
});

test('namespace, deep, require, re-export, style and dynamic imports are reported', async (t) => {
  const root = await fixture(t, {
    'src/imports.tsx': `import * as Antd from 'antd';
import Button from 'antd/es/button';
import 'antd/dist/reset.css';
const { Switch: Toggle } = require('@arco-design/web-react');
export { Modal } from 'ant-design-vue';
const lazy = import('antd');
const example = <Antd.Input />;`,
  });
  const report = await auditProject(root, 'react');
  assert.ok(report.findings.some((item) => item.local === 'Antd.Input' && item.target === 'Input'));
  assert.ok(
    report.findings.some((item) => item.source === 'antd/es/button' && item.target === 'Button'),
  );
  assert.ok(report.findings.some((item) => item.status === 'infrastructure'));
  assert.ok(report.findings.some((item) => item.local === 'Toggle' && item.target === 'Switch'));
  assert.ok(
    report.findings.some(
      (item) =>
        item.kind === 're-export' &&
        item.target === 'Dialog' &&
        item.issues.some((issue) => issue.includes('--framework react')),
    ),
  );
  assert.ok(
    report.findings.some((item) => item.kind === 'dynamic-import' && item.status === 'unresolved'),
  );
});

test('ignored directories and symlinks are excluded', async (t) => {
  const root = await fixture(t, {
    'src/main.ts': "import { Input } from 'antd';",
    'node_modules/a/index.ts': "import { Table } from 'antd';",
    'dist/main.js': "import { Modal } from 'antd';",
  });
  await fs.symlink(path.join(root, 'src'), path.join(root, 'linked'));
  const report = await auditProject(root, 'react');
  assert.equal(report.summary.scannedFiles, 1);
  assert.equal(report.findings.length, 1);
  assert.equal(report.summary.skippedFiles, 1);
});

test('CLI writes requested reports, refuses overwrite and leaves source unchanged', async (t) => {
  const root = await fixture(t, { 'src/main.ts': "import { Button } from 'antd';" });
  const out = path.join(root, 'audit');
  const cli = fileURLToPath(new URL('./migrate-audit.mjs', import.meta.url));
  execFileSync(process.execPath, [cli, root, '--framework', 'react', '--out', out]);
  const report = JSON.parse(await fs.readFile(path.join(out, 'migration-report.json'), 'utf8'));
  assert.equal(report.summary.candidate, 1);
  assert.match(await fs.readFile(path.join(out, 'migration-report.md'), 'utf8'), /源项目未被修改/);
  assert.throws(
    () =>
      execFileSync(process.execPath, [cli, root, '--framework', 'react', '--out', out], {
        stdio: 'pipe',
      }),
    /报告已存在/,
  );
  assert.equal(
    await fs.readFile(path.join(root, 'src/main.ts'), 'utf8'),
    "import { Button } from 'antd';",
  );
  assert.match(reportMarkdown(report), /candidate/);
});

test('invalid framework and missing path produce failures', async () => {
  await assert.rejects(auditProject('.', 'angular'), /react 或 vue/);
  await assert.rejects(auditProject('/this-path-does-not-exist-forma-audit', 'react'));
});

test('granular migration candidates preserve explicit limits for number inputs, empty states and spinners', async (t) => {
  const source = `import { InputNumber, Empty, Spin, Pagination, Breadcrumb, Radio, Form } from 'antd';
const screen = <Form><InputNumber formatter={v => '$' + v} stringMode /><Spin spinning><Empty /></Spin><Radio.Group /><Pagination total={42} /></Form>;`;
  const root = await fixture(t, { 'src/New.tsx': source });
  const report = await auditProject(root, 'react');
  const byName = Object.fromEntries(report.findings.map((item) => [item.imported, item]));
  assert.equal(byName.InputNumber.target, 'NumberInput');
  assert.equal(byName.Empty.target, 'EmptyState');
  assert.equal(byName.Spin.target, 'Spinner');
  assert.equal(byName.Radio.target, 'Radio');
  for (const name of ['InputNumber', 'Empty', 'Spin', 'Pagination', 'Breadcrumb', 'Radio']) {
    assert.equal(byName[name].status, 'partial');
    assert.equal(byName[name].automaticReplacement, false);
  }
  assert.match(byName.InputNumber.issues.join(' '), /formatter\/parser.*stringMode/);
  assert.match(byName.Spin.issues.join(' '), /包裹内容.*delay/);
  assert.match(byName.Pagination.issues.join(' '), /数据条数而非页数/);
  assert.equal(byName.Form.target, 'Form');
  assert.equal(byName.Form.status, 'partial');
  assert.match(byName.Form.issues.join(' '), /不等价/);
  assert.equal(await fs.readFile(path.join(root, 'src/New.tsx'), 'utf8'), source);
});

test('same-name compound parts map to actual exports without claiming API compatibility', async (t) => {
  const root = await fixture(t, {
    'src/Composed.tsx': `import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { Field, FormField } from '@/components/ui/field';
import { RadioGroup } from '@/components/ui/radio-group';`,
  });
  const report = await auditProject(root, 'react');
  for (const item of report.findings) {
    assert.equal(item.target, item.imported === 'InputGroupAddon' ? 'InputAddon' : item.imported);
    assert.equal(item.status, 'partial');
    assert.equal(item.automaticReplacement, false);
    assert.ok(item.issues.length > 0);
    assert.ok(!item.issues.join(' ').includes('未导出同名子组件'));
  }
  assert.equal(report.findings.find((item) => item.imported === 'FormField').target, 'FormField');
});

test('Vue and deep imports recognize new candidate names and keep unsupported extensions honest', async (t) => {
  const root = await fixture(t, {
    'src/Page.vue': `<script setup>\nimport { ElInputNumber, ElEmpty, ElPagination, ElRadioGroup, ElFormItem } from 'element-plus';\nimport InputNumber from '@arco-design/web-vue/es/input-number';\nimport { DatePicker } from 'ant-design-vue';\n</script>`,
  });
  const report = await auditProject(root, 'vue');
  assert.equal(report.findings.filter((item) => item.target === 'NumberInput').length, 2);
  assert.equal(report.findings.find((item) => item.imported === 'ElEmpty').target, 'EmptyState');
  assert.equal(
    report.findings.find((item) => item.imported === 'ElRadioGroup').target,
    'RadioGroup',
  );
  assert.equal(report.findings.find((item) => item.imported === 'ElFormItem').target, 'FormField');
  assert.equal(report.findings.find((item) => item.imported === 'DatePicker').status, 'partial');
  assert.doesNotMatch(reportMarkdown(report), /当前 16 个/);
});

test('enterprise components are partial candidates with explicit date, form, hierarchy and upload boundaries', async (t) => {
  const root = await fixture(t, {
    'src/Enterprise.tsx': `import { Form, FormItem, DatePicker, RangePicker, Tree, TreeSelect, Cascader, Transfer, Menu, Dropdown, Upload, TimePicker } from 'antd';
import { ProTable, ProForm } from '@ant-design/pro-components';
import { FormActions, ListItem, FileList } from '@/components/ui/list';`,
  });
  const report = await auditProject(root, 'react');
  const byName = Object.fromEntries(report.findings.map((item) => [item.imported, item]));
  const targets = {
    Form: 'Form',
    FormItem: 'FormField',
    DatePicker: 'DatePicker',
    RangePicker: 'DateRangePicker',
    Tree: 'Tree',
    TreeSelect: 'TreeSelect',
    Cascader: 'Cascader',
    Transfer: 'Transfer',
    Menu: 'SidebarNav',
    Dropdown: 'DropdownMenu',
    ProTable: 'DataTable',
    ProForm: 'Form',
    FormActions: 'FormActions',
    ListItem: 'ListItem',
    FileList: 'FileList',
  };
  for (const [source, target] of Object.entries(targets)) {
    assert.equal(byName[source].target, target);
    assert.equal(byName[source].status, 'partial');
    assert.equal(byName[source].automaticReplacement, false);
  }
  assert.equal(byName.Upload.status, 'unsupported');
  assert.equal(byName.TimePicker.status, 'unsupported');
  assert.match(byName.Form.issues.join(' '), /异步校验/);
  assert.match(byName.DatePicker.issues.join(' '), /dayjs\/moment\/Date/);
  assert.match(byName.Cascader.issues.join(' '), /不是层级路径数组/);
  assert.match(byName.FileList.issues.join(' '), /不提供上传/);
  assert.match(byName.ProTable.issues.join(' '), /虚拟化.*任意单元格合并/);
});

test('actual JSX table props distinguish data-driven candidates from semantic table composition', async (t) => {
  const root = await fixture(t, {
    'src/Tables.tsx': `import { Table as Advanced } from 'antd';
import { Table } from '@/components/ui/table';
import * as Ant from 'antd';
const unused = '<Table columns={columns} />';
export const page = <><Advanced columns={columns} dataSource={rows} rowSelection={selection} virtual /><Table className="simple"><tbody /></Table><Ant.Table {...props} /></>;`,
  });
  const report = await auditProject(root, 'react');
  const advanced = report.findings.find((item) => item.local === 'Advanced');
  const simple = report.findings.find((item) => item.local === 'Table');
  const spread = report.findings.find((item) => item.local === 'Ant.Table');
  assert.equal(advanced.target, 'DataTable');
  assert.deepEqual(advanced.observedTableProps, [
    'columns',
    'dataSource',
    'rowSelection',
    'virtual',
  ]);
  assert.match(advanced.issues.join(' '), /实际使用属性/);
  assert.equal(simple.target, 'Table');
  assert.equal(simple.observedTableProps, undefined);
  assert.equal(spread.target, 'Table');
  assert.deepEqual(spread.observedTableProps, ['...props']);
  assert.ok(report.findings.every((item) => item.automaticReplacement === false));
});

test('Vue confirmed table imports inspect template binding names without inferring unresolved global tables', async (t) => {
  const root = await fixture(t, {
    'src/Tables.vue': `<template><el-table :data="rows" :tree-props="treeProps"><el-table-column prop="name" /></el-table><a-table :columns="columns" /></template>
<script setup lang="ts">import { ElTable, ElTableColumn } from 'element-plus';</script>`,
  });
  const report = await auditProject(root, 'vue');
  const table = report.findings.find((item) => item.imported === 'ElTable');
  assert.equal(table.target, 'DataTable');
  assert.deepEqual(table.observedTableProps, ['data', 'tree-props']);
  assert.equal(report.findings.length, 2);
  assert.ok(report.warnings.some((warning) => warning.includes('自动导入')));
});

test('Vue table detection skips quoted values and recognizes acronym aliases and bound expressions', async (t) => {
  const root = await fixture(t, {
    'src/Tables.vue': `<template><simple-table title="table data pagination virtual" class='columns data-source' /><a-table :data="rows.filter(row => row.score > 0)" :pagination="false" /><spread-table v-bind="props" /></template>
<script setup>import { Table as SimpleTable, Table as ATable, Table as SpreadTable } from 'ant-design-vue';</script>`,
  });
  const report = await auditProject(root, 'vue');
  const byLocal = Object.fromEntries(report.findings.map((item) => [item.local, item]));
  assert.equal(byLocal.SimpleTable.target, 'Table');
  assert.equal(byLocal.SimpleTable.observedTableProps, undefined);
  assert.equal(byLocal.ATable.target, 'DataTable');
  assert.deepEqual(byLocal.ATable.observedTableProps, ['data', 'pagination']);
  assert.equal(byLocal.SpreadTable.target, 'Table');
  assert.deepEqual(byLocal.SpreadTable.observedTableProps, ['...props']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import * as ui from '../dist/index.js';
import { formFieldRules, formValidation } from '../dist/enterprise-form-utils.js';

const nodes = [
  {
    key: 'team',
    label: '团队',
    children: [
      { key: 'design', label: '设计' },
      { key: 'dev', label: '开发' },
    ],
  },
  { key: 'archived', label: '归档', disabled: true, children: [{ key: 'old', label: '旧成员' }] },
];
const options = [
  { value: 'design', label: '设计', description: '设计规范' },
  { value: 'dev', label: '开发' },
  { value: 'admin', label: '管理员', disabled: true },
];
const columns = [
  {
    key: 'identity',
    title: '成员信息',
    children: [
      { key: 'name', title: '姓名', fixed: 'left', width: 160 },
      { key: 'score', title: '评分', sortable: true, editable: true },
    ],
  },
  {
    key: 'role',
    title: '角色',
    filterOptions: [
      { value: 'design', label: '设计' },
      { value: 'dev', label: '开发' },
    ],
  },
];
const data = [
  {
    id: '1',
    name: '团队一',
    score: 20,
    role: 'design',
    children: [{ id: '1a', name: '子成员', score: 10, role: 'dev' }],
  },
  { id: '2', name: '团队二', score: 5, role: 'dev' },
];

test('enterprise public surface contains twenty families and six composable parts', () => {
  for (const name of [
    'Form',
    'FormField',
    'FormSection',
    'FormActions',
    'Calendar',
    'DatePicker',
    'DateRangePicker',
    'Radio',
    'CheckboxGroup',
    'ToggleGroup',
    'Segmented',
    'ButtonGroup',
    'List',
    'ListItem',
    'ListItemContent',
    'ListItemActions',
    'FileList',
    'Tree',
    'TreeSelect',
    'Cascader',
    'OrgPicker',
    'Transfer',
    'SidebarNav',
    'TopNav',
    'DropdownMenu',
    'DataTable',
  ])
    assert.ok(ui[name], name);
  for (const name of [
    'AvatarGroup',
    'PasswordInput',
    'SearchInput',
    'Slider',
    'TimePicker',
    'Collapse',
  ])
    assert.ok(ui[name], name);
});
test('form adapter combines canonical rules with native invalid drafts, including nested date ids', () => {
  const errors = formValidation(
    { email: 'valid@example.com', date: '2026-11-10', count: 0 },
    { email: { type: 'email' }, count: { required: true } },
    [
      {
        name: '',
        id: 'form-date-end',
        willValidate: true,
        validity: { valid: false },
        validationMessage: '日期不可用',
      },
      {
        name: 'disabled',
        id: 'disabled',
        willValidate: false,
        validity: { valid: false },
        validationMessage: '忽略',
      },
    ],
    [['date', { id: 'form-date' }]],
  );
  assert.deepEqual(errors, { date: '日期不可用' });
  assert.equal(
    formValidation({ email: 'bad' }, { email: { type: 'email', message: '邮箱格式错误' } }, [], [])
      .email,
    '邮箱格式错误',
  );
});
test('form inferred rules retain custom messages and add email validation only once', () => {
  const explicit = [
    { required: true, message: '必填' },
    { type: 'email', message: '邮箱错误' },
  ];
  assert.deepEqual(formFieldRules(explicit, true, 'email'), explicit);
  assert.deepEqual(formFieldRules(undefined, true, 'email'), [
    { required: true },
    { type: 'email' },
  ]);
});
test('form fields preserve initial zero values, native names and inherited required rules', () => {
  const html = render(
    h(
      ui.Form,
      {
        id: 'profile',
        initialValues: { count: 0, email: 'a@example.com' },
        rules: { email: { required: true } },
      },
      h(
        ui.FormSection,
        { title: '基础资料' },
        h(ui.FormField, { name: 'count', label: '数量', type: 'number' }),
        h(ui.FormField, { name: 'email', label: '邮箱', type: 'email', description: '工作邮箱' }),
        h(ui.FormField, { name: 'department', label: '部门', type: 'select', options }),
      ),
    ),
  );
  assert.match(html, /<form[^>]*noValidate/);
  assert.match(html, /<legend>基础资料<\/legend>/);
  assert.match(html, /name="count"[^>]*value="0"/);
  assert.match(html, /id="profile-email"[^>]*required=""/);
  assert.match(html, /aria-describedby="profile-email-description"/);
  assert.match(html, /<option value="admin" disabled="">管理员<\/option>/);
});
test('form section and whole-form disabled state reach custom render controls', () => {
  const html = render(
    h(
      ui.Form,
      null,
      h(
        ui.FormSection,
        { title: '只读资料', disabled: true },
        h(ui.FormField, { name: 'custom', label: '自定义' }, (field) =>
          h('input', {
            id: field.id,
            disabled: field.disabled,
            value: String(field.value ?? ''),
            readOnly: true,
          }),
        ),
      ),
    ),
  );
  assert.match(html, /<fieldset disabled="" class="f-form-section"/);
  assert.match(html, /<input[^>]*disabled=""/);
  assert.match(
    render(h(ui.Form, { submitting: true }, h('button', { type: 'submit' }, '提交'))),
    /class="f-form-body" disabled=""/,
  );
});
test('selection button groups retain native radios/checkboxes and Field naming', () => {
  const single = render(
    h(
      ui.Field,
      { id: 'scope', label: '访问范围', disabled: true },
      h(ui.Segmented, { options, value: 'design', name: 'scope' }),
    ),
  );
  assert.match(single, /role="radiogroup"[^>]*aria-labelledby="scope-label"/);
  assert.equal((single.match(/type="radio"/g) ?? []).length, 3);
  assert.equal((single.match(/disabled=""/g) ?? []).length, 3);
  assert.match(single, /id="scope"[^>]*type="radio"/);
  const multi = render(
    h(ui.CheckboxGroup, { options, value: ['design'], name: 'roles', label: '角色' }),
  );
  assert.match(multi, /name="roles"[^>]*checked=""/);
  assert.match(multi, /aria-describedby="[^"]+-0-description"/);
  assert.match(
    render(h(ui.ToggleGroup, { options, multiple: true, value: ['dev'] })),
    /type="checkbox"/,
  );
  assert.match(
    render(h(ui.Radio, { label: '单选', defaultChecked: true, name: 'one', value: 'yes' })),
    /checked=""/,
  );
});
test('calendar renders real leap-month cells and disabled boundaries without invented dates', () => {
  const html = render(
    h(ui.Calendar, {
      month: '2024-02',
      value: '2024-02-29',
      min: '2024-02-10',
      max: '2024-02-29',
      label: '交付日期',
    }),
  );
  assert.equal((html.match(/data-calendar-day="true"/g) ?? []).length, 42);
  assert.match(html, /aria-label="2024-02-29"/);
  assert.doesNotMatch(html, /2024-02-30/);
  assert.match(html, /aria-label="2024-02-09"[^>]*disabled=""/);
  assert.match(html, /role="group" aria-label="交付日期"/);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
});
test('date picker and range expose visible names and do not duplicate Field control ids', () => {
  const single = render(
    h(
      ui.Field,
      { id: 'due', label: '交付时间', required: true },
      h(ui.DatePicker, { value: '2026-11-10', name: 'due' }),
    ),
  );
  assert.equal((single.match(/id="due"/g) ?? []).length, 1);
  assert.match(single, /aria-labelledby="due-label"/);
  assert.match(single, /name="due"/);
  const standalone = render(h(ui.DatePicker, { label: '日期', value: '2026-11-10' }));
  assert.match(standalone, /class="f-date-label">日期<\/label>/);
  const range = render(
    h(
      ui.Field,
      { id: 'period', label: '周期' },
      h(ui.DateRangePicker, { label: '周期', name: 'period', value: ['2026-11-10', '2026-11-12'] }),
    ),
  );
  assert.equal((range.match(/id="period"/g) ?? []).length, 1);
  assert.equal((range.match(/id="period-end"/g) ?? []).length, 1);
  assert.match(range, /class="f-date-label">周期开始/);
  assert.match(range, /class="f-date-label">周期结束/);
  assert.match(range, /name="period\[1\]"/);
});
test('tree exposes cascade mixed state, inherited disabled state and one keyboard stop', () => {
  const html = render(
    h(ui.Tree, {
      nodes,
      multiple: true,
      cascade: true,
      value: ['design'],
      defaultExpandedKeys: ['team', 'archived'],
      name: 'members',
    }),
  );
  assert.match(html, /data-key="team"[^>]*aria-checked="mixed"/);
  assert.match(html, /data-key="old"[^>]*aria-disabled="true"/);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
  assert.match(html, /type="hidden" name="members" value="design"/);
  assert.match(html, /aria-level="2" aria-posinset="1" aria-setsize="2"/);
});
test('tree selectors expose selected paths and hidden values while closed', () => {
  const html = render(h(ui.OrgPicker, { nodes, value: 'dev', name: 'org' }));
  assert.match(html, /团队 \/ 开发/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /role="dialog"/);
  assert.match(html, /type="hidden" name="org" value="dev"/);
  const named = render(
    h(ui.Field, { id: 'branch', label: '分支机构' }, h(ui.TreeSelect, { nodes, value: 'dev' })),
  );
  assert.match(named, /aria-labelledby="branch-label"/);
  const cascade = render(
    h(ui.Cascader, { nodes, value: ['design'], multiple: true, disabled: true, name: 'location' }),
  );
  assert.match(cascade, /团队 \/ 设计/);
  assert.match(cascade, /<input[^>]*disabled=""[^>]*name="location"/);
});
test('transfer keeps disabled choices and controlled target values in separate panels', () => {
  const html = render(h(ui.Transfer, { options, value: ['admin'], name: 'owners' }));
  assert.match(html, /aria-label="搜索待选"/);
  assert.match(html, /aria-label="搜索已选"/);
  assert.match(html, /type="hidden" name="owners" value="admin"/);
  assert.match(html, /disabled=""\/><span>管理员/);
});
test('navigation has current-page semantics and never emits unsafe destinations', () => {
  const items = [
    { key: 'home', label: '首页', href: '/home' },
    { key: 'danger', label: '危险', href: 'javascript:alert(1)' },
    {
      key: 'locked',
      label: '禁用分组',
      disabled: true,
      children: [{ key: 'child', label: '成员', href: '/private' }],
    },
  ];
  for (const Component of [ui.SidebarNav, ui.TopNav]) {
    const html = render(h(Component, { items, activeKey: 'home' }));
    assert.match(html, /href="\/home" aria-current="page"/);
    assert.doesNotMatch(html, /javascript:|href="\/private"/);
    assert.match(html, /f-nav-group-toggle" disabled=""/);
  }
  const menu = render(h(ui.DropdownMenu, { items, label: '项目操作', disabled: true }));
  assert.match(menu, /aria-haspopup="menu" aria-expanded="false"/);
  assert.doesNotMatch(menu, /role="menu"/);
});
test('table composes grouped column headers, expanded tree rows and mixed row selection', () => {
  const html = render(
    h(ui.DataTable, {
      columns,
      data,
      caption: '团队评分',
      selectable: true,
      selectedKeys: ['1'],
      expandedKeys: ['1'],
      onCellChange() {},
    }),
  );
  assert.match(html, /scope="colgroup" colSpan="2"/);
  assert.match(html, /scope="col" colSpan="1" rowSpan="2"[^>]*>角色/);
  assert.match(
    html,
    /aria-label="选择当前页全部行"[^>]*aria-checked="mixed"|aria-checked="mixed"[^>]*aria-label="选择当前页全部行"/,
  );
  assert.match(html, /data-depth="1"/);
  assert.match(html, /子成员/);
  assert.match(html, /aria-label="编辑评分 行 1a"/);
  assert.match(html, /position:sticky;left:44px/);
});
test('DataTable preserves inline expansion by default and supports a separately fixed utility column', () => {
  const base = { columns, data, selectable: true, expandedKeys: ['1'] };
  const inline = render(h(ui.DataTable, base));
  assert.doesNotMatch(inline, /aria-label="展开行"/);
  assert.match(inline, /class="f-data-table-cell"[^>]*>.*aria-label="收起行 1"/);
  const separate = render(h(ui.DataTable, { ...base, expandColumn: 'separate' }));
  assert.match(separate, /aria-label="展开行" class="f-data-table-expansion"/);
  assert.match(separate, /class="f-data-table-expansion"[^>]*>.*aria-label="收起行 1"/);
  assert.match(separate, /position:sticky;left:76px/);
  assert.match(separate, /data-depth="1"/);
});
test('DataTable fixes uniform grouped headers at their leaf boundaries and leaves mixed groups scrolling', () => {
  const columns = [
    {
      key: 'left',
      title: '左组',
      children: [
        { key: 'a', title: 'A', fixed: 'left', width: 80 },
        { key: 'b', title: 'B', fixed: 'left', width: 100 },
      ],
    },
    {
      key: 'mixed',
      title: '混合组',
      children: [
        { key: 'c', title: 'C', fixed: 'left', width: 100 },
        { key: 'd', title: 'D', width: 100 },
      ],
    },
    {
      key: 'right',
      title: '右组',
      children: [
        { key: 'e', title: 'E', fixed: 'right', width: 80 },
        { key: 'f', title: 'F', fixed: 'right', width: 96 },
      ],
    },
    { key: 'tail', title: '末列', fixed: 'right', width: 48 },
  ];
  const props = { columns, data, selectable: true, expandColumn: 'separate' };
  const group = (html, label) =>
    html.match(new RegExp(`<th[^>]*scope="colgroup"[^>]*>${label}</th>`))?.[0];
  const html = render(h(ui.DataTable, props));
  assert.match(group(html, '左组'), /position:sticky;left:76px;z-index:4/);
  assert.match(group(html, '右组'), /position:sticky;right:48px;z-index:4/);
  assert.doesNotMatch(group(html, '混合组'), /position:sticky|data-fixed=/);
  const hidden = render(h(ui.DataTable, { ...props, hiddenKeys: ['d'] }));
  assert.match(group(hidden, '混合组'), /position:sticky;left:256px;z-index:4/);
});
test('table applies controlled sort/filter and column visibility while preserving ancestors', () => {
  const sorted = render(
    h(ui.DataTable, {
      columns,
      data,
      sort: { key: 'score', direction: 'asc' },
      hiddenKeys: ['role'],
      searchable: false,
    }),
  );
  assert.ok(sorted.indexOf('团队二') < sorted.indexOf('团队一'));
  assert.doesNotMatch(sorted, /筛选角色/);
  assert.match(sorted, /aria-sort="ascending"/);
  const filtered = render(
    h(ui.DataTable, { columns, data, filters: { role: 'dev' }, pagination: false }),
  );
  assert.match(filtered, /团队一/);
  assert.match(filtered, /子成员/);
  assert.match(filtered, /aria-expanded="true"[^>]*aria-label="收起行 1"/);
});
test('DataTable preserves legacy select and opts into multiple and inclusive numeric range filters', () => {
  const filteredColumns = [
    { key: 'name', title: '名称' },
    { key: 'legacy', title: '旧筛选', filterOptions: [{ value: 'a', label: '甲' }] },
    {
      key: 'status',
      title: '状态',
      filterMode: 'multiple',
      filterOptions: [{ value: 'active', label: '活跃' }],
    },
    { key: 'score', title: '得分', filterMode: 'numberRange' },
  ];
  const rows = [
    {
      id: 'parent',
      name: '父',
      score: 99,
      status: 'active',
      children: [{ id: 'child', name: '命中', score: 0, status: 'active' }],
    },
    { id: 'other', name: '未命中', score: 1, status: 'active' },
  ];
  const html = render(
    h(ui.DataTable, {
      columns: filteredColumns,
      data: rows,
      filters: { status: ['active'] },
      numberRanges: { score: { min: 0, max: 0 } },
      pagination: false,
    }),
  );
  assert.match(html, /<select[^>]*aria-label="筛选旧筛选"/);
  assert.match(html, /aria-label="筛选状态" aria-haspopup="dialog" aria-expanded="false"/);
  assert.match(html, /aria-label="筛选得分" aria-haspopup="dialog" aria-expanded="false"/);
  assert.match(html, /命中/);
  assert.doesNotMatch(html, /未命中/);
  assert.match(html, /aria-expanded="true"[^>]*aria-label="收起行 parent"/);
});
test('loading and empty table states remain understandable without data or fake totals', () => {
  const empty = render(
    h(ui.DataTable, { columns, data: [], emptyText: '没有符合条件的成员', loading: false }),
  );
  assert.match(empty, /没有符合条件的成员/);
  assert.match(empty, /共 0 项/);
  const loading = render(h(ui.DataTable, { columns, data: [], loading: true }));
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /正在加载数据/);
});
test('file lists use semantic items, safe links and real bounded progress', () => {
  const html = render(
    h(ui.FileList, {
      files: [
        {
          id: '1',
          name: '计划.pdf',
          size: 1024,
          url: 'javascript:alert(1)',
          status: 'uploading',
          progress: 150,
        },
        { id: '2', name: '报告.csv', status: 'error', error: '网络中断' },
      ],
      onRemove() {},
      onRetry() {},
      disabled: true,
    }),
  );
  assert.match(html, /^<ul/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /max="100" value="100"/);
  assert.match(html, /网络中断/);
  assert.match(html, /aria-label="重试 报告.csv"/);
});

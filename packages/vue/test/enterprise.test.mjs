import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import * as ui from '../dist/index.js';
const render = (component, props = {}, children) =>
  renderToString(createSSRApp({ render: () => h(component, props, children) }));
function mount(component, props = {}, children) {
  let active;
  const descendants = (node) => [node, ...node.children.flatMap(descendants)];
  const make = (type, text = '') => ({
    type,
    text,
    props: {},
    children: [],
    parent: null,
    focus() {
      active = this;
    },
    contains(node) {
      return descendants(this).includes(node);
    },
    closest(selector) {
      let node = this;
      while (node) {
        if (selector === '[role="menu"]' && node.props.role === 'menu') return node;
        if (
          selector === '.f-data-table' &&
          String(node.props.class ?? '')
            .split(/\s+/)
            .includes('f-data-table')
        )
          return node;
        node = node.parent;
      }
      return null;
    },
    querySelectorAll(selector) {
      return descendants(this).filter((node) =>
        selector === 'input, select, textarea'
          ? ['input', 'select', 'textarea'].includes(node.type)
          : selector === '[id]'
            ? node.props.id
            : selector.includes('treeitem')
              ? node.props.role === 'treeitem'
              : selector.includes('menuitem')
                ? node.props.role === 'menuitem' && !node.props.disabled
                : false,
      );
    },
    querySelector(selector) {
      if (selector.includes('data-date'))
        return descendants(this).find(
          (node) => node.props['data-date'] === selector.match(/"([^"]+)"/)?.[1],
        );
      if (selector.includes('calendar-day'))
        return descendants(this).find(
          (node) => node.props['data-date'] && node.props.tabindex === 0,
        );
      return undefined;
    },
    setCustomValidity(value) {
      this.validationMessage = value;
      this.validity = { valid: !value };
    },
  });
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: (text) => make('#text', text),
    createComment: (text) => make('#comment', text),
    setText: (node, text) => (node.text = text),
    setElementText: (node, text) => {
      node.text = text;
      node.children = [];
    },
    patchProp: (node, key, _, value) => {
      node.props[key] = value;
      if (key === 'value') node.value = String(value ?? '');
      if (key === 'id') node.id = value;
      if (key === 'name') node.name = value;
      if (key === 'data-key') node.dataset = { key: value };
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
    insert(node, parent, anchor = null) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
      node.parent = parent;
    },
    remove(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    },
  });
  const root = make('root');
  const app = renderer.createApp({ render: () => h(component, props, children) });
  app.mount(root);
  return {
    app,
    all: (type) => descendants(root).filter((node) => node.type === type),
    where: (predicate) => descendants(root).filter(predicate),
    active: () => active,
  };
}
const event = (target = {}, extra = {}) => ({
  target,
  currentTarget: target,
  defaultPrevented: false,
  preventDefault() {
    this.defaultPrevented = true;
  },
  stopPropagation() {},
  ...extra,
});
const options = [
  { value: 'a', label: '设计' },
  { value: 'b', label: '开发' },
  { value: 'c', label: '锁定', disabled: true },
];
const nodes = [
  {
    key: 'team',
    label: '团队',
    children: [
      { key: 'design', label: '设计' },
      { key: 'dev', label: '研发' },
      { key: 'locked', label: '受限', disabled: true },
    ],
  },
  { key: 'other', label: '其他' },
];
const columns = [
  { key: 'name', title: '名称', rowSpan: 2, sortable: true },
  {
    key: 'details',
    title: '详情',
    children: [
      { key: 'role', title: '角色', filterOptions: options },
      { key: 'amount', title: '金额', sortable: true, editable: true },
    ],
  },
];
const data = [
  {
    id: '1',
    name: '乙',
    role: 'a',
    amount: 20,
    children: [{ id: '1-1', name: '子项目', role: 'b', amount: 5 }],
  },
  { id: '2', name: '甲', role: 'b', amount: 10 },
];

test('all enterprise components are exported and registered without internal utilities', () => {
  const names = [
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
  ];
  const registered = [];
  ui.BTDESIGNPlugin.install({
    component(name) {
      registered.push(name);
    },
  });
  assert.equal(registered.length, Object.keys(ui).length - 1);
  for (const name of names) {
    assert.ok(ui[name]);
    assert.ok(registered.includes(`F${name}`));
  }
});
test('choice groups retain native radio/checkbox semantics and disabled options', async () => {
  const checkbox = await render(ui.CheckboxGroup, {
    options,
    modelValue: ['a'],
    name: 'teams',
    label: '团队',
  });
  assert.match(checkbox, /role="group"/);
  assert.match(checkbox, /<input[^>]+type="checkbox"[^>]+name="teams"[^>]+value="a"[^>]+checked/);
  assert.match(checkbox, /<input[^>]+value="c"[^>]+disabled/);
  const segmented = await render(ui.Segmented, { options, modelValue: 'b', label: '切换视图' });
  assert.match(segmented, /role="radiogroup"/);
  assert.equal((segmented.match(/type="radio"/g) ?? []).length, 3);
});
test('choice groups update uncontrolled values, preserve controlled state and skip disabled', async () => {
  const events = [];
  const view = mount(ui.CheckboxGroup, {
    options,
    defaultValue: ['a'],
    'onUpdate:modelValue': (v) => events.push(v),
  });
  view.all('input')[1].props.onChange(event({ checked: true }));
  await nextTick();
  assert.deepEqual(events, [['a', 'b']]);
  assert.equal(view.all('input')[1].props.checked, true);
  view.all('input')[2].props.onChange(event({ checked: true }));
  assert.equal(events.length, 1);
  view.app.unmount();
  const controlled = mount(ui.ToggleGroup, {
    options,
    modelValue: 'a',
    'onUpdate:modelValue': (v) => events.push(v),
  });
  controlled.all('input')[1].props.onChange(event({ checked: true }));
  await nextTick();
  assert.equal(events.at(-1), 'b');
  assert.equal(controlled.all('input')[0].props.checked, true);
  controlled.app.unmount();
});
test('form submits only validated values, updates errors, focuses first error and resets', async () => {
  const submitted = [];
  const failed = [];
  const view = mount(
    ui.Form,
    {
      initialValues: { email: '' },
      onSubmit: (v) => submitted.push(v),
      onInvalid: (v) => failed.push(v),
    },
    () => [
      h(ui.FormField, {
        name: 'email',
        label: '邮箱',
        required: true,
        rules: [{ type: 'email', message: '请输入邮箱' }],
      }),
      h('button', { type: 'submit' }, '提交'),
    ],
  );
  view.all('form')[0].props.onSubmit(event());
  await nextTick();
  assert.equal(submitted.length, 0);
  assert.ok(failed[0].email);
  assert.equal(view.active()?.props.name, 'email');
  let input = view.all('input')[0];
  input.props.onInput(event({ value: 'bad' }));
  await nextTick();
  assert.ok(view.where((n) => n.props.role === 'alert').length);
  view.all('input')[0].props.onInput(event({ value: 'team@example.com' }));
  await nextTick();
  view.all('form')[0].props.onSubmit(event());
  assert.deepEqual(submitted, [{ email: 'team@example.com' }]);
  view.all('form')[0].props.onReset(event());
  await nextTick();
  assert.equal(view.all('input')[0].props.value, '');
  view.app.unmount();
});
test('custom FormField slot binds arbitrary controls and disabled Form prevents updates', async () => {
  const events = [];
  const view = mount(
    ui.Form,
    { initialValues: { team: 'a' }, disabled: true, 'onUpdate:modelValue': (v) => events.push(v) },
    () =>
      h(
        ui.FormField,
        { name: 'team', label: '团队' },
        {
          default: (field) =>
            h(
              'button',
              { id: field.id, disabled: field.disabled, onClick: () => field.setValue('b') },
              String(field.value),
            ),
        },
      ),
  );
  view.all('button')[0].props.onClick();
  assert.equal(events.length, 0);
  assert.equal(view.all('button')[0].text, 'a');
  assert.equal(view.all('button')[0].props.disabled, true);
  view.app.unmount();
});
test('Calendar renders a named 42-day grid and respects leap days and boundaries', async () => {
  const html = await render(ui.Calendar, {
    month: '2024-02',
    modelValue: '2024-02-29',
    min: '2024-02-10',
    max: '2024-02-29',
  });
  assert.match(html, /role="grid"/);
  assert.equal((html.match(/data-date=/g) ?? []).length, 42);
  assert.match(html, /data-date="2024-02-29"[^>]*data-selected="true"/);
  assert.match(html, /<button(?=[^>]*data-date="2024-03-01")(?=[^>]*disabled)[^>]*>/);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
});
test('Calendar selection and keyboard month navigation follow engine dates', async () => {
  const changes = [];
  const months = [];
  const view = mount(ui.Calendar, {
    month: '2024-02',
    modelValue: '2024-02-29',
    'onUpdate:modelValue': (v) => changes.push(v),
    'onUpdate:month': (v) => months.push(v),
  });
  const day = view.all('button').find((n) => n.props['data-date'] === '2024-02-29');
  day.props.onClick();
  assert.deepEqual(changes, ['2024-02-29']);
  day.props.onKeydown(event(day, { key: 'PageDown' }));
  await nextTick();
  assert.equal(months.at(-1), '2024-03');
  view.app.unmount();
});
test('date range uses distinct control IDs and ordered values', async () => {
  const html = await render(ui.Field, { id: 'period', label: '执行周期' }, () =>
    h(ui.DateRangePicker, { modelValue: ['2024-01-02', '2024-01-10'], name: 'period' }),
  );
  const ids = [...html.matchAll(/<input[^>]*id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(ids, ['period', 'period-end']);
  assert.match(html, /name="period\[0\]"/);
  assert.match(html, /name="period\[1\]"/);
});
test('tree selection exposes mixed parents, disabled descendants and hidden form values', async () => {
  const html = await render(ui.Tree, {
    nodes,
    multiple: true,
    cascade: true,
    modelValue: ['design'],
    defaultExpandedKeys: ['team'],
    name: 'members',
  });
  assert.match(
    html,
    /<div(?=[^>]*role="treeitem")(?=[^>]*aria-label="团队")(?=[^>]*aria-checked="mixed")[^>]*>/,
  );
  assert.match(html, /<div(?=[^>]*aria-label="受限")(?=[^>]*aria-disabled="true")[^>]*>/);
  assert.match(html, /<input[^>]*type="hidden"[^>]*name="members"[^>]*value="design"/);
});
test('tree cascades only selectable leaves and searching preserves selected hidden leaves', async () => {
  const changes = [];
  const view = mount(ui.Tree, {
    nodes,
    multiple: true,
    cascade: true,
    searchable: true,
    defaultExpandedKeys: ['team'],
    'onUpdate:modelValue': (v) => changes.push(v),
  });
  const item = () => view.where((n) => n.props.role === 'treeitem');
  item()
    .find((n) => n.props['data-key'] === 'team')
    .props.onClick();
  await nextTick();
  assert.deepEqual(changes.at(-1), ['design', 'dev']);
  view
    .all('input')
    .find((n) => n.props.type === 'search')
    .props.onInput(event({ value: '设计' }));
  await nextTick();
  assert.deepEqual(
    item().map((n) => n.props['data-key']),
    ['team', 'design'],
  );
  item()
    .find((n) => n.props['data-key'] === 'design')
    .props.onClick();
  await nextTick();
  assert.deepEqual(changes.at(-1), ['dev']);
  view.app.unmount();
});
test('Transfer filters visible options, moves selected values and preserves disabled target values', async () => {
  const changes = [];
  const view = mount(ui.Transfer, {
    options,
    defaultValue: ['c'],
    'onUpdate:modelValue': (v) => changes.push(v),
  });
  const checks = view.all('input').filter((n) => n.props.type === 'checkbox');
  checks
    .find((n) => n.parent?.props.class === 'f-choice-option')
    .props.onChange(event({ checked: true }));
  await nextTick();
  view
    .all('button')
    .find((n) => n.text === '移入 →')
    .props.onClick();
  await nextTick();
  assert.deepEqual(changes.at(-1), ['c', 'a']);
  assert.equal(
    view.all('input').filter((n) => n.props.type === 'checkbox' && n.props.disabled).length >= 1,
    true,
  );
  view.app.unmount();
});
test('navigation and file list reject unsafe URLs without inventing upload state', async () => {
  const nav = await render(ui.SidebarNav, {
    items: [
      { key: 'safe', label: '文档', href: '/docs' },
      { key: 'unsafe', label: '危险', href: 'javascript:alert(1)' },
    ],
    activeKey: 'safe',
  });
  assert.match(nav, /aria-current="page"/);
  assert.doesNotMatch(nav, /href="javascript/);
  const files = await render(ui.FileList, {
    files: [
      { id: 'a', name: '测试.pdf', size: 1024, status: 'uploading' },
      { id: 'b', name: '失败.txt', url: 'javascript:alert(1)', status: 'error', error: '网络错误' },
    ],
  });
  assert.match(files, /<progress/);
  assert.doesNotMatch(files, /<progress[^>]*value=/);
  assert.doesNotMatch(files, /href="javascript/);
  assert.match(files, /网络错误/);
});
test('dropdown skips disabled actions and closes after selection', async () => {
  const changes = [];
  const view = mount(ui.DropdownMenu, {
    label: '操作',
    items: [
      { key: 'a', label: '编辑' },
      { key: 'b', label: '归档', disabled: true },
    ],
    onSelect: (v) => changes.push(v),
  });
  view.all('button')[0].props.onClick();
  await nextTick();
  const menu = view.where((n) => n.props.role === 'menuitem');
  assert.equal(menu.length, 2);
  menu[1].props.onClick();
  assert.equal(changes.length, 0);
  menu[0].props.onClick();
  await nextTick();
  assert.deepEqual(changes, ['a']);
  assert.equal(view.where((n) => n.props.role === 'menu').length, 0);
  view.app.unmount();
});
test('dropdown groups, nested keyboard navigation, safe links and danger actions', async () => {
  const changes = [];
  const view = mount(ui.DropdownMenu, {
    label: '操作',
    items: [
      { key: 'group', label: '项目', group: true, children: [{ key: 'edit', label: '编辑' }] },
      { key: 'separator', label: '', separator: true },
      {
        key: 'more',
        label: '更多',
        children: [
          { key: 'safe', label: '安全链接', href: '/safe' },
          { key: 'unsafe', label: '危险地址', href: 'javascript:alert(1)' },
          { key: 'remove', label: '删除', danger: true },
        ],
      },
    ],
    onSelect: (key) => changes.push(key),
  });
  view.all('button')[0].props.onClick();
  await nextTick();
  assert.equal(view.where((node) => node.props.role === 'group')[0].props['aria-label'], '项目');
  assert.equal(view.where((node) => node.props.role === 'separator').length, 1);
  const more = view.where(
    (node) => node.props['aria-haspopup'] === 'menu' && node.props.role === 'menuitem',
  )[0];
  const right = event(more, { key: 'ArrowRight' });
  more.props.onKeydown(right);
  await nextTick();
  assert.equal(right.defaultPrevented, true);
  assert.equal(view.where((node) => node.props.role === 'menu').length, 2);
  const safe = view.where((node) => node.props.href === '/safe')[0];
  assert.equal(safe.type, 'a');
  assert.equal(view.where((node) => node.props.href?.startsWith('javascript:')).length, 0);
  const danger = view.where((node) => node.props['data-danger'])[0];
  assert.equal(danger.props.role, 'menuitem');
  const submenu = view.where((node) => node.props.role === 'menu')[1];
  const escape = event(safe, { key: 'Escape' });
  submenu.props.onKeydown(escape);
  await nextTick();
  assert.equal(escape.defaultPrevented, true);
  assert.equal(view.where((node) => node.props.role === 'menu').length, 1);
  assert.equal(view.active(), more);
  more.props.onClick();
  await nextTick();
  view.where((node) => node.props['data-danger'])[0].props.onClick();
  await nextTick();
  assert.deepEqual(changes, ['remove']);
  assert.equal(view.where((node) => node.props.role === 'menu').length, 0);
  view.app.unmount();
});
test('DataTable creates multilevel table headers and an actual expandable hierarchy', async () => {
  const html = await render(ui.DataTable, {
    columns,
    data,
    selectable: true,
    expandedKeys: ['1'],
    'onCell-change': () => {},
  });
  assert.match(html, /<th(?=[^>]*scope="colgroup")(?=[^>]*colspan="2")[^>]*>详情/);
  assert.match(html, /<th(?=[^>]*rowspan="2")[^>]*>/);
  assert.match(html, /data-row-key="1-1"/);
  assert.match(html, /aria-label="编辑 金额，行 1-1"/);
  assert.match(html, /aria-label="选择当前页"/);
});
test('DataTable keeps Vue separate expansion by default and supports inline tree controls', async () => {
  const defaults = await render(ui.DataTable, {
    columns,
    data,
    selectable: true,
    expandedKeys: ['1'],
  });
  assert.match(defaults, /aria-label="展开行" class="f-data-table-expansion"/);
  const inline = await render(ui.DataTable, {
    columns,
    data,
    selectable: true,
    expandedKeys: ['1'],
    expandColumn: 'inline',
  });
  assert.doesNotMatch(inline, /aria-label="展开行" class="f-data-table-expansion"/);
  assert.match(inline, /class="f-data-table-tree-cell"[^>]*>.*aria-label="收起行 1"/);
  assert.match(inline, /data-row-key="1-1"/);
  const view = mount(ui.DataTable, { columns, data, selectable: true, expandColumn: 'inline' });
  const toggle = view.all('button').find((node) => node.props['aria-label'] === '展开行 1');
  toggle.props.onClick();
  await nextTick();
  assert.ok(view.where((node) => node.props['data-row-key'] === '1-1').length);
  view.app.unmount();
});
test('DataTable fixes uniform grouped headers at their leaf boundaries and leaves mixed groups scrolling', async () => {
  const grouped = [
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
  const props = { columns: grouped, data, selectable: true };
  const group = (html, label) =>
    html.match(new RegExp(`<th[^>]*scope="colgroup"[^>]*>${label}(?:<!---->)?</th>`))?.[0];
  const html = await render(ui.DataTable, props);
  assert.match(group(html, '左组'), /position:sticky;left:76px;z-index:4/);
  assert.match(group(html, '右组'), /position:sticky;right:48px;z-index:4/);
  assert.doesNotMatch(group(html, '混合组'), /position:sticky|data-fixed=/);
  const hidden = await render(ui.DataTable, { ...props, hiddenKeys: ['d'] });
  assert.match(group(hidden, '混合组'), /position:sticky;left:256px;z-index:4/);
});
test('DataTable keeps utility columns narrow and recomputes fixed offsets when columns are hidden', async () => {
  const layoutColumns = [
    { key: 'name', title: '名称', fixed: 'left', width: 120 },
    {
      key: 'details',
      title: '详情',
      children: [
        { key: 'role', title: '角色', fixed: 'left' },
        { key: 'amount', title: '金额', width: 220 },
      ],
    },
    { key: 'action', title: '操作', fixed: 'right', width: 80 },
    { key: 'status', title: '状态', fixed: 'right', width: 96 },
  ];
  const view = mount(ui.DataTable, { columns: layoutColumns, data, selectable: true });
  const rowCells = () => view.all('tr').find((node) => node.props['data-row-key'] === '1').children;
  const hide = async (title) => {
    view
      .all('input')
      .find(
        (node) =>
          node.parent?.type === 'label' &&
          node.parent.children.some((child) => child.text === title),
      )
      .props.onChange(event({ checked: false }));
    await nextTick();
  };
  assert.deepEqual(
    view.all('col').map((node) => node.props.style.width),
    ['44px', '32px', '120px', '140px', undefined, '80px', '96px'],
  );
  assert.deepEqual(view.all('table')[0].props.style, {
    tableLayout: 'fixed',
    minWidth: '732px',
    width: '100%',
  });
  assert.deepEqual(
    rowCells()
      .slice(0, 4)
      .map((node) => node.props.style.left),
    ['0px', '44px', '76px', '196px'],
  );
  assert.equal(rowCells()[5].props.style.right, '96px');
  assert.equal(rowCells()[6].props.style.right, '0px');
  await hide('角色');
  assert.equal(view.all('table')[0].props.style.minWidth, '592px');
  assert.deepEqual(
    view.all('col').map((node) => node.props.style.width),
    ['44px', '32px', '120px', undefined, '80px', '96px'],
  );
  await hide('金额');
  assert.deepEqual(view.all('table')[0].props.style, {
    tableLayout: 'fixed',
    minWidth: '372px',
    width: '372px',
  });
  assert.equal(rowCells()[2].props.style.left, '76px');
  view.app.unmount();
});
test('DataTable sorts, filters and selects the visible page rather than hidden roots', async () => {
  const selections = [];
  const view = mount(ui.DataTable, {
    columns,
    data,
    selectable: true,
    searchable: true,
    pageSize: 1,
    'onUpdate:selectedKeys': (v) => selections.push(v),
  });
  view
    .all('button')
    .find((n) => n.children.some((c) => c.text === '金额'))
    .props.onClick();
  await nextTick();
  assert.equal(view.all('tr').find((n) => n.props['data-row-key'])?.props['data-row-key'], '2');
  view
    .all('input')
    .find((n) => n.props['aria-label'] === '选择当前页')
    .props.onChange(event({ checked: true }));
  assert.deepEqual(selections.at(-1), ['2']);
  view
    .all('input')
    .find((n) => n.props.type === 'search')
    .props.onInput(event({ value: '子项目' }));
  await nextTick();
  assert.deepEqual(
    view
      .all('tr')
      .filter((n) => n.props['data-row-key'])
      .map((n) => n.props['data-row-key']),
    ['1', '1-1'],
  );
  view.app.unmount();
});
test('DataTable multi-select draft searches without losing hidden choices, and cancel does not commit', async () => {
  const changes = [];
  const view = mount(ui.DataTable, {
    columns: [
      { key: 'name', title: '名称' },
      {
        key: 'status',
        title: '状态',
        filterMode: 'multiple',
        filterOptions: [
          { value: 'a', label: '活跃' },
          { value: 'b', label: '暂停' },
        ],
      },
    ],
    data: [
      { id: '1', name: '项目甲', status: 'a' },
      { id: '2', name: '项目乙', status: 'b' },
    ],
    filters: { status: ['a'] },
    'onUpdate:filters': (value) => changes.push(value),
  });
  const trigger = () => view.all('button').find((node) => node.props['aria-label'] === '筛选状态');
  const byText = (label) => view.all('button').find((node) => node.text === label);
  const optionChecks = () =>
    view.all('input').filter((node) => {
      let parent = node.parent;
      while (parent && parent.props.role !== 'dialog') parent = parent.parent;
      return node.props.type === 'checkbox' && parent;
    });
  trigger().props.onClick();
  await nextTick();
  let search = view.all('input').find((node) => node.props['aria-label'] === '搜索状态选项');
  search.props.onInput(event({ value: '暂停' }));
  await nextTick();
  let checks = optionChecks();
  assert.equal(checks.length, 1);
  checks[0].props.onChange(event({ checked: true }));
  await nextTick();
  byText('取消').props.onClick();
  await nextTick();
  assert.deepEqual(changes, []);
  trigger().props.onClick();
  await nextTick();
  search = view.all('input').find((node) => node.props['aria-label'] === '搜索状态选项');
  search.props.onInput(event({ value: '暂停' }));
  await nextTick();
  checks = optionChecks();
  assert.equal(checks[0].props.checked, false);
  checks[0].props.onChange(event({ checked: true }));
  await nextTick();
  byText('确定').props.onClick();
  await nextTick();
  assert.deepEqual(changes, [{ status: ['a', 'b'] }]);
  assert.deepEqual(
    view.where((node) => node.props['data-row-key']).map((node) => node.props['data-row-key']),
    ['1'],
  );
  view.app.unmount();
});
test('DataTable range validates drafts, commits zero inclusively and retains tree paths', async () => {
  const changes = [];
  const view = mount(ui.DataTable, {
    columns: [
      { key: 'name', title: '名称' },
      { key: 'score', title: '得分', filterMode: 'numberRange' },
    ],
    data: [
      {
        id: 'parent',
        name: '父项',
        score: 99,
        children: [{ id: 'child', name: '命中', score: 0 }],
      },
      { id: 'other', name: '其他', score: 2 },
    ],
    'onUpdate:numberRanges': (value) => changes.push(value),
  });
  const find = (label) =>
    view.all('button').find((node) => node.props['aria-label'] === label || node.text === label);
  find('筛选得分').props.onClick();
  await nextTick();
  const min = view.all('input').find((node) => node.props['aria-label'] === '得分最小值');
  const max = view.all('input').find((node) => node.props['aria-label'] === '得分最大值');
  min.props.onInput(event({ value: '2', validity: { badInput: false } }));
  max.props.onInput(event({ value: '0', validity: { badInput: false } }));
  await nextTick();
  assert.equal(find('确定').props.disabled, true);
  find('确定').props.onClick();
  assert.deepEqual(changes, []);
  min.props.onInput(event({ value: '0', validity: { badInput: false } }));
  await nextTick();
  find('确定').props.onClick();
  await nextTick();
  assert.deepEqual(changes, [{ score: { min: 0, max: 0 } }]);
  assert.deepEqual(
    view.where((node) => node.props['data-row-key']).map((node) => node.props['data-row-key']),
    ['parent', 'child'],
  );
  assert.equal(find('收起行 parent').props.disabled, true);
  view.app.unmount();
});

test('Form respects disabled sections, inherited required rules and automatic email validation', async () => {
  const submitted = [];
  const failed = [];
  const view = mount(
    ui.Form,
    {
      rules: { email: { required: true } },
      onSubmit: (v) => submitted.push(v),
      onInvalid: (v) => failed.push(v),
    },
    () => [
      h(ui.FormSection, { title: '已锁定', disabled: true }, () =>
        h(ui.FormField, { name: 'locked', label: '锁定字段', required: true }),
      ),
      h(ui.FormField, { name: 'email', label: '邮箱', type: 'email' }),
    ],
  );
  assert.equal(view.all('input').find((n) => n.props.name === 'locked').props.disabled, true);
  assert.equal(view.all('input').find((n) => n.props.name === 'email').props.required, true);
  view
    .all('input')
    .find((n) => n.props.name === 'email')
    .props.onInput(event({ value: 'invalid' }));
  await nextTick();
  view.all('form')[0].props.onSubmit(event());
  await nextTick();
  assert.ok(failed[0].email);
  assert.equal(failed[0].locked, undefined);
  view
    .all('input')
    .find((n) => n.props.name === 'email')
    .props.onInput(event({ value: 'test@example.com' }));
  await nextTick();
  view.all('form')[0].props.onSubmit(event());
  assert.equal(submitted.length, 1);
  view.app.unmount();
});
test('DatePicker rejects impossible dates and preserves controlled value after refused changes', async () => {
  const changes = [];
  const view = mount(ui.DatePicker, {
    modelValue: '2024-02-01',
    label: '交付日期',
    'onUpdate:modelValue': (v) => changes.push(v),
  });
  let input = view.all('input')[0];
  input.value = '2024-02-30';
  input.props.onInput(event(input));
  await nextTick();
  view.all('input')[0].props.onBlur();
  await nextTick();
  assert.equal(changes.length, 0);
  assert.equal(view.all('input')[0].props['aria-invalid'], true);
  assert.match(view.all('input')[0].validationMessage, /YYYY-MM-DD/);
  input = view.all('input')[0];
  input.value = '2024-02-29';
  input.props.onInput(event(input));
  await nextTick();
  view.all('input')[0].props.onBlur();
  await nextTick();
  assert.deepEqual(changes, ['2024-02-29']);
  assert.equal(view.all('input')[0].value, '2024-02-01');
  assert.equal(view.all('label')[0].text, '交付日期');
  view.app.unmount();
});
test('Form validates actual custom-control draft validity instead of stale canonical values', async () => {
  const submitted = [];
  const failures = [];
  const view = mount(
    ui.Form,
    {
      initialValues: { date: '2024-02-01' },
      onSubmit: (v) => submitted.push(v),
      onInvalid: (v) => failures.push(v),
    },
    () =>
      h(
        ui.FormField,
        { name: 'date', label: '日期' },
        {
          default: (field) =>
            h(ui.DatePicker, {
              id: field.id,
              modelValue: field.value,
              'onUpdate:modelValue': field.setValue,
            }),
        },
      ),
  );
  const input = view.all('input')[0];
  input.value = '2024-02-30';
  input.props.onInput(event(input));
  await nextTick();
  view.all('input')[0].props.onBlur();
  await nextTick();
  view.all('form')[0].props.onSubmit(event());
  await nextTick();
  assert.equal(submitted.length, 0);
  assert.ok(failures[0].date);
  view.app.unmount();
});
test('DataTable controlled query and edit callbacks never silently commit rejected data', async () => {
  const queries = [];
  const edits = [];
  const view = mount(ui.DataTable, {
    columns,
    data,
    query: '',
    onCellChange: (v) => edits.push(v),
    'onUpdate:query': (v) => queries.push(v),
  });
  view
    .all('input')
    .find((n) => n.props.type === 'search')
    .props.onInput(event({ value: '不存在' }));
  await nextTick();
  assert.deepEqual(queries, ['不存在']);
  assert.equal(view.all('tr').filter((n) => n.props['data-row-key']).length, 2);
  const input = view.all('input').find((n) => n.props['aria-label'] === '编辑 金额，行 1');
  input.value = '100';
  input.props.onBlur(event(input));
  await nextTick();
  assert.deepEqual(edits, [{ key: '1', column: 'amount', value: '100' }]);
  assert.equal(input.value, '20');
  view.app.unmount();
});

test('DatePicker keeps native draft validity current before blur and respects readonly', async () => {
  const view = mount(ui.DatePicker, { defaultValue: '2024-02-01' });
  const input = view.all('input')[0];
  input.value = '2024-02-30';
  input.props.onInput(event(input));
  assert.equal(input.validity.valid, false);
  view.app.unmount();
  const changes = [];
  const locked = mount(ui.DatePicker, {
    modelValue: '2024-02-01',
    readonly: true,
    'onUpdate:modelValue': (v) => changes.push(v),
  });
  assert.equal(locked.all('button').filter((button) => !button.props.disabled).length, 0);
  locked.all('input')[0].props.onInput(event({ value: '2024-02-02' }));
  assert.equal(changes.length, 0);
  locked.app.unmount();
});

test('Cascader restores a selected path and independently selects parents when enabled', async () => {
  const nodes = [
    {
      key: 'a',
      label: '亚洲',
      children: [{ key: 'cn', label: '中国', children: [{ key: 'bj', label: '北京' }] }],
    },
    {
      key: 'disabled',
      label: '受限',
      disabled: true,
      children: [{ key: 'hidden', label: '隐藏' }],
    },
  ];
  const updates = [];
  const view = mount(ui.Cascader, {
    nodes,
    defaultValue: ['bj'],
    multiple: true,
    changeOnSelect: true,
    searchable: false,
    label: '地区',
    'onUpdate:modelValue': (value) => updates.push(value),
  });
  view
    .all('button')
    .find((node) => node.props['aria-label'] === '地区')
    .props.onClick();
  await nextTick();
  assert.equal(
    view.all('input').some((node) => node.props.type === 'search'),
    false,
  );
  assert.equal(view.where((node) => node.props.class === 'f-cascader-column').length, 3);
  const parent = view.all('input').find((node) => node.props['aria-label'] === '亚洲');
  parent.props.onChange();
  await nextTick();
  assert.deepEqual(updates.at(-1), ['bj', 'a']);
  assert.equal(
    view.all('input').find((node) => node.props['aria-label'] === '亚洲 / 中国 / 北京').props
      .checked,
    true,
  );
  assert.equal(
    view.all('input').find((node) => node.props['aria-label'] === '受限').props.disabled,
    true,
  );
  view.app.unmount();
});

test('Cascader search shows an accessible empty state and keeps disabled results unavailable', async () => {
  const view = mount(ui.Cascader, {
    nodes: [{ key: 'a', label: '亚洲', children: [{ key: 'bj', label: '北京', disabled: true }] }],
    label: '地区',
  });
  view
    .all('button')
    .find((node) => node.props['aria-label'] === '地区')
    .props.onClick();
  await nextTick();
  const search = view.all('input').find((node) => node.props.type === 'search');
  search.props.onInput(event({ value: '不存在' }));
  await nextTick();
  assert.equal(view.where((node) => node.props.role === 'status')[0].text, '没有匹配的选项');
  search.props.onInput(event({ value: '北京' }));
  await nextTick();
  assert.equal(
    view.all('button').find((node) => node.text.includes('亚洲 / 北京')).props.disabled,
    true,
  );
  view.app.unmount();
});

test('Transfer counts all items and moves only checked filtered results', async () => {
  const changes = [];
  const view = mount(ui.Transfer, {
    options: [
      { value: 'design', label: '设计' },
      { value: 'dev', label: '开发' },
      { value: 'locked', label: '受限', disabled: true },
      { value: 'legal', label: '法务', disabled: true },
    ],
    defaultValue: ['legal'],
    'onUpdate:modelValue': (value) => changes.push(value),
  });
  const text = (node) => node.text + node.children.map(text).join('');
  const option = (label) =>
    view
      .all('label')
      .find((node) => node.props.class === 'f-choice-option' && text(node).includes(label))
      .children.find((node) => node.type === 'input');
  const search = () => view.all('input').find((node) => node.props['aria-label'] === '搜索待选');
  const move = () => view.all('button').find((node) => node.text === '移入 →');
  option('设计').props.onChange(event({ checked: true }));
  await nextTick();
  assert.equal(
    view.all('input').find((node) => node.props['aria-label'] === '全选待选搜索结果').props[
      'aria-checked'
    ],
    'mixed',
  );
  search().props.onInput(event({ value: '开发' }));
  await nextTick();
  assert.equal(view.where((node) => node.props['aria-label'] === '待选总数 3 项').length, 1);
  assert.equal(move().props.disabled, true);
  option('开发').props.onChange(event({ checked: true }));
  await nextTick();
  move().props.onClick();
  await nextTick();
  assert.deepEqual(changes.at(-1), ['legal', 'dev']);
  search().props.onInput(event({ value: '' }));
  await nextTick();
  assert.equal(option('设计').props.checked, true);
  assert.equal(option('受限').props.disabled, true);
  move().props.onClick();
  await nextTick();
  assert.deepEqual(changes.at(-1), ['legal', 'dev', 'design']);
  view.app.unmount();
});

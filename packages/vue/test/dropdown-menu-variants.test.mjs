import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, h, markRaw, nextTick, reactive } from 'vue';
import { DropdownMenu } from '../dist/enterprise-navigation.js';
const items = [
  { key: 'action', label: '编辑' },
  { key: 'check', label: '显示名称', kind: 'checkbox' },
  { key: 'locked', label: '锁定', kind: 'checkbox', disabled: true },
  {
    key: 'more',
    label: '更多',
    children: [{ key: 'child', label: '子选项', kind: 'checkbox' }],
  },
];
function mount(input = {}) {
  let active;
  globalThis.document = {
    get activeElement() {
      return active;
    },
    addEventListener() {},
    removeEventListener() {},
  };
  const walk = (node) => [node, ...node.children.flatMap(walk)];
  const make = (type, text = '') =>
    markRaw({
      type,
      text,
      props: {},
      children: [],
      parent: null,
      focus() {
        active = this;
      },
      contains(node) {
        return walk(this).includes(node);
      },
      closest(selector) {
        let n = this;
        while (n) {
          if (selector === '[role="menu"]' && n.props.role === 'menu') return n;
          n = n.parent;
        }
      },
      querySelectorAll(selector) {
        return walk(this).filter(
          (n) =>
            selector.includes('menuitem') &&
            ['menuitem', 'menuitemcheckbox'].includes(n.props.role) &&
            !n.props.disabled,
        );
      },
    });
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: (text) => make('#text', text),
    createComment: (text) => make('#comment', text),
    setText: (n, t) => {
      n.text = t;
    },
    setElementText: (n, t) => {
      n.text = t;
      n.children = [];
    },
    patchProp: (n, k, _, v) => {
      n.props[k] = v;
    },
    parentNode: (n) => n.parent,
    nextSibling: (n) => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
    insert(n, p, anchor) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
      const i = anchor ? p.children.indexOf(anchor) : -1;
      p.children.splice(i < 0 ? p.children.length : i, 0, n);
      n.parent = p;
    },
    remove(n) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
    },
  });
  const props = reactive({ items, label: '项目', ...input }),
    root = make('root');
  const app = renderer.createApp({ render: () => h(DropdownMenu, props) });
  app.mount(root);
  return { props, app, all: () => walk(root), active: () => active };
}
const find = (view, predicate) => view.all().find(predicate);
const trigger = (view) =>
  find(view, (n) => n.props['aria-haspopup'] === 'menu' && n.props.role !== 'menuitem');
const text = (node) => [node.text, ...node.children.map(text)].join('');
const item = (view, label) =>
  find(
    view,
    (n) => ['menuitem', 'menuitemcheckbox'].includes(n.props.role) && text(n).includes(label),
  );
const event = (key) => ({
  key,
  preventDefault() {
    this.prevented = true;
  },
  stopPropagation() {},
});
async function open(view) {
  trigger(view).props.onClick();
  await nextTick();
  await nextTick();
}

test('legacy action closes by default, emits select, and group flags win over checkbox', async () => {
  const selected = [];
  const view = mount({ onSelect: (key) => selected.push(key) });
  await open(view);
  assert.equal(item(view, '编辑').props.role, 'menuitem');
  item(view, '编辑').props.onClick();
  await nextTick();
  assert.deepEqual(selected, ['action']);
  assert.equal(
    find(view, (n) => n.props.role === 'menu'),
    undefined,
  );
  assert.equal(view.active(), trigger(view));
  view.app.unmount();
});
test('uncontrolled checkbox, visual highlight and closed policy are independent', async () => {
  const checked = [],
    selected = [];
  const view = mount({
    highlightedKeys: ['action'],
    defaultCheckedKeys: ['locked'],
    'onUpdate:checkedKeys': (v) => checked.push(v),
    onSelect: (v) => selected.push(v),
  });
  await open(view);
  assert.equal(item(view, '编辑').props['data-highlighted'], true);
  assert.equal(item(view, '编辑').props['aria-checked'], undefined);
  assert.equal(item(view, '显示名称').props['aria-checked'], false);
  assert.equal(item(view, '锁定').props['aria-checked'], true);
  item(view, '显示名称').props.onClick();
  await nextTick();
  assert.deepEqual(checked, [['locked', 'check']]);
  assert.deepEqual(selected, []);
  assert.equal(item(view, '显示名称').props['aria-checked'], true);
  assert.ok(find(view, (n) => n.props.role === 'menu'));
  item(view, '锁定').props.onClick();
  assert.equal(checked.length, 1);
  view.app.unmount();
});
test('controlled rejection, explicit policies and focus restoration', async () => {
  const changes = [];
  const view = mount({
    checkedKeys: [],
    closeOnCheck: true,
    'onUpdate:checkedKeys': (v) => changes.push(v),
  });
  await open(view);
  item(view, '显示名称').props.onClick();
  await nextTick();
  assert.deepEqual(changes, [['check']]);
  assert.equal(
    find(view, (n) => n.props.role === 'menu'),
    undefined,
  );
  await open(view);
  assert.equal(item(view, '显示名称').props['aria-checked'], false);
  view.props.checkedKeys = ['check'];
  await nextTick();
  assert.equal(item(view, '显示名称').props['aria-checked'], true);
  view.props.closeOnAction = false;
  await nextTick();
  item(view, '编辑').props.onClick();
  await nextTick();
  assert.ok(find(view, (n) => n.props.role === 'menu'));
  view.app.unmount();
});
test('mixed item arrow navigation includes checkbox, skips disabled, submenu Escape restores parent', async () => {
  const view = mount();
  await open(view);
  const menu = find(view, (n) => n.props.role === 'menu');
  assert.equal(view.active(), item(view, '编辑'));
  menu.props.onKeydown(event('ArrowDown'));
  assert.equal(view.active(), item(view, '显示名称'));
  menu.props.onKeydown(event('ArrowDown'));
  assert.equal(view.active(), item(view, '更多'));
  item(view, '更多').props.onKeydown(event('ArrowRight'));
  await nextTick();
  await nextTick();
  assert.equal(view.active(), item(view, '子选项'));
  const menus = view.all().filter((n) => n.props.role === 'menu');
  menus[1].props.onKeydown(event('Escape'));
  await nextTick();
  await nextTick();
  assert.equal(view.active(), item(view, '更多'));
  menu.props.onKeydown(event('Escape'));
  await nextTick();
  await nextTick();
  assert.equal(view.active(), trigger(view));
  view.app.unmount();
});
test('split buttons are independent, separately disabled and named', async () => {
  let calls = 0;
  const view = mount({ triggerMode: 'split', onPrimaryAction: () => calls++ });
  const buttons = view.all().filter((n) => n.type === 'button');
  assert.equal(buttons.length, 2);
  assert.equal(buttons[1].props['aria-label'], '项目菜单');
  buttons[0].props.onClick();
  assert.equal(calls, 1);
  assert.equal(
    find(view, (n) => n.props.role === 'menu'),
    undefined,
  );
  view.props.primaryDisabled = true;
  await nextTick();
  assert.equal(buttons[0].props.disabled, true);
  buttons[0].props.onClick();
  assert.equal(calls, 1);
  view.props.menuDisabled = true;
  await nextTick();
  assert.equal(buttons[1].props.disabled, true);
  buttons[1].props.onClick();
  await nextTick();
  assert.equal(
    find(view, (n) => n.props.role === 'menu'),
    undefined,
  );
  view.props.primaryDisabled = false;
  view.props.disabled = true;
  await nextTick();
  assert.equal(buttons[0].props.disabled, true);
  view.app.unmount();
  const noHandler = mount({ triggerMode: 'split' });
  assert.equal(noHandler.all().filter((n) => n.type === 'button')[0].props.disabled, true);
  noHandler.app.unmount();
});
test('checkbox with href or children preserves existing action/submenu behavior', async () => {
  const v = mount({
    items: [
      { key: 'link', label: '跳转', kind: 'checkbox', href: '/x' },
      {
        key: 'parent',
        label: '子级',
        kind: 'checkbox',
        children: [{ key: 'c', label: '子项' }],
      },
    ],
  });
  await open(v);
  assert.equal(item(v, '跳转').props.role, 'menuitem');
  assert.equal(item(v, '跳转').props.href, '/x');
  assert.equal(item(v, '子级').props['aria-haspopup'], 'menu');
  v.app.unmount();
});

test('Vue once listener works exactly once and disables a spent primary button', async () => {
  let count = 0;
  const view = mount({
    triggerMode: 'split',
    onPrimaryActionOnce: () => count++,
  });
  const primary = () => view.all().filter((n) => n.type === 'button')[0];
  assert.equal(primary().props.disabled, false);
  primary().props.onClick();
  await nextTick();
  assert.equal(count, 1);
  assert.equal(primary().props.disabled, true);
  primary().props.onClick();
  await nextTick();
  assert.equal(count, 1);
  view.app.unmount();
});
test('ordinary listener remains enabled after the once listener is consumed', async () => {
  let normal = 0,
    once = 0;
  const view = mount({
    triggerMode: 'split',
    onPrimaryAction: () => normal++,
    onPrimaryActionOnce: () => once++,
  });
  const primary = () => view.all().filter((n) => n.type === 'button')[0];
  primary().props.onClick();
  await nextTick();
  assert.equal(primary().props.disabled, false);
  primary().props.onClick();
  await nextTick();
  assert.equal(normal, 2);
  assert.equal(once, 1);
  view.app.unmount();
});

test('an explicit empty href keeps action semantics', async () => {
  const selected = [],
    changes = [];
  const view = mount({
    items: [{ key: 'a', label: '空链接', kind: 'checkbox', href: '' }],
    onSelect: (key) => selected.push(key),
    'onUpdate:checkedKeys': (next) => changes.push(next),
  });
  await open(view);
  assert.equal(item(view, '空链接').props.role, 'menuitem');
  item(view, '空链接').props.onClick();
  await nextTick();
  assert.deepEqual(selected, ['a']);
  assert.deepEqual(changes, []);
  view.app.unmount();
});

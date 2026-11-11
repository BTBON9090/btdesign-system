import test from 'node:test';
import assert from 'node:assert/strict';
import { Comment, Fragment, Text, createRenderer, h, markRaw, nextTick, reactive } from 'vue';
import { SidebarNav, TopNav } from '../dist/enterprise-navigation.js';
const items = [
  {
    key: 'group',
    label: '团队',
    href: '/team',
    children: [
      {
        key: 'deep',
        label: '部门',
        children: [{ key: 'design', label: '设计', href: '/design' }],
      },
      { key: 'locked', label: '受限', disabled: true },
    ],
  },
];
function mount(input = {}, slots = {}, component = SidebarNav) {
  let active;
  const listeners = new Map();
  globalThis.document = {
    get activeElement() {
      return active;
    },
    addEventListener(type, fn) {
      listeners.set(type, fn);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
  };
  const walk = (n) => [n, ...n.children.flatMap(walk)];
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
    });
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: (t) => make('#text', t),
    createComment: (t) => make('#comment', t),
    setText(n, t) {
      n.text = t;
    },
    setElementText(n, t) {
      n.text = t;
      n.children = [];
    },
    patchProp(n, k, _, v) {
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
  const props = reactive({ items, ...input }),
    root = make('root');
  const app = renderer.createApp({ render: () => h(component, props, slots) });
  app.mount(root);
  return {
    props,
    app,
    all: () => walk(root),
    active: () => active,
    outside() {
      listeners.get('pointerdown')?.({ target: make('outside') });
    },
  };
}
const text = (n) => [n.text, ...n.children.map(text)].join('');
const find = (v, fn) => v.all().find(fn);
const group = (v, label) =>
  find(
    v,
    (n) =>
      n.type === 'button' &&
      n.props['aria-expanded'] !== undefined &&
      (n.props['aria-label']?.includes(label) || text(n).includes(label)),
  );
const link = (v, label) =>
  find(
    v,
    (n) =>
      ['a', 'button'].includes(n.type) && n.props.class === 'f-nav-link' && text(n).includes(label),
  );
const ev = (key) => ({
  key,
  preventDefault() {
    this.prevented = true;
  },
  stopPropagation() {},
});

test('old default opens nested and newly inserted groups; collapse exceptions persist', async () => {
  const changes = [];
  const v = mount({ 'onUpdate:expandedKeys': (x) => changes.push(x) });
  assert.equal(group(v, '团队').props['aria-expanded'], true);
  assert.ok(link(v, '设计'));
  group(v, '团队').props.onClick();
  await nextTick();
  assert.equal(link(v, '设计'), undefined);
  assert.deepEqual(changes, [['deep']]);
  v.props.items = [
    ...v.props.items,
    {
      key: 'new',
      label: '新部门',
      children: [{ key: 'child', label: '新成员' }],
    },
  ];
  await nextTick();
  assert.equal(group(v, '团队').props['aria-expanded'], false);
  assert.equal(group(v, '新部门').props['aria-expanded'], true);
  assert.ok(link(v, '新成员'));
  v.app.unmount();
});
test('controlled refusal, explicit defaults, and disabled parent', async () => {
  const changes = [];
  const v = mount({
    expandedKeys: [],
    'onUpdate:expandedKeys': (x) => changes.push(x),
  });
  assert.equal(group(v, '团队').props['aria-expanded'], false);
  group(v, '团队').props.onClick();
  await nextTick();
  assert.deepEqual(changes, [['group']]);
  assert.equal(group(v, '团队').props['aria-expanded'], false);
  v.props.expandedKeys = ['group'];
  await nextTick();
  assert.equal(group(v, '团队').props['aria-expanded'], true);
  v.app.unmount();
  const u = mount({ defaultExpandedKeys: [] });
  assert.equal(group(u, '团队').props['aria-expanded'], false);
  group(u, '团队').props.onClick();
  await nextTick();
  assert.equal(group(u, '团队').props['aria-expanded'], true);
  u.app.unmount();
  const d = mount({ items: [{ ...items[0], disabled: true }] });
  assert.equal(group(d, '团队').props.disabled, true);
  assert.equal(link(d, '设计').props.disabled, true);
  d.app.unmount();
});
test('parent link requires explicit opt-in and safe href; toggle and link stay separate', async () => {
  const events = [];
  const legacy = mount({ onSelect: (k) => events.push(k) });
  assert.equal(
    legacy.all().some((n) => n.type === 'a' && n.props.href === '/team'),
    false,
  );
  legacy.app.unmount();
  const v = mount({
    items: [{ ...items[0], parentLink: true }],
    onSelect: (k) => events.push(k),
  });
  const a = find(v, (n) => n.type === 'a' && n.props.href === '/team');
  const b = group(v, '团队');
  assert.ok(a);
  assert.ok(b);
  assert.equal(
    a.children.some((n) => n.type === 'button'),
    false,
  );
  a.props.onClick();
  assert.deepEqual(events, ['group']);
  assert.equal(b.props['aria-expanded'], true);
  b.props.onClick();
  await nextTick();
  assert.equal(group(v, '团队').props['aria-expanded'], false);
  v.app.unmount();
  const bad = mount({
    items: [{ ...items[0], parentLink: true, href: 'javascript:alert(1)' }],
  });
  assert.equal(
    bad.all().some((n) => n.type === 'a' && n.props.href?.startsWith('javascript')),
    false,
  );
  assert.ok(group(bad, '团队'));
  bad.app.unmount();
});
test('collapsed popup does not alter expandedKeys; focusout and Escape close and restore', async () => {
  const changes = [],
    v = mount({
      collapsed: true,
      expandedKeys: [],
      'onUpdate:expandedKeys': (x) => changes.push(x),
    });
  const top = group(v, '团队');
  assert.equal(top.props['aria-expanded'], false);
  top.props.onClick();
  await nextTick();
  assert.equal(top.props['aria-expanded'], true);
  assert.ok(group(v, '部门'));
  assert.deepEqual(changes, []);
  const popup = find(v, (n) => String(n.props.class ?? '').includes('f-nav-children--popup'));
  assert.equal(top.props['aria-controls'], popup.props.id);
  group(v, '部门').props.onClick();
  await nextTick();
  assert.deepEqual(changes, [['deep']]);
  assert.equal(link(v, '设计'), undefined);
  const nav = find(v, (n) => n.type === 'nav');
  nav.props.onFocusout({ relatedTarget: group(v, '部门') });
  await nextTick();
  assert.ok(group(v, '部门'));
  const escape = ev('Escape');
  nav.props.onKeydown(escape);
  await nextTick();
  await nextTick();
  assert.equal(escape.prevented, true);
  assert.equal(v.active(), top);
  assert.equal(group(v, '部门'), undefined);
  top.props.onClick();
  await nextTick();
  nav.props.onFocusout({ relatedTarget: top });
  await nextTick();
  assert.ok(group(v, '部门'));
  nav.props.onFocusout({ relatedTarget: link(v, '受限') });
  await nextTick();
  assert.ok(group(v, '部门'));
  nav.props.onFocusout({ relatedTarget: {} });
  await nextTick();
  assert.equal(group(v, '部门'), undefined);
  top.props.onClick();
  await nextTick();
  v.outside();
  await nextTick();
  assert.equal(group(v, '部门'), undefined);
  v.app.unmount();
});
test('collapsed icon is decorative with retained label; no icon keeps visible text', async () => {
  const v = mount(
    { collapsed: true },
    { icon: ({ item }) => (item.key === 'group' ? h('i', '装饰') : null) },
  );
  const b = group(v, '团队');
  assert.ok(find(v, (n) => n.props['aria-hidden'] === 'true' && n.props.class === 'f-nav-icon'));
  assert.ok(
    find(
      v,
      (n) => n.props.class === 'f-nav-label f-nav-label--visually-hidden' && n.text === '团队',
    ),
  );
  b.props.onClick();
  await nextTick();
  assert.ok(find(v, (n) => n.props.class === 'f-nav-label' && n.text === '部门'));
  v.app.unmount();
  const fallback = mount({ collapsed: true });
  assert.ok(find(fallback, (n) => n.props.class === 'f-nav-label' && n.text === '团队'));
  fallback.app.unmount();
});
test('collapse control is opt-in, disabled-aware and honours controlled refusal', async () => {
  const changes = [],
    v = mount({
      collapsed: false,
      showCollapseControl: true,
      'onUpdate:collapsed': (x) => changes.push(x),
    });
  const toggle = find(v, (n) => n.props['aria-label'] === '收起侧栏');
  toggle.props.onClick();
  await nextTick();
  assert.deepEqual(changes, [true]);
  assert.equal(
    find(v, (n) => n.props['aria-label'] === '展开侧栏'),
    undefined,
  );
  v.props.collapsed = true;
  await nextTick();
  assert.ok(find(v, (n) => n.props['aria-label'] === '展开侧栏'));
  v.props.disabled = true;
  await nextTick();
  assert.equal(find(v, (n) => n.props['aria-label'] === '展开侧栏').props.disabled, true);
  v.app.unmount();
  const top = mount({ showCollapseControl: true, collapsed: true }, {}, TopNav);
  assert.equal(
    find(top, (n) => n.props['aria-label'] === '展开侧栏'),
    undefined,
  );
  assert.equal(group(top, '团队').props['aria-expanded'], true);
  top.app.unmount();
});

test('selected leaf retains popup until focus leaves; disabled or removed group closes it', async () => {
  const selected = [];
  const v = mount({ collapsed: true, onSelect: (key) => selected.push(key) });
  group(v, '团队').props.onClick();
  await nextTick();
  const leaf = link(v, '设计');
  leaf.props.onClick();
  await nextTick();
  assert.deepEqual(selected, ['design']);
  assert.ok(group(v, '部门'));
  v.props.items = [{ ...items[0], disabled: true }];
  await nextTick();
  assert.equal(group(v, '部门'), undefined);
  assert.equal(group(v, '团队').props.disabled, true);
  v.props.items = items;
  await nextTick();
  group(v, '团队').props.onClick();
  await nextTick();
  assert.ok(group(v, '部门'));
  v.props.items = [];
  await nextTick();
  assert.equal(group(v, '部门'), undefined);
  v.app.unmount();
});

test('empty text, comments and empty fragments do not hide compact labels', () => {
  const inputs = [
    () => '  ',
    () => h(Text, ' \n '),
    () => h(Comment, 'empty'),
    () => h(Fragment, null, [h(Comment, ''), h(Text, '  ')]),
  ];
  for (const icon of inputs) {
    const view = mount({ collapsed: true }, { icon });
    assert.ok(find(view, (n) => n.props.class === 'f-nav-label' && n.text === '团队'));
    assert.equal(
      find(
        view,
        (n) => n.props.class === 'f-nav-label f-nav-label--visually-hidden' && n.text === '团队',
      ),
      undefined,
    );
    view.app.unmount();
  }
});

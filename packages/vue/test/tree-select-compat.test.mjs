import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, h, markRaw, nextTick, reactive } from 'vue';
const { TreeSelect } = await import(
  process.env.BT_TREE_TEST_MODULE ?? '../dist/enterprise-tree.js'
);
const nodes = [
  {
    key: 'team',
    label: '团队',
    children: [
      { key: 'design', label: '设计' },
      { key: 'locked', label: '受限', disabled: true },
    ],
  },
];
function mount(input = {}, slots = {}) {
  let active;
  const all = (node) => [node, ...node.children.flatMap(all)];
  const make = (type, text = '') =>
    markRaw({
      type,
      text,
      props: {},
      children: [],
      parent: null,
      dataset: {},
      focus() {
        active = this;
      },
      contains(node) {
        return all(this).includes(node);
      },
      querySelectorAll(selector) {
        return selector.includes('treeitem')
          ? all(this).filter((n) => n.props.role === 'treeitem')
          : [];
      },
      querySelector(selector) {
        return (
          all(this).find(
            (n) =>
              selector.includes('.f-tree-search') &&
              String(n.props.class ?? '').includes('f-tree-search'),
          ) ??
          (selector.includes('treeitem')
            ? all(this).find((n) => n.props.role === 'treeitem' && n.props.tabindex === 0)
            : undefined)
        );
      },
    });
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: (text) => make('#text', text),
    createComment: (text) => make('#comment', text),
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.text = text;
      node.children = [];
    },
    patchProp(node, key, _, value) {
      node.props[key] = value;
      if (key === 'data-key') node.dataset.key = value;
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
    insert(node, parent, anchor) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      const at = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(at < 0 ? parent.children.length : at, 0, node);
      node.parent = parent;
    },
    remove(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    },
  });
  const props = reactive({ nodes, ...input });
  const root = make('root');
  const app = renderer.createApp({ render: () => h(TreeSelect, props, slots) });
  app.mount(root);
  return { props, all: () => all(root), active: () => active, app };
}
const find = (mounted, fn) => mounted.all().find(fn);
const treeItem = (mounted, key) =>
  find(mounted, (n) => n.props.role === 'treeitem' && n.props['data-key'] === key);
const button = (mounted, label) =>
  find(mounted, (n) => n.type === 'button' && n.props['aria-label'] === label);
const keyEvent = (key) => ({
  key,
  preventDefault() {
    this.prevented = true;
  },
  stopPropagation() {},
});
async function open(mounted) {
  find(mounted, (n) => n.props['aria-haspopup'] === 'dialog').props.onClick();
  await nextTick();
  await nextTick();
}

test('default roots remain expanded; explicit empty and controlled expansion work', async () => {
  const initial = mount();
  await open(initial);
  assert.ok(treeItem(initial, 'design'));
  assert.equal(
    find(initial, (n) => n.type === 'input' && n.props.type === 'search'),
    undefined,
  );
  initial.app.unmount();
  const uncontrolled = mount({ defaultExpandedKeys: [] });
  await open(uncontrolled);
  assert.equal(treeItem(uncontrolled, 'design'), undefined);
  treeItem(uncontrolled, 'team').props.onKeydown(keyEvent('ArrowRight'));
  await nextTick();
  assert.ok(treeItem(uncontrolled, 'design'));
  uncontrolled.app.unmount();
  const updates = [];
  const controlled = mount({
    expandedKeys: [],
    'onUpdate:expandedKeys': (keys) => updates.push(keys),
  });
  await open(controlled);
  treeItem(controlled, 'team').props.onKeydown(keyEvent('ArrowRight'));
  await nextTick();
  assert.deepEqual(updates, [['team']]);
  assert.equal(treeItem(controlled, 'design'), undefined);
  controlled.props.expandedKeys = ['team'];
  await nextTick();
  assert.ok(treeItem(controlled, 'design'));
  controlled.app.unmount();
});

test('size, lines and decorative icon slot reach actual Tree; search announces no results', async () => {
  const mounted = mount(
    { size: 'mini', showLine: true, searchable: true },
    { icon: ({ node }) => `icon-${node.key}` },
  );
  await open(mounted);
  assert.equal(find(mounted, (n) => n.props.role === 'tree').props['data-size'], 'mini');
  assert.equal(find(mounted, (n) => n.props.role === 'tree').props['data-show-line'], true);
  assert.ok(find(mounted, (n) => n.props.class === 'f-tree-guide'));
  const icon = find(mounted, (n) => n.props.class === 'f-tree-icon');
  assert.equal(icon.props['aria-hidden'], 'true');
  assert.equal(icon.children[0].text, 'icon-team');
  const search = find(mounted, (n) => n.type === 'input' && n.props.type === 'search');
  search.props.onInput({ target: { value: '不存在' } });
  await nextTick();
  const status = find(mounted, (n) => n.props.role === 'status');
  assert.equal(status.text, '无匹配节点');
  assert.notEqual(status.parent.props.role, 'tree');
  mounted.app.unmount();
});

test('clear retains disabled multiple values; disabled selector ignores activation', async () => {
  const values = [];
  const mounted = mount({
    multiple: true,
    modelValue: ['design', 'locked'],
    'onUpdate:modelValue': (value) => values.push(value),
  });
  assert.equal(button(mounted, '移除 受限').props.disabled, true);
  button(mounted, '清空树形选择').props.onClick();
  await nextTick();
  assert.deepEqual(values, [['locked']]);
  assert.ok(button(mounted, '移除 设计')); // controlled parent has not accepted the update
  mounted.app.unmount();
  const disabled = mount({ disabled: true, defaultValue: 'design' });
  const trigger = find(disabled, (n) => n.props['aria-haspopup'] === 'dialog');
  assert.equal(trigger.props.disabled, true);
  trigger.props.onClick();
  await nextTick();
  assert.equal(
    find(disabled, (n) => n.props.role === 'dialog'),
    undefined,
  );
  assert.equal(button(disabled, '清空树形选择').props.disabled, true);
  disabled.app.unmount();
});

test('Escape closes the popup and returns focus to the trigger', async () => {
  const mounted = mount();
  await open(mounted);
  const trigger = find(mounted, (n) => n.props['aria-haspopup'] === 'dialog');
  const wrapper = find(mounted, (n) => n.props.class?.includes?.('f-tree-select'));
  const event = keyEvent('Escape');
  wrapper.props.onKeydown(event);
  await nextTick();
  await nextTick();
  assert.equal(event.prevented, true);
  assert.equal(
    find(mounted, (n) => n.props.role === 'dialog'),
    undefined,
  );
  assert.equal(mounted.active(), trigger);
  mounted.app.unmount();
});

test('clear can be hidden and keyboard selection closes a single-select popup', async () => {
  const hidden = mount({ defaultValue: 'design', clearable: false });
  assert.equal(button(hidden, '清空树形选择'), undefined);
  hidden.app.unmount();
  const updates = [];
  const mounted = mount({ 'onUpdate:modelValue': (value) => updates.push(value) });
  await open(mounted);
  treeItem(mounted, 'design').props.onKeydown(keyEvent('Enter'));
  await nextTick();
  await nextTick();
  assert.deepEqual(updates, ['design']);
  assert.equal(
    find(mounted, (n) => n.props.role === 'dialog'),
    undefined,
  );
  assert.equal(
    mounted.active(),
    find(mounted, (n) => n.props['aria-haspopup'] === 'dialog'),
  );
  mounted.app.unmount();
});

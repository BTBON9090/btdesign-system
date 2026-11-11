import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, h, nextTick } from 'vue';
import { AutoComplete } from '../dist/auto-complete.js';
function mount(props, slots) {
  const make = (type, text = '') => ({ type, text, props: {}, children: [], parent: null });
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
    patchProp: (node, key, _old, value) => {
      node.props[key] = value;
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
  const app = renderer.createApp({ render: () => h(AutoComplete, props, slots) });
  app.mount(root);
  const all = (node = root) => [node, ...node.children.flatMap(all)];
  return { app, all };
}
const options = [{ value: 'bj', label: '北京', description: '28' }];
test('Vue option suffix renderer preserves description and excludes decoration from its name', async () => {
  const calls = [];
  const view = mount({
    options,
    renderOptionSuffix: (option) => {
      calls.push(option.value);
      return h('span', '↗');
    },
  });
  view
    .all()
    .find((node) => node.type === 'input')
    .props.onFocus({ defaultPrevented: false });
  await nextTick();
  assert.deepEqual(calls, ['bj']);
  assert.equal(
    view.all().find((node) => node.props.class === 'f-autocomplete-description').text,
    '28',
  );
  const suffix = view.all().find((node) => node.props.class === 'f-autocomplete-suffix');
  assert.equal(suffix.props['aria-hidden'], 'true');
  assert.equal(suffix.children[0].text, '↗');
  view.app.unmount();
});
test('Vue scoped suffix slot replaces the function renderer', async () => {
  const view = mount(
    { options, renderOptionSuffix: () => h('span', '错误') },
    { 'option-suffix': ({ option }) => h('span', `图标-${option.value}`) },
  );
  view
    .all()
    .find((node) => node.type === 'input')
    .props.onFocus({ defaultPrevented: false });
  await nextTick();
  const suffix = view.all().find((node) => node.props.class === 'f-autocomplete-suffix');
  assert.equal(suffix.children[0].text, '图标-bj');
  view.app.unmount();
});

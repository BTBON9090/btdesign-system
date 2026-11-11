import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Collapse } from '../dist/collapse.js';

const items = [
  { value: 'a', label: '简介', content: '内容 A' },
  { value: 'b', label: '详情', content: '内容 B' },
  { value: 'c', label: '禁用项', content: '内容 C', disabled: true },
];
const render = (props) =>
  renderToString(createSSRApp({ render: () => h(Collapse, { id: 'example', items, ...props }) }));

test('Collapse links triggers and panels, supports multiple open items and disabled headers', async () => {
  const html = await render({ defaultValue: ['a', 'b'] });
  assert.match(
    html,
    /id="example-trigger-0"[^>]*aria-expanded="true"[^>]*aria-controls="example-panel-0"/,
  );
  assert.match(
    html,
    /id="example-panel-0" role="region" aria-labelledby="example-trigger-0"[^>]*>内容 A/,
  );
  assert.match(html, /id="example-trigger-1"[^>]*aria-expanded="true"/);
  assert.match(html, /id="example-trigger-2"[^>]*disabled/);
  assert.match(html, /id="example-panel-2"[^>]*hidden/);
});

test('Collapse prefers modelValue and accordion exposes only one open item', async () => {
  const html = await render({
    modelValue: ['b', 'a'],
    defaultValue: ['a'],
    accordion: true,
    expandIconPosition: 'end',
  });
  assert.match(html, /id="example-trigger-0"[^>]*aria-expanded="false"/);
  assert.match(html, /id="example-trigger-1"[^>]*aria-expanded="true"/);
  assert.match(html, /f-collapse-icon--end/);
  assert.doesNotMatch(await render({ expandIconPosition: 'none' }), /f-collapse-icon/);
});

function setupHost(props) {
  const make = (type) =>
    markRaw({
      type,
      props: {},
      children: [],
      parent: null,
      querySelectorAll() {
        return walk(this).filter((node) => node.type === 'button' && !node.props.disabled);
      },
      focus() {
        this.focused = true;
      },
    });
  function walk(node) {
    return [node, ...node.children.flatMap(walk)];
  }
  const renderer = createRenderer({
    createElement: make,
    createText: (text) => ({ ...make('#text'), text }),
    createComment: (text) => ({ ...make('#comment'), text }),
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.text = text;
      node.children = [];
    },
    patchProp: (node, key, oldValue, value) => {
      node.props[key] = value;
    },
    insert: (node, parent, anchor) => {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
    },
    remove: (node) => {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
  });
  const root = make('root');
  renderer.createApp({ render: () => h(Collapse, { items, ...props }) }).mount(root);
  return () => walk(root).filter((node) => node.type === 'button');
}

test('Vue uncontrolled multiple and accordion actions update and notify, while keyboard skips disabled items', async () => {
  const events = [];
  const buttons = setupHost({
    defaultValue: ['a'],
    'onUpdate:modelValue': (value) => events.push(value),
  });
  buttons()[1].props.onClick();
  await nextTick();
  assert.deepEqual(events.at(-1), ['a', 'b']);
  assert.equal(buttons()[1].props['aria-expanded'], true);
  let prevented = false;
  buttons()[1].props.onKeydown({
    key: 'ArrowDown',
    currentTarget: buttons()[1],
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(buttons()[0].focused, true);

  const selected = [];
  const accordion = setupHost({
    accordion: true,
    defaultValue: ['a'],
    'onUpdate:modelValue': (value) => selected.push(value),
  });
  accordion()[1].props.onClick();
  await nextTick();
  assert.deepEqual(selected.at(-1), ['b']);
  assert.equal(accordion()[0].props['aria-expanded'], false);
  assert.equal(accordion()[1].props['aria-expanded'], true);
});

test('Vue controlled state emits a request without changing until its parent updates', async () => {
  const selected = ref(['a']);
  const calls = [];
  const props = {
    get modelValue() {
      return selected.value;
    },
    'onUpdate:modelValue': (value) => calls.push(value),
  };
  const buttons = setupHost(props);
  buttons()[1].props.onClick();
  await nextTick();
  assert.deepEqual(calls.at(-1), ['a', 'b']);
  assert.equal(buttons()[1].props['aria-expanded'], false);
  selected.value = ['a', 'b'];
  await nextTick();
  assert.equal(buttons()[1].props['aria-expanded'], true);
});

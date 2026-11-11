import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Popover } from '../dist/popover.js';

const render = (props = {}) => renderToString(createSSRApp({ render: () => h(Popover, {
  id: 'details', triggerLabel: '打开', title: '详情标题', ...props,
}, { default: () => h('button', '执行操作') }) }));

test('Popover links its accessible dialog and preserves interactive content', async () => {
  const html = await render({ defaultOpen: true, placement: 'right-end' });
  assert.match(html, /aria-haspopup="dialog" aria-expanded="true" aria-controls="details-panel"/);
  assert.match(html, /id="details-panel"[^>]*f-popover-panel--right-end[^>]*role="dialog" aria-labelledby="details-panel-title"/);
  assert.match(html, /<button>执行操作<\/button>/);
  assert.match(html, /f-popover-panel--arrow/);
});

test('Popover supports controlled state, disabling and an accessible fallback label', async () => {
  assert.doesNotMatch(await render({ modelValue: false, defaultOpen: true }), /role="dialog"/);
  assert.doesNotMatch(await render({ defaultOpen: true, disabled: true }), /role="dialog"/);
  const html = await render({ modelValue: true, title: undefined, label: '更多信息', showArrow: false });
  assert.match(html, /role="dialog" aria-label="更多信息"/);
  assert.doesNotMatch(html, /f-popover-panel--arrow/);
});

function mount(props) {
  const make = (type) => markRaw({ type, props: {}, children: [], parent: null });
  const walk = (node) => [node, ...node.children.flatMap(walk)];
  const renderer = createRenderer({
    createElement: make,
    createText: (text) => ({ ...make('#text'), text }),
    createComment: (text) => ({ ...make('#comment'), text }),
    setText: (node, text) => { node.text = text; },
    setElementText: (node, text) => { node.text = text; node.children = []; },
    patchProp: (node, key, oldValue, value) => { node.props[key] = value; },
    insert: (node, parent, anchor) => {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
    },
    remove: (node) => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
  });
  const root = make('root');
  renderer.createApp({ render: () => h(Popover, { ...props }) }).mount(root);
  return () => walk(root).find((node) => node.type === 'button');
}

test('Vue uncontrolled and controlled triggers report requested changes', async () => {
  const calls = [];
  const button = mount({ 'onUpdate:modelValue': (value) => calls.push(value) });
  button().props.onClick();
  await nextTick();
  assert.equal(button().props['aria-expanded'], true);
  button().props.onClick();
  await nextTick();
  assert.equal(button().props['aria-expanded'], false);
  assert.deepEqual(calls, [true, false]);

  const controlled = ref(false);
  const requests = [];
  const controlledButton = mount({ get modelValue() { return controlled.value; }, 'onUpdate:modelValue': (value) => requests.push(value) });
  controlledButton().props.onClick();
  await nextTick();
  assert.deepEqual(requests, [true]);
  assert.equal(controlledButton().props['aria-expanded'], false);
  controlled.value = true;
  await nextTick();
  assert.equal(controlledButton().props['aria-expanded'], true);
});

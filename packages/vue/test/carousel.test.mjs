import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, createSSRApp, h, markRaw, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Carousel } from '../dist/carousel.js';

const items = [
  { key: 'one', content: '第一项' },
  { key: 'two', content: '第二项' },
];
const render = (props) =>
  renderToString(createSSRApp({ render: () => h(Carousel, { items, ...props }) }));
test('Carousel labels slides, hides inactive content, and disables navigation at boundaries', async () => {
  const html = await render({ label: '项目展示' });
  assert.match(html, /role="region" aria-label="项目展示" aria-roledescription="轮播"/);
  assert.match(html, /aria-label="1 \/ 2"[^>]*>第一项/);
  assert.match(html, /aria-label="2 \/ 2" hidden[^>]*>第二项/);
  assert.match(html, /aria-label="上一张" disabled/);
  assert.match(html, /aria-label="第 1 张" aria-current="true"/);
});

test('Carousel clamps external indexes and renders an explicit empty state', async () => {
  const html = await render({ modelValue: 99, indicatorStyle: 'lines', indicatorPlacement: 'end' });
  assert.match(html, /aria-label="第 2 张" aria-current="true"/);
  assert.match(html, /f-carousel-indicators--lines f-carousel-indicators--end/);
  assert.match(await render({ items: [] }), /暂无轮播内容/);
});

function mount(props) {
  const make = (type) => markRaw({ type, props: {}, children: [], parent: null });
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
  renderer.createApp({ render: () => h(Carousel, { items, ...props }) }).mount(root);
  return () => walk(root);
}

test('Vue navigation and keyboard update uncontrolled state, and loop wraps', async () => {
  const events = [];
  const nodes = mount({ loop: true, 'onUpdate:modelValue': (value) => events.push(value) });
  nodes()
    .find((n) => n.props['aria-label'] === '上一张')
    .props.onClick();
  await nextTick();
  assert.deepEqual(events, [1]);
  assert.equal(
    nodes().find((n) => n.props['aria-label'] === '第 2 张').props['aria-current'],
    'true',
  );
  let prevented = false;
  nodes()
    .find((n) => n.type === 'section')
    .props.onKeydown({
      key: 'Home',
      preventDefault() {
        prevented = true;
      },
    });
  await nextTick();
  assert.equal(prevented, true);
  assert.deepEqual(events, [1, 0]);
});

test('Vue controlled navigation emits a request without mutating selected index', async () => {
  const selected = ref(0);
  const events = [];
  const nodes = mount({
    get modelValue() {
      return selected.value;
    },
    'onUpdate:modelValue': (value) => events.push(value),
  });
  nodes()
    .find((n) => n.props['aria-label'] === '下一张')
    .props.onClick();
  await nextTick();
  assert.deepEqual(events, [1]);
  assert.equal(
    nodes().find((n) => n.props['aria-label'] === '第 1 张').props['aria-current'],
    'true',
  );
  selected.value = 1;
  await nextTick();
  assert.equal(
    nodes().find((n) => n.props['aria-label'] === '第 2 张').props['aria-current'],
    'true',
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, createSSRApp, h, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { BTDESIGNPlugin, ResizeBox } from '../dist/index.js';

test('Vue plugin registers the public ResizeBox component', () => {
  const registered = new Map();
  BTDESIGNPlugin.install({ component: (name, component) => registered.set(name, component) });
  assert.equal(registered.get('FResizeBox'), ResizeBox);
});

test('Vue ResizeBox exposes constrained panel size and ARIA association in SSR', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          ResizeBox,
          { size: 95, min: 20, max: 80, orientation: 'vertical', handleLabel: '调整高度' },
          { first: () => '目录', second: () => '内容' },
        ),
    }),
  );
  assert.match(html, /f-resize-box--vertical/);
  assert.match(html, /role="separator" aria-label="调整高度" aria-orientation="horizontal"/);
  assert.match(html, /aria-valuemin="20" aria-valuemax="80" aria-valuenow="80"/);
  const panel = html.match(/id="([^"]+-first)"/);
  assert.ok(panel);
  assert.ok(html.includes(`aria-controls="${panel[1]}"`));
});
test('Vue ResizeBox keyboard and pointer update the bounded uncontrolled value', async () => {
  const descendants = (node) => [node, ...node.children.flatMap(descendants)];
  const make = (type) => ({
    type,
    props: {},
    children: [],
    parent: null,
    focus() {},
    getBoundingClientRect() {
      return {
        left: 0,
        top: 0,
        width: this.type === 'handle' ? 8 : 208,
        height: 108,
      };
    },
    setPointerCapture(id) {
      this.capture = id;
    },
    hasPointerCapture(id) {
      return this.capture === id;
    },
    releasePointerCapture() {
      this.capture = null;
    },
  });
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: () => make('#text'),
    createComment: () => make('#comment'),
    setText() {},
    setElementText() {},
    patchProp(node, key, _, value) {
      node.props[key] = value;
    },
    parentNode: (node) => node.parent,
    nextSibling: () => null,
    insert(node, parent) {
      parent.children.push(node);
      node.parent = parent;
    },
    remove(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    },
  });
  const changes = [];
  const host = make('host');
  const app = renderer.createApp({
    render: () =>
      h(ResizeBox, { min: 20, max: 80, step: 10, 'onUpdate:size': (value) => changes.push(value) }),
  });
  app.mount(host);
  const handle = descendants(host).find((node) => node.props.role === 'separator');
  handle.type = 'handle';
  let prevented = false;
  handle.props.onKeydown({
    key: 'ArrowRight',
    preventDefault() {
      prevented = true;
    },
  });
  await nextTick();
  assert.equal(prevented, true);
  assert.equal(handle.props['aria-valuenow'], 60);
  handle.props.onPointerdown({
    button: 0,
    pointerId: 1,
    currentTarget: handle,
    preventDefault() {},
  });
  handle.props.onPointermove({ pointerId: 1, currentTarget: handle, clientX: 200, clientY: 0 });
  await nextTick();
  assert.equal(handle.props['aria-valuenow'], 80);
  handle.props.onPointerup({ pointerId: 1, currentTarget: handle });
  assert.equal(handle.capture, null);
  assert.deepEqual(changes, [60, 80]);
  app.unmount();
});

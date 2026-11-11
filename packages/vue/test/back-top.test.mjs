import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, h, markRaw, nextTick } from 'vue';
import { BackTop } from '../dist/back-top.js';

function setup() {
  const listeners = new Map();
  const target = {
    scrollTop: 0,
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
    removeEventListener(name, listener) {
      if (listeners.get(name) === listener) listeners.delete(name);
    },
    scrollTo(options) {
      this.scrolled = options;
    },
  };
  const make = (type) => markRaw({ type, props: {}, children: [], parent: null });
  const walk = (node) => [node, ...node.children.flatMap(walk)];
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
  const app = renderer.createApp({
    render: () =>
      h(BackTop, {
        target: () => target,
        visibilityHeight: 100,
        top: 25,
        shape: 'circle',
        variant: 'primary',
        content: 'up',
      }),
  });
  app.mount(root);
  return {
    target,
    listeners,
    button: () => walk(root).find((node) => node.type === 'button'),
    unmount: () => app.unmount(),
  };
}

test('BackTop observes its scroll container, scrolls to the configured position and cleans up', async () => {
  const previousWindow = globalThis.window;
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  try {
    const { target, listeners, button, unmount } = setup();
    assert.equal(button(), undefined);
    target.scrollTop = 150;
    listeners.get('scroll')();
    await nextTick();
    assert.equal(button().props['aria-label'], '返回顶部');
    assert.match(button().props.class, /f-back-top--circle/);
    button().props.onClick({ defaultPrevented: false });
    assert.deepEqual(target.scrolled, { top: 25, behavior: 'instant' });
    target.scrollTop = 0;
    listeners.get('scroll')();
    await nextTick();
    assert.equal(button(), undefined);
    unmount();
    assert.equal(listeners.size, 0);
  } finally {
    globalThis.window = previousWindow;
  }
});

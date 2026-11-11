import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Tooltip } from '../dist/tooltip.js';

const render = (props) =>
  renderToString(
    createSSRApp({
      render: () =>
        h(
          Tooltip,
          { id: 'hint', content: '保存后可分享', ...props },
          { default: () => h('button', { 'aria-describedby': 'existing' }, '保存') },
        ),
    }),
  );
test('Tooltip preserves trigger descriptions and supports controlled open, placement and disabled override', async () => {
  const closed = await render({});
  assert.match(closed, /<button aria-describedby="existing hint">保存<\/button>/);
  assert.match(closed, /id="hint" role="tooltip"[^>]*hidden/);
  const open = await render({ open: true, placement: 'right' });
  assert.match(open, /f-tooltip-content--right/);
  assert.doesNotMatch(open, /hidden/);
  assert.match(await render({ open: true, disabled: true }), /hidden/);
});

function createHost(props) {
  const node = (type) => markRaw({ type, props: {}, children: [], parent: null });
  const renderer = createRenderer({
    createElement: node,
    createText: (text) => ({ ...node('#text'), text }),
    createComment: (text) => ({ ...node('#comment'), text }),
    setText: (el, text) => {
      el.text = text;
    },
    setElementText: (el, text) => {
      el.text = text;
    },
    patchProp: (el, key, _prev, value) => {
      el.props[key] = value;
    },
    insert: (el, parent) => {
      el.parent = parent;
      parent.children.push(el);
    },
    remove: () => {},
    parentNode: (el) => el.parent,
    nextSibling: () => null,
  });
  const root = node('root');
  const app = renderer.createApp({
    render: () =>
      h(
        Tooltip,
        { id: 'hint', content: '帮助', ...props },
        { default: () => h('button', {}, '触发') },
      ),
  });
  app.mount(root);
  return {
    app,
    wrapper: root.children[0],
    tooltip: () => root.children[0].children.find((el) => el.props.role === 'tooltip'),
  };
}

test('pointer and focus cooperate, Escape dismisses, and controlled state remains parent-owned', async () => {
  const listeners = new Map();
  const original = globalThis.document;
  globalThis.document = {
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type) => listeners.delete(type),
  };
  try {
    const events = [];
    const host = createHost({ 'onUpdate:open': (value) => events.push(value) });
    assert.equal(host.tooltip().props.hidden, true);
    host.wrapper.props.onPointerenter();
    await nextTick();
    assert.equal(host.tooltip().props.hidden, false);
    host.wrapper.props.onFocusin();
    host.wrapper.props.onPointerleave();
    await nextTick();
    assert.equal(host.tooltip().props.hidden, false, 'focus retains tooltip when pointer leaves');
    listeners.get('keydown')({ key: 'Escape' });
    await nextTick();
    assert.equal(host.tooltip().props.hidden, true);
    host.wrapper.props.onFocusout({ relatedTarget: null });
    host.wrapper.props.onFocusin();
    await nextTick();
    assert.equal(host.tooltip().props.hidden, false, 'refocusing can open after Escape');
    assert.deepEqual(events, [true, false, true]);
    host.app.unmount();

    const controlled = ref(true);
    const calls = [];
    const controlledHost = createHost({
      get open() {
        return controlled.value;
      },
      'onUpdate:open': (value) => calls.push(value),
    });
    controlledHost.wrapper.props.onPointerleave();
    await nextTick();
    assert.deepEqual(calls, [false]);
    assert.equal(
      controlledHost.tooltip().props.hidden,
      false,
      'parent has not changed controlled open',
    );
    controlledHost.app.unmount();
  } finally {
    globalThis.document = original;
  }
});

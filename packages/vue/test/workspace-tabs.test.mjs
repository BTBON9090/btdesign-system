import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Comment,
  Fragment,
  Text,
  createRenderer,
  createSSRApp,
  h,
  markRaw,
  nextTick,
  reactive,
} from 'vue';
import { renderToString } from '@vue/server-renderer';
import { WorkspaceTabs, BTDESIGNPlugin } from '../dist/index.js';
const items = [
  { key: 'home', label: '首页', href: '/home' },
  { key: 'a', label: '项目', closable: true },
  { key: 'locked', label: '锁定', closable: true, disabled: true },
];
const render = (props = {}, slots = {}) =>
  renderToString(
    createSSRApp({ render: () => h(WorkspaceTabs, { items, activeKey: 'a', ...props }, slots) }),
  );

test('semantic links, button selection and separate named close controls', async () => {
  const html = await render(
    { id: 'work', class: 'custom', onClose: () => {}, onSelect: () => {} },
    { more: () => h('button', '更多') },
  );
  assert.match(html, /<nav aria-label="工作区标签" id="work" class="custom f-workspace-tabs">/);
  assert.match(html, /<ul class="f-workspace-tabs-list">/);
  assert.match(html, /<a class="f-workspace-tabs-link" href="\/home">首页<\/a>/);
  assert.match(
    html,
    /<button class="f-workspace-tabs-link" type="button" aria-current="page">项目<\/button>/,
  );
  assert.match(html, /aria-label="关闭项目"/);
  assert.match(html, /disabled aria-label="关闭锁定"/);
  assert.doesNotMatch(html, /<button[^>]*>[^<]*<button/);
  assert.match(html, /class="f-workspace-tabs-more"><button>更多<\/button>/);
  assert.doesNotMatch(html, /f-workspace-tabs-scroll--/);
});
test('missing close handler, empty more slot and unsafe href do not create fake actions', async () => {
  const html = await render(
    {
      items: [{ key: 'x', label: '危险', href: 'javascript:alert(1)', closable: true }],
      activeKey: null,
    },
    { more: () => h(Fragment, null, [h(Comment, ''), h(Text, '  ')]) },
  );
  assert.doesNotMatch(
    html,
    /href="javascript|f-workspace-tabs-close|f-workspace-tabs-more|aria-current/,
  );
  assert.match(html, /<button class="f-workspace-tabs-link" type="button" disabled>危险<\/button>/);
});
function mount(input = {}, { resizeObserver = true, direction = 'ltr', slots = {} } = {}) {
  const observers = [],
    handlers = new Map();
  const fakeDocument = { body: {}, activeElement: null };
  fakeDocument.activeElement = fakeDocument.body;
  globalThis.document = fakeDocument;
  let root;
  globalThis.window = {
    getComputedStyle: () => ({ direction }),
    addEventListener: (name, cb) => handlers.set(name, cb),
    removeEventListener: (name) => handlers.delete(name),
  };
  if (resizeObserver)
    globalThis.ResizeObserver = class {
      constructor(cb) {
        this.cb = cb;
        this.nodes = [];
        observers.push(this);
      }
      observe(node) {
        this.nodes.push(node);
      }
      disconnect() {
        this.disconnected = true;
      }
    };
  else delete globalThis.ResizeObserver;
  const node = (type, text = '') =>
    markRaw({
      type,
      text,
      props: {},
      children: [],
      parent: null,
      focus() {
        fakeDocument.activeElement = this;
      },
      get isConnected() {
        let current = this;
        while (current) {
          if (current === root) return true;
          current = current.parent;
        }
        return false;
      },
      getBoundingClientRect() {
        return (
          this.rect ??
          (String(this.props.class).includes('f-workspace-tabs-scroll')
            ? { left: 0, right: 0 }
            : { left: 0, right: 300 })
        );
      },
      scrollWidth: 300,
      clientWidth: 300,
      scrollLeft: 0,
      scrollBy({ left }) {
        this.lastDelta = left;
        const max = this.scrollWidth - this.clientWidth;
        this.scrollLeft =
          direction === 'rtl'
            ? Math.max(-max, Math.min(0, this.scrollLeft + left))
            : Math.max(0, Math.min(max, this.scrollLeft + left));
      },
    });
  const walk = (n) => [n, ...n.children.flatMap(walk)];
  const renderer = createRenderer({
    createElement: (type) => node(type),
    createText: (text) => node('#text', text),
    createComment: (text) => node('#comment', text),
    setText: (n, text) => {
      n.text = text;
    },
    setElementText: (n, text) => {
      n.text = text;
      n.children = [];
    },
    patchProp: (n, key, _, value) => {
      n.props[key] = value;
    },
    parentNode: (n) => n.parent,
    nextSibling: (n) => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
    insert(n, p, anchor) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
      const index = anchor ? p.children.indexOf(anchor) : -1;
      p.children.splice(index < 0 ? p.children.length : index, 0, n);
      n.parent = p;
    },
    remove(n) {
      if (walk(n).includes(fakeDocument.activeElement))
        fakeDocument.activeElement = fakeDocument.body;
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
      n.parent = null;
    },
  });
  const props = reactive({ items, activeKey: 'a', onSelect: () => {}, ...input });
  root = node('root');
  const app = renderer.createApp({ render: () => h(WorkspaceTabs, props, slots) });
  app.mount(root);
  const all = () => walk(root),
    find = (predicate) => all().find(predicate);
  return {
    props,
    app,
    observers,
    handlers,
    document: fakeDocument,
    all,
    find,
    viewport: () => find((n) => n.props.class === 'f-workspace-tabs-viewport'),
    scroll: (label) => find((n) => n.props['aria-label'] === label),
  };
}
test('selection and close events leave parent state untouched, including rejected changes', async () => {
  const selected = [],
    closed = [];
  const view = mount({ onSelect: (key) => selected.push(key), onClose: (key) => closed.push(key) });
  await nextTick();
  view.find((n) => n.type === 'a' && n.props.href === '/home').props.onClick();
  view.scroll('关闭项目').props.onClick({ currentTarget: view.scroll('关闭项目') });
  view.scroll('关闭锁定').props.onClick({ currentTarget: view.scroll('关闭锁定') });
  assert.deepEqual(selected, ['home']);
  assert.deepEqual(closed, ['a']);
  assert.equal(view.props.activeKey, 'a');
  assert.equal(view.props.items.length, 3);
  assert.equal(view.find((n) => n.props['aria-current'] === 'page').text, '项目');
  view.app.unmount();
});
test('selection requires a listener only for button items, including once listeners', async () => {
  const closed = [];
  const view = mount({ onSelect: undefined, onClose: (key) => closed.push(key) });
  await nextTick();
  const page = () => view.find((n) => n.type === 'button' && n.text === '项目');
  const link = () => view.find((n) => n.type === 'a' && n.props.href === '/home');
  assert.equal(page().props.disabled, true);
  assert.ok(link(), 'real destinations remain links without a selection listener');
  view.scroll('关闭项目').props.onClick({ currentTarget: view.scroll('关闭项目') });
  assert.deepEqual(closed, ['a'], 'close remains independently available');
  const selected = [];
  view.props.onSelectOnce = (key) => selected.push(key);
  await nextTick();
  assert.equal(page().props.disabled, false);
  page().props.onClick();
  await nextTick();
  assert.deepEqual(selected, ['a']);
  assert.equal(page().props.disabled, true, 'one-shot listener cannot leave an inert action');
  assert.ok(link(), 'links stay available after a one-shot listener is consumed');
  view.app.unmount();
});
test('actual overflow, scrolling, boundaries and ResizeObserver update correctly', async () => {
  const view = mount();
  await nextTick();
  const viewport = view.viewport();
  assert.equal(view.observers[0].nodes.length, 2);
  assert.equal(view.scroll('向左滚动标签'), undefined);
  viewport.scrollWidth = 301;
  view.observers[0].cb();
  await nextTick();
  assert.equal(view.scroll('向左滚动标签').props.disabled, true);
  assert.equal(view.scroll('向右滚动标签').props.disabled, false);
  view.scroll('向右滚动标签').props.onClick();
  await nextTick();
  assert.equal(viewport.lastDelta, 240);
  assert.equal(viewport.scrollLeft, 1);
  assert.equal(view.scroll('向右滚动标签').props.disabled, true);
  assert.equal(view.scroll('向左滚动标签').props.disabled, false);
  viewport.scrollWidth = 300;
  view.observers[0].cb();
  await nextTick();
  assert.equal(view.scroll('向右滚动标签'), undefined);
  const observer = view.observers[0];
  view.app.unmount();
  assert.equal(observer.disconnected, true);
});
test('RTL physical edges, resize fallback and teardown are correct', async () => {
  const view = mount({}, { resizeObserver: false, direction: 'rtl' });
  await nextTick();
  const viewport = view.viewport();
  viewport.scrollWidth = 600;
  view.handlers.get('resize')();
  await nextTick();
  assert.equal(view.scroll('向右滚动标签').props.disabled, true);
  assert.equal(view.scroll('向左滚动标签').props.disabled, false);
  view.scroll('向左滚动标签').props.onClick();
  await nextTick();
  assert.equal(viewport.lastDelta, -240);
  assert.equal(viewport.scrollLeft, -240);
  assert.equal(view.scroll('向右滚动标签').props.disabled, false);
  view.app.unmount();
  assert.equal(view.handlers.has('resize'), false);
});
test('close listener can be added or removed after mounting and plugin registers component', async () => {
  const view = mount();
  await nextTick();
  assert.equal(view.scroll('关闭项目'), undefined);
  view.props.onClose = () => {};
  await nextTick();
  assert.ok(view.scroll('关闭项目'));
  delete view.props.onClose;
  await nextTick();
  assert.equal(view.scroll('关闭项目'), undefined);
  view.app.unmount();
  const registrations = new Map();
  BTDESIGNPlugin.install({
    component(name, component) {
      registrations.set(name, component);
    },
  });
  assert.equal(registrations.get('FWorkspaceTabs'), WorkspaceTabs);
});

test('once-only close listener is consumed without changing tab state', async () => {
  let calls = 0;
  const view = mount({ onCloseOnce: () => calls++ });
  await nextTick();
  view.scroll('关闭项目').props.onClick({ currentTarget: view.scroll('关闭项目') });
  await nextTick();
  assert.equal(calls, 1);
  assert.equal(view.scroll('关闭项目'), undefined);
  assert.equal(view.props.items.length, 3);
  assert.equal(view.props.activeKey, 'a');
  view.app.unmount();
});
test('scroll event and legacy scrollBy fallback update actual boundaries', async () => {
  const view = mount();
  await nextTick();
  const viewport = view.viewport();
  viewport.scrollWidth = 600;
  viewport.scrollLeft = 120;
  view.find((n) => n.type === 'nav').props.onWheel();
  viewport.props.onScroll();
  await nextTick();
  assert.equal(view.scroll('向左滚动标签').props.disabled, false);
  assert.equal(view.scroll('向右滚动标签').props.disabled, false);
  viewport.scrollBy = () => {
    throw new TypeError('unsupported options');
  };
  view.scroll('向右滚动标签').props.onClick();
  await nextTick();
  assert.equal(viewport.scrollLeft, 360);
  assert.equal(view.scroll('向右滚动标签').props.disabled, true);
  view.app.unmount();
});

test('focused close restores the next available entry after delayed removal, then the previous when needed', async () => {
  const extended = [...items, { key: 'next', label: '下一项', closable: true }];
  const view = mount({ items: extended, onClose: () => {} });
  await nextTick();
  const close = view.scroll('关闭项目');
  close.focus();
  close.props.onClick({ currentTarget: close });
  await nextTick();
  assert.equal(view.document.activeElement, close, 'a rejected close keeps focus');
  view.props.items = extended.filter((item) => item.key !== 'a');
  await nextTick();
  await nextTick();
  assert.equal(view.document.activeElement.text, '下一项', 'skips disabled subsequent entry');
  const nextClose = view.scroll('关闭下一项');
  nextClose.focus();
  nextClose.props.onClick({ currentTarget: nextClose });
  await nextTick();
  view.props.items = view.props.items.filter((item) => item.key !== 'next');
  await nextTick();
  await nextTick();
  assert.equal(view.document.activeElement.text, '首页', 'falls back to previous enabled entry');
  view.app.unmount();
});
test('focus restoration skips buttons that have no selection listener', async () => {
  const entries = [
    { key: 'a', label: '当前', closable: true },
    { key: 'b', label: '不可选择' },
    { key: 'c', label: '安全链接', href: '/next' },
  ];
  const view = mount({ items: entries, onSelect: undefined, onClose: () => {} });
  await nextTick();
  const close = view.scroll('关闭当前');
  close.focus();
  close.props.onClick({ currentTarget: close });
  view.props.items = entries.slice(1);
  await nextTick();
  await nextTick();
  assert.equal(view.document.activeElement.text, '安全链接');
  view.app.unmount();
});
test('focus deliberately moved by host is not stolen after a later close', async () => {
  const view = mount({ onClose: () => {} });
  await nextTick();
  const close = view.scroll('关闭项目');
  close.focus();
  close.props.onClick({ currentTarget: close });
  await nextTick();
  const other = { id: 'outside' };
  view.document.activeElement = other;
  view.find((n) => n.type === 'nav').props.onFocusout({ target: close, relatedTarget: other });
  await nextTick();
  view.props.items = view.props.items.filter((item) => item.key !== 'a');
  await nextTick();
  await nextTick();
  assert.equal(view.document.activeElement, other);
  view.app.unmount();
});
test('activeKey changes reveal only the horizontal viewport and do not fight manual scrolling', async () => {
  const view = mount();
  await nextTick();
  const viewport = view.viewport();
  viewport.scrollWidth = 700;
  viewport.clientWidth = 300;
  viewport.rect = { left: 100, right: 400 };
  const home = view.find((n) => n.type === 'a' && n.props.href === '/home');
  home.rect = { left: 450, right: 510 };
  view.props.activeKey = 'home';
  await nextTick();
  await nextTick();
  assert.equal(viewport.lastDelta, 110);
  assert.equal(viewport.scrollLeft, 110);
  viewport.scrollLeft = 0;
  viewport.lastDelta = undefined;
  viewport.props.onScroll();
  await nextTick();
  assert.equal(viewport.scrollLeft, 0);
  assert.equal(viewport.lastDelta, undefined);
  view.props.items = [...view.props.items];
  await nextTick();
  await nextTick();
  assert.equal(
    viewport.lastDelta,
    undefined,
    'unrelated rerender does not move a manually scrolled viewport',
  );
  view.app.unmount();
});

test('active change while hidden waits for visible viewport and does not repeat after manual scrolling', async () => {
  const view = mount();
  await nextTick();
  const viewport = view.viewport();
  viewport.clientWidth = 0;
  viewport.scrollWidth = 700;
  viewport.rect = { left: 100, right: 400 };
  const home = view.find((node) => node.type === 'a' && node.props.href === '/home');
  home.rect = { left: 450, right: 510 };
  view.props.activeKey = 'home';
  await nextTick();
  await nextTick();
  assert.equal(viewport.lastDelta, undefined);
  viewport.clientWidth = 300;
  view.observers[0].cb();
  await nextTick();
  assert.equal(viewport.lastDelta, 110);
  viewport.lastDelta = undefined;
  viewport.scrollLeft = 0;
  viewport.props.onScroll();
  view.observers[0].cb();
  await nextTick();
  assert.equal(viewport.lastDelta, undefined);
  view.app.unmount();
});

test('revealing a middle item includes its close button and excludes visible overlays', async () => {
  const view = mount({ onClose: () => {} });
  await nextTick();
  const viewport = view.viewport();
  viewport.clientWidth = 300;
  viewport.scrollWidth = 700;
  viewport.scrollLeft = 200;
  viewport.rect = { left: 100, right: 400 };
  view.observers[0].cb();
  await nextTick();
  view.scroll('向左滚动标签').rect = { left: 100, right: 130 };
  view.scroll('向右滚动标签').rect = { left: 370, right: 400 };
  const tab = view.find((node) => node.type === 'button' && node.text === '项目');
  tab.rect = { left: 250, right: 350 };
  tab.parent.rect = { left: 250, right: 380.23 };
  tab.closest = () => tab.parent;
  view.props.activeKey = 'home';
  await nextTick();
  viewport.scrollLeft = 200;
  viewport.lastDelta = undefined;
  view.observers[0].cb();
  await nextTick();
  view.props.activeKey = 'a';
  await nextTick();
  assert.equal(viewport.lastDelta, 11, 'rounds away from the overlay to reveal the close button');
  view.app.unmount();
});

test('revealing the final item reaches the edge and removes its covering scroll control', async () => {
  const extra = [...items, { key: 'last', label: '末项', closable: true }];
  const view = mount({ items: extra, onClose: () => {} });
  await nextTick();
  const viewport = view.viewport();
  viewport.clientWidth = 300;
  viewport.scrollWidth = 700;
  viewport.scrollLeft = 390;
  viewport.rect = { left: 100, right: 400 };
  view.find((node) => node.type === 'button' && node.text === '项目').rect = {
    left: 200,
    right: 250,
  };
  view.observers[0].cb();
  await nextTick();
  view.scroll('向左滚动标签').rect = { left: 100, right: 130 };
  view.scroll('向右滚动标签').rect = { left: 370, right: 400 };
  const tab = view.find((node) => node.type === 'button' && node.text === '末项');
  tab.rect = { left: 350, right: 365 };
  tab.parent.rect = { left: 350, right: 410 };
  tab.closest = () => tab.parent;
  view.props.activeKey = 'last';
  await nextTick();
  assert.equal(viewport.scrollLeft, 400);
  assert.equal(view.scroll('向右滚动标签').props.disabled, true);
  view.app.unmount();
});

test('layout resizing keeps a previously visible active tab visible, but respects manual scrolling away', async () => {
  const view = mount({ onClose: () => {} });
  await nextTick();
  const viewport = view.viewport();
  viewport.clientWidth = 300;
  viewport.scrollWidth = 700;
  viewport.scrollLeft = 400;
  viewport.rect = { left: 100, right: 400 };
  const tab = view.find((node) => node.type === 'button' && node.text === '项目');
  tab.closest = () => tab.parent;
  let contentRight = 790;
  tab.parent.getBoundingClientRect = () => ({
    left: contentRight - viewport.scrollLeft - 80,
    right: contentRight - viewport.scrollLeft,
  });
  view.observers[0].cb();
  await nextTick();
  view.scroll('向左滚动标签').rect = { left: 100, right: 130 };
  view.scroll('向右滚动标签').rect = { left: 370, right: 400 };
  viewport.props.onScroll();
  // A larger Lab gap moves the active tab beyond the old scroll endpoint.
  viewport.scrollWidth = 800;
  contentRight = 890;
  view.observers[0].cb();
  await nextTick();
  assert.equal(viewport.scrollLeft, 500, 'keeps the previously visible tab at the new edge');
  // A deliberate scroll away clears the visibility condition.
  viewport.scrollLeft = 0;
  viewport.props.onScroll();
  viewport.lastDelta = undefined;
  viewport.scrollWidth = 900;
  contentRight = 990;
  view.observers[0].cb();
  await nextTick();
  assert.equal(viewport.lastDelta, undefined, 'layout changes do not override manual scrolling');
  view.app.unmount();
});

test('a layout-induced scroll arriving before ResizeObserver preserves previous visibility', async () => {
  const view = mount();
  await nextTick();
  const viewport = view.viewport();
  viewport.clientWidth = 300;
  viewport.scrollWidth = 700;
  viewport.scrollLeft = 400;
  viewport.rect = { left: 100, right: 400 };
  const tab = view.find((node) => node.type === 'button' && node.text === '项目');
  tab.closest = () => tab.parent;
  let contentRight = 790;
  tab.parent.getBoundingClientRect = () => ({
    left: contentRight - viewport.scrollLeft - 80,
    right: contentRight - viewport.scrollLeft,
  });
  view.observers[0].cb();
  await nextTick();
  view.scroll('向左滚动标签').rect = { left: 100, right: 130 };
  view.scroll('向右滚动标签').rect = { left: 370, right: 400 };
  viewport.props.onScroll();
  viewport.scrollWidth = 800;
  contentRight = 890;
  viewport.props.onScroll();
  await nextTick();
  assert.equal(viewport.scrollLeft, 500);
  view.app.unmount();
});

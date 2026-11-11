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
import { Tabs } from '../dist/index.js';

const items = [
  { value: 'one', label: 'One', content: 'First' },
  { value: 'disabled', label: 'Unavailable', disabled: true },
  { value: 'two', label: 'Two', content: 'Second' },
];
const render = (props) =>
  renderToString(createSSRApp({ render: () => h(Tabs, { items, ...props }) }));
test('Vue Tabs expose styles and orientation with SSR-linked tabs and panels', async () => {
  assert.match(await render({}), /^<div class="f-tabs">/);
  for (const variant of ['line', 'text', 'card', 'card-gutter', 'rounded']) {
    const html = await render({ variant, orientation: 'vertical' });
    assert.match(html, new RegExp(`f-tabs--${variant} f-tabs--vertical`));
    assert.match(html, /role="tablist"[^>]*aria-orientation="vertical"/);
    assert.match(html, /aria-selected="false"[^>]*disabled/);
    const tab = html.match(/id="([^"]+-tab-0)" aria-controls="([^"]+-panel-0)"/);
    assert.ok(tab);
    assert.ok(html.includes(`id="${tab[2]}" aria-labelledby="${tab[1]}"`));
  }
});

const iconItems = [
  { value: 'icon', label: '图标面板', content: '默认内容' },
  { value: 'b', label: '禁用', disabled: true },
  { value: 'c', label: '其他', content: 'C 内容' },
];
const renderTabsSize = (props = {}, slots = {}) =>
  renderToString(createSSRApp({ render: () => h(Tabs, { items: iconItems, ...props }, slots) }));
function mount(input = {}) {
  let active;
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
    insert(n, p, a) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
      const i = a ? p.children.indexOf(a) : -1;
      p.children.splice(i < 0 ? p.children.length : i, 0, n);
      n.parent = p;
    },
    remove(n) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
    },
  });
  const props = reactive({ items: iconItems, ...input }),
    root = make('root');
  const app = renderer.createApp({ render: () => h(Tabs, props) });
  app.mount(root);
  return { props, app, all: () => walk(root), active: () => active };
}
const tab = (v, index) => v.all().filter((n) => n.props.role === 'tab')[index];
const key = (key) => ({
  key,
  preventDefault() {
    this.prevented = true;
  },
});

test('default markup remains compatible; four sizes work with every variant and orientation', async () => {
  assert.match(await renderTabsSize(), /^<div class="f-tabs">/);
  for (const size of ['mini', 'small', 'medium', 'big'])
    for (const variant of ['default', 'line', 'text', 'card', 'card-gutter', 'rounded'])
      for (const orientation of ['horizontal', 'vertical']) {
        const html = await renderTabsSize({ size, variant, orientation });
        if (size === 'medium') assert.doesNotMatch(html, /f-tabs--medium/);
        else assert.match(html, new RegExp(`f-tabs--${size}`));
        if (variant !== 'default') assert.match(html, new RegExp(`f-tabs--${variant}`));
        assert.match(html, new RegExp(`aria-orientation="${orientation}"`));
      }
});
test('icon render prop is inert decorative content and does not conflict with panel slot named icon', async () => {
  const calls = [];
  const html = await renderTabsSize(
    {
      renderIcon: (item, index) => {
        calls.push([item.value, index]);
        return h('svg', { 'aria-label': '不应读出' }, [h('path')]);
      },
    },
    { icon: () => h('strong', '原有面板插槽') },
  );
  assert.deepEqual(calls, [
    ['icon', 0],
    ['b', 1],
    ['c', 2],
  ]);
  assert.match(html, /<span class="f-tab-icon" aria-hidden="true" inert[^>]*><svg/);
  assert.match(html, /<strong>原有面板插槽<\/strong>/);
});
test('empty icon strings, fragments and comments leave no empty wrapper', async () => {
  for (const icon of [
    undefined,
    null,
    false,
    '',
    '  ',
    [],
    h(Comment, ''),
    h(Text, ' '),
    h(Fragment, null, [h(Comment, ''), h(Text, ' ')]),
  ]) {
    const html = await renderTabsSize({ renderIcon: () => icon });
    assert.doesNotMatch(html, /f-tab-icon/);
  }
  assert.match(await renderTabsSize({ renderIcon: () => h('span', '图') }), /f-tab-icon/);
});
test('keyboard skips disabled items and reports selection when parent refuses controlled change', async () => {
  const changes = [];
  const v = mount({
    modelValue: 'icon',
    orientation: 'vertical',
    'onUpdate:modelValue': (value) => changes.push(value),
    renderIcon: () => h('i', '图'),
  });
  const e = key('ArrowDown');
  tab(v, 0).props.onKeydown(e);
  await nextTick();
  assert.equal(e.prevented, true);
  assert.deepEqual(changes, ['c']);
  assert.equal(tab(v, 0).props['aria-selected'], true);
  assert.equal(tab(v, 2).props['aria-selected'], false);
  assert.equal(v.active(), tab(v, 2));
  v.props.modelValue = 'c';
  await nextTick();
  assert.equal(tab(v, 2).props['aria-selected'], true);
  tab(v, 2).props.onKeydown(key('Home'));
  await nextTick();
  assert.deepEqual(changes, ['c', 'icon']);
  v.app.unmount();
});

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
  ref,
} from 'vue';
import { renderToString } from '@vue/server-renderer';
import { SystemHeader, BTDESIGNPlugin } from '../dist/index.js';

const render = (slots = {}, attrs = {}) =>
  renderToString(createSSRApp({ render: () => h(SystemHeader, attrs, slots) }));
test('SystemHeader keeps semantic header, attrs and distinct caller-owned regions in order', async () => {
  const html = await render(
    {
      brand: () => h('a', { href: '/' }, '品牌'),
      search: () => h('input', { type: 'search', 'aria-label': '搜索' }),
      actions: () => h('button', '操作'),
      account: () => h('button', '账号'),
      organization: () => h('button', '组织'),
    },
    { id: 'system', class: 'custom', 'data-owner': 'team' },
  );
  assert.match(html, /^<header id="system" class="custom f-system-header" data-owner="team">/);
  assert.match(html, /class="f-system-header-brand"><a href="\/">品牌<\/a>/);
  assert.match(html, /class="f-system-header-end"/);
  const names = ['brand', 'end', 'search', 'actions', 'account', 'organization'];
  const positions = names.map((name) => html.indexOf(`class="f-system-header-${name}"`));
  assert.ok(positions.every((pos) => pos >= 0));
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
  assert.match(html, /aria-label="搜索"/);
});
test('missing and blank slots, nested fragments and comments create no sections or end wrapper', async () => {
  const empty = await render({
    brand: () => ' ',
    search: () => h(Comment, ''),
    actions: () => h(Text, ' \n '),
    account: () => h(Fragment, null, [h(Comment, ''), h(Text, '  ')]),
    organization: () => [],
  });
  assert.doesNotMatch(empty, /f-system-header-(brand|end|search|actions|account|organization)/);
  const rightOnly = await render({ account: () => h('span', '个人') });
  assert.match(rightOnly, /class="f-system-header-end"/);
  assert.match(rightOnly, /class="f-system-header-account"/);
  assert.doesNotMatch(rightOnly, /f-system-header-brand/);
  const zero = await render({ actions: () => 0 });
  assert.match(zero, /class="f-system-header-actions">0/);
});
test('dynamic slot updates remove their section and header attributes and events remain functional', async () => {
  const node = (type, text = '') => markRaw({ type, text, props: {}, children: [], parent: null });
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
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
    },
  });
  const show = ref(true);
  let clicked = 0;
  const root = node('root');
  const app = renderer.createApp({
    render: () =>
      h(
        SystemHeader,
        { onClick: () => clicked++ },
        { search: () => (show.value ? h('input', { 'aria-label': '搜索' }) : h(Comment, '')) },
      ),
  });
  app.mount(root);
  const header = () => walk(root).find((n) => n.type === 'header');
  assert.ok(walk(root).some((n) => n.props.class === 'f-system-header-search'));
  header().props.onClick();
  assert.equal(clicked, 1);
  show.value = false;
  await nextTick();
  assert.equal(
    walk(root).some((n) => n.props.class === 'f-system-header-search'),
    false,
  );
  assert.equal(
    walk(root).some((n) => n.props.class === 'f-system-header-end'),
    false,
  );
  app.unmount();
});
test('plugin exposes SystemHeader for template registration', () => {
  const registrations = new Map();
  BTDESIGNPlugin.install({
    component(name, component) {
      registrations.set(name, component);
    },
  });
  assert.equal(registrations.get('FSystemHeader'), SystemHeader);
});

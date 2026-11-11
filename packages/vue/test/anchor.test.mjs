import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Anchor } from '../dist/anchor.js';

const items = [
  {
    id: 'intro',
    href: '#intro',
    title: '介绍',
    children: [{ id: 'more', href: '#more', title: '更多' }],
  },
  { id: 'invalid', href: 'javascript:alert(1)', title: '无效地址' },
];
test('Anchor renders nested real links, named navigation and caller-controlled current location', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () => h(Anchor, { id: 'contents', items, activeHref: '#more', label: '文章目录' }),
    }),
  );
  assert.match(html, /^<nav id="contents" aria-label="文章目录" class="f-anchor">/);
  assert.match(html, /href="#intro">介绍<\/a>/);
  assert.match(html, /href="#more" aria-current="location">更多<\/a>/);
  assert.match(html, /aria-disabled="true">无效地址<\/span>/);
  assert.doesNotMatch(html, /javascript:/);
  assert.equal((html.match(/<ol/g) ?? []).length, 2);
});
test('Anchor emits the native event so a hash-router consumer can prevent navigation', () => {
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
  let received;
  const event = {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
  renderer
    .createApp({
      render: () =>
        h(Anchor, {
          items,
          onNavigate: (href, e) => {
            received = href;
            e.preventDefault();
          },
        }),
    })
    .mount(root);
  const find = (el) => (el.type === 'a' ? el : el.children.map(find).find(Boolean));
  find(root).props.onClick(event);
  assert.equal(received, '#intro');
  assert.equal(event.defaultPrevented, true);
});

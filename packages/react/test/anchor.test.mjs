import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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
test('Anchor exposes real, nested fragment links with a caller-provided current location', () => {
  const html = renderToStaticMarkup(
    h(Anchor, { id: 'contents', items, activeHref: '#more', label: '文章目录' }),
  );
  assert.match(html, /^<nav id="contents" aria-label="文章目录" class="f-anchor">/);
  assert.match(html, /href="#intro">介绍<\/a>/);
  assert.match(html, /href="#more" aria-current="location">更多<\/a>/);
  assert.match(html, /aria-disabled="true">无效地址<\/span>/);
  assert.doesNotMatch(html, /javascript:/);
  assert.equal((html.match(/<ol/g) ?? []).length, 2);
});
test('Anchor allows a hash-router consumer to prevent native navigation', () => {
  let received;
  const event = {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
  const tree = Anchor.render(
    {
      items,
      onNavigate: (href, e) => {
        received = href;
        e.preventDefault();
      },
    },
    null,
  );
  const link = tree.props.children.props.children[0].props.children[0];
  link.props.onClick(event);
  assert.equal(received, '#intro');
  assert.equal(event.defaultPrevented, true);
});

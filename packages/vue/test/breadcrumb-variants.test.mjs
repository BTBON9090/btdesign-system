import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Breadcrumb } from '../dist/index.js';

test('Breadcrumb separators preserve navigation semantics and safe links', async () => {
  for (const [separator, symbol] of [['slash', '/'], ['dot', '·'], ['arrow', '›']]) {
    const html = await renderToString(createSSRApp({ render: () => h(Breadcrumb, { separator, items: [{ label: '首页', href: '/home' }, { label: '当前', href: 'javascript:alert(1)' }] }) }));
    assert.match(html, new RegExp(`aria-hidden="true">${symbol}</span>`));
    assert.match(html, /href="\/home"/);
    assert.match(html, /aria-current="page">当前/);
    assert.doesNotMatch(html, /javascript:/);
  }
});

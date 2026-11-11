import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tabs } from '../dist/index.js';

const items = [
  { value: 'one', label: 'One', content: 'First' },
  { value: 'disabled', label: 'Unavailable', disabled: true },
  { value: 'two', label: 'Two', content: 'Second' },
];
test('Tabs expose each visual style and correct orientation without changing default classes', () => {
  assert.match(renderToStaticMarkup(h(Tabs, { items })), /^<div class="f-tabs">/);
  for (const variant of ['line', 'text', 'card', 'card-gutter', 'rounded']) {
    const html = renderToStaticMarkup(h(Tabs, { items, variant, orientation: 'vertical' }));
    assert.match(html, new RegExp(`f-tabs--${variant} f-tabs--vertical`));
    assert.match(html, /role="tablist"[^>]*aria-orientation="vertical"/);
    assert.match(html, /aria-selected="false"[^>]*disabled=""/);
    const tab = html.match(/id="([^"]+-tab-0)" aria-controls="([^"]+-panel-0)"/);
    assert.ok(tab);
    assert.ok(html.includes(`id="${tab[2]}" aria-labelledby="${tab[1]}"`));
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
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

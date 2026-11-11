import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { Rate } from '../dist/rate.js';
const render = (node) => renderToString(createSSRApp({ render: () => node }));

test('half rating renders a named native radio group with a real field label', async () => {
  const html = await render(
    h(
      Field,
      { id: 'rating', label: '满意度', required: true },
      { default: () => h(Rate, { name: 'rating', allowHalf: true, defaultValue: 2.5 }) },
    ),
  );
  assert.equal((html.match(/type="radio"/g) ?? []).length, 10);
  assert.equal((html.match(/id="rating"/g) ?? []).length, 1);
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /aria-labelledby="rating-label"/);
  assert.match(html, /checked[^>]*aria-label="2.5 \/ 5"/);
  assert.match(html, /--f-rate-fill:50%/);
  assert.match(html, /name="rating"/);
});

test('heart rating inherits disabled state and exposes accessible value names', async () => {
  const html = await render(
    h(
      Field,
      { label: '喜爱程度', disabled: true },
      { default: () => h(Rate, { shape: 'heart', count: 3 }) },
    ),
  );
  assert.equal((html.match(/type="radio"/g) ?? []).length, 3);
  assert.equal((html.match(/\sdisabled(?:[\s>])/g) ?? []).length, 3);
  assert.match(html, /♥/);
  assert.match(html, /aria-label="3 \/ 3"/);
});

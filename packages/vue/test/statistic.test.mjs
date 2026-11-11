import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Statistic } from '../dist/statistic.js';

const render = (props, slots) =>
  renderToString(createSSRApp({ render: () => h(Statistic, props, slots) }));

test('Statistic formats the supplied value and exposes trend without relying only on color', async () => {
  const html = await render({
    id: 'orders',
    title: '完成率',
    value: 25,
    format: 'percent',
    precision: 1,
    trend: 'up',
    trendText: '较上期提高',
  });
  assert.match(html, /role="group" aria-labelledby="orders-label"/);
  assert.match(html, /id="orders-label"[^>]*>完成率/);
  assert.match(html, />25\.0<\/span><span[^>]*>%<\/span>/);
  assert.match(html, /aria-label="上升"/);
  assert.match(html, /较上期提高/);
});

test('Statistic supports rich slots, non-finite values, invalid locale and escaped text', async () => {
  assert.match(await render({ value: Number.NaN }), /—/);
  await assert.doesNotReject(render({ value: 42, locale: 'not_a_locale' }));
  const html = await render({ value: '<script>' }, { suffix: () => h('strong', '项') });
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<strong>项<\/strong>/);
  assert.doesNotMatch(html, /<script>/);
});

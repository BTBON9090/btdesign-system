import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Statistic } from '../dist/statistic.js';

test('Statistic formats the supplied value and exposes trend without relying only on color', () => {
  const html = renderToStaticMarkup(
    h(Statistic, {
      id: 'orders',
      title: '完成率',
      value: 25,
      format: 'percent',
      precision: 1,
      trend: 'up',
      trendText: '较上期提高',
    }),
  );
  assert.match(html, /role="group" aria-labelledby="orders-label"/);
  assert.match(html, /id="orders-label"[^>]*>完成率/);
  assert.match(html, />25\.0<\/span><span[^>]*>%<\/span>/);
  assert.match(html, /aria-label="上升"/);
  assert.match(html, /较上期提高/);
});

test('Statistic safely handles non-finite values, invalid locale and literal text', () => {
  assert.match(renderToStaticMarkup(h(Statistic, { value: Number.NaN })), /—/);
  assert.doesNotThrow(() =>
    renderToStaticMarkup(h(Statistic, { value: 42, locale: 'not_a_locale' })),
  );
  const html = renderToStaticMarkup(h(Statistic, { value: '<script>', suffix: '项' }));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /项/);
  assert.doesNotMatch(html, /<script>/);
});

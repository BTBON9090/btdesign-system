import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Carousel } from '../dist/carousel.js';

const items = [
  { key: 'one', content: '第一项' },
  { key: 'two', content: '第二项' },
];
test('Carousel labels slides, hides inactive content, and disables navigation at boundaries', () => {
  const html = renderToStaticMarkup(h(Carousel, { items, label: '项目展示' }));
  assert.match(html, /role="region" aria-label="项目展示" aria-roledescription="轮播"/);
  assert.match(html, /aria-label="1 \/ 2"[^>]*>第一项/);
  assert.match(html, /aria-label="2 \/ 2" hidden=""[^>]*>第二项/);
  assert.match(html, /aria-label="上一张" disabled=""/);
  assert.match(html, /aria-label="第 1 张" aria-current="true"/);
});

test('Carousel clamps externally supplied indexes and renders an explicit empty state', () => {
  const html = renderToStaticMarkup(
    h(Carousel, { items, index: 99, indicatorStyle: 'lines', indicatorPlacement: 'end' }),
  );
  assert.match(html, /aria-label="第 2 张" aria-current="true"/);
  assert.match(html, /f-carousel-indicators--lines f-carousel-indicators--end/);
  assert.match(renderToStaticMarkup(h(Carousel, { items: [] })), /暂无轮播内容/);
});

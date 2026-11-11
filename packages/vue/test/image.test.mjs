import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Image } from '../dist/image.js';

const render = (props, slots) =>
  renderToString(createSSRApp({ render: () => h(Image, props, slots) }));

test('Image preserves alternative text and exposes loading without opening an unavailable preview', async () => {
  const html = await render({
    src: '/sample.png',
    alt: '项目封面',
    caption: '封面',
    preview: true,
    aspectRatio: '16 / 9',
  });
  assert.match(html, /<figure/);
  assert.match(html, /aspect-ratio:16 \/ 9/);
  assert.match(html, /aria-label="查看大图：项目封面" disabled/);
  assert.match(html, /<img[^>]*alt="项目封面"/);
  assert.match(html, /role="status"[^>]*>加载中/);
  assert.match(html, /<figcaption[^>]*>封面<\/figcaption>/);
  assert.match(html, /<dialog[^>]*aria-label="查看大图：项目封面"/);
});

test('Image can be decorative without preview and escapes caller text', async () => {
  const html = await render({ src: '/sample.png', alt: '', caption: '<script>' });
  assert.match(html, /alt(?:=""|(?=\s|>))/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<dialog|<button|<script>/);
});

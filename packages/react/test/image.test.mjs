import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Image } from '../dist/image.js';

test('Image preserves alternative text and exposes loading without opening an unavailable preview', () => {
  const html = renderToStaticMarkup(
    h(Image, {
      src: '/sample.png',
      alt: '项目封面',
      caption: '封面',
      preview: true,
      aspectRatio: '16 / 9',
    }),
  );
  assert.match(html, /<figure/);
  assert.match(html, /aspect-ratio:16 \/ 9/);
  assert.match(html, /aria-label="查看大图：项目封面" disabled=""/);
  assert.match(html, /<img[^>]*alt="项目封面"/);
  assert.match(html, /role="status"[^>]*>加载中/);
  assert.match(html, /<figcaption[^>]*>封面<\/figcaption>/);
  assert.match(html, /<dialog[^>]*aria-label="查看大图：项目封面"/);
});

test('Image can be decorative without preview and escapes caller text', () => {
  const html = renderToStaticMarkup(h(Image, { src: '/sample.png', alt: '', caption: '<script>' }));
  assert.match(html, /alt=""/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<dialog|<button|<script>/);
});

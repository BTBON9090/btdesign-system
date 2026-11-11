import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResizeBox } from '../dist/index.js';

test('ResizeBox exposes constrained value, controlled pane and perpendicular separator orientation', () => {
  const html = renderToStaticMarkup(
    h(ResizeBox, {
      first: '目录',
      second: '内容',
      size: 95,
      min: 20,
      max: 80,
      orientation: 'vertical',
      handleLabel: '调整高度',
    }),
  );
  assert.match(html, /f-resize-box--vertical/);
  assert.match(html, /role="separator" aria-label="调整高度" aria-orientation="horizontal"/);
  assert.match(html, /aria-valuemin="20" aria-valuemax="80" aria-valuenow="80"/);
  const panel = html.match(/id="([^"]+-first)"/);
  assert.ok(panel);
  assert.ok(html.includes(`aria-controls="${panel[1]}"`));
  assert.match(html, /flex:80 1 0%/);
  assert.match(html, /flex:20 1 0%/);
});
test('disabled ResizeBox is removed from keyboard order', () => {
  assert.match(
    renderToStaticMarkup(h(ResizeBox, { disabled: true })),
    /aria-disabled="true" tabindex="-1"/,
  );
});

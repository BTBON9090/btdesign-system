import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../dist/index.js';

test('button variants keep icon-only controls named and disabled during loading', () => {
  const html = renderToStaticMarkup(
    h(
      Button,
      {
        size: 'xs',
        tone: 'warning',
        shape: 'pill',
        iconOnly: true,
        loading: true,
        'aria-label': '保存',
      },
      h('span', { 'aria-hidden': true }, '+'),
    ),
  );
  for (const name of [
    'f-button--xs',
    'f-button--tone-warning',
    'f-button--pill',
    'f-button--icon-only',
  ])
    assert.ok(html.includes(name), name);
  assert.match(html, /aria-label="保存"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /disabled=""/);
  assert.doesNotMatch(html, />\+<\/span>/);
});

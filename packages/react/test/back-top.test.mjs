import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BackTop } from '../dist/back-top.js';

test('BackTop does not expose a nonfunctional control before its scroll target is available', () => {
  assert.equal(renderToStaticMarkup(h(BackTop, { visibilityHeight: 10 })), '');
});

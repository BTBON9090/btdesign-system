import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge } from '../dist/index.js';

test('legacy Badge keeps variant, content and HTML attributes', () => {
  assert.match(
    renderToStaticMarkup(h(Badge, { variant: 'success', id: 'status' }, '已发布')),
    /^<span id="status" class="f-badge f-badge--success">已发布<\/span>$/,
  );
});
test('Badge count wraps a control without changing its semantics and exposes the uncapped count', () => {
  const html = renderToStaticMarkup(
    h(
      Badge,
      { count: 120, max: 99, variant: 'danger', badgeLabel: '120 条未读消息' },
      h('button', { type: 'button' }, '消息'),
    ),
  );
  assert.match(html, /f-badge-anchor/);
  assert.match(html, /<button type="button">消息<\/button>/);
  assert.match(html, /f-badge--danger f-badge--count f-badge--overlay/);
  assert.match(html, /aria-label="120 条未读消息">99\+<\/span>/);
});
test('Badge hides zero unless requested and renders an accessible dot', () => {
  assert.doesNotMatch(renderToStaticMarkup(h(Badge, { count: 0 }, '消息')), /f-badge--count/);
  assert.match(
    renderToStaticMarkup(h(Badge, { count: 0, showZero: true })),
    /aria-label="0">0<\/span>/,
  );
  assert.match(
    renderToStaticMarkup(h(Badge, { dot: true, badgeLabel: '有新消息' }, '头像')),
    /f-badge--dot f-badge--overlay" role="img" aria-label="有新消息"/,
  );
});

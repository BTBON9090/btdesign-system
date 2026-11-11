import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Badge } from '../dist/index.js';

const render = (props, child) =>
  renderToString(
    createSSRApp({ render: () => h(Badge, props, child === undefined ? undefined : () => child) }),
  );
test('legacy Vue Badge keeps variant, content and HTML attributes', async () => {
  assert.match(
    await render({ variant: 'success', id: 'status' }, '已发布'),
    /^<span id="status" class="f-badge f-badge--success">已发布<\/span>$/,
  );
});
test('Vue Badge count wraps a native control and exposes the uncapped count', async () => {
  const html = await render(
    { count: 120, max: 99, variant: 'danger', badgeLabel: '120 条未读消息' },
    h('button', { type: 'button' }, '消息'),
  );
  assert.match(html, /f-badge-anchor/);
  assert.match(html, /<button type="button">消息<\/button>/);
  assert.match(html, /f-badge--danger f-badge--count f-badge--overlay/);
  assert.match(html, /aria-label="120 条未读消息">99\+<\/span>/);
});
test('Vue Badge hides zero unless requested and renders an accessible dot', async () => {
  assert.doesNotMatch(await render({ count: 0 }, '消息'), /f-badge--count/);
  assert.match(await render({ count: 0, showZero: true }), /aria-label="0">0<\/span>/);
  assert.match(
    await render({ dot: true, badgeLabel: '有新消息' }, '头像'),
    /f-badge--dot f-badge--overlay" role="img" aria-label="有新消息"/,
  );
});

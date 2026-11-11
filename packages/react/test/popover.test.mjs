import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Popover } from '../dist/popover.js';

const render = (props = {}) => renderToStaticMarkup(h(Popover, {
  id: 'details', trigger: '打开', title: '详情标题', content: h('button', null, '执行操作'), ...props,
}));

test('Popover links its accessible dialog and preserves interactive content', () => {
  const html = render({ defaultOpen: true, placement: 'right-end' });
  assert.match(html, /aria-haspopup="dialog" aria-expanded="true" aria-controls="details-panel"/);
  assert.match(html, /id="details-panel"[^>]*f-popover-panel--right-end[^>]*role="dialog" aria-labelledby="details-panel-title"/);
  assert.match(html, /<button>执行操作<\/button>/);
  assert.match(html, /f-popover-panel--arrow/);
});

test('Popover supports controlled state, disabling and an accessible fallback label', () => {
  assert.doesNotMatch(render({ open: false, defaultOpen: true }), /role="dialog"/);
  assert.doesNotMatch(render({ defaultOpen: true, disabled: true }), /role="dialog"/);
  const html = render({ open: true, title: undefined, label: '更多信息', showArrow: false });
  assert.match(html, /role="dialog" aria-label="更多信息"/);
  assert.doesNotMatch(html, /f-popover-panel--arrow/);
});

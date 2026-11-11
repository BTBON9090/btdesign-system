import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tooltip } from '../dist/tooltip.js';

test('Tooltip preserves trigger descriptions and hides content until opened', () => {
  const html = renderToStaticMarkup(
    h(
      Tooltip,
      { id: 'hint', content: '保存后可分享' },
      h('button', { 'aria-describedby': 'existing' }, '保存'),
    ),
  );
  assert.match(html, /<button aria-describedby="existing hint">保存<\/button>/);
  assert.match(html, /id="hint" role="tooltip"[^>]*hidden=""[^>]*>保存后可分享/);
});
test('Tooltip supports controlled open, placement and disabled override', () => {
  const render = (props) =>
    renderToStaticMarkup(
      h(Tooltip, { id: 'hint', content: '说明', ...props }, h('button', {}, '帮助')),
    );
  const open = render({ open: true, placement: 'right' });
  assert.match(open, /f-tooltip-content--right/);
  assert.doesNotMatch(open, /hidden=""/);
  assert.match(render({ open: true, disabled: true }), /hidden=""/);
  assert.throws(() =>
    renderToStaticMarkup(h(Tooltip, { content: '说明' }, h('button'), h('button'))),
  );
});

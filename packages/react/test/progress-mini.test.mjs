import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Progress } from '../dist/progress.js';

test('mini is a true progress ring with accessible value and optional visible value', () => {
  const html = renderToStaticMarkup(
    h(Progress, { type: 'mini', value: 25, max: 50, label: '同步', status: 'warning' }),
  );
  assert.match(html, /f-progress-wrap--mini/);
  assert.match(
    html,
    /role="progressbar" aria-label="同步" aria-valuenow="25" aria-valuemin="0" aria-valuemax="50" aria-valuetext="50%，警告"/,
  );
  assert.match(html, /stroke-dashoffset:50/);
  assert.doesNotMatch(html, /f-progress-circle-content/);
  assert.match(html, /f-progress-mini-content/);
  assert.doesNotMatch(html, />50%/);
  assert.match(
    renderToStaticMarkup(h(Progress, { type: 'mini', value: 50, showValue: true })),
    />50%<\/span>/,
  );
});
test('mini clamps the range and hides zero-length arc', () => {
  const zero = renderToStaticMarkup(h(Progress, { type: 'mini', value: -5 }));
  assert.match(zero, /aria-valuenow="0"/);
  assert.match(zero, /visibility:hidden/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Progress } from '../dist/index.js';

test('circle exposes bounded progress, accessible status and a truthful SVG arc', () => {
  const html = renderToStaticMarkup(
    h(Progress, { type: 'circle', value: 25, max: 50, label: '上传', status: 'warning' }),
  );
  assert.match(
    html,
    /role="progressbar" aria-label="上传" aria-valuenow="25" aria-valuemin="0" aria-valuemax="50" aria-valuetext="50%，警告"/,
  );
  assert.match(html, /f-progress--warning/);
  assert.match(html, /stroke-dashoffset:50/);
  assert.match(html, /50%/);
});
test('line and circle clamp invalid values and do not infer business status', () => {
  const line = renderToStaticMarkup(h(Progress, { value: NaN, max: 0, showValue: true }));
  assert.match(line, /aria-valuenow="0"[^>]*aria-valuemax="100"/);
  assert.match(line, /width:0%/);
  assert.doesNotMatch(line, /aria-valuetext/);
  const circle = renderToStaticMarkup(
    h(Progress, { type: 'circle', value: 200, max: 100, showValue: false, status: 'error' }),
  );
  assert.match(circle, /aria-valuenow="100"[^>]*aria-valuetext="100%，错误"/);
  assert.match(circle, /stroke-dashoffset:0/);
});

test('zero progress renders no misleading colored arc', () => {
  const html = renderToStaticMarkup(h(Progress, { type: 'circle', value: 0 }));
  assert.match(html, /stroke-dashoffset:100;visibility:hidden/);
});

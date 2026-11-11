import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Steps } from '../dist/steps.js';

const items = [
  { id: 'one', title: '创建', description: '填写基本信息' },
  { id: 'two', title: '审核', icon: h('span', null, '✓') },
  { id: 'three', title: '发布', status: 'error' },
];
test('Steps derives progress from current, preserves error overrides and exposes status as text', () => {
  const html = renderToStaticMarkup(
    h(Steps, { id: 'wizard', label: '发布步骤', items, current: 1 }),
  );
  assert.match(html, /^<ol id="wizard" aria-label="发布步骤" class="f-steps f-steps--horizontal">/);
  assert.equal((html.match(/<li/g) ?? []).length, 3);
  assert.match(html, /f-steps-item--finish/);
  assert.match(html, /f-steps-item--process" aria-current="step"/);
  assert.match(html, /f-steps-item--error/);
  assert.match(html, /第 1 步，已完成：/);
  assert.match(html, /第 2 步，进行中：/);
  assert.match(html, /第 3 步，错误：/);
  assert.match(html, /aria-hidden="true"><span>✓<\/span>/);
  assert.doesNotMatch(html, /<button/);
});
test('Steps supports vertical orientation and bounds the current index', () => {
  const html = renderToStaticMarkup(
    h(Steps, { items, current: 99, orientation: 'vertical', 'aria-label': '自定义' }),
  );
  assert.match(html, /aria-label="自定义"/);
  assert.match(html, /f-steps--vertical/);
  assert.equal((html.match(/f-steps-item--finish/g) ?? []).length, 2);
  assert.match(
    html,
    /f-steps-item--error" aria-current="step"/,
    'current step remains current when it has an error',
  );
});

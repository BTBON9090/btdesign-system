import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Steps } from '../dist/steps.js';

const items = [
  { id: 'one', title: '创建', description: '填写基本信息' },
  { id: 'two', title: '审核' },
  { id: 'three', title: '发布', status: 'error' },
];
const render = (props, slots = {}) =>
  renderToString(createSSRApp({ render: () => h(Steps, props, slots) }));
test('Steps derives progress from current, preserves error overrides and exposes status as text', async () => {
  const html = await render(
    { id: 'wizard', label: '发布步骤', items, current: 1 },
    { 'icon-two': () => h('span', {}, '✓') },
  );
  assert.match(html, /^<ol id="wizard" aria-label="发布步骤" class="f-steps f-steps--horizontal">/);
  assert.equal((html.match(/<li/g) ?? []).length, 3);
  assert.match(html, /f-steps-item--finish/);
  assert.match(html, /f-steps-item--process" aria-current="step"/);
  assert.match(html, /f-steps-item--error/);
  assert.match(html, /第 1 步，已完成：/);
  assert.match(html, /第 2 步，进行中：/);
  assert.match(html, /第 3 步，错误：/);
  assert.match(html, /aria-hidden="true">(?:<!--\[-->)?<span>✓<\/span>/);
  assert.doesNotMatch(html, /<button/);
});
test('Steps supports vertical orientation and per-item title and description slots', async () => {
  const html = await render(
    { items: [{ id: 'a', title: '默认' }], orientation: 'vertical', 'aria-label': '自定义' },
    {
      'title-a': () => h('strong', {}, '授权'),
      'description-a': () => h('span', {}, '等待确认'),
    },
  );
  assert.match(html, /aria-label="自定义"/);
  assert.match(html, /f-steps--vertical/);
  assert.match(html, /<strong>授权<\/strong>/);
  assert.match(html, /<span>等待确认<\/span>/);
});

test('current step remains identifiable when its status is error', async () => {
  const html = await render({ items, current: 2 });
  assert.match(html, /f-steps-item--error" aria-current="step"/);
});

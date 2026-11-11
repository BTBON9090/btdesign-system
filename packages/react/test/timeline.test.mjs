import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Timeline } from '../dist/timeline.js';

const items = [
  {
    id: 'create',
    title: '创建项目',
    state: 'done',
    time: '11 月 1 日',
    dateTime: '2026-11-01',
    tone: 'success',
  },
  { id: 'review', title: '团队评审', state: 'current', description: '等待反馈' },
  { id: 'launch', title: '发布', state: 'pending' },
];

test('Timeline conveys sequence, date, tone and status without relying on marker color', () => {
  const html = renderToStaticMarkup(h(Timeline, { items, label: '项目进度', id: 'history' }));
  assert.match(
    html,
    /^<ol id="history" aria-label="项目进度" class="f-timeline f-timeline--vertical">/,
  );
  assert.equal((html.match(/<li/g) ?? []).length, 3);
  assert.match(html, /f-timeline-item--success[^>]*data-state="done"/);
  assert.match(html, /class="f-sr-only">已完成：/);
  assert.match(html, /data-state="current" aria-current="step"/);
  assert.match(html, /class="f-sr-only">待开始：/);
  assert.match(html, /<time[^>]*dateTime="2026-11-01">11 月 1 日<\/time>/);
});

test('Timeline supports horizontal orientation and custom title content', () => {
  const html = renderToStaticMarkup(
    h(Timeline, {
      orientation: 'horizontal',
      'aria-label': '审批记录',
      items: [{ id: 'a', title: h('strong', null, '已审批') }],
    }),
  );
  assert.match(html, /aria-label="审批记录"/);
  assert.match(html, /f-timeline--horizontal/);
  assert.match(html, /<strong>已审批<\/strong>/);
  assert.doesNotMatch(html, /aria-current=/);
});

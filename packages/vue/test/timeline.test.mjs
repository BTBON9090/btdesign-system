import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
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
const render = (props, slots = {}) =>
  renderToString(createSSRApp({ render: () => h(Timeline, props, slots) }));

test('Timeline conveys sequence, date, tone and status without relying on marker color', async () => {
  const html = await render({ items, label: '项目进度', id: 'history' });
  assert.match(
    html,
    /^<ol id="history" aria-label="项目进度" class="f-timeline f-timeline--vertical">/,
  );
  assert.equal((html.match(/<li/g) ?? []).length, 3);
  assert.match(html, /f-timeline-item--success[^>]*data-state="done"/);
  assert.match(html, /class="f-sr-only">已完成：/);
  assert.match(html, /data-state="current" aria-current="step"/);
  assert.match(html, /class="f-sr-only">待开始：/);
  assert.match(html, /<time[^>]*datetime="2026-11-01">11 月 1 日<\/time>/);
});

test('Timeline supports horizontal orientation and per-item title and description slots', async () => {
  const html = await render(
    { items: [{ id: 'a', title: '默认' }], orientation: 'horizontal', 'aria-label': '审批记录' },
    {
      'title-a': () => h('strong', {}, '已审批'),
      'description-a': () => h('span', {}, '自定义说明'),
    },
  );
  assert.match(html, /aria-label="审批记录"/);
  assert.match(html, /f-timeline--horizontal/);
  assert.match(html, /<strong>已审批<\/strong>/);
  assert.match(html, /<span>自定义说明<\/span>/);
  assert.doesNotMatch(html, /aria-current=/);
});

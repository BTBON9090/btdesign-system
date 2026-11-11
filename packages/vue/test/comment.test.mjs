import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Comment } from '../dist/comment.js';

const render = (props, slots) =>
  renderToString(createSSRApp({ render: () => h(Comment, props, slots) }));

test('Comment exposes named slots for accessible content, actions and nested replies', async () => {
  const html = await render(
    { author: '林晓', time: '1 小时前', dateTime: '2026-11-11T08:00:00Z', alignment: 'end' },
    {
      avatar: () => h('span', { role: 'img', 'aria-label': '林晓' }, '林'),
      content: () => h('strong', null, '建议补充校验'),
      actions: () => h('button', { type: 'button' }, '回复'),
      default: () => h(Comment, { author: '王宁', content: '收到' }),
    },
  );
  assert.equal((html.match(/<article/g) ?? []).length, 2);
  assert.match(html, /f-comment--end/);
  assert.match(html, /<time[^>]*datetime="2026-11-11T08:00:00Z"[^>]*>1 小时前<\/time>/);
  assert.match(html, /aria-label="林晓"/);
  assert.match(html, /<button type="button">回复<\/button>/);
  assert.match(html, /<strong>建议补充校验<\/strong>/);
  assert.match(html, /王宁/);
});

test('Comment escapes untrusted text and omits absent optional regions', async () => {
  const html = await render({ author: '<user>', content: '<script>' });
  assert.match(html, /&lt;user&gt;/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|<time|f-comment-actions|f-comment-replies/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Comment } from '../dist/comment.js';

test('Comment composes accessible author, time, content, actions and nested replies', () => {
  const html = renderToStaticMarkup(
    h(
      Comment,
      {
        author: '林晓',
        time: '1 小时前',
        dateTime: '2026-11-11T08:00:00Z',
        content: '建议补充校验',
        avatar: h('span', { role: 'img', 'aria-label': '林晓' }, '林'),
        actions: h('button', { type: 'button' }, '回复'),
        alignment: 'end',
      },
      h(Comment, { author: '王宁', content: '收到' }),
    ),
  );
  assert.equal((html.match(/<article/g) ?? []).length, 2);
  assert.match(html, /f-comment--end/);
  assert.match(html, /<time[^>]*dateTime="2026-11-11T08:00:00Z"[^>]*>1 小时前<\/time>/);
  assert.match(html, /aria-label="林晓"/);
  assert.match(html, /<button type="button">回复<\/button>/);
  assert.match(html, /建议补充校验/);
  assert.match(html, /王宁/);
});

test('Comment escapes untrusted text and omits absent optional regions', () => {
  const html = renderToStaticMarkup(h(Comment, { author: '<user>', content: '<script>' }));
  assert.match(html, /&lt;user&gt;/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|<time|f-comment-actions|f-comment-replies/);
});

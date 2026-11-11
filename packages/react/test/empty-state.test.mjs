import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState } from '../dist/composition.js';

test('EmptyState provides explicit scenario headings without inferring state', () => {
  for (const [variant, title] of [
    ['no-content', '暂无内容'],
    ['initial', '从这里开始'],
    ['no-messages', '暂无消息'],
    ['no-results', '没有找到结果'],
    ['no-permission', '暂无访问权限'],
    ['offline', '连接已断开'],
    ['not-found', '内容不存在'],
    ['error', '暂时无法加载'],
  ]) {
    const html = renderToStaticMarkup(h(EmptyState, { variant }));
    assert.match(html, new RegExp(`data-variant="${variant}"`));
    assert.match(html, new RegExp(`<h3 class="f-empty-state-title">${title}</h3>`));
    assert.doesNotMatch(html, /<button|role="alert"/);
  }
});

test('EmptyState retains custom content and action and supports contextual heading and size', () => {
  const html = renderToStaticMarkup(
    h(
      EmptyState,
      {
        variant: 'offline',
        size: 'compact',
        headingLevel: 2,
        title: '项目连接失败',
        description: '检查项目连接',
        icon: h('span', null, '图'),
        action: h('button', null, '重试'),
      },
      h('span', null, '自定义内容'),
    ),
  );
  assert.match(html, /f-empty-state--compact/);
  assert.match(html, /aria-hidden="true"><span>图<\/span>/);
  assert.match(html, /<h2 class="f-empty-state-title">项目连接失败<\/h2>/);
  assert.match(html, /<p class="f-empty-state-description">检查项目连接<\/p>/);
  assert.match(html, /<button>重试<\/button>/);
  assert.match(html, /自定义内容/);
});

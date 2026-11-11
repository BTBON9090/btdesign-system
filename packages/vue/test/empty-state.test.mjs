import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { EmptyState } from '../dist/granular.js';
const render = (props, slots) =>
  renderToString(createSSRApp({ render: () => h(EmptyState, props, slots) }));

test('EmptyState provides explicit scenario headings without inferring state', async () => {
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
    const html = await render({ variant });
    assert.match(html, new RegExp(`data-variant="${variant}"`));
    assert.match(html, new RegExp(`<h3 class="f-empty-state-title">${title}</h3>`));
    assert.doesNotMatch(html, /<button|role="alert"/);
  }
});

test('EmptyState preserves custom slots and action with contextual heading and size', async () => {
  const html = await render(
    { variant: 'offline', size: 'compact', headingLevel: 2 },
    {
      title: () => '项目连接失败',
      description: () => '检查项目连接',
      icon: () => h('span', '图'),
      action: () => h('button', '重试'),
      default: () => h('span', '自定义内容'),
    },
  );
  assert.match(html, /f-empty-state--compact/);
  assert.match(html, /aria-hidden="true"><span>图<\/span>/);
  assert.match(html, /<h2 class="f-empty-state-title">项目连接失败<\/h2>/);
  assert.match(html, /<p class="f-empty-state-description">检查项目连接<\/p>/);
  assert.match(html, /<button>重试<\/button>/);
  assert.match(html, /自定义内容/);
});

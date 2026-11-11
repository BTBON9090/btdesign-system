import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Descriptions } from '../dist/descriptions.js';

const render = (props, slots) =>
  renderToString(createSSRApp({ render: () => h(Descriptions, props, slots) }));

test('Descriptions renders semantic label/value pairs and named slots for rich content', async () => {
  const html = await render(
    {
      title: '项目详情',
      id: 'details',
      items: [
        { key: 'name', label: '名称', value: '设计系统' },
        { key: 'link', label: '文档', value: '默认' },
      ],
    },
    { 'value-link': () => h('a', { href: '/guide' }, '查看文档') },
  );
  assert.match(html, /id="details"/);
  assert.match(html, /<h3[^>]*>项目详情<\/h3>/);
  assert.match(html, /<dl[^>]*>/);
  assert.match(html, /<dt[^>]*>名称<\/dt><dd[^>]*>设计系统<\/dd>/);
  assert.match(html, /<dt[^>]*>文档<\/dt><dd[^>]*>.*<a href="\/guide">查看文档<\/a>.*<\/dd>/);
});

test('Descriptions applies bordered vertical layout and safely clamps column spans', async () => {
  const html = await render({
    orientation: 'vertical',
    bordered: true,
    column: 2,
    items: [{ key: 'wide', label: '说明', value: '<script>', span: 99 }],
  });
  assert.match(html, /f-descriptions-grid--vertical f-descriptions-grid--bordered/);
  assert.match(html, /--f-descriptions-columns:2/);
  assert.match(html, /--f-descriptions-span:2/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

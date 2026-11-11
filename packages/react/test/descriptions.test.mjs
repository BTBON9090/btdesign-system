import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Descriptions } from '../dist/descriptions.js';

test('Descriptions renders accessible label/value associations and composable content', () => {
  const html = renderToStaticMarkup(
    h(Descriptions, {
      title: '项目详情',
      items: [
        { key: 'name', label: '名称', value: h('strong', null, '设计系统') },
        { key: 'link', label: '文档', value: h('a', { href: '/guide' }, '查看文档') },
      ],
      id: 'details',
    }),
  );
  assert.match(html, /id="details"/);
  assert.match(html, /<h3[^>]*>项目详情<\/h3>/);
  assert.match(html, /<dl[^>]*>/);
  assert.match(html, /<dt[^>]*>名称<\/dt><dd[^>]*><strong>设计系统<\/strong><\/dd>/);
  assert.match(html, /<dt[^>]*>文档<\/dt><dd[^>]*><a href="\/guide">查看文档<\/a><\/dd>/);
});

test('Descriptions applies bordered vertical layout and safely clamps column spans', () => {
  const html = renderToStaticMarkup(
    h(Descriptions, {
      orientation: 'vertical',
      bordered: true,
      column: 2,
      items: [{ key: 'wide', label: '说明', value: '<script>', span: 99 }],
    }),
  );
  assert.match(html, /f-descriptions-grid--vertical f-descriptions-grid--bordered/);
  assert.match(html, /--f-descriptions-columns:2/);
  assert.match(html, /--f-descriptions-span:2/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { List, ListItem, ListItemContent, ListItemActions } from '../dist/enterprise-choice.js';

test('List preserves semantic list structure with basic and advanced content', () => {
  const html = renderToStaticMarkup(
    h(
      List,
      { 'aria-label': '项目' },
      h(
        ListItem,
        {
          leading: h('span', null, '图标'),
          extra: h('img', { src: '/project.png', alt: '项目预览' }),
        },
        h(ListItemContent, null, h('strong', null, '项目名称'), h('p', null, '项目说明')),
        h(ListItemActions, null, h('button', null, '查看')),
      ),
    ),
  );
  assert.match(html, /<ul aria-label="项目" class="f-list"/);
  assert.match(html, /<li class="f-list-item">/);
  assert.match(html, /f-list-item-leading/);
  assert.match(html, /f-list-item-content/);
  assert.match(html, /f-list-item-actions/);
  assert.match(html, /f-list-item-extra/);
  assert.match(html, /alt="项目预览"/);
  assert.match(html, /<button>查看<\/button>/);
});

test('List exposes grid columns, optional border and split controls', () => {
  const html = renderToStaticMarkup(
    h(
      List,
      { layout: 'grid', columns: 2, bordered: true, split: false },
      h(ListItem, null, '甲'),
      h(ListItem, null, '乙'),
    ),
  );
  assert.match(html, /f-list--grid/);
  assert.match(html, /f-list--bordered/);
  assert.match(html, /f-list--no-split/);
  assert.match(html, /--f-list-columns:2/);
  assert.equal((html.match(/<li /g) ?? []).length, 2);
});

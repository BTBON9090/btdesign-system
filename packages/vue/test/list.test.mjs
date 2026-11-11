import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { List, ListItem, ListItemContent, ListItemActions } from '../dist/enterprise-choice.js';
const render = (props, children) =>
  renderToString(createSSRApp({ render: () => h(List, props, () => children) }));

test('List preserves semantic list structure with basic and advanced slots', async () => {
  const html = await render(
    { 'aria-label': '项目' },
    h(
      ListItem,
      {},
      {
        leading: () => h('span', '图标'),
        extra: () => h('img', { src: '/project.png', alt: '项目预览' }),
        default: () => [
          h(ListItemContent, {}, () => [h('strong', '项目名称'), h('p', '项目说明')]),
          h(ListItemActions, {}, () => h('button', '查看')),
        ],
      },
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

test('List exposes grid columns, optional border and split controls', async () => {
  const html = await render({ layout: 'grid', columns: 2, bordered: true, split: false }, [
    h(ListItem, {}, () => '甲'),
    h(ListItem, {}, () => '乙'),
  ]);
  assert.match(html, /f-list--grid/);
  assert.match(html, /f-list--bordered/);
  assert.match(html, /f-list--no-split/);
  assert.match(html, /--f-list-columns:2/);
  assert.equal((html.match(/<li /g) ?? []).length, 2);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PageHeader } from '../dist/page-header.js';

test('PageHeader renders semantic heading, optional sections and named back action', () => {
  const html = renderToStaticMarkup(
    h(PageHeader, {
      id: 'page',
      title: '项目',
      description: '管理工作',
      breadcrumb: h('nav', { 'aria-label': '路径' }, '首页'),
      actions: h('button', {}, '新建'),
      headingLevel: 2,
      onBack: () => {},
    }),
  );
  assert.match(html, /^<header id="page" class="f-page-header">/);
  assert.match(html, /<nav aria-label="路径">首页<\/nav>/);
  assert.match(html, /<button type="button" class="f-page-header-back" aria-label="返回">/);
  assert.match(html, /<h2 class="f-page-header-title">项目<\/h2>/);
  assert.match(html, /f-page-header-description">管理工作/);
  assert.match(html, /f-page-header-actions"><button>新建<\/button>/);
});
test('PageHeader delegates back to its consumer and cannot offer an inert enabled back control', () => {
  let received;
  const event = { type: 'click' };
  const tree = PageHeader.render(
    {
      title: '项目',
      onBack: (value) => {
        received = value;
      },
    },
    null,
  );
  const button = tree.props.children[1].props.children[0].props.children[0];
  button.props.onClick(event);
  assert.equal(received, event);
  const disabled = renderToStaticMarkup(h(PageHeader, { title: '项目', showBack: true }));
  assert.match(disabled, /f-page-header-back" aria-label="返回" disabled=""/);
  assert.doesNotMatch(renderToStaticMarkup(h(PageHeader, { title: '项目' })), /f-page-header-back/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h, Fragment } from 'react';
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

test('guide shares breadcrumb row and tabs follow the heading without supplying behavior', () => {
  const html = renderToStaticMarkup(
    h(PageHeader, {
      title: '项目',
      breadcrumb: h('nav', { 'aria-label': '路径' }, '首页'),
      guide: h('a', { href: '/help' }, '使用指南'),
      tabs: h('nav', { 'aria-label': '项目页' }, h('a', { href: '/details' }, '详情')),
    }),
  );
  assert.match(
    html,
    /<div class="f-page-header-top"><div class="f-page-header-breadcrumb"><nav aria-label="路径">首页<\/nav><\/div><div class="f-page-header-guide"><a href="\/help">使用指南<\/a><\/div><\/div>/,
  );
  assert.ok(html.indexOf('f-page-header-main') < html.indexOf('f-page-header-tabs'));
  assert.match(
    html,
    /f-page-header-tabs"><nav aria-label="项目页"><a href="\/details">详情<\/a><\/nav>/,
  );
});
test('empty guide and tabs retain legacy structure, including nested blank fragments', () => {
  const breadcrumb = h('nav', { 'aria-label': '路径' }, '首页');
  const baseline = renderToStaticMarkup(h(PageHeader, { title: '项目', breadcrumb }));
  for (const empty of [
    '',
    '  ',
    null,
    false,
    [],
    h(Fragment, {}, [null, ' ', h(Fragment, { key: 'x' })]),
  ]) {
    const html = renderToStaticMarkup(
      h(PageHeader, { title: '项目', breadcrumb, guide: empty, tabs: empty }),
    );
    assert.equal(html, baseline);
    assert.doesNotMatch(html, /f-page-header-top|f-page-header-guide|f-page-header-tabs/);
  }
});
test('guide without breadcrumb and zero-valued content remain valid', () => {
  const html = renderToStaticMarkup(h(PageHeader, { title: '项目', guide: 0, tabs: 0 }));
  assert.match(
    html,
    /<div class="f-page-header-top"><div class="f-page-header-guide">0<\/div><\/div>/,
  );
  assert.match(html, /<div class="f-page-header-tabs">0<\/div>/);
  assert.doesNotMatch(html, /f-page-header-breadcrumb/);
});

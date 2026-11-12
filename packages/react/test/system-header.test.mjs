import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h, Fragment, version } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SystemHeader } from '../dist/system-header.js';

const render = (props) => renderToStaticMarkup(h(SystemHeader, props));
test('renders semantic header, caller attributes and all populated sections in order', () => {
  const html = render({
    id: 'top',
    className: 'custom',
    'aria-label': '工作台顶栏',
    brand: h('a', { href: '/' }, '品牌'),
    search: h('input', { type: 'search', 'aria-label': '搜索' }),
    actions: h('button', { type: 'button' }, '通知'),
    account: h('button', { type: 'button' }, '账户'),
    organization: h('span', {}, '设计团队'),
  });
  assert.match(html, /^<header id="top" aria-label="工作台顶栏" class="f-system-header custom">/);
  const positions = ['brand', 'end', 'search', 'actions', 'account', 'organization'].map((name) =>
    html.indexOf(`class="f-system-header-${name}"`),
  );
  assert.ok(positions.every((index) => index >= 0));
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
  assert.match(html, /<a href="\/">品牌<\/a>/);
  assert.match(html, /aria-label="搜索"/);
  assert.match(html, /<button type="button">通知<\/button>/);
});
test('omits empty sections and the right container for empty nested fragments', () => {
  const blank = h(Fragment, {}, [' ', null, false, h(Fragment, { key: 'nested' }, ' \n ')]);
  const html = render({
    brand: blank,
    search: '',
    actions: blank,
    account: false,
    organization: [null, '  '],
  });
  assert.equal(html, '<header class="f-system-header"></header>');
  assert.equal(
    render({ brand: '品牌' }),
    '<header class="f-system-header"><div class="f-system-header-brand">品牌</div></header>',
  );
});
test('zero and nonempty nested content render without an artificial brand section', () => {
  const html = render({
    actions: 0,
    account: h(Fragment, {}, [null, h('span', { key: 'x' }, '登录')]),
  });
  assert.doesNotMatch(html, /f-system-header-brand/);
  assert.match(html, /f-system-header-end/);
  assert.match(html, /f-system-header-actions">0<\/div>/);
  assert.match(html, /f-system-header-account"><span>登录<\/span>/);
  assert.doesNotMatch(html, /f-system-header-search|f-system-header-organization/);
});
test('preserves native event handlers and ref target through forwardRef', () => {
  const onClick = () => {};
  const ref = { current: null };
  const tree = SystemHeader.render({ id: 'main', onClick, actions: h('button', {}, '操作') }, ref);
  assert.equal(tree.type, 'header');
  assert.equal(tree.props.onClick, onClick);
  assert.equal(Number.parseInt(version, 10) >= 19 ? tree.props.ref : tree.ref, ref);
});

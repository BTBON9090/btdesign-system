import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { SidebarNav, TopNav } from '../dist/enterprise-navigation.js';
const items = [
  {
    key: 'team',
    label: '团队',
    href: '/team',
    children: [{ key: 'member', label: '成员', href: '/members' }],
  },
  {
    key: 'inactive',
    label: '禁用',
    disabled: true,
    children: [{ key: 'child', label: '子级', href: '/private' }],
  },
];
test('legacy navigation keeps all groups initially open and ignores parent href', () => {
  const html = render(h(SidebarNav, { items }));
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /href="\/members"/);
  assert.doesNotMatch(html, /href="\/team"|href="\/private"/);
  assert.doesNotMatch(html, /收起侧栏/);
});
test('explicit expanded state and opted-in parent link are independent', () => {
  const linked = [{ ...items[0], parentLink: true }];
  const html = render(h(SidebarNav, { items: linked, expandedKeys: [] }));
  assert.match(html, /<div class="f-nav-parent"><a[^>]*href="\/team"/);
  assert.match(html, /aria-label="展开团队" aria-expanded="false"/);
  assert.doesNotMatch(html, /href="\/members"/);
});
test('collapsed mode preserves accessible text, icons are decorative, and toggle is optional', () => {
  const html = render(
    h(SidebarNav, {
      items,
      collapsed: true,
      showCollapseControl: true,
      renderIcon: () => h('svg', { 'data-test': 'icon' }),
    }),
  );
  assert.match(html, /f-nav--collapsed/);
  assert.match(html, /aria-hidden="true"><svg/);
  assert.match(html, /f-nav-label--visually-hidden">团队/);
  assert.match(html, /f-nav-collapse-control f-button f-button--ghost/);
  assert.match(html, /f-nav-item f-nav-item--popup/);
  assert.match(html, />展开侧栏<\/button>/);
  assert.doesNotMatch(html, /href="\/members"/);
  const withoutIcons = render(h(SidebarNav, { items, collapsed: true }));
  assert.doesNotMatch(withoutIcons, /f-nav-label--visually-hidden/);
});
test('blank icon text leaves the only item label visibly available when collapsed', () => {
  for (const icon of ['', ' ', '\t\n', [], [' ', null], h(Fragment, null, '  ')]) {
    const html = render(h(SidebarNav, { items, collapsed: true, renderIcon: () => icon }));
    assert.doesNotMatch(html, /f-nav-label--visually-hidden/);
    assert.doesNotMatch(html, /f-nav-icon/);
    assert.match(html, /f-nav-label">团队/);
  }
});
test('top nav keeps normal nav semantics without an implicit popover', () => {
  const html = render(h(TopNav, { items, defaultExpandedKeys: [] }));
  assert.match(html, /<nav/);
  assert.match(html, /f-nav--top/);
  assert.doesNotMatch(html, /role="menu"|f-nav-children--popup/);
});

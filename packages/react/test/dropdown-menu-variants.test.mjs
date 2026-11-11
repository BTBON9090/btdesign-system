import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { DropdownMenu } from '../dist/enterprise-navigation.js';
const items = [
  { key: 'copy', label: '复制' },
  { key: 'checked', label: '勾选项', kind: 'checkbox' },
];
test('old single trigger is retained by default', () => {
  const html = render(h(DropdownMenu, { items, label: '操作' }));
  assert.equal((html.match(/<button/g) ?? []).length, 1);
  assert.match(html, /aria-haspopup="menu" aria-expanded="false"/);
  assert.match(html, />操作<span/);
  assert.doesNotMatch(html, /checkedKeys|closeOnCheck|highlightedKeys/);
});
test('split actions independently honor disabled states and callback availability', () => {
  const renderSplit = (props) =>
    render(h(DropdownMenu, { items, label: '操作', triggerMode: 'split', ...props }));
  const noPrimary = renderSplit({});
  assert.match(noPrimary, /<button[^>]+disabled=""[^>]*>操作<\/button>/);
  assert.match(noPrimary, /<button[^>]+aria-label="操作菜单"[^>]*aria-haspopup="menu"/);
  const separate = renderSplit({ onPrimaryAction: () => {}, menuDisabled: true });
  assert.match(separate, /<button(?![^>]*disabled)[^>]*>操作<\/button>/);
  assert.match(separate, /<button[^>]+disabled=""[^>]+aria-label="操作菜单"/);
  const all = renderSplit({ onPrimaryAction: () => {}, disabled: true });
  assert.equal((all.match(/disabled=""/g) ?? []).length, 2);
});

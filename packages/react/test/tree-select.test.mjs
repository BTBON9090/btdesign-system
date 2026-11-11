import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TreeSelect } from '../dist/enterprise-tree.js';
const nodes = [
  {
    key: 'parent',
    label: '团队',
    children: [
      { key: 'child', label: '成员' },
      { key: 'locked', label: '锁定成员', disabled: true },
    ],
  },
];
test('clear-all action remains visible by default and clearable=false hides it', () => {
  const render = (props) =>
    renderToStaticMarkup(h(TreeSelect, { nodes, value: 'child', name: 'team', ...props }));
  assert.match(render({}), />清空<\/button>/);
  const withoutClear = render({ clearable: false });
  assert.doesNotMatch(withoutClear, />清空<\/button>/);
  assert.doesNotMatch(withoutClear, /f-tree-select-tags/);
  assert.match(withoutClear, /name="team" value="child"/);
});
test('hiding clear-all preserves individual multi-select removal and disabled semantics', () => {
  const html = renderToStaticMarkup(
    h(TreeSelect, { nodes, multiple: true, clearable: false, value: ['child', 'locked'] }),
  );
  assert.doesNotMatch(html, />清空<\/button>/);
  assert.match(html, /aria-label="移除成员"/);
  assert.match(html, /disabled="" aria-label="移除锁定成员"/);
});

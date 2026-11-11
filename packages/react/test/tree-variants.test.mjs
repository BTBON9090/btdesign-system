import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const { Tree } = await import(process.env.BT_TREE_TEST_MODULE ?? '../dist/enterprise-tree.js');
const nodes = [
  {
    key: 'root',
    label: '团队',
    children: [
      { key: 'a', label: '设计', children: [{ key: 'a1', label: '品牌' }] },
      { key: 'b', label: '研发', disabled: true },
    ],
  },
];
const render = (props = {}) =>
  renderToStaticMarkup(h(Tree, { nodes, defaultExpandedKeys: ['root', 'a'], ...props }));

test('tree sizes and guides are opt-in while nodes keep accessible state', () => {
  const plain = render();
  assert.match(plain, /data-size="medium"/);
  assert.doesNotMatch(plain, /f-tree-guide/);
  for (const size of ['mini', 'small', 'medium', 'big']) {
    const html = render({ size, showLine: true, multiple: true, defaultValue: ['a1'] });
    assert.match(html, new RegExp(`data-size="${size}"`));
    assert.match(html, /data-show-line="true"/);
    assert.equal((html.match(/class="f-tree-guide"/g) ?? []).length, 4);
    assert.equal((html.match(/data-last="true"/g) ?? []).length, 2);
    assert.match(html, /data-key="a1"[^>]*aria-level="3"[^>]*aria-checked="true"/);
    assert.match(html, /data-key="b"[^>]*aria-disabled="true"/);
  }
});
test('caller icon is decorative and receives each flattened node', () => {
  const html = render({ renderIcon: (node) => `${node.key}:${node.depth}` });
  assert.match(html, /class="f-tree-icon" aria-hidden="true">a1:2/);
  assert.match(html, /aria-label="品牌"/);
});

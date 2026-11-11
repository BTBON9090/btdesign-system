import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Collapse } from '../dist/collapse.js';

const items = [
  { value: 'a', label: '简介', content: '内容 A' },
  { value: 'b', label: '详情', content: '内容 B' },
  { value: 'c', label: '禁用项', disabled: true, content: '内容 C' },
];
const render = (props) => renderToStaticMarkup(h(Collapse, { id: 'example', items, ...props }));

test('Collapse links each trigger and panel, supports multiple open items and disabled headers', () => {
  const html = render({ defaultValue: ['a', 'b'] });
  assert.match(
    html,
    /id="example-trigger-0"[^>]*aria-expanded="true"[^>]*aria-controls="example-panel-0"/,
  );
  assert.match(
    html,
    /id="example-panel-0" role="region" aria-labelledby="example-trigger-0"[^>]*>内容 A/,
  );
  assert.match(html, /id="example-trigger-1"[^>]*aria-expanded="true"/);
  assert.match(html, /id="example-trigger-2"[^>]*disabled=""/);
  assert.match(html, /id="example-panel-2"[^>]*hidden=""/);
});

test('Collapse uses controlled state before default and accordion exposes only one open item', () => {
  const html = render({
    value: ['b', 'a'],
    defaultValue: ['a'],
    accordion: true,
    expandIconPosition: 'end',
  });
  assert.match(html, /id="example-trigger-0"[^>]*aria-expanded="false"/);
  assert.match(html, /id="example-trigger-1"[^>]*aria-expanded="true"/);
  assert.match(html, /f-collapse-icon--end/);
  assert.doesNotMatch(render({ expandIconPosition: 'none' }), /f-collapse-icon/);
});

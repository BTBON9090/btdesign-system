import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tag } from '../dist/tag.js';

test('Tag renders a named native close button and semantic tone without nested buttons', () => {
  const html = renderToStaticMarkup(
    h(Tag, { tone: 'success', closable: true, closeLabel: '移除已完成', id: 'done' }, '已完成'),
  );
  assert.match(html, /^<span id="done" class="f-tag f-tag--success">/);
  assert.match(html, /<button type="button" class="f-tag-close" aria-label="移除已完成">/);
  assert.equal((html.match(/<button/g) ?? []).length, 1);
});

test('disabled Tag exposes disabled semantics and disables its close action', () => {
  const html = renderToStaticMarkup(h(Tag, { disabled: true, closable: true }, '已归档'));
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /<button[^>]*disabled=""/);
  assert.doesNotMatch(renderToStaticMarkup(h(Tag, null, '普通标签')), /<button/);
});

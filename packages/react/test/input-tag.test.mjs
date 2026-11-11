import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field } from '../dist/fields.js';
import { InputTag } from '../dist/input-tag.js';

test('input tag keeps the label, validation and native required behavior for an empty list', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      { label: '关键词', required: true, error: '至少一项' },
      h(InputTag, { name: 'keyword' }),
    ),
  );
  assert.match(html, /<label[^>]*for="([^"]+)"/);
  const id = /<label[^>]*for="([^"]+)"/.exec(html)[1];
  assert.ok(html.includes(`id="${id}"`));
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /required=""/);
  assert.doesNotMatch(html, /type="hidden"/);
});

test('committed tags become repeated form values, support duplicate values, and provide named removals', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      { label: '关键词', required: true },
      h(InputTag, { name: 'keyword', value: ['alpha', 'alpha'] }),
    ),
  );
  assert.equal((html.match(/type="hidden"/g) ?? []).length, 2);
  assert.equal((html.match(/name="keyword"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-label="删除 alpha"/g) ?? []).length, 2);
  assert.match(html, /aria-required="true"/);
  assert.doesNotMatch(html, / required=""/);
});

test('disabled or read-only fields do not allow modifying tags', () => {
  const disabled = renderToStaticMarkup(
    h(
      Field,
      { label: '关键词', disabled: true },
      h(InputTag, { defaultValue: ['alpha'], name: 'keyword' }),
    ),
  );
  assert.match(disabled, /<button[^>]*disabled=""/);
  assert.match(disabled, /type="hidden"[^>]*disabled=""/);
  const readonly = renderToStaticMarkup(
    h(InputTag, { 'aria-label': '关键词', readOnly: true, defaultValue: ['alpha'] }),
  );
  assert.doesNotMatch(readonly, /<button/);
  assert.match(readonly, /readOnly=""/);
});

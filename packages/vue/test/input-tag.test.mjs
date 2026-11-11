import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { InputTag } from '../dist/input-tag.js';
const render = (node) => renderToString(createSSRApp({ render: () => node }));

test('input tag keeps the label, validation and native required behavior for an empty list', async () => {
  const html = await render(
    h(
      Field,
      { label: '关键词', required: true, error: '至少一项' },
      { default: () => h(InputTag, { name: 'keyword' }) },
    ),
  );
  const id = /<label[^>]*for="([^"]+)"/.exec(html)?.[1];
  assert.ok(id && html.includes(`id="${id}"`));
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /required/);
  assert.doesNotMatch(html, /type="hidden"/);
});

test('committed tags become repeated form values, support duplicate values, and provide named removals', async () => {
  const html = await render(
    h(
      Field,
      { label: '关键词', required: true },
      { default: () => h(InputTag, { name: 'keyword', modelValue: ['alpha', 'alpha'] }) },
    ),
  );
  assert.equal((html.match(/type="hidden"/g) ?? []).length, 2);
  assert.equal((html.match(/name="keyword"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-label="删除 alpha"/g) ?? []).length, 2);
  assert.match(html, /aria-required="true"/);
  assert.doesNotMatch(html, /\srequired(?:[\s=>])/);
});

test('disabled or read-only fields do not allow modifying tags', async () => {
  const disabled = await render(
    h(
      Field,
      { label: '关键词', disabled: true },
      { default: () => h(InputTag, { defaultValue: ['alpha'], name: 'keyword' }) },
    ),
  );
  assert.match(disabled, /<button[^>]*disabled/);
  assert.match(disabled, /type="hidden"[^>]*disabled/);
  const readonly = await render(
    h(InputTag, { 'aria-label': '关键词', readonly: true, defaultValue: ['alpha'] }),
  );
  assert.doesNotMatch(readonly, /<button/);
  assert.match(readonly, /readonly/);
});

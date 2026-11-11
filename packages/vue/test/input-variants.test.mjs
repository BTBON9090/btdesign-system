import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { PasswordInput, SearchInput } from '../dist/input-variants.js';

const render = (node) => renderToString(createSSRApp({ render: () => node }));

test('password control keeps field semantics and disables the reveal action with the field', async () => {
  const html = await render(
    h(
      Field,
      { label: '密码', disabled: true, error: '无效' },
      { default: () => h(PasswordInput, { name: 'password', showLabel: 'Show password' }) },
    ),
  );
  assert.match(html, /<input[^>]*type="password"/);
  assert.match(html, /name="password"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(
    html,
    /<button[^>]*type="button"[^>]*disabled[^>]*aria-label="Show password"[^>]*aria-pressed="false"/,
  );
  assert.match(html, /aria-describedby="[^"]+-error"/);
});

test('search control renders a named native search field and non-submitting action', async () => {
  const html = await render(
    h(SearchInput, { name: 'query', 'aria-label': '搜索成员', searchLabel: '查找' }),
  );
  assert.match(html, /<input[^>]*name="query"[^>]*aria-label="搜索成员"[^>]*type="search"/);
  assert.match(html, /<button[^>]*type="button"[^>]*aria-label="查找"/);
});

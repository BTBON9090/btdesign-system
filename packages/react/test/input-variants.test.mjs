import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field } from '../dist/fields.js';
import { PasswordInput, SearchInput } from '../dist/input-variants.js';

test('password control keeps field semantics and disables the reveal action with the field', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      { label: '密码', disabled: true, error: '无效' },
      h(PasswordInput, { name: 'password', showLabel: 'Show password' }),
    ),
  );
  assert.match(html, /<input[^>]*type="password"/);
  assert.match(html, /name="password"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(
    html,
    /<button[^>]*type="button"[^>]*disabled=""[^>]*aria-label="Show password"[^>]*aria-pressed="false"/,
  );
  assert.match(html, /aria-describedby="[^"]+-error"/);
});

test('search control renders a named native search field and non-submitting action', () => {
  const html = renderToStaticMarkup(
    h(SearchInput, { name: 'query', 'aria-label': '搜索成员', searchLabel: '查找' }),
  );
  assert.match(html, /<input[^>]*type="search"/);
  assert.match(html, /name="query"/);
  assert.match(html, /aria-label="搜索成员"/);
  assert.match(html, /<button[^>]*type="button"[^>]*aria-label="查找"/);
});

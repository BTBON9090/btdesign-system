import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field, Input, Form, FormField } from '../dist/index.js';

test('horizontal Field keeps label, description, and error associations', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      {
        id: 'email',
        label: '邮箱',
        description: '工作邮箱',
        error: '请输入邮箱',
        required: true,
        layout: 'horizontal',
      },
      h(Input, { type: 'email' }),
    ),
  );
  assert.match(html, /f-field--horizontal/);
  assert.match(html, /<label id="email-label" for="email"/);
  assert.match(html, /id="email"[^>]*aria-describedby="email-description email-error"/);
  assert.match(html, /id="email-error"[^>]*role="alert"/);
});
test('FormField forwards horizontal layout and defaults to vertical', () => {
  const horizontal = renderToStaticMarkup(
    h(Form, {}, h(FormField, { name: 'email', label: '邮箱', layout: 'horizontal' })),
  );
  assert.match(horizontal, /f-field--horizontal/);
  const vertical = renderToStaticMarkup(
    h(Form, {}, h(FormField, { name: 'email', label: '邮箱' })),
  );
  assert.doesNotMatch(vertical, /f-field--horizontal/);
});

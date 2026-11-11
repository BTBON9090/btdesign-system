import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field, Input, Form, FormField } from '../dist/index.js';
const render = (component, props, slots) =>
  renderToString(createSSRApp({ render: () => h(component, props, slots) }));

test('horizontal Field keeps label, description, and error associations', async () => {
  const html = await render(
    Field,
    {
      id: 'email',
      label: '邮箱',
      description: '工作邮箱',
      error: '请输入邮箱',
      required: true,
      layout: 'horizontal',
    },
    { default: () => h(Input, { type: 'email' }) },
  );
  assert.match(html, /f-field--horizontal/);
  assert.match(html, /<label class="f-field-label" id="email-label" for="email"/);
  assert.match(html, /id="email"[^>]*aria-describedby="email-description email-error"/);
  assert.match(html, /id="email-error" role="alert"/);
});
test('FormField forwards horizontal layout and defaults to vertical', async () => {
  const horizontal = await render(
    Form,
    {},
    { default: () => h(FormField, { name: 'email', label: '邮箱', layout: 'horizontal' }) },
  );
  assert.match(horizontal, /f-field--horizontal/);
  const vertical = await render(
    Form,
    {},
    { default: () => h(FormField, { name: 'email', label: '邮箱' }) },
  );
  assert.doesNotMatch(vertical, /f-field--horizontal/);
});

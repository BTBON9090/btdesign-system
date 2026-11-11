import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { Mention } from '../dist/mention.js';
const render = (node) => renderToString(createSSRApp({ render: () => node }));
const options = [
  { value: 'a', label: '林晓' },
  { value: 'b', label: 'Alex', disabled: true },
];
test('mention preserves field, form and combobox semantics', async () => {
  const html = await render(
    h(
      Field,
      { label: '提及成员', required: true, error: '请填写' },
      { default: () => h(Mention, { options, name: 'message', modelValue: '你好' }) },
    ),
  );
  for (const attr of [
    'role="combobox"',
    'aria-autocomplete="list"',
    'aria-expanded="false"',
    'name="message"',
    'value="你好"',
    'required',
    'aria-invalid="true"',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="([^"]+)"/);
  assert.doesNotMatch(html, /role="listbox"/);
});
test('mention inherits disabled field state', async () => {
  const html = await render(
    h(Field, { label: '提及成员', disabled: true }, { default: () => h(Mention, { options }) }),
  );
  assert.match(html, /disabled/);
  assert.match(html, /aria-expanded="false"/);
});

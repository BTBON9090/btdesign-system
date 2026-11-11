import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field } from '../dist/fields.js';
import { Mention } from '../dist/mention.js';
const options = [
  { value: 'a', label: '林晓' },
  { value: 'b', label: 'Alex', disabled: true },
];
test('mention preserves field, form and combobox semantics', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      { label: '提及成员', required: true, error: '请填写' },
      h(Mention, { options, name: 'message', defaultValue: '你好' }),
    ),
  );
  for (const attr of [
    'role="combobox"',
    'aria-autocomplete="list"',
    'aria-expanded="false"',
    'name="message"',
    'value="你好"',
    'required=""',
    'aria-invalid="true"',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="([^"]+)"/);
  assert.doesNotMatch(html, /role="listbox"/);
});
test('mention inherits disabled field state', () => {
  const html = renderToStaticMarkup(
    h(Field, { label: '提及成员', disabled: true }, h(Mention, { options })),
  );
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-expanded="false"/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { AutoComplete } from '../dist/auto-complete.js';
const render = (node) => renderToString(createSSRApp({ render: () => node }));
const options = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海', disabled: true },
];
test('autocomplete exposes a named, collapsed editable combobox with form semantics', async () => {
  const html = await render(
    h(
      Field,
      { label: '城市', required: true, error: '请选择城市' },
      { default: () => h(AutoComplete, { options, name: 'city', modelValue: 'bj' }) },
    ),
  );
  for (const attr of [
    'role="combobox"',
    'aria-autocomplete="list"',
    'aria-expanded="false"',
    'name="city"',
    'value="bj"',
    'required',
    'aria-invalid="true"',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="([^"]+)"/);
  assert.doesNotMatch(html, /role="listbox"/);
});
test('autocomplete inherits disabled field state and remains closed', async () => {
  const html = await render(
    h(Field, { label: '城市', disabled: true }, { default: () => h(AutoComplete, { options }) }),
  );
  assert.match(html, /disabled/);
  assert.match(html, /aria-expanded="false"/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Checkbox, CheckboxGroup, Radio, ToggleGroup } from '../dist/index.js';
const options = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙', disabled: true },
];

test('Checkbox exposes the mixed state; an icon-only radio retains its accessible label', () => {
  assert.match(
    renderToStaticMarkup(h(Checkbox, { label: '全选', indeterminate: true })),
    /type="checkbox"[^>]*aria-checked="mixed"/,
  );
  const radio = renderToStaticMarkup(
    h(Radio, { 'aria-label': '选择甲', name: 'letter', value: 'a' }),
  );
  assert.match(radio, /aria-label="选择甲"[^>]*type="radio"/);
});
test('horizontal checkbox group keeps native checkbox, names, selected and disabled states', () => {
  const html = renderToStaticMarkup(
    h(CheckboxGroup, {
      options,
      value: ['a'],
      name: 'items',
      label: '项目',
      orientation: 'horizontal',
    }),
  );
  assert.match(html, /role="group" aria-label="项目"/);
  assert.match(html, /f-choice-group--horizontal/);
  assert.match(
    html,
    /<input(?=[^>]*type="checkbox")(?=[^>]*name="items")(?=[^>]*value="a")(?=[^>]*checked)[^>]*>/,
  );
  assert.match(html, /<input(?=[^>]*value="c")(?=[^>]*disabled)[^>]*>/);
});
test('button-style selections keep radio semantics for single selection and checkbox semantics for multiple', () => {
  const single = renderToStaticMarkup(h(ToggleGroup, { options, value: 'a', label: '城市' }));
  const multiple = renderToStaticMarkup(
    h(ToggleGroup, { options, value: ['a'], multiple: true, label: '城市' }),
  );
  assert.match(single, /role="radiogroup"/);
  assert.equal((single.match(/type="radio"/g) ?? []).length, 3);
  assert.match(multiple, /role="group"/);
  assert.equal((multiple.match(/type="checkbox"/g) ?? []).length, 3);
  assert.match(single, /data-disabled="true"/);
});

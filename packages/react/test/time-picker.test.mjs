import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field } from '../dist/fields.js';
import { TimePicker } from '../dist/time-picker.js';

test('time picker retains native form constraints and Field accessibility', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      { label: '开始时间', description: '本地时间', error: '超出范围', required: true },
      h(TimePicker, {
        name: 'start',
        min: '09:00',
        max: '18:00',
        step: 300,
        defaultValue: '09:30',
      }),
    ),
  );
  assert.match(html, /type="time"/);
  for (const attr of [
    'name="start"',
    'min="09:00"',
    'max="18:00"',
    'step="300"',
    'value="09:30"',
    'required=""',
    'aria-invalid="true"',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="[^"]+"[^>]*>开始时间/);
});

test('time picker inherits disabled field and supports controlled empty value', () => {
  const html = renderToStaticMarkup(
    h(Field, { label: '时间', disabled: true }, h(TimePicker, { value: '', onChange: () => {} })),
  );
  assert.match(html, /disabled=""/);
  assert.match(html, /value=""/);
});

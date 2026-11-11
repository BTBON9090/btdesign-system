import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { TimePicker } from '../dist/time-picker.js';
const render = (node) => renderToString(createSSRApp({ render: () => node }));

test('time picker retains native form constraints and Field accessibility', async () => {
  const html = await render(
    h(
      Field,
      { label: '开始时间', description: '本地时间', error: '超出范围', required: true },
      {
        default: () =>
          h(TimePicker, {
            name: 'start',
            min: '09:00',
            max: '18:00',
            step: 300,
            modelValue: '09:30',
          }),
      },
    ),
  );
  assert.match(html, /type="time"/);
  for (const attr of [
    'name="start"',
    'min="09:00"',
    'max="18:00"',
    'step="300"',
    'value="09:30"',
    'required',
    'aria-invalid="true"',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="[^"]+"[^>]*>开始时间/);
});

test('time picker inherits disabled field and supports controlled empty value', async () => {
  const html = await render(
    h(
      Field,
      { label: '时间', disabled: true },
      { default: () => h(TimePicker, { modelValue: '' }) },
    ),
  );
  assert.match(html, /disabled/);
  assert.match(html, /\svalue(?:=""|(?=[\s>]))/);
});

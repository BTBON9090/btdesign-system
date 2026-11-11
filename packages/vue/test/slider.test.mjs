import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { Slider } from '../dist/slider.js';
const render = (node) => renderToString(createSSRApp({ render: () => node }));

test('slider retains native range semantics, accessible field and disabled state', async () => {
  const html = await render(
    h(
      Field,
      { label: '音量', description: '调节大小', disabled: true },
      { default: () => h(Slider, { name: 'volume', min: 10, max: 90, step: 5, modelValue: 40 }) },
    ),
  );
  assert.match(html, /type="range"/);
  for (const attr of [
    'name="volume"',
    'min="10"',
    'max="90"',
    'step="5"',
    'value="40"',
    'disabled',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="[^"]+"[^>]*>音量/);
});

test('slider associates marks with a native datalist', async () => {
  const html = await render(
    h(Slider, { 'aria-label': '进度', marks: [{ value: 25, label: '四分之一' }] }),
  );
  const id = /list="([^"]+)"/.exec(html)?.[1];
  assert.ok(id);
  assert.ok(html.includes(`<datalist id="${id}">`));
  assert.match(html, /<option value="25" label="四分之一"/);
});

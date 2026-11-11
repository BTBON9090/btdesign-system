import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field } from '../dist/fields.js';
import { Slider } from '../dist/slider.js';

test('slider retains native range semantics, accessible field and disabled state', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      { label: '音量', description: '调节大小', disabled: true },
      h(Slider, { name: 'volume', min: 10, max: 90, step: 5, defaultValue: 40 }),
    ),
  );
  assert.match(html, /type="range"/);
  for (const attr of [
    'name="volume"',
    'min="10"',
    'max="90"',
    'step="5"',
    'value="40"',
    'disabled=""',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="[^"]+"[^>]*>音量/);
});

test('slider associates marks with a native datalist', () => {
  const html = renderToStaticMarkup(
    h(Slider, {
      'aria-label': '进度',
      marks: [
        { value: 25, label: '四分之一' },
        { value: 75, label: '四分之三' },
      ],
    }),
  );
  const id = /list="([^"]+)"/.exec(html)?.[1];
  assert.ok(id);
  assert.ok(html.includes(`<datalist id="${id}">`));
  assert.match(html, /<option value="25" label="四分之一"/);
});

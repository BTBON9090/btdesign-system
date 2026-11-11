import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field } from '../dist/fields.js';
import { Upload } from '../dist/upload.js';

test('upload retains native file and accessible field semantics', () => {
  const html = renderToStaticMarkup(
    h(
      Field,
      { label: '附件', required: true, description: '选择图片' },
      h(Upload, { name: 'attachment', accept: 'image/*', multiple: true }),
    ),
  );
  for (const attr of [
    'type="file"',
    'name="attachment"',
    'accept="image/*"',
    'multiple=""',
    'required=""',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="([^"]+)"/);
});
test('upload inherits disabled field state', () => {
  const html = renderToStaticMarkup(h(Field, { label: '附件', disabled: true }, h(Upload)));
  assert.match(html, /disabled=""/);
});

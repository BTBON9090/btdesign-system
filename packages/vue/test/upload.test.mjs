import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Field } from '../dist/field.js';
import { Upload } from '../dist/upload.js';
const render = (node) => renderToString(createSSRApp({ render: () => node }));

test('upload retains native file and accessible field semantics', async () => {
  const html = await render(
    h(
      Field,
      { label: '附件', required: true, description: '选择图片' },
      { default: () => h(Upload, { name: 'attachment', accept: 'image/*', multiple: true }) },
    ),
  );
  for (const attr of [
    'type="file"',
    'name="attachment"',
    'accept="image/*"',
    'multiple',
    'required',
    'aria-describedby=',
  ])
    assert.ok(html.includes(attr), attr);
  assert.match(html, /<label[^>]*for="([^"]+)"/);
});
test('upload inherits disabled field state', async () => {
  const html = await render(
    h(Field, { label: '附件', disabled: true }, { default: () => h(Upload) }),
  );
  assert.match(html, /disabled/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UploadDropzone } from '../dist/upload-dropzone.js';
test('renders an accessible button and application-managed file input', () => {
  const html = renderToStaticMarkup(
    h(UploadDropzone, {
      label: '添加附件',
      multiple: true,
      accept: '.pdf',
      children: '只能添加 PDF 文件',
    }),
  );
  assert.match(html, /<button type="button"[^>]*>添加附件<\/button>/);
  assert.match(html, /<input[^>]*type="file"[^>]*hidden=""/);
  assert.match(html, /accept="\.pdf"/);
  assert.match(html, /multiple=""/);
  assert.match(html, /只能添加 PDF 文件/);
  assert.doesNotMatch(html, /name=|required/);
});
test('disabled state disables picker and its visible button', () => {
  const html = renderToStaticMarkup(h(UploadDropzone, { disabled: true }));
  assert.match(html, /data-disabled="true"/);
  assert.match(html, /<input[^>]*disabled=""/);
  assert.match(html, /<button[^>]*disabled=""/);
});

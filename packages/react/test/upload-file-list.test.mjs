import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UploadFileList } from '../dist/upload-file-list.js';

const items = [
  {
    id: '1',
    name: '封面.png',
    url: '/download/1',
    thumbnailUrl: 'https://example.org/cover.png',
    alt: '封面',
    status: 'uploading',
    progress: 140,
    size: 2048,
  },
  {
    id: '2',
    name: '危险文件.pdf',
    url: 'javascript:alert(1)',
    thumbnailUrl: 'javascript:alert(2)',
    status: 'error',
    error: '网络中断',
  },
];
function render(props = {}) {
  return renderToStaticMarkup(h(UploadFileList, { items, ...props }));
}
test('renders semantic lists, caller-owned status, safe independent URLs and bounded progress', () => {
  const html = render({ variant: 'picture' });
  assert.match(
    html,
    /<ul aria-label="文件列表" class="f-list f-upload-file-list f-upload-file-list--picture"/,
  );
  assert.equal((html.match(/<li /g) ?? []).length, 2);
  assert.match(html, /href="\/download\/1" download=""/);
  assert.match(html, /src="https:\/\/example.org\/cover.png" alt="封面"/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /暂无缩略图/);
  assert.match(html, /value="100"/);
  assert.match(html, /aria-label="封面.png 上传进度"/);
  assert.match(html, /上传失败/);
  assert.match(html, /网络中断/);
  assert.doesNotMatch(html, /缩略图加载失败/);
});
test('renders only supplied actions in every mode, retry only on errors, and disables actions/download', () => {
  for (const variant of ['file', 'picture', 'picture-card']) {
    const html = render({ variant, disabled: true, onPreview() {}, onRetry() {}, onRemove() {} });
    assert.equal((html.match(/>预览<\/button>/g) ?? []).length, 2);
    assert.equal((html.match(/>重试<\/button>/g) ?? []).length, 1);
    assert.equal((html.match(/>移除<\/button>/g) ?? []).length, 2);
    assert.equal((html.match(/ disabled=""/g) ?? []).length, 5);
    assert.doesNotMatch(html, /href="\/download\/1"/);
    if (variant === 'file') assert.doesNotMatch(html, /<img /);
  }
  assert.doesNotMatch(render(), /<button/);
});
test('handles empty items and ignores non-finite progress without inventing state', () => {
  assert.match(render({ items: [] }), /<li class="f-list-item">暂无文件<\/li>/);
  const html = render({ items: [{ id: 'x', name: 'x', status: 'uploading', progress: NaN }] });
  assert.match(html, /<progress[^>]*aria-label="x 上传进度"[^>]*><\/progress>/);
  assert.doesNotMatch(html, /value="NaN"/);
});

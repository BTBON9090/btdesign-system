import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import {
  uploadFileListExampleCode,
  uploadFileListPreviewItems,
  uploadFileListPreviewOptions,
} from '../src/UploadFileListExample';

test('preview status changes retain removed items and do not mutate sample data', () => {
  const ids = ['cover', 'draft'];
  assert.deepEqual(
    uploadFileListPreviewItems(ids, 'uploading').map((item) => [
      item.id,
      item.status,
      item.progress,
    ]),
    [
      ['cover', 'uploading', 64],
      ['draft', 'uploading', 64],
    ],
  );
  assert.deepEqual(
    uploadFileListPreviewItems(ids, 'mixed').map((item) => [item.id, item.status]),
    [
      ['cover', 'done'],
      ['draft', 'error'],
    ],
  );
  assert.equal(uploadFileListPreviewOptions().variant, 'file');
});
test('generated examples parse and include the selected variant, status and local assets', () => {
  const options = uploadFileListPreviewOptions({
    uploadFileListVariant: 'picture-card',
    uploadFileListStatus: 'error',
    state: 'disabled',
  });
  const react = uploadFileListExampleCode('react', options);
  const vue = uploadFileListExampleCode('vue', options);
  for (const code of [react, vue]) {
    assert.match(code, /variant="picture-card"/);
    assert.match(code, /\/examples\/file-preview.svg/);
    assert.match(code, /"status":"error"/);
    assert.match(code, /关闭预览/);
  }
  assert.deepEqual(
    ts.transpileModule(react, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    }).diagnostics ?? [],
    [],
  );
  const { descriptor, errors } = parse(vue, { filename: 'UploadFileList.vue' });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'file-list' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'UploadFileList.vue',
      id: 'file-list',
    }).errors,
    [],
  );
});

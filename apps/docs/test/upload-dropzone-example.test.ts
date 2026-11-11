import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import {
  dropzoneResult,
  uploadDropzoneExampleCode,
  uploadDropzonePreviewOptions,
} from '../src/UploadDropzoneExample';

test('dropzone preview forwards constraints and keeps source with accepted file names', () => {
  const options = uploadDropzonePreviewOptions({
    uploadDropzoneAccept: 'image',
    uploadDropzoneMultiple: false,
    uploadDropzoneSizeLimit: true,
    uploadDropzoneCountLimit: true,
    uploadDropzoneExisting: true,
    state: 'disabled',
  });
  assert.deepEqual(options, {
    accept: 'image/*',
    multiple: false,
    maxFileSize: 1048576,
    maxFiles: 3,
    existingCount: 1,
    disabled: true,
  });
  const file = new File(['content'], 'sample.png', { type: 'image/png' });
  assert.deepEqual(dropzoneResult([file], [], 'drop'), {
    accepted: ['sample.png'],
    source: 'drop',
  });
});

test('dropzone examples compile and reflect matching options in both frameworks', () => {
  for (const options of [
    uploadDropzonePreviewOptions(),
    uploadDropzonePreviewOptions({
      uploadDropzoneAccept: 'text',
      uploadDropzoneMultiple: false,
      uploadDropzoneSizeLimit: true,
      uploadDropzoneCountLimit: true,
      uploadDropzoneExisting: true,
      state: 'disabled',
    }),
  ]) {
    const react = uploadDropzoneExampleCode('react', options);
    const vue = uploadDropzoneExampleCode('vue', options);
    assert.match(react, /文件仅在本地处理，不会上传/);
    assert.match(vue, /文件仅在本地处理，不会上传/);
    assert.ok(react.includes(`multiple={${options.multiple}}`));
    assert.ok(vue.includes(`:multiple="${options.multiple}"`));
    assert.ok(react.includes(`existingCount={${options.existingCount}}`));
    assert.ok(vue.includes(`:existing-count="${options.existingCount}"`));
    assert.deepEqual(
      ts.transpileModule(react, {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics ?? [],
      [],
    );
    const { descriptor, errors } = parse(vue, { filename: 'Dropzone.vue' });
    assert.deepEqual(errors, []);
    assert.doesNotThrow(() => compileScript(descriptor, { id: 'dropzone' }));
    assert.deepEqual(
      compileTemplate({
        source: descriptor.template!.content,
        filename: 'Dropzone.vue',
        id: 'dropzone',
      }).errors,
      [],
    );
  }
});

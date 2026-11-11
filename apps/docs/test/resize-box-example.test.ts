import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import {
  resizeBoxExampleCode,
  resizeBoxPreviewOptions,
  type ResizeBoxPreviewOptions,
} from '../src/resize-box-example-code';

test('ResizeBox preview defaults to horizontal and honors direction and disabled state', () => {
  assert.deepEqual(resizeBoxPreviewOptions(), { orientation: 'horizontal', disabled: false });
  assert.deepEqual(
    resizeBoxPreviewOptions({
      orientation: 'vertical',
      state: 'disabled',
      size: 'md',
      variant: 'default',
      progress: 0,
    }),
    { orientation: 'vertical', disabled: true },
  );
});

test('ResizeBox examples express the same direction, bounds, disabled state and controlled value', () => {
  const options: ResizeBoxPreviewOptions = { orientation: 'vertical', disabled: true };
  for (const framework of ['react', 'vue'] as const) {
    const code = resizeBoxExampleCode(framework, options);
    assert.match(code, /orientation="vertical"/);
    assert.match(code, /disabled/);
    assert.match(code, /20/);
    assert.match(code, /80/);
    assert.match(code, /size/);
  }
});
test('ResizeBox examples parse in both frameworks', () => {
  const options: ResizeBoxPreviewOptions = { orientation: 'horizontal', disabled: false };
  const react = ts.transpileModule(resizeBoxExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(resizeBoxExampleCode('vue', options), {
    filename: 'ResizeBoxExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'resize-box-example' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'ResizeBoxExample.vue',
      id: 'resize-box-example',
    }).errors,
    [],
  );
});

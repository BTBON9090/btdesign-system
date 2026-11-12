import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import {
  pageForSize,
  paginationExampleCode,
  paginationPreviewOptions,
} from '../src/PaginationExample.ts';

test('page-size changes retain the first item from the current page within the new bounds', () => {
  assert.equal(pageForSize(5, 10, 20, 128), 3);
  assert.equal(pageForSize(13, 10, 50, 128), 3);
  assert.equal(pageForSize(1, 10, 50, 128), 1);
  assert.equal(pageForSize(99, 10, 50, 128), 3);
});
test('React and Vue examples reflect all controls and compile as syntax', () => {
  const o = paginationPreviewOptions({
    paginationSize: 'big',
    paginationSimple: false,
    paginationShowTotal: true,
    paginationPageSizes: true,
    paginationJumper: true,
    paginationArrow: 'icon',
    state: 'disabled',
  });
  const react = paginationExampleCode('react', o),
    vue = paginationExampleCode('vue', o);
  assert.match(
    react,
    /size="big".*showTotal=\{true\}.*showQuickJumper=\{true\}.*arrow="icon".*onPageSizeChange=\{changeSize\}/,
  );
  assert.match(
    vue,
    /size="big".*:show-total="true".*:show-quick-jumper="true".*arrow="icon".*@update:page-size="changeSize"/,
  );
  assert.match(react, /保留原页首条/);
  assert.match(vue, /保留原页首条/);
  assert.deepEqual(
    ts.transpileModule(react, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    }).diagnostics ?? [],
    [],
  );
  const { descriptor, errors } = parse(vue, { filename: 'PaginationExample.vue' });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'pagination-example' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'PaginationExample.vue',
      id: 'pagination-example',
    }).errors,
    [],
  );
});

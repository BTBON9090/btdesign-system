import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import {
  dropdownMenuExampleCode,
  dropdownMenuPreviewItems,
  dropdownMenuPreviewOptions,
} from '../src/DropdownMenuExample';

test('dropdown options keep commands, checkbox items and independent highlight distinct', () => {
  const options = dropdownMenuPreviewOptions({
    dropdownGroup: true,
    dropdownSeparator: true,
    dropdownSubmenu: true,
    dropdownCheckable: true,
    dropdownHighlight: true,
    dropdownSplit: true,
    dropdownCloseOnCheck: true,
  });
  const items = dropdownMenuPreviewItems(options);
  assert.equal(items[0].group, true);
  assert.equal(items[0].children?.[0].kind, 'checkbox');
  assert.equal(items[1].separator, true);
  assert.equal(items[2].children?.[0].kind, undefined);
  assert.equal(options.triggerMode, 'split');
  for (const framework of ['react', 'vue'] as const) {
    const code = dropdownMenuExampleCode(framework, options);
    assert.match(code, /"kind":"checkbox"/);
    assert.match(code, /\['copy'\]/);
    assert.match(code, /命令：/);
    assert.match(code, /已触发主操作/);
  }
  assert.equal(dropdownMenuPreviewItems(dropdownMenuPreviewOptions())[0].kind, undefined);
});
test('dropdown examples parse in both frameworks for standard and configured cases', () => {
  for (const options of [
    dropdownMenuPreviewOptions(),
    dropdownMenuPreviewOptions({
      dropdownCheckable: true,
      dropdownHighlight: true,
      dropdownSplit: true,
      dropdownCloseOnCheck: true,
    }),
  ]) {
    const react = dropdownMenuExampleCode('react', options);
    assert.deepEqual(
      ts.transpileModule(react, {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics ?? [],
      [],
    );
    const { descriptor, errors } = parse(dropdownMenuExampleCode('vue', options), {
      filename: 'Dropdown.vue',
    });
    assert.deepEqual(errors, []);
    assert.doesNotThrow(() => compileScript(descriptor, { id: 'dropdown' }));
    assert.deepEqual(
      compileTemplate({
        source: descriptor.template!.content,
        filename: 'Dropdown.vue',
        id: 'dropdown',
      }).errors,
      [],
    );
  }
});

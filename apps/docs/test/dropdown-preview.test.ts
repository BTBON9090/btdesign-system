import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { dropdownPreviewItems } from '../src/dropdown-preview';
import { enterpriseComponentCode } from '../src/enterprise-catalog';
import { defaultDemoOptions } from '../src/catalog';

test('Dropdown preview and code share group, separator and submenu settings', () => {
  const plain = dropdownPreviewItems();
  assert.equal(plain.length, 3);
  assert.deepEqual(
    plain.map((item) => item.key),
    ['edit', 'copy', 'archive'],
  );
  const options = {
    ...defaultDemoOptions,
    dropdownGroup: true,
    dropdownSeparator: true,
    dropdownSubmenu: true,
  };
  const entries = dropdownPreviewItems(options);
  assert.deepEqual(
    entries.map((item) => item.key),
    ['project', 'separator', 'more', 'archive'],
  );
  for (const framework of ['react', 'vue'] as const) {
    const code = enterpriseComponentCode('dropdown-menu', framework, options);
    assert.match(code, /"group": true/);
    assert.match(code, /"separator": true/);
    assert.match(code, /"children"/);
    assert.match(code, /"danger": true/);
  }
});
test('Dropdown generated examples parse in both frameworks', () => {
  const options = {
    ...defaultDemoOptions,
    dropdownGroup: true,
    dropdownSeparator: true,
    dropdownSubmenu: true,
  };
  const react = ts.transpileModule(enterpriseComponentCode('dropdown-menu', 'react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(enterpriseComponentCode('dropdown-menu', 'vue', options), {
    filename: 'DropdownExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'dropdown-example' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'DropdownExample.vue',
      id: 'dropdown-example',
    }).errors,
    [],
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import {
  tabsExampleCode,
  tabsPreviewItems,
  type TabsPreviewOptions,
} from '../src/tabs-example-code';

test('Tabs generated code matches selected variant, orientation and disabled item', () => {
  const options: TabsPreviewOptions = {
    variant: 'card-gutter',
    orientation: 'vertical',
    disabledItem: true,
  };
  assert.equal(tabsPreviewItems(options)[2].disabled, true);
  for (const framework of ['react', 'vue'] as const) {
    const code = tabsExampleCode(framework, options);
    assert.match(code, /variant="card-gutter"/);
    assert.match(code, /orientation="vertical"/);
    assert.match(code, /"disabled": true/);
  }
});
test('Tabs examples parse in both frameworks', () => {
  const options: TabsPreviewOptions = {
    variant: 'line',
    orientation: 'horizontal',
    disabledItem: false,
  };
  const react = ts.transpileModule(tabsExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(tabsExampleCode('vue', options), {
    filename: 'TabsExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'tabs-example' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'TabsExample.vue',
      id: 'tabs-example',
    }).errors,
    [],
  );
});

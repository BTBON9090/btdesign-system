import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import {
  numberInputExampleCode,
  numberInputPreviewOptions,
  type NumberInputPreviewOptions,
} from '../src/number-input-example-code';

test('NumberInput examples match selected layout, bounds and state', () => {
  assert.equal(numberInputPreviewOptions().stepperLayout, 'sides');
  const options: NumberInputPreviewOptions = {
    stepperLayout: 'stacked',
    controlSize: 'lg',
    disabled: true,
    invalid: true,
  };
  for (const framework of ['react', 'vue'] as const) {
    const code = numberInputExampleCode(framework, options);
    assert.match(code, /stepper(?:Layout|-layout)="stacked"/);
    assert.match(code, /disabled/);
    assert.match(code, /请检查席位数量/);
    assert.match(code, /20/);
  }
});
test('NumberInput examples parse for React and Vue', () => {
  const options: NumberInputPreviewOptions = {
    stepperLayout: 'stacked',
    controlSize: 'md',
    disabled: false,
    invalid: false,
  };
  const react = ts.transpileModule(numberInputExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(numberInputExampleCode('vue', options), {
    filename: 'NumberInputExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'number-example' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'NumberInputExample.vue',
      id: 'number-example',
    }).errors,
    [],
  );
});

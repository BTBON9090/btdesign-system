import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { tooltipExampleCode } from '../src/tooltip-example-code';

test('Tooltip examples use a real focusable trigger and reflect position and disabled state', () => {
  for (const framework of ['react', 'vue'] as const) {
    const code = tooltipExampleCode(framework, { placement: 'right', disabled: true });
    assert.match(code, /placement="right" disabled/);
    assert.match(code, /<Button variant="secondary">查看说明<\/Button>/);
    assert.doesNotMatch(
      tooltipExampleCode(framework, { placement: 'top', disabled: false }),
      / disabled/,
    );
  }
});

test('generated Tooltip examples parse as React TSX and Vue SFC', () => {
  const options = { placement: 'right', disabled: false } as const;
  const react = ts.transpileModule(tooltipExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(tooltipExampleCode('vue', options), {
    filename: 'TooltipExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'tooltip-example' }));
  const template = compileTemplate({
    source: descriptor.template!.content,
    filename: 'TooltipExample.vue',
    id: 'tooltip-example',
  });
  assert.deepEqual(template.errors, []);
});

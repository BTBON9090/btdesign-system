import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { stepsExampleCode, stepsPreviewItems } from '../src/steps-example-code';

test('Steps previews and examples share icons, error status and progress settings', () => {
  const options = {
    orientation: 'vertical',
    current: 1,
    showIcons: true,
    errorLast: true,
  } as const;
  const items = stepsPreviewItems(options);
  assert.equal(items.length, 3);
  assert.equal(items[1].icon, '◆');
  assert.equal(items[2].status, 'error');
  for (const framework of ['react', 'vue'] as const) {
    const code = stepsExampleCode(framework, options);
    assert.match(code, /orientation="vertical"/);
    assert.match(code, /"status": "error"/);
    assert.match(code, /"icon": "◆"/);
    assert.match(code, framework === 'react' ? /current=\{1\}/ : /:current="1"/);
  }
  assert.ok(
    stepsPreviewItems({ ...options, showIcons: false, errorLast: false }).every(
      (item) => !('icon' in item) && !('status' in item),
    ),
  );
});

test('generated Steps examples parse as React TSX and Vue SFC', () => {
  const options = {
    orientation: 'vertical',
    current: 1,
    showIcons: true,
    errorLast: true,
  } as const;
  const react = ts.transpileModule(stepsExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(stepsExampleCode('vue', options), {
    filename: 'StepsExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'steps-example' }));
  const template = compileTemplate({
    source: descriptor.template!.content,
    filename: 'StepsExample.vue',
    id: 'steps-example',
  });
  assert.deepEqual(template.errors, []);
});

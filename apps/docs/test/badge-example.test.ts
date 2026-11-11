import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { badgeExampleCode, type BadgePreviewOptions } from '../src/badge-example-code';

test('Badge generated examples reflect status, count and dot settings', () => {
  const base: BadgePreviewOptions = {
    mode: 'count',
    variant: 'danger',
    target: 'avatar',
    count: 120,
    showZero: false,
  };
  for (const framework of ['react', 'vue'] as const) {
    const count = badgeExampleCode(framework, base);
    assert.match(count, /Avatar name="林晓"/);
    assert.match(count, /120/);
    assert.match(count, /variant="danger"/);
    const dot = badgeExampleCode(framework, { ...base, mode: 'dot', target: 'standalone' });
    assert.match(dot, / dot /);
    assert.doesNotMatch(dot, /Avatar|120/);
    assert.match(badgeExampleCode(framework, { ...base, mode: 'status' }), /已发布/);
  }
});
test('Badge examples parse in both frameworks', () => {
  const options: BadgePreviewOptions = {
    mode: 'count',
    variant: 'info',
    target: 'avatar',
    count: 0,
    showZero: true,
  };
  const react = ts.transpileModule(badgeExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(badgeExampleCode('vue', options), {
    filename: 'BadgeExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'badge-example' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'BadgeExample.vue',
      id: 'badge-example',
    }).errors,
    [],
  );
});

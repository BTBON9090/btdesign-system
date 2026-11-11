import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { anchorExampleCode, anchorPreviewItems } from '../src/anchor-example-code';

test('Anchor examples match the selected nesting and safely navigate inside the demo', () => {
  assert.equal(anchorPreviewItems({ nested: false }).length, 2);
  assert.equal(anchorPreviewItems({ nested: true })[0].children?.[0].href, '#anchor-demo-detail');
  for (const framework of ['react', 'vue'] as const) {
    for (const nested of [false, true]) {
      const code = anchorExampleCode(framework, { nested });
      assert.equal(code.includes('"children"'), nested);
      assert.match(code, /event\.preventDefault\(\)/);
      assert.match(code, /scrollTop \+=/);
      assert.match(code, /anchor-demo-detail/);
    }
  }
});
test('generated Anchor examples parse as React TSX and Vue SFC', () => {
  const react = ts.transpileModule(anchorExampleCode('react', { nested: true }), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(anchorExampleCode('vue', { nested: true }), {
    filename: 'AnchorExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'anchor-example' }));
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template!.content,
      filename: 'AnchorExample.vue',
      id: 'anchor-example',
    }).errors,
    [],
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { tagExampleCode } from '../src/tag-example-code';

test('Tag examples expose real close and restore behavior only when closable', () => {
  for (const framework of ['react', 'vue'] as const) {
    const plain = tagExampleCode(framework, { tone: 'success', closable: false, disabled: false });
    assert.match(plain, /tone="success"/);
    assert.doesNotMatch(plain, /closable|恢复标签/);
    const closable = tagExampleCode(framework, { tone: 'warning', closable: true, disabled: true });
    assert.match(closable, /tone="warning"/);
    assert.match(closable, /closable[^>]*disabled/);
    assert.match(closable, /恢复标签/);
    assert.match(
      closable,
      framework === 'react'
        ? /onClose=\{\(\) => setVisible\(false\)\}/
        : /@close="visible = false"/,
    );
  }
});

test('generated closable Tag examples parse as React TSX and Vue SFC', () => {
  const options = { tone: 'info', closable: true, disabled: false } as const;
  const react = ts.transpileModule(tagExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(tagExampleCode('vue', options), {
    filename: 'TagExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'tag-example' }));
  const template = compileTemplate({
    source: descriptor.template!.content,
    filename: 'TagExample.vue',
    id: 'tag-example',
  });
  assert.deepEqual(template.errors, []);
});

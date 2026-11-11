import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { timelineExampleCode, timelinePreviewItems } from '../src/timeline-example-code';

test('Timeline preview switches orientation, tone, and explicit states without inventing behavior', () => {
  const plain = timelinePreviewItems({
    orientation: 'vertical',
    tone: 'default',
    showStates: false,
  });
  assert.equal(plain.length, 3);
  assert.ok(plain.every((item) => !('state' in item)));
  const statuses = timelinePreviewItems({
    orientation: 'horizontal',
    tone: 'warning',
    showStates: true,
  });
  assert.deepEqual(
    statuses.map((item) => item.state),
    ['done', 'current', 'pending'],
  );
  assert.ok(statuses.every((item) => item.tone === 'warning'));
  for (const framework of ['react', 'vue'] as const) {
    const code = timelineExampleCode(framework, {
      orientation: 'horizontal',
      tone: 'warning',
      showStates: true,
    });
    assert.match(code, /orientation="horizontal"/);
    assert.match(code, /"tone": "warning"/);
    assert.match(code, /"state": "current"/);
  }
});

test('generated Timeline examples parse as React TSX and Vue SFC', () => {
  const options = { orientation: 'horizontal', tone: 'success', showStates: true } as const;
  const react = ts.transpileModule(timelineExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(timelineExampleCode('vue', options), {
    filename: 'TimelineExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'timeline-example' }));
  const template = compileTemplate({
    source: descriptor.template!.content,
    filename: 'TimelineExample.vue',
    id: 'timeline-example',
  });
  assert.deepEqual(template.errors, []);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { pageHeaderExampleCode } from '../src/page-header-example-code';

test('PageHeader examples expose only selected parts and wire back and action callbacks', () => {
  const empty = {
    showBack: false,
    showDescription: false,
    showActions: false,
    showBreadcrumb: false,
  };
  for (const framework of ['react', 'vue'] as const) {
    const simple = pageHeaderExampleCode(framework, empty);
    assert.doesNotMatch(simple, /handleBack|handleSave|面包屑|查看并管理/);
    const full = pageHeaderExampleCode(framework, {
      showBack: true,
      showDescription: true,
      showActions: true,
      showBreadcrumb: true,
    });
    assert.match(full, /handleBack/);
    assert.match(full, /handleSave/);
    assert.match(full, /面包屑/);
    assert.match(full, /查看并管理/);
  }
});
test('generated PageHeader examples parse as React TSX and Vue SFC', () => {
  const options = {
    showBack: true,
    showDescription: true,
    showActions: true,
    showBreadcrumb: true,
  };
  const react = ts.transpileModule(pageHeaderExampleCode('react', options), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(react.diagnostics ?? [], []);
  const { descriptor, errors } = parse(pageHeaderExampleCode('vue', options), {
    filename: 'PageHeaderExample.vue',
  });
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => compileScript(descriptor, { id: 'page-header-example' }));
  const template = compileTemplate({
    source: descriptor.template!.content,
    filename: 'PageHeaderExample.vue',
    id: 'page-header-example',
  });
  assert.deepEqual(template.errors, []);
});

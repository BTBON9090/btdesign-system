import test from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbExampleCode } from '../src/breadcrumb-example-code';

test('Breadcrumb generated examples retain the selected separator in both frameworks', () => {
  for (const framework of ['react', 'vue'] as const) {
    for (const separator of ['slash', 'dot', 'arrow'] as const) {
      const code = breadcrumbExampleCode(framework, separator);
      assert.ok(code.includes(`separator="${separator}"`));
      assert.ok(code.includes('组件总览'));
    }
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { componentCode, defaultDemoOptions } from '../src/catalog';

test('React and Vue generated examples match button variant choices and group order', () => {
  for (const framework of ['react', 'vue'] as const) {
    const button = componentCode('button', framework, {
      ...defaultDemoOptions,
      buttonSize: 'xs',
      buttonTone: 'warning',
      buttonShape: 'pill',
      buttonContent: 'icon',
    });
    assert.match(button, /size="xs"/);
    assert.match(button, /tone="warning"/);
    assert.match(button, /shape="pill"/);
    assert.match(button, /aria-label="保存更改"/);
    assert.match(button, framework === 'react' ? /iconOnly/ : /icon-only/);
    const group = componentCode('button-group', framework, {
      ...defaultDemoOptions,
      buttonGroupCount: 4,
      buttonGroupReverse: true,
    });
    assert.equal((group.match(/>操作 \d<\/Button>/g) ?? []).length, 4);
    assert.ok(group.indexOf('操作 4') < group.indexOf('操作 1'));
  }
});

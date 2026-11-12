import test from 'node:test';
import assert from 'node:assert/strict';
import {
  closeWorkspaceTab,
  initialWorkspaceTabs,
  workspaceTabsExample,
  workspaceTabsPreviewOptions,
} from '../src/WorkspaceTabsExample.ts';

test('closing selects the next available tab, then previous, then empty', () => {
  const items = [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C', disabled: true },
    { key: 'd', label: 'D' },
  ];
  assert.equal(closeWorkspaceTab(items, 'b', 'b').activeKey, 'd');
  assert.equal(closeWorkspaceTab(items, 'd', 'd').activeKey, 'b');
  assert.equal(closeWorkspaceTab(items, 'a', 'b').activeKey, 'a');
  assert.equal(closeWorkspaceTab([{ key: 'a', label: 'A' }], 'a', 'a').activeKey, null);
  assert.deepEqual(closeWorkspaceTab(items, 'a', 'missing'), { items, activeKey: 'a' });
});
test('examples match toggles and provide usable page restoration', () => {
  assert.ok(initialWorkspaceTabs.length > 5);
  assert.deepEqual(workspaceTabsPreviewOptions(), { closable: true, more: true });
  for (const framework of ['react', 'vue'] as const) {
    const code = workspaceTabsExample(framework);
    assert.match(code, /更多页面/);
    assert.match(code, /恢复示例/);
    assert.match(code, /closable: true/);
    const hidden = workspaceTabsExample(framework, {
      workspaceTabsClosable: false,
      workspaceTabsMore: false,
    });
    assert.match(hidden, /closable: false/);
    assert.doesNotMatch(hidden, /更多页面/);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject } from '@btdesign/core';
import { parseThemeImport } from '../src/studio/migration-utils.ts';
import { patchHistory, redoChange, undoChange, resetProjectStyle } from '../src/studio/model.ts';

test('breadcrumb rules import consistently from JSON and CSS and obey bounds', () => {
  const fromJson = parseThemeImport(
    JSON.stringify({ components: { breadcrumb: { itemGap: 12, separatorGap: 3, fontSize: 16 } } }),
  );
  const fromCss = parseThemeImport(
    '--f-breadcrumb-item-gap:12px;--f-breadcrumb-separator-gap:3px;--f-breadcrumb-font-size:16px;',
  );
  assert.deepEqual(fromJson.warnings, []);
  assert.deepEqual(fromCss.warnings, []);
  assert.deepEqual(fromCss.patch.components, fromJson.patch.components);
  assert.deepEqual(fromJson.patch.components?.breadcrumb, {
    itemGap: 12,
    separatorGap: 3,
    fontSize: 16,
  });
  const bounded = parseThemeImport(
    '--f-breadcrumb-item-gap:-2px;--f-breadcrumb-separator-gap:99px;--f-breadcrumb-font-size:99px;',
  );
  assert.deepEqual(bounded.patch.components?.breadcrumb, {
    itemGap: 0,
    separatorGap: 24,
    fontSize: 20,
  });
});
test('breadcrumb edits undo, redo and reset as normal project rules', () => {
  const project = createProject();
  const initial = { past: [], present: project, future: [] };
  const edited = patchHistory(initial, {
    theme: { components: { breadcrumb: { itemGap: 18, fontSize: 16 } } },
  });
  assert.deepEqual(edited.present.theme.components?.breadcrumb, { itemGap: 18, fontSize: 16 });
  const undone = undoChange(edited);
  assert.equal(undone.present.theme.components?.breadcrumb, undefined);
  assert.deepEqual(redoChange(undone).present.theme.components?.breadcrumb, {
    itemGap: 18,
    fontSize: 16,
  });
  assert.equal(resetProjectStyle(edited.present).theme.components?.breadcrumb, undefined);
});

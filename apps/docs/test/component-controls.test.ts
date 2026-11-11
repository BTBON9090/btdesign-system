import test from 'node:test';
import assert from 'node:assert/strict';
import { applyThemePatch, createTheme, defaultTheme, type ThemeConfig } from '@btdesign/tokens';
import { catalog } from '../src/catalog.ts';
import {
  componentControls,
  controlDefinitions,
  getSelectedPart,
  partHasOverrides,
  resetPartPatch,
  sharedControlLabels,
  type EditorSelection,
} from '../src/studio/component-controls.ts';

test('every published family has named parts and editable controls that resolve to real theme tokens', () => {
  assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
  assert.deepEqual(Object.keys(componentControls).sort(), catalog.map((item) => item.id).sort());
  const vars = createTheme(defaultTheme);
  for (const item of catalog) {
    const definition = componentControls[item.id];
    assert.equal(definition.label, item.cn);
    assert.ok(definition.parts.length > 0, item.id);
    assert.equal(new Set(definition.parts.map((part) => part.id)).size, definition.parts.length);
    for (const part of definition.parts) {
      assert.ok(part.label.length > 0);
      for (const id of part.controls) {
        const control = controlDefinitions[id];
        assert.ok(control, `${item.id}/${part.id}/${id}`);
        assert.ok(Number.isFinite(parseInt(vars[control.token])), control.token);
        assert.ok(control.min <= control.max);
        const changed = applyThemePatch(defaultTheme, {
          components: { [control.group]: { [control.property]: control.max } },
        });
        assert.equal(createTheme(changed)[control.token], `${control.max}px`);
      }
    }
  }
});

test('a component switch resolves to that component first part and never keeps an unrelated rule group', () => {
  assert.equal(getSelectedPart({ component: 'table' })?.id, 'cells');
  assert.deepEqual(getSelectedPart({ component: 'table', part: 'calendar' })?.controls, [
    'tablePadding',
  ]);
  assert.equal(getSelectedPart({ component: 'date-picker', part: 'calendar' })?.id, 'calendar');
  assert.equal(getSelectedPart({ component: 'page' }), null);
});

test('switch dimensions and native select options never expose unrelated input geometry', () => {
  assert.deepEqual(
    componentControls.switch.parts.flatMap((part) => part.controls),
    [],
  );
  assert.deepEqual(getSelectedPart({ component: 'select', part: 'options' })?.controls, []);
  assert.deepEqual(getSelectedPart({ component: 'textarea', part: 'input' })?.controls, [
    'inputRadius',
  ]);
  assert.ok(
    !componentControls.segmented.parts.flatMap((part) => part.controls).includes('choiceGap'),
  );
});

test('reset removes only visible part fields and preserves sibling rules and other groups', () => {
  const theme: ThemeConfig = {
    ...defaultTheme,
    components: {
      table: { cellPadding: 20, rowHeight: 60 },
      input: { radius: 14, height: 48 },
      calendar: { cellSize: 44, gap: 6 },
      overlay: { radius: 16, padding: 20 },
    },
  };
  const selected: EditorSelection = { component: 'table', part: 'cells' };
  assert.equal(partHasOverrides(theme, selected), true);
  const reset = applyThemePatch(theme, resetPartPatch(selected));
  assert.equal(reset.components?.table?.cellPadding, undefined);
  assert.equal(reset.components?.table?.rowHeight, 60);
  assert.deepEqual(reset.components?.input, theme.components?.input);
  assert.equal(partHasOverrides(reset, selected), false);
  const calendarReset = applyThemePatch(
    theme,
    resetPartPatch({ component: 'date-picker', part: 'calendar' }),
  );
  assert.equal(calendarReset.components?.calendar, undefined);
  assert.deepEqual(calendarReset.components?.input, theme.components?.input);
  assert.deepEqual(calendarReset.components?.overlay, theme.components?.overlay);
  assert.deepEqual(resetPartPatch({ component: 'switch' }), { components: {} });
});

test('shared rules disclose related components without including the current component or unrelated controls', () => {
  const inputShared = sharedControlLabels({ component: 'input' });
  assert.ok(inputShared.includes('选择器'));
  assert.ok(inputShared.includes('日期选择器'));
  assert.ok(!inputShared.includes('输入框'));
  assert.ok(!inputShared.includes('开关'));
  assert.ok(sharedControlLabels({ component: 'table', part: 'rows' }).includes('高级表格'));
  assert.deepEqual(sharedControlLabels({ component: 'switch' }), []);
});

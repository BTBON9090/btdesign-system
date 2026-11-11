import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyThemePatch,
  createTheme,
  defaultTheme,
  normalizeTheme,
  themeToCSS,
} from '../dist/index.js';

test('field label width is bounded, shared by both themes and survives patch and export', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: { field: { gap: 10, labelSize: 14, labelWidth: 400 } },
  });
  assert.deepEqual(theme.components.field, { gap: 10, labelSize: 14, labelWidth: 240 });
  const edited = applyThemePatch(theme, { components: { field: { labelWidth: 156 } } });
  assert.deepEqual(edited.components.field, { gap: 10, labelSize: 14, labelWidth: 156 });
  assert.equal(createTheme(edited, 'light')['--f-field-label-width'], '156px');
  assert.equal(createTheme(edited, 'dark')['--f-field-label-width'], '156px');
  assert.match(themeToCSS(edited), /--f-field-label-width: 156px/);
});

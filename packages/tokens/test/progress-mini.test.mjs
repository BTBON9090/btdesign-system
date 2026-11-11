import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyThemePatch,
  createTheme,
  defaultTheme,
  normalizeTheme,
  themeToCSS,
} from '../dist/index.js';
test('mini size and stroke use bounded, independent and exportable Lab geometry', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: {
      field: { labelWidth: 140 },
      progress: { miniSize: 100, miniStroke: 0, circleSize: 88 },
    },
  });
  assert.deepEqual(theme.components.progress, { miniSize: 64, miniStroke: 1, circleSize: 88 });
  const edited = applyThemePatch(theme, {
    components: { progress: { miniSize: 40, miniStroke: 5 } },
  });
  assert.equal(createTheme(edited, 'dark')['--f-progress-mini-size'], '40px');
  assert.equal(createTheme(edited, 'light')['--f-progress-mini-stroke'], '5px');
  assert.equal(createTheme(edited)['--f-field-label-width'], '140px');
  assert.match(themeToCSS(edited), /--f-progress-mini-size: 40px/);
});

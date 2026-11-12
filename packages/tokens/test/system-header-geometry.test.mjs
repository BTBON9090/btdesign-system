import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyThemePatch,
  createTheme,
  defaultTheme,
  normalizeTheme,
  themeToCSS,
} from '../dist/index.js';

test('system header rules normalize, merge, reset and export for both modes', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: { systemHeader: { minHeight: 10, paddingInline: 99, gap: 13.6 } },
  });
  assert.deepEqual(theme.components.systemHeader, { minHeight: 48, paddingInline: 40, gap: 14 });
  const changed = applyThemePatch(theme, { components: { systemHeader: { gap: 20 } } });
  assert.equal(createTheme(changed, 'dark')['--f-system-header-gap'], '20px');
  assert.equal(createTheme(changed)['--f-system-header-min-height'], '48px');
  const restored = applyThemePatch(changed, { components: { systemHeader: { gap: null } } });
  assert.equal(createTheme(restored)['--f-system-header-gap'], '16px');
  const css = themeToCSS(changed);
  assert.equal(css.split('--f-system-header-gap: 20px;').length - 1, 2);
});

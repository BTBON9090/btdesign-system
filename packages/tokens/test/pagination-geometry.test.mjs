import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyThemePatch,
  createTheme,
  defaultTheme,
  normalizeTheme,
  themeToCSS,
} from '../dist/index.js';

test('pagination geometry preserves density defaults and round-trips overrides', () => {
  assert.equal(createTheme(defaultTheme)['--f-pagination-size'], '38px');
  assert.equal(createTheme({ ...defaultTheme, density: 'compact' })['--f-pagination-size'], '32px');
  const theme = normalizeTheme({
    ...defaultTheme,
    components: { pagination: { size: 99, gap: -2, fontSize: 15.6 } },
  });
  assert.deepEqual(theme.components.pagination, { size: 56, gap: 0, fontSize: 16 });
  const changed = applyThemePatch(theme, { components: { pagination: { gap: 12 } } });
  assert.equal(createTheme(changed, 'dark')['--f-pagination-gap'], '12px');
  assert.equal(themeToCSS(changed).split('--f-pagination-gap: 12px;').length - 1, 2);
  const reset = applyThemePatch(changed, { components: { pagination: { gap: null } } });
  assert.equal(createTheme(reset)['--f-pagination-gap'], '6px');
});

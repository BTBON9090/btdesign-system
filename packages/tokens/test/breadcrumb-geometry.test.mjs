import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyThemePatch,
  createTheme,
  defaultTheme,
  normalizeTheme,
  themeToCSS,
} from '../dist/index.js';
const expected = {
  '--f-breadcrumb-item-gap': '8px',
  '--f-breadcrumb-separator-gap': '8px',
  '--f-breadcrumb-font-size': '13px',
};
test('existing themes retain breadcrumb defaults in both densities and modes', () => {
  for (const density of ['comfortable', 'compact'])
    for (const mode of ['light', 'dark']) {
      const theme = normalizeTheme({ ...defaultTheme, density });
      assert.equal(theme.components, undefined);
      const vars = createTheme(theme, mode);
      for (const [key, value] of Object.entries(expected)) assert.equal(vars[key], value);
    }
});
test('breadcrumb settings bound values, merge fields, honor locks and restore defaults', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: {
      breadcrumb: { itemGap: -5, separatorGap: 40, fontSize: 9 },
      input: { height: 42 },
    },
  });
  assert.deepEqual(theme.components.breadcrumb, { itemGap: 0, separatorGap: 24, fontSize: 11 });
  const changed = applyThemePatch(theme, { components: { breadcrumb: { fontSize: 17 } } });
  assert.deepEqual(changed.components.breadcrumb, { itemGap: 0, separatorGap: 24, fontSize: 17 });
  assert.deepEqual(changed.components.input, { height: 42 });
  assert.deepEqual(
    applyThemePatch(
      theme,
      { components: { breadcrumb: { itemGap: 9 } } },
      { locked: ['components'] },
    ),
    theme,
  );
  const reset = applyThemePatch(changed, {
    components: { breadcrumb: { itemGap: null, separatorGap: null, fontSize: null } },
  });
  assert.equal(reset.components.breadcrumb, undefined);
  for (const [key, value] of Object.entries(expected)) assert.equal(createTheme(reset)[key], value);
  const css = themeToCSS(changed);
  for (const [key, value] of Object.entries({
    '--f-breadcrumb-item-gap': '0px',
    '--f-breadcrumb-separator-gap': '24px',
    '--f-breadcrumb-font-size': '17px',
  }))
    assert.equal(css.split(`${key}: ${value};`).length - 1, 2);
});

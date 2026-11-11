import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTheme,
  applyThemePatch,
  createTheme,
  defaultTheme,
  themeToCSS,
} from '../dist/index.js';

const expected = {
  '--f-tabs-min-height': '32px',
  '--f-tabs-padding-inline': '13px',
  '--f-tabs-gap': '4px',
  '--f-tabs-font-size': '13px',
  '--f-tabs-icon-gap': '6px',
};
test('old theme keeps its old Tabs geometry for both densities and color modes', () => {
  for (const density of ['comfortable', 'compact'])
    for (const mode of ['light', 'dark']) {
      const theme = normalizeTheme({ ...defaultTheme, density });
      assert.equal(theme.components, undefined);
      const vars = createTheme(theme, mode);
      for (const [key, value] of Object.entries(expected))
        assert.equal(vars[key], value, `${density}/${mode}/${key}`);
    }
});
test('Tabs geometry clamps, rounds, merges, protects locked components, and restores only requested values', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: {
      tabs: { minHeight: 10, paddingInline: 80, gap: -5, fontSize: 99, iconGap: 4.6 },
      input: { height: 44 },
    },
  });
  assert.deepEqual(theme.components.tabs, {
    minHeight: 24,
    paddingInline: 32,
    gap: 0,
    fontSize: 20,
    iconGap: 5,
  });
  const patched = applyThemePatch(theme, { components: { tabs: { gap: 12, fontSize: 16 } } });
  assert.deepEqual(patched.components.tabs, {
    minHeight: 24,
    paddingInline: 32,
    gap: 12,
    fontSize: 16,
    iconGap: 5,
  });
  assert.deepEqual(patched.components.input, { height: 44 });
  assert.deepEqual(
    applyThemePatch(patched, { components: { tabs: { gap: 22 } } }, { locked: ['components'] }),
    patched,
  );
  const reset = applyThemePatch(patched, { components: { tabs: { gap: null } } });
  assert.equal(reset.components.tabs.gap, undefined);
  assert.equal(reset.components.tabs.fontSize, 16);
  assert.equal(createTheme(reset)['--f-tabs-gap'], '4px');
});
test('Tabs JSON round trip retains overrides and CSS export reflects both modes', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    density: 'compact',
    components: { tabs: { minHeight: 42, paddingInline: 21, gap: 8, fontSize: 17, iconGap: 9 } },
  });
  const restored = normalizeTheme(JSON.parse(JSON.stringify(theme)));
  assert.deepEqual(restored, theme);
  const css = themeToCSS(restored);
  for (const [key, value] of Object.entries(createTheme(restored))) {
    if (!key.startsWith('--f-tabs-')) continue;
    assert.equal(css.split(`${key}: ${value};`).length - 1, 2, `${key} in light and dark`);
  }
});

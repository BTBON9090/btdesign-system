import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyThemePatch,
  createTheme,
  defaultTheme,
  normalizeTheme,
  themeToCSS,
} from '../dist/index.js';
test('old themes retain file defaults and picture radius follows global radius in both densities and modes', () => {
  for (const density of ['comfortable', 'compact'])
    for (const mode of ['light', 'dark']) {
      const theme = normalizeTheme({ ...defaultTheme, radius: 13, density });
      assert.equal(theme.components, undefined);
      const vars = createTheme(theme, mode);
      assert.equal(vars['--f-file-thumbnail-size'], '64px');
      assert.equal(vars['--f-file-picture-card-size'], '160px');
      assert.equal(vars['--f-file-picture-radius'], '13px');
    }
});
test('file overrides are bounded, merge independently, lock and export to both theme modes', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    radius: 13,
    components: {
      fileList: { thumbnailSize: 12, pictureCardSize: 400, pictureRadius: 99 },
      input: { height: 40 },
    },
  });
  assert.deepEqual(theme.components.fileList, {
    thumbnailSize: 24,
    pictureCardSize: 320,
    pictureRadius: 20,
  });
  const updated = applyThemePatch(theme, { components: { fileList: { pictureRadius: 4 } } });
  assert.deepEqual(updated.components.fileList, {
    thumbnailSize: 24,
    pictureCardSize: 320,
    pictureRadius: 4,
  });
  assert.equal(updated.components.input.height, 40);
  assert.deepEqual(
    applyThemePatch(
      theme,
      { components: { fileList: { pictureRadius: 1 } } },
      { locked: ['components'] },
    ),
    theme,
  );
  const css = themeToCSS(updated);
  for (const declaration of [
    '--f-file-thumbnail-size: 24px;',
    '--f-file-picture-card-size: 320px;',
    '--f-file-picture-radius: 4px;',
  ])
    assert.equal(css.split(declaration).length - 1, 2, declaration);
  const restored = applyThemePatch(updated, { components: { fileList: { pictureRadius: null } } });
  assert.equal(createTheme(restored)['--f-file-picture-radius'], '13px');
  assert.equal(restored.components.fileList.thumbnailSize, 24);
});

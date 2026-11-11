import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, getProjectFiles, normalizeProject } from '../dist/index.js';
import { createTheme, defaultTheme } from '@btdesign/tokens';

const tokens = {
  thumbnailSize: '--f-file-thumbnail-size',
  pictureCardSize: '--f-file-picture-card-size',
  pictureRadius: '--f-file-picture-radius',
};
function assertCssForBothModes(css, expected) {
  for (const [name, value] of Object.entries(expected)) {
    const declaration = `${tokens[name]}: ${value}px;`;
    assert.equal(css.split(declaration).length - 1, 2, declaration);
  }
}

test('project export and import preserve file list rules for React and Vue', () => {
  const geometry = { thumbnailSize: 72, pictureCardSize: 192, pictureRadius: 5 };
  for (const framework of ['react', 'vue']) {
    const project = createProject({
      framework,
      theme: {
        ...defaultTheme,
        radius: 14,
        components: { fileList: geometry, input: { height: 42 } },
      },
    });
    const exported = getProjectFiles(project);
    const system = JSON.parse(exported['.btdesign/system.json']);
    assert.deepEqual(system.theme.components.fileList, geometry);
    assert.deepEqual(normalizeProject(system), project);
    assertCssForBothModes(exported['theme.css'], geometry);
    assert.equal(createTheme(normalizeProject(system).theme)['--f-file-picture-radius'], '5px');
  }
});

test('older exports without a picture radius inherit the global value and retain unrelated overrides', () => {
  const project = createProject({
    theme: {
      ...defaultTheme,
      radius: 14,
      components: { fileList: { thumbnailSize: 72, pictureCardSize: 192 }, input: { height: 42 } },
    },
  });
  const exported = getProjectFiles(project);
  const system = JSON.parse(exported['.btdesign/system.json']);
  assert.equal(system.theme.components.fileList.pictureRadius, undefined);
  const imported = normalizeProject(system);
  assert.deepEqual(imported, project);
  assert.deepEqual(imported.theme.components.input, { height: 42 });
  assertCssForBothModes(exported['theme.css'], {
    thumbnailSize: 72,
    pictureCardSize: 192,
    pictureRadius: 14,
  });
  for (const mode of ['light', 'dark'])
    assert.equal(createTheme(imported.theme, mode)['--f-file-picture-radius'], '14px');
});

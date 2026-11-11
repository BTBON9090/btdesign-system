import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, getProjectFiles, normalizeProject } from '../dist/index.js';
import { defaultTheme } from '@btdesign/tokens';
test('breadcrumb geometry survives project and CSS export for each framework', () => {
  for (const framework of ['react', 'vue']) {
    const values = { itemGap: 12, separatorGap: 3, fontSize: 16 };
    const project = createProject({
      framework,
      theme: { ...defaultTheme, components: { breadcrumb: values } },
    });
    const files = getProjectFiles(project);
    const imported = normalizeProject(JSON.parse(files['.btdesign/system.json']));
    assert.deepEqual(imported, project);
    assert.deepEqual(imported.theme.components.breadcrumb, values);
    for (const css of [
      '--f-breadcrumb-item-gap: 12px;',
      '--f-breadcrumb-separator-gap: 3px;',
      '--f-breadcrumb-font-size: 16px;',
    ])
      assert.equal(files['theme.css'].split(css).length - 1, 2, css);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseThemeImport } from '../src/studio/migration-utils.ts';

test('file list geometry imports from JSON and CSS with the same bounds', () => {
  const fromJson = parseThemeImport(
    JSON.stringify({
      components: { fileList: { thumbnailSize: 72, pictureCardSize: 180, pictureRadius: 12 } },
    }),
  );
  const fromCss = parseThemeImport(
    '--f-file-thumbnail-size:72px;--f-file-picture-card-size:180px;--f-file-picture-radius:12px;',
  );
  assert.deepEqual(fromJson.warnings, []);
  assert.deepEqual(fromCss.warnings, []);
  assert.deepEqual(fromCss.patch.components, fromJson.patch.components);
  assert.deepEqual(fromJson.patch.components?.fileList, {
    thumbnailSize: 72,
    pictureCardSize: 180,
    pictureRadius: 12,
  });
  const bounded = parseThemeImport(
    '--f-file-thumbnail-size:1px;--f-file-picture-card-size:999px;--f-file-picture-radius:99px;',
  );
  assert.deepEqual(bounded.patch.components?.fileList, {
    thumbnailSize: 24,
    pictureCardSize: 320,
    pictureRadius: 20,
  });
});

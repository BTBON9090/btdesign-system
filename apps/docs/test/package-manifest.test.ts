import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requiredPackageEntries } from '../src/studio/package-manifest';

const project = JSON.stringify({
  dependencies: {
    '@btdesign/tokens': 'file:./packages/btdesign-tokens-0.17.0.tgz',
    '@btdesign/engine': 'file:./packages/btdesign-engine-0.17.0.tgz',
    '@btdesign/react': 'file:./packages/btdesign-react-0.17.0.tgz',
  },
});
const manifest = ['tokens', 'engine', 'react', 'vue'].map((name) => ({
  name: `@btdesign/${name}`,
  file: `btdesign-${name}-0.17.0.tgz`,
  version: '0.17.0',
}));
test('export includes exactly the package paths named by the generated project', () => {
  assert.deepEqual(
    requiredPackageEntries(manifest, 'react', project).map((entry) => entry.file),
    ['btdesign-tokens-0.17.0.tgz', 'btdesign-engine-0.17.0.tgz', 'btdesign-react-0.17.0.tgz'],
  );
});
test('export rejects incomplete, duplicate, stale, and unsafe package manifests', () => {
  assert.throws(() => requiredPackageEntries(manifest.slice(1), 'react', project));
  assert.throws(() => requiredPackageEntries([...manifest, manifest[0]], 'react', project));
  assert.throws(() =>
    requiredPackageEntries(
      manifest.map((entry) => ({ ...entry, file: entry.file.replace('0.17.0', '0.3.0') })),
      'react',
      project,
    ),
  );
  assert.throws(() =>
    requiredPackageEntries(
      manifest.map((entry) => ({ ...entry, file: '../' + entry.file })),
      'react',
      project,
    ),
  );
});

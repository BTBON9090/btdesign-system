import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const dest = resolve('apps/docs/public/downloads');
mkdirSync(dest, { recursive: true });
for (const file of readdirSync(dest)) if (file.endsWith('.tgz')) unlinkSync(resolve(dest, file));
const packages = ['tokens', 'engine', 'react', 'vue'].map((name) => {
  const result = JSON.parse(
    execFileSync(
      'npm',
      ['pack', '--workspace', `@btdesign/${name}`, '--pack-destination', dest, '--json'],
      { encoding: 'utf8' },
    ),
  );
  return { name: `@btdesign/${name}`, file: result[0].filename, version: result[0].version };
});
// Keep previously published package URLs usable after the current version changes.
const legacy = resolve('assets/legacy-downloads');
if (existsSync(legacy)) {
  for (const version of readdirSync(legacy, { withFileTypes: true })) {
    if (!version.isDirectory()) continue;
    const directory = resolve(legacy, version.name);
    for (const file of readdirSync(directory)) {
      if (file.endsWith('.tgz') && !packages.some((entry) => entry.file === file))
        copyFileSync(resolve(directory, file), resolve(dest, file));
    }
  }
}
writeFileSync(resolve(dest, 'manifest.json'), JSON.stringify(packages, null, 2));
console.log('Packaged libraries:', packages.map((p) => p.file).join(', '));

import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const dest = resolve('apps/docs/public/downloads');
mkdirSync(dest, { recursive: true });
for (const file of readdirSync(dest)) if (file.endsWith('.tgz')) unlinkSync(resolve(dest, file));
const packages = ['tokens', 'react', 'vue'].map((name) => {
  const result = JSON.parse(
    execFileSync(
      'npm',
      ['pack', '--workspace', `@forma-ui/${name}`, '--pack-destination', dest, '--json'],
      { encoding: 'utf8' },
    ),
  );
  return { name: `@forma-ui/${name}`, file: result[0].filename, version: result[0].version };
});
writeFileSync(resolve(dest, 'manifest.json'), JSON.stringify(packages, null, 2));
console.log('Packaged libraries:', packages.map((p) => p.file).join(', '));

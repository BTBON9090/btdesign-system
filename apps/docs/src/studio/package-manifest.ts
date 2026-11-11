import type { ProjectFramework } from '@btdesign/core';

type Entry = { name: string; file: string };

/** Match the archive manifest to the exact paths referenced by the generated project. */
export function requiredPackageEntries(
  raw: unknown,
  framework: ProjectFramework,
  packageJson: string,
): Entry[] {
  const parsed: unknown = JSON.parse(packageJson);
  if (!parsed || typeof parsed !== 'object' || !('dependencies' in parsed))
    throw Error('项目依赖清单无效。');
  const dependencies = (parsed as { dependencies?: Record<string, unknown> }).dependencies;
  if (!dependencies || typeof dependencies !== 'object' || !Array.isArray(raw))
    throw Error('组件包清单无效，请刷新后重试。');
  return ['@btdesign/tokens', '@btdesign/engine', `@btdesign/${framework}`].map((name) => {
    const dependency = dependencies[name];
    const expected =
      typeof dependency === 'string'
        ? /^file:\.\/packages\/(btdesign-[a-z]+-\d+\.\d+\.\d+\.tgz)$/.exec(dependency)?.[1]
        : undefined;
    const matches = raw.filter(
      (item): item is Entry =>
        !!item &&
        typeof item === 'object' &&
        (item as Entry).name === name &&
        typeof (item as Entry).file === 'string',
    );
    if (!expected || matches.length !== 1 || matches[0].file !== expected)
      throw Error('安装包版本与导出项目不匹配，请刷新页面后重试。');
    return matches[0];
  });
}

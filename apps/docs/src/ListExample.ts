import type { Framework } from './component-types';
import { sampleImage } from './ImageExample';

export interface ListPreviewOptions {
  mode: 'basic' | 'advanced' | 'grid';
  columns: 2 | 3 | 4;
  bordered: boolean;
  split: boolean;
}
export type ListPreviewFields = {
  listMode?: ListPreviewOptions['mode'];
  listColumns?: ListPreviewOptions['columns'];
  listBordered?: boolean;
  listSplit?: boolean;
};
export function listPreviewOptions(options?: ListPreviewFields): ListPreviewOptions {
  return {
    mode: options?.listMode ?? 'basic',
    columns: options?.listColumns ?? 3,
    bordered: options?.listBordered ?? false,
    split: options?.listSplit ?? true,
  };
}
export const listPreviewItems = ['品牌体系升级', '客户服务门户', '品牌资产中心'];

export function listExampleCode(framework: Framework, options: ListPreviewOptions) {
  const grid = options.mode === 'grid';
  const advanced = options.mode === 'advanced';
  const imports = 'List, ListItem, ListItemContent, ListItemActions';
  const items = JSON.stringify(listPreviewItems);
  if (framework === 'vue') {
    const attrs = `${grid ? ` layout="grid" :columns="${options.columns}"` : ''}${options.bordered ? ' bordered' : ''}${options.split ? '' : ' :split="false"'}`;
    const image = advanced ? `\nconst image = ${JSON.stringify(sampleImage)};` : '';
    const leading = grid
      ? ''
      : '\n      <template #leading><span aria-hidden="true">◆</span></template>';
    const extra = advanced
      ? '\n      <template #extra><img :src="image" :alt="`${name}的示例图片`" width="100" /></template>'
      : '';
    return `<script setup lang="ts">\nimport { ${imports} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst names = ${items};${image}\n</script>\n\n<template>\n  <List${attrs}>\n    <ListItem v-for="name in names" :key="name">${leading}\n      <ListItemContent><strong>{{ name }}</strong><p>设计与研发共同维护</p></ListItemContent>\n      <ListItemActions><details><summary>详情</summary>示例项目</details></ListItemActions>${extra}\n    </ListItem>\n  </List>\n</template>`;
  }
  const attrs = `${grid ? ` layout="grid" columns={${options.columns}}` : ''}${options.bordered ? ' bordered' : ''}${options.split ? '' : ' split={false}'}`;
  const image = advanced ? `\nconst image = ${JSON.stringify(sampleImage)};` : '';
  const leading = grid ? '' : ' leading={<span aria-hidden="true">◆</span>}';
  const extra = advanced
    ? ' extra={<img src={image} alt={`${name}的示例图片`} width={100} />}'
    : '';
  return `import { ${imports} } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\nconst names = ${items};${image}\n\nexport default function Example() {\n  return <List${attrs}>{names.map((name) => <ListItem key={name}${leading}${extra}>\n    <ListItemContent><strong>{name}</strong><p>设计与研发共同维护</p></ListItemContent>\n    <ListItemActions><details><summary>详情</summary>示例项目</details></ListItemActions>\n  </ListItem>)}</List>;\n}`;
}

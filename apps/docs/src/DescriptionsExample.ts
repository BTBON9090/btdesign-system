import type { DemoOptions, Framework } from './component-types';

export interface DescriptionsPreviewOptions {
  orientation: 'horizontal' | 'vertical';
  bordered: boolean;
  columns: 1 | 2 | 3;
}

export function descriptionsPreviewOptions(options?: DemoOptions): DescriptionsPreviewOptions {
  return {
    orientation: options?.orientation ?? 'horizontal',
    bordered: options?.descriptionsBordered ?? false,
    columns: options?.descriptionsColumns ?? 3,
  };
}

export const descriptionsItems = [
  { key: 'name', label: '项目名称', value: '设计系统' },
  { key: 'status', label: '状态', value: '进行中' },
  { key: 'owner', label: '负责人', value: '林晓' },
  { key: 'summary', label: '项目说明', value: '让设计与开发共享同一套规则。', span: 2 },
];

/** The generated sample uses the same data and configuration as the live preview. */
export function descriptionsCode(framework: Framework, options: DescriptionsPreviewOptions) {
  const vue = framework === 'vue';
  const items = JSON.stringify(descriptionsItems, null, 2);
  const attrs = `title="项目详情" orientation="${options.orientation}"${options.bordered ? ' bordered' : ''}`;
  if (vue)
    return `<script setup lang="ts">\nimport { Descriptions } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n\nconst items = ${items};\n</script>\n\n<template>\n  <Descriptions ${attrs} :column="${options.columns}" :items="items" />\n</template>`;
  return `import { Descriptions } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items = ${items};\n\nexport default function Example() {\n  return <Descriptions ${attrs} column={${options.columns}} items={items} />;\n}`;
}

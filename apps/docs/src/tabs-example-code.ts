export interface TabsPreviewOptions {
  variant: 'default' | 'line' | 'text' | 'card' | 'card-gutter' | 'rounded';
  orientation: 'horizontal' | 'vertical';
  disabledItem: boolean;
}
export function tabsPreviewItems(options: TabsPreviewOptions) {
  return [
    { value: 'design', label: '设计规范', content: '了解设计规则。' },
    { value: 'develop', label: '开发资源', content: '了解组件和代码。' },
    {
      value: 'history',
      label: '更新记录',
      content: '查看版本变更。',
      ...(options.disabledItem ? { disabled: true } : {}),
    },
  ];
}
export function tabsExampleCode(framework: 'react' | 'vue', options: TabsPreviewOptions) {
  const items = JSON.stringify(tabsPreviewItems(options), null, 2);
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { Tabs } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items = ${items};\n</script>\n\n<template>\n  <Tabs label="资源类型" :items="items" variant="${options.variant}" orientation="${options.orientation}" />\n</template>`;
  return `import { Tabs } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items = ${items};\nexport default function Example() {\n  return <Tabs label="资源类型" items={items} variant="${options.variant}" orientation="${options.orientation}" />;\n}`;
}

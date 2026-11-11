export function breadcrumbExampleCode(framework: 'react' | 'vue', separator: 'slash' | 'dot' | 'arrow') {
  const items = JSON.stringify([
    { label: '组件总览', href: '#/components' },
    { label: '导航' },
    { label: '面包屑' },
  ], null, 2);
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { Breadcrumb } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items = ${items};\n</script>\n\n<template>\n  <Breadcrumb :items="items" separator="${separator}" />\n</template>`;
  return `import { Breadcrumb } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items = ${items};\nexport default function Example() {\n  return <Breadcrumb items={items} separator="${separator}" />;\n}`;
}

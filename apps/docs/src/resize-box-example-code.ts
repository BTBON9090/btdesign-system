import type { DemoOptions } from './component-types';

export interface ResizeBoxPreviewOptions {
  orientation: 'horizontal' | 'vertical';
  disabled: boolean;
}
export function resizeBoxPreviewOptions(options?: DemoOptions): ResizeBoxPreviewOptions {
  return {
    orientation: options?.orientation ?? 'horizontal',
    disabled: options?.state === 'disabled',
  };
}
export function resizeBoxExampleCode(framework: 'react' | 'vue', options: ResizeBoxPreviewOptions) {
  const height = options.orientation === 'vertical' ? 240 : 160;
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { ResizeBox } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst size = ref(50);\n</script>\n\n<template>\n  <ResizeBox v-model:size="size" orientation="${options.orientation}" :min="20" :max="80" :step="5"${options.disabled ? ' disabled' : ''} style="height: ${height}px; width: 100%">\n    <template #first>目录</template>\n    <template #second>内容区域</template>\n  </ResizeBox>\n  <p>面板占比：{{ size }}%</p>\n</template>`;
  return `import { useState } from 'react';\nimport { ResizeBox } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  const [size, setSize] = useState(50);\n  return (\n    <>\n      <ResizeBox size={size} onSizeChange={setSize} orientation="${options.orientation}" min={20} max={80} step={5}${options.disabled ? ' disabled' : ''} style={{ height: ${height}, width: '100%' }} first="目录" second="内容区域" />\n      <p>面板占比：{size}%</p>\n    </>\n  );\n}`;
}

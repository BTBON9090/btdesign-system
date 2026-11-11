import type { Framework } from './component-types';
export interface ProgressPreviewOptions {
  type: 'line' | 'circle' | 'mini';
  status: 'normal' | 'success' | 'warning' | 'error';
  value: number;
  showValue: boolean;
}
export type ProgressPreviewFields = {
  progressType?: ProgressPreviewOptions['type'];
  progressStatus?: ProgressPreviewOptions['status'];
  progress?: number;
  progressShowValue?: boolean;
};
export function progressPreviewOptions(options?: ProgressPreviewFields): ProgressPreviewOptions {
  return {
    type: options?.progressType ?? 'line',
    status: options?.progressStatus ?? 'normal',
    value: options?.progress ?? 64,
    showValue: options?.progressShowValue ?? true,
  };
}
export function progressExampleCode(framework: Framework, options: ProgressPreviewOptions) {
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { Progress } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  <Progress label="任务进度" :value="${options.value}" type="${options.type}" status="${options.status}" :show-value="${options.showValue}" />\n</template>`;
  return `import { Progress } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return <Progress label="任务进度" value={${options.value}} type="${options.type}" status="${options.status}" showValue={${options.showValue}} />;\n}`;
}

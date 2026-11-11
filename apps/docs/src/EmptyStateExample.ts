import type { DemoOptions, Framework } from './component-types';
export type EmptyPreviewVariant =
  | 'no-content'
  | 'initial'
  | 'no-messages'
  | 'no-results'
  | 'no-permission'
  | 'offline'
  | 'not-found'
  | 'error';
export interface EmptyPreviewOptions {
  variant: EmptyPreviewVariant;
  size: 'compact' | 'default' | 'page';
  headingLevel: 2 | 3 | 4 | 5 | 6;
}
export function emptyPreviewOptions(options?: DemoOptions): EmptyPreviewOptions {
  return {
    variant: options?.emptyVariant ?? 'no-content',
    size: options?.emptySize ?? 'default',
    headingLevel: options?.emptyHeadingLevel ?? 3,
  };
}
export function emptyExampleCode(framework: Framework, options: EmptyPreviewOptions) {
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { EmptyState } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  <EmptyState variant="${options.variant}" size="${options.size}" :heading-level="${options.headingLevel}" />\n</template>`;
  return `import { EmptyState } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return <EmptyState variant="${options.variant}" size="${options.size}" headingLevel={${options.headingLevel}} />;\n}`;
}

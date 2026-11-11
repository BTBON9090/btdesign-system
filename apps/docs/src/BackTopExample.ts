import type { DemoOptions, Framework } from './component-types';

export interface BackTopPreviewOptions {
  shape: 'square' | 'circle';
  variant: 'neutral' | 'primary';
  content: 'arrow' | 'up' | 'top';
}
type BackTopDemoFields = {
  backTopShape?: BackTopPreviewOptions['shape'];
  backTopVariant?: BackTopPreviewOptions['variant'];
  backTopContent?: BackTopPreviewOptions['content'];
};
export function backTopPreviewOptions(
  options?: DemoOptions & BackTopDemoFields,
): BackTopPreviewOptions {
  return {
    shape: options?.backTopShape ?? 'square',
    variant: options?.backTopVariant ?? 'neutral',
    content: options?.backTopContent ?? 'arrow',
  };
}

/** A contained scrolling example; no action affects the component documentation page itself. */
export function backTopExampleCode(framework: Framework, options: BackTopPreviewOptions) {
  const attrs = `visibilityHeight={80} position="inline" shape="${options.shape}" variant="${options.variant}" content="${options.content}"`;
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { BackTop } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n\nconst area = ref<HTMLElement | null>(null);\nconst target = () => area.value;\n</script>\n\n<template>\n  <div ref="area" style="height: 140px; overflow: auto; border: 1px solid var(--f-border)">\n    <div style="height: 450px; padding: 16px">向下滚动查看返回顶部</div>\n  </div>\n  <BackTop :target="target" :visibility-height="80" position="inline" shape="${options.shape}" variant="${options.variant}" content="${options.content}" />\n</template>`;
  }
  return `import { useCallback, useRef } from 'react';\nimport { BackTop } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  const area = useRef<HTMLDivElement>(null);\n  const target = useCallback(() => area.current, []);\n  return <>\n    <div ref={area} style={{ height: 140, overflow: 'auto', border: '1px solid var(--f-border)' }}>\n      <div style={{ height: 450, padding: 16 }}>向下滚动查看返回顶部</div>\n    </div>\n    <BackTop target={target} ${attrs} />\n  </>;\n}`;
}

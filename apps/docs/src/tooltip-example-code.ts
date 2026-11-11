export type TooltipPreviewPlacement = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipPreviewOptions {
  placement: TooltipPreviewPlacement;
  disabled: boolean;
}

export function tooltipExampleCode(
  framework: 'react' | 'vue',
  options: TooltipPreviewOptions,
): string {
  const tooltip = `<Tooltip content="保存后可以继续邀请成员" placement="${options.placement}"${options.disabled ? ' disabled' : ''}>\n    <Button variant="secondary">查看说明</Button>\n  </Tooltip>`;
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { Tooltip, Button } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  ${tooltip}\n</template>`;
  }
  return `import { Tooltip, Button } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return (\n    ${tooltip}\n  );\n}`;
}

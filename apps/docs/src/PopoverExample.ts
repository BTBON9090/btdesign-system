import type { DemoOptions, Framework } from './component-types';

export type PopoverPreviewPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface PopoverPreviewOptions {
  placement: PopoverPreviewPlacement;
  showArrow: boolean;
  showTitle: boolean;
  disabled: boolean;
}

type PopoverDemoFields = {
  popoverPlacement?: PopoverPreviewPlacement;
  popoverArrow?: boolean;
  popoverTitle?: boolean;
  popoverDisabled?: boolean;
};

export function popoverPreviewOptions(
  options?: DemoOptions & PopoverDemoFields,
): PopoverPreviewOptions {
  return {
    placement: options?.popoverPlacement ?? 'bottom',
    showArrow: options?.popoverArrow ?? true,
    showTitle: options?.popoverTitle ?? true,
    disabled: options?.popoverDisabled ?? false,
  };
}

/** Produces the same position, title, arrow, disabled state and interactive content as the preview. */
export function popoverExampleCode(framework: Framework, options: PopoverPreviewOptions) {
  if (framework === 'vue') {
    const attrs = `placement="${options.placement}"${options.showTitle ? ' title="通知设置"' : ' label="通知设置"'}${options.showArrow ? '' : ' :show-arrow="false"'}${options.disabled ? ' disabled' : ''}`;
    return `<script setup lang="ts">\nimport { Popover } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  <Popover trigger-label="通知设置" ${attrs}>\n    <label><input type="checkbox" checked /> 接收项目更新</label>\n  </Popover>\n</template>`;
  }
  const attrs = `placement="${options.placement}"${options.showTitle ? ' title="通知设置"' : ' label="通知设置"'}${options.showArrow ? '' : ' showArrow={false}'}${options.disabled ? ' disabled' : ''}`;
  return `import { Popover } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return (\n    <Popover trigger="通知设置" ${attrs} content={<label><input type="checkbox" defaultChecked /> 接收项目更新</label>} />\n  );\n}`;
}

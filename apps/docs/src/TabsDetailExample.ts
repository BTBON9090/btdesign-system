import { tabsPreviewItems, type TabsPreviewOptions } from './tabs-example-code';
import type { Framework } from './component-types';

export interface TabsDetailOptions extends TabsPreviewOptions {
  size: 'mini' | 'small' | 'medium' | 'big';
  showIcon: boolean;
}
export type TabsDetailFields = {
  tabsVariant?: TabsPreviewOptions['variant'];
  orientation?: TabsPreviewOptions['orientation'];
  tabsDisabledItem?: boolean;
  tabsSize?: TabsDetailOptions['size'];
  tabsShowIcon?: boolean;
};
export function tabsDetailOptions(options?: TabsDetailFields): TabsDetailOptions {
  return {
    variant: options?.tabsVariant ?? 'default',
    orientation: options?.orientation ?? 'horizontal',
    disabledItem: options?.tabsDisabledItem ?? false,
    size: options?.tabsSize ?? 'medium',
    showIcon: options?.tabsShowIcon ?? false,
  };
}
export const tabsDetailIcon = (_item: unknown, index: number) => ['◆', '●', '■'][index];
export function tabsDetailExampleCode(framework: Framework, options: TabsDetailOptions): string {
  const items = JSON.stringify(tabsPreviewItems(options), null, 2);
  if (framework === 'vue') {
    const iconImport = options.showIcon ? ', type TabItem' : '';
    const iconFn = options.showIcon
      ? "\nconst renderIcon = (_item: TabItem, index: number) => ['◆', '●', '■'][index];"
      : '';
    return `<script setup lang="ts">\nimport { Tabs${iconImport} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items = ${items};${iconFn}\n</script>\n\n<template>\n  <Tabs label="资源类型" :items="items" variant="${options.variant}" orientation="${options.orientation}" size="${options.size}"${options.showIcon ? ' :render-icon="renderIcon"' : ''} />\n</template>`;
  }
  const iconProp = options.showIcon ? " renderIcon={(_item, index) => ['◆', '●', '■'][index]}" : '';
  return `import { Tabs } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items = ${items};\nexport default function Example() {\n  return <Tabs label="资源类型" items={items} variant="${options.variant}" orientation="${options.orientation}" size="${options.size}"${iconProp} />;\n}`;
}

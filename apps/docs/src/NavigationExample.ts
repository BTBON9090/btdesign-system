import type { DemoOptions, Framework } from './component-types';
import { enterpriseNav } from './enterprise-fixtures';

export type NavigationPreviewOptions = {
  collapsed: boolean;
  showIcons: boolean;
  showCollapseControl: boolean;
  parentLink: boolean;
  initialExpanded: 'all' | 'none';
  disabled: boolean;
};
export function navigationPreviewOptions(options?: DemoOptions): NavigationPreviewOptions {
  return {
    collapsed: options?.navCollapsed ?? false,
    showIcons: options?.navIcons ?? false,
    showCollapseControl: options?.navShowCollapseControl ?? false,
    parentLink: options?.navParentLink ?? false,
    initialExpanded: options?.navInitialExpanded ?? 'all',
    disabled: options?.state === 'disabled',
  };
}
export function navigationPreviewItems(parentLink: boolean) {
  return enterpriseNav.map((item) =>
    item.key === 'work' && parentLink ? { ...item, href: '#nav-work', parentLink: true } : item,
  );
}
type NavigationLabelItem = {
  key: string;
  label: string;
  children?: readonly NavigationLabelItem[];
};
function collectNavigationLabels(items: readonly NavigationLabelItem[]): [string, string][] {
  return items.flatMap((item) => [
    [item.key, item.label] as [string, string],
    ...collectNavigationLabels(item.children ?? []),
  ]);
}
const navigationLabels = Object.fromEntries(collectNavigationLabels(enterpriseNav)) as Record<
  string,
  string
>;
export function navigationPreviewLabel(key: string): string {
  return Object.hasOwn(navigationLabels, key) ? navigationLabels[key] : '未知入口';
}
/** The example prevents navigation because its destinations are illustrative only. */
export function navigationExample(
  kind: 'sidebar-nav' | 'top-nav',
  framework: Framework,
  options?: DemoOptions,
) {
  const o = navigationPreviewOptions(options);
  const sidebar = kind === 'sidebar-nav';
  const name = sidebar ? 'SidebarNav' : 'TopNav';
  const items = JSON.stringify(navigationPreviewItems(sidebar && o.parentLink), null, 2);
  const expanded = o.initialExpanded === 'all' ? "['work']" : '[]';
  const labels = JSON.stringify(navigationLabels, null, 2);
  if (framework === 'react') {
    const icon = o.showIcons ? " renderIcon={() => '◆'}" : '';
    const collapse = sidebar
      ? ` collapsed={collapsed} onCollapsedChange={setCollapsed} showCollapseControl={${o.showCollapseControl}}`
      : '';
    const state = sidebar ? `\n  const [collapsed, setCollapsed] = useState(${o.collapsed});` : '';
    return `import { useState } from 'react';\nimport { ${name} } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items = ${items};\nconst labels: Record<string, string> = ${labels};\n\nexport default function Example() {\n  const [activeKey, setActiveKey] = useState('overview');\n  const [expandedKeys, setExpandedKeys] = useState<string[]>(${expanded});${state}\n  return (\n    <div onClick={event => { if ((event.target as HTMLElement).closest('a')) event.preventDefault(); }}>\n      <${name} label="工作空间导航" items={items} activeKey={activeKey} onSelect={setActiveKey} expandedKeys={expandedKeys} onExpandedChange={setExpandedKeys}${collapse}${icon} disabled={${o.disabled}} />\n      <p>当前入口：{labels[activeKey] ?? '未知入口'}（示例链接不跳转）</p>\n    </div>\n  );\n}`;
  }
  const icon = o.showIcons ? '<template #icon>◆</template>' : '';
  const collapse = sidebar
    ? ` v-model:collapsed="collapsed" :show-collapse-control="${o.showCollapseControl}"`
    : '';
  const state = sidebar ? `\nconst collapsed = ref(${o.collapsed});` : '';
  return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { ${name} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items = ${items};\nconst labels: Record<string, string> = ${labels};\nconst activeKey = ref('overview');\nconst expandedKeys = ref<string[]>(${expanded});${state}\nfunction preventExampleNavigation(event: MouseEvent) {\n  if ((event.target as HTMLElement).closest('a')) event.preventDefault();\n}\n</script>\n\n<template>\n  <div @click="preventExampleNavigation">\n    <${name} label="工作空间导航" :items="items" :active-key="activeKey" @select="activeKey = $event" v-model:expanded-keys="expandedKeys"${collapse} :disabled="${o.disabled}">${icon}</${name}>\n    <p>当前入口：{{ labels[activeKey] ?? '未知入口' }}（示例链接不跳转）</p>\n  </div>\n</template>`;
}

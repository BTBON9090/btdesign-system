import type { DemoOptions, Framework } from './component-types';
export type WorkspaceTab = { key: string; label: string; disabled?: boolean; closable?: boolean };
export const initialWorkspaceTabs: WorkspaceTab[] = [
  { key: 'overview', label: '工作概览' },
  { key: 'projects', label: '项目管理' },
  { key: 'members', label: '团队成员' },
  { key: 'assets', label: '资源中心' },
  { key: 'tasks', label: '任务列表' },
  { key: 'reports', label: '数据报表' },
  { key: 'settings', label: '空间设置' },
  { key: 'activity', label: '近期动态' },
];
export function workspaceTabsPreviewOptions(options?: DemoOptions) {
  return {
    closable: options?.workspaceTabsClosable ?? true,
    more: options?.workspaceTabsMore ?? true,
  };
}
/** Closing the current page prefers the next available tab, then the previous one. */
export function closeWorkspaceTab(items: WorkspaceTab[], activeKey: string | null, key: string) {
  const index = items.findIndex((item) => item.key === key);
  if (index < 0) return { items, activeKey };
  const next = items.filter((item) => item.key !== key);
  const fallback = [...items.slice(index + 1), ...items.slice(0, index).reverse()].find(
    (item) => !item.disabled,
  );
  return { items: next, activeKey: activeKey === key ? (fallback?.key ?? null) : activeKey };
}
export function workspaceTabsExample(framework: Framework, options?: DemoOptions): string {
  const o = workspaceTabsPreviewOptions(options);
  const initial = JSON.stringify(initialWorkspaceTabs);
  if (framework === 'react')
    return `import { useState } from 'react';
import { WorkspaceTabs, Button, DropdownMenu } from '@btdesign/react';
import '@btdesign/tokens/styles.css';
type Item = { key: string; label: string; disabled?: boolean };
const initial: Item[] = ${initial};
export default function Example() {
  const [items, setItems] = useState(initial);
  const [activeKey, setActiveKey] = useState<string | null>('overview');
  function closeTab(key: string) {
    const index = items.findIndex(item => item.key === key);
    if (index < 0) return;
    const fallback = [...items.slice(index + 1), ...items.slice(0, index).reverse()].find(item => !item.disabled);
    setItems(items.filter(item => item.key !== key));
    if (activeKey === key) setActiveKey(fallback?.key ?? null);
  }
  function restore() { setItems(initial); setActiveKey('overview'); }
  return <div style={{ width: '100%', maxWidth: 520 }}>
    <WorkspaceTabs label="打开的页面" items={items.map(item => ({ ...item, closable: ${o.closable} }))} activeKey={activeKey} onSelect={setActiveKey} onClose={closeTab}${o.more ? '\n      more={items.length ? <DropdownMenu label="更多页面" items={items} onSelect={setActiveKey} /> : undefined}' : ''} />
    {items.length === 0 && <p>没有打开的页面</p>}
    <Button variant="ghost" onClick={restore}>恢复示例</Button>
  </div>;
}`;
  return `<script setup lang="ts">
import { ref } from 'vue';
import { WorkspaceTabs, Button, DropdownMenu } from '@btdesign/vue';
import '@btdesign/tokens/styles.css';
type Item = { key: string; label: string; disabled?: boolean };
const initial: Item[] = ${initial};
const items = ref<Item[]>([...initial]);
const activeKey = ref<string | null>('overview');
function closeTab(key: string) {
  const index = items.value.findIndex(item => item.key === key);
  if (index < 0) return;
  const fallback = [...items.value.slice(index + 1), ...items.value.slice(0, index).reverse()].find(item => !item.disabled);
  items.value = items.value.filter(item => item.key !== key);
  if (activeKey.value === key) activeKey.value = fallback?.key ?? null;
}
function restore() { items.value = [...initial]; activeKey.value = 'overview'; }
</script>
<template>
  <div style="width:100%;max-width:520px">
    <WorkspaceTabs label="打开的页面" :items="items.map(item => ({ ...item, closable: ${o.closable} }))" :active-key="activeKey" @select="activeKey = $event" @close="closeTab">${o.more ? '\n      <template #more><DropdownMenu v-if="items.length" label="更多页面" :items="items" @select="activeKey = $event" /></template>' : ''}
    </WorkspaceTabs>
    <p v-if="!items.length">没有打开的页面</p>
    <Button variant="ghost" @click="restore">恢复示例</Button>
  </div>
</template>`;
}

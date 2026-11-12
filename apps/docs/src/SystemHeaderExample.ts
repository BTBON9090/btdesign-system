import type { DemoOptions, Framework } from './component-types';

export type SystemHeaderPreviewOptions = {
  search: boolean;
  actions: boolean;
  account: boolean;
  organization: boolean;
};
export function systemHeaderPreviewOptions(options?: DemoOptions): SystemHeaderPreviewOptions {
  return {
    search: options?.headerSearch ?? true,
    actions: options?.headerActions ?? true,
    account: options?.headerAccount ?? true,
    organization: options?.headerOrganization ?? true,
  };
}
export const headerAccountItems = [
  { key: 'profile', label: '个人资料' },
  { key: 'preferences', label: '偏好设置' },
];
export const headerOrganizationItems = [
  { key: 'design', label: '设计团队' },
  { key: 'product', label: '产品团队' },
];
export function systemHeaderExample(framework: Framework, options?: DemoOptions): string {
  const o = systemHeaderPreviewOptions(options);
  const account = JSON.stringify(headerAccountItems);
  const organizations = JSON.stringify(headerOrganizationItems);
  if (framework === 'react') {
    return `import { useState } from 'react';
import { SystemHeader, Input, Button, Avatar, DropdownMenu } from '@btdesign/react';
import '@btdesign/tokens/styles.css';
const accounts = ${account};
const organizations = ${organizations};
export default function Example() {
  const [organization, setOrganization] = useState('设计团队');
  const [message, setMessage] = useState('');
  return <>
    <SystemHeader brand={<strong>工作空间</strong>}${o.search ? '\n      search={<Input aria-label="搜索工作空间" placeholder="搜索" />}' : ''}${o.actions ? '\n      actions={<Button variant="ghost" onClick={() => setMessage("已点击帮助（演示）")}>帮助</Button>}' : ''}${o.account ? '\n      account={<><Avatar name="林晓" size="sm" /><DropdownMenu label="林晓" items={accounts} onSelect={key => setMessage(`已选择：${accounts.find(item => item.key === key)?.label ?? key}（演示）`)} /></>}' : ''}${o.organization ? '\n      organization={<DropdownMenu label={organization} items={organizations} onSelect={key => setOrganization(organizations.find(item => item.key === key)?.label ?? organization)} />}' : ''} />
    {message && <p role="status">{message}</p>}
  </>;
}`;
  }
  return `<script setup lang="ts">
import { ref } from 'vue';
import { SystemHeader, Input, Button, Avatar, DropdownMenu } from '@btdesign/vue';
import '@btdesign/tokens/styles.css';
const accounts = ${account};
const organizations = ${organizations};
const organization = ref('设计团队');
const message = ref('');
function chooseAccount(key: string) { message.value = '已选择：' + (accounts.find(item => item.key === key)?.label ?? key) + '（演示）'; }
function chooseOrganization(key: string) { organization.value = organizations.find(item => item.key === key)?.label ?? organization.value; }
</script>
<template>
  <SystemHeader>
    <template #brand><strong>工作空间</strong></template>${o.search ? '\n    <template #search><Input aria-label="搜索工作空间" placeholder="搜索" /></template>' : ''}${o.actions ? '\n    <template #actions><Button variant="ghost" @click="message = \'已点击帮助（演示）\'">帮助</Button></template>' : ''}${o.account ? '\n    <template #account><Avatar name="林晓" size="sm" /><DropdownMenu label="林晓" :items="accounts" @select="chooseAccount" /></template>' : ''}${o.organization ? '\n    <template #organization><DropdownMenu :label="organization" :items="organizations" @select="chooseOrganization" /></template>' : ''}
  </SystemHeader>
  <p v-if="message" role="status">{{ message }}</p>
</template>`;
}

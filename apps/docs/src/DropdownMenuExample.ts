import type { Framework } from './component-types';
export type DropdownMenuPreviewOptions = {
  group: boolean;
  separator: boolean;
  submenu: boolean;
  checkable: boolean;
  highlight: boolean;
  closeOnCheck: boolean;
  triggerMode: 'single' | 'split';
  primaryDisabled: boolean;
  menuDisabled: boolean;
  disabled: boolean;
};
export type DropdownMenuPreviewFields = {
  dropdownGroup?: boolean;
  dropdownSeparator?: boolean;
  dropdownSubmenu?: boolean;
  dropdownCheckable?: boolean;
  dropdownHighlight?: boolean;
  dropdownCloseOnCheck?: boolean;
  dropdownSplit?: boolean;
  dropdownPrimaryDisabled?: boolean;
  dropdownMenuDisabled?: boolean;
  state?: 'default' | 'disabled' | 'invalid' | 'loading';
};
export const dropdownCheckedLabels: Record<string, string> = {
  edit: '编辑项目',
  copy: '创建副本',
  share: '分享项目',
  delete: '删除项目',
};
export type DropdownDemoItem = {
  key: string;
  label: string;
  kind?: 'checkbox';
  group?: boolean;
  separator?: boolean;
  danger?: boolean;
  disabled?: boolean;
  children?: DropdownDemoItem[];
};
export function dropdownMenuPreviewOptions(
  options?: DropdownMenuPreviewFields,
): DropdownMenuPreviewOptions {
  return {
    group: options?.dropdownGroup ?? false,
    separator: options?.dropdownSeparator ?? false,
    submenu: options?.dropdownSubmenu ?? false,
    checkable: options?.dropdownCheckable ?? false,
    highlight: options?.dropdownHighlight ?? false,
    closeOnCheck: options?.dropdownCloseOnCheck ?? false,
    triggerMode: options?.dropdownSplit ? 'split' : 'single',
    primaryDisabled: options?.dropdownPrimaryDisabled ?? false,
    menuDisabled: options?.dropdownMenuDisabled ?? false,
    disabled: options?.state === 'disabled',
  };
}
export function dropdownMenuPreviewItems(options: DropdownMenuPreviewOptions): DropdownDemoItem[] {
  const actions: DropdownDemoItem[] = [
    { key: 'edit', label: '编辑项目', ...(options.checkable ? { kind: 'checkbox' } : {}) },
    { key: 'copy', label: '创建副本', ...(options.checkable ? { kind: 'checkbox' } : {}) },
  ];
  return [
    ...(options.group
      ? [{ key: 'project', label: '项目操作', group: true, children: actions }]
      : actions),
    ...(options.separator ? [{ key: 'separator', label: '', separator: true }] : []),
    ...(options.submenu
      ? [
          {
            key: 'more',
            label: '更多操作',
            children: [
              { key: 'share', label: '分享项目' },
              { key: 'delete', label: '删除项目', danger: true },
            ],
          },
        ]
      : []),
    { key: 'archive', label: '归档项目', disabled: true },
  ];
}
export function dropdownMenuExampleCode(
  framework: Framework,
  options: DropdownMenuPreviewOptions,
): string {
  const data = JSON.stringify(dropdownMenuPreviewItems(options));
  const highlights = options.highlight ? "['copy']" : '[]';
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { DropdownMenu } from '@btdesign/vue';\nimport type { DropdownMenuItem } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items: DropdownMenuItem[] = ${data};\nconst checked = ref<string[]>(['edit']);\nconst labels: Record<string, string> = { edit: '编辑项目', copy: '创建副本', share: '分享项目', delete: '删除项目' };\nconst message = ref('');\nfunction changeChecked(keys: string[]) { checked.value = keys; message.value = ''; }\n</script>\n\n<template>\n  <DropdownMenu label="项目操作" :items="items" trigger-mode="${options.triggerMode}" :checked-keys="checked" @update:checked-keys="changeChecked" :highlighted-keys="${highlights}" :close-on-action="true" :close-on-check="${options.closeOnCheck}" :primary-disabled="${options.primaryDisabled}" :menu-disabled="${options.menuDisabled}" :disabled="${options.disabled}" @select="key => message = '命令：' + (labels[key] ?? '菜单操作')" @primary-action="message = '已触发主操作'" />\n  ${options.checkable ? "<p>已勾选：{{ checked.map(key => labels[key] ?? key).join('、') || '无' }}</p>\n  " : ''}<p v-if="message" role="status">{{ message }}</p>\n</template>`;
  return `import { useState } from 'react';\nimport { DropdownMenu } from '@btdesign/react';\nimport type { DropdownMenuItem } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\nconst items: DropdownMenuItem[] = ${data};\nconst labels: Record<string, string> = { edit: '编辑项目', copy: '创建副本', share: '分享项目', delete: '删除项目' };\n\nexport default function Example() {\n  const [checked, setChecked] = useState<string[]>(['edit']);\n  const [message, setMessage] = useState('');\n  return <><DropdownMenu label="项目操作" items={items} triggerMode="${options.triggerMode}" checkedKeys={checked} onCheckedKeysChange={keys => { setChecked(keys); setMessage(''); }} highlightedKeys={${highlights}} closeOnAction={true} closeOnCheck={${options.closeOnCheck}} primaryDisabled={${options.primaryDisabled}} menuDisabled={${options.menuDisabled}} disabled={${options.disabled}} onSelect={key => setMessage('命令：' + (labels[key] ?? '菜单操作'))} onPrimaryAction={() => setMessage('已触发主操作')} />\n    ${options.checkable ? "<p>已勾选：{checked.map(key => labels[key] ?? key).join('、') || '无'}</p>\n    " : ''}{message && <p role="status">{message}</p>}\n  </>;\n}`;
}

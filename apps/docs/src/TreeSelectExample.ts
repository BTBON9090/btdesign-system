import type { Framework } from './component-types';

export interface TreeSelectPreviewOptions {
  multiple: boolean;
  cascade: boolean;
  searchable: boolean;
  clearable: boolean;
  showPath: boolean;
  treeSize: 'mini' | 'small' | 'medium' | 'big';
  showLine: boolean;
  showIcon: boolean;
  disabled: boolean;
}
export type TreeSelectPreviewFields = {
  multiple?: boolean;
  cascade?: boolean;
  treeSelectSearchable?: boolean;
  treeSelectClearable?: boolean;
  treeSelectShowPath?: boolean;
  treeSize?: TreeSelectPreviewOptions['treeSize'];
  treeShowLine?: boolean;
  treeShowIcon?: boolean;
  state?: 'default' | 'disabled' | 'invalid' | 'loading';
};
export function treeSelectPreviewOptions(
  options?: TreeSelectPreviewFields,
): TreeSelectPreviewOptions {
  return {
    multiple: options?.multiple ?? false,
    cascade: options?.cascade ?? false,
    searchable: options?.treeSelectSearchable ?? true,
    clearable: options?.treeSelectClearable ?? true,
    showPath: options?.treeSelectShowPath ?? false,
    treeSize: options?.treeSize ?? 'medium',
    showLine: options?.treeShowLine ?? false,
    showIcon: options?.treeShowIcon ?? false,
    disabled: options?.state === 'disabled',
  };
}
export const treeSelectPreviewNodes = [
  {
    key: 'team',
    label: '产品团队',
    children: [
      { key: 'design', label: '设计组' },
      { key: 'dev', label: '研发组' },
    ],
  },
];
export const treeSelectPreviewExpandedKeys = ['team'];

export function treeSelectExampleCode(framework: Framework, options: TreeSelectPreviewOptions) {
  const nodes = JSON.stringify(treeSelectPreviewNodes);
  const initial = options.multiple ? "['design']" : "'design'";
  if (framework === 'vue') {
    const icon = options.showIcon
      ? "\n    <template #icon=\"{ node }\"><span>{{ node.leaf ? '•' : '▣' }}</span></template>\n  "
      : '';
    return `<script setup lang="ts">\nimport { TreeSelect } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst nodes = ${nodes};\n</script>\n\n<template>\n  <TreeSelect label="选择团队" placeholder="选择团队" :nodes="nodes" :default-value="${initial}" :default-expanded-keys="['team']" :multiple="${options.multiple}" :cascade="${options.cascade}" :searchable="${options.searchable}" :clearable="${options.clearable}" :show-path="${options.showPath}" size="${options.treeSize}" :show-line="${options.showLine}" :disabled="${options.disabled}">${icon}</TreeSelect>\n</template>`;
  }
  const icon = options.showIcon ? " renderIcon={(node) => node.leaf ? '•' : '▣'}" : '';
  return `import { TreeSelect } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\nconst nodes = ${nodes};\n\nexport default function Example() {\n  return <TreeSelect label="选择团队" placeholder="选择团队" nodes={nodes} defaultValue={${initial}} defaultExpandedKeys={['team']} multiple={${options.multiple}} cascade={${options.cascade}} searchable={${options.searchable}} clearable={${options.clearable}} showPath={${options.showPath}} size="${options.treeSize}" showLine={${options.showLine}} disabled={${options.disabled}}${icon} />;\n}`;
}

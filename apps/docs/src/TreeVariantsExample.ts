import type { Framework } from './component-types';

export interface TreeVariantsOptions {
  size: 'mini' | 'small' | 'medium' | 'big';
  showLine: boolean;
  showIcon: boolean;
  multiple: boolean;
  cascade: boolean;
  disabled: boolean;
}
export type TreeVariantsFields = {
  treeSize?: TreeVariantsOptions['size'];
  treeShowLine?: boolean;
  treeShowIcon?: boolean;
  multiple?: boolean;
  cascade?: boolean;
  state?: 'default' | 'disabled' | 'invalid' | 'loading';
};
export function treeVariantsOptions(options?: TreeVariantsFields): TreeVariantsOptions {
  return {
    size: options?.treeSize ?? 'medium',
    showLine: options?.treeShowLine ?? false,
    showIcon: options?.treeShowIcon ?? false,
    multiple: options?.multiple ?? false,
    cascade: options?.cascade ?? false,
    disabled: options?.state === 'disabled',
  };
}

export const treeVariantsNodes = [
  {
    key: 'team',
    label: '产品团队',
    children: [
      { key: 'design', label: '设计组' },
      { key: 'dev', label: '研发组' },
    ],
  },
];

export function treeVariantsExampleCode(framework: Framework, options: TreeVariantsOptions) {
  const nodes =
    "[{ key: 'team', label: '产品团队', children: [{ key: 'design', label: '设计组' }, { key: 'dev', label: '研发组' }] }]";
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { Tree } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst nodes = ${nodes};\n</script>\n\n<template>\n  <Tree :nodes="nodes" :default-expanded-keys="['team']" size="${options.size}" :show-line="${options.showLine}" :multiple="${options.multiple}" :cascade="${options.cascade}" :disabled="${options.disabled}" searchable>${options.showIcon ? "\n    <template #icon=\"{ node }\"><span>{{ node.leaf ? '•' : '▣' }}</span></template>\n  " : ''}</Tree>\n</template>`;
  return `import { Tree } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst nodes = ${nodes};\nexport default function Example() {\n  return <Tree nodes={nodes} defaultExpandedKeys={['team']} size="${options.size}" showLine={${options.showLine}} multiple={${options.multiple}} cascade={${options.cascade}} disabled={${options.disabled}} searchable${options.showIcon ? " renderIcon={(node) => node.leaf ? '•' : '▣'}" : ''} />;\n}`;
}

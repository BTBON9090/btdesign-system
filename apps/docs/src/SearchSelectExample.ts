import type { Framework } from './component-types';
export interface SearchSelectPreviewOptions {
  multiple: boolean;
  disabled: boolean;
  empty: boolean;
}
export type SearchSelectPreviewFields = {
  multiple?: boolean;
  state?: 'default' | 'disabled' | 'invalid' | 'loading';
  searchSelectEmpty?: boolean;
};
export function searchSelectPreviewOptions(
  options?: SearchSelectPreviewFields,
): SearchSelectPreviewOptions {
  return {
    multiple: options?.multiple ?? false,
    disabled: options?.state === 'disabled',
    empty: options?.searchSelectEmpty ?? false,
  };
}
export const searchSelectPreviewItems = [
  { value: 'design', label: '设计团队' },
  { value: 'development', label: '研发团队' },
  { value: 'operations', label: '运营团队', disabled: true },
];
export function searchSelectExampleCode(framework: Framework, options: SearchSelectPreviewOptions) {
  const data = JSON.stringify(options.empty ? [] : searchSelectPreviewItems);
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { SearchSelect } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst options: { value: string; label: string; disabled?: boolean }[] = ${data};\n</script>\n\n<template>\n  <SearchSelect label="团队" name="team" :options="options"${options.multiple ? ' multiple' : ''}${options.disabled ? ' disabled' : ''} />\n</template>`;
  return `import { SearchSelect } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\nconst options: { value: string; label: string; disabled?: boolean }[] = ${data};\n\nexport default function Example() {\n  return <SearchSelect label="团队" name="team" options={options}${options.multiple ? ' multiple' : ''}${options.disabled ? ' disabled' : ''} />;\n}`;
}

import { Field, InputTag } from '@btdesign/react';
import type { DemoOptions, Framework } from './component-types';

type InputTagPreviewOptions = DemoOptions & { inputTagDuplicates?: boolean };

/** The same options drive the React and Vue examples and the code shown beside them. */
export function InputTagPreview({ options }: { options: InputTagPreviewOptions }) {
  const disabled = options.state === 'disabled';
  const invalid = options.state === 'invalid';
  return (
    <Field className="demo-form" label="关键词" error={invalid ? '请检查标签后重试。' : undefined}>
      <InputTag
        name="keywords"
        controlSize={options.size}
        disabled={disabled}
        invalid={invalid}
        defaultValue={['设计', '前端']}
        allowDuplicates={options.inputTagDuplicates}
        placeholder="输入后按 Enter 添加"
      />
    </Field>
  );
}

export function inputTagVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: InputTagPreviewOptions,
) {
  const disabled = options.state === 'disabled';
  const invalid = options.state === 'invalid';
  return vue.h(
    ui.Field,
    { class: 'demo-form', label: '关键词', error: invalid ? '请检查标签后重试。' : undefined },
    () =>
      vue.h(ui.InputTag, {
        name: 'keywords',
        controlSize: options.size,
        disabled,
        invalid,
        defaultValue: ['设计', '前端'],
        allowDuplicates: options.inputTagDuplicates,
        placeholder: '输入后按 Enter 添加',
      }),
  );
}

export function inputTagExample(framework: Framework, options: InputTagPreviewOptions): string {
  const disabled = options.state === 'disabled' ? ' disabled' : '';
  const invalid = options.state === 'invalid';
  const error = invalid ? ' error="请检查标签后重试。"' : '';
  const control = ` controlSize="${options.size}"${disabled}${invalid ? ' invalid' : ''}`;
  if (framework === 'vue') {
    const duplicates = options.inputTagDuplicates ? ' allow-duplicates' : '';
    return `<script setup lang="ts">\nimport { Field, InputTag } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n<Field label="关键词"${error}>\n  <InputTag name="keywords"${control}${duplicates} :default-value="['设计', '前端']" placeholder="输入后按 Enter 添加" />\n</Field>\n</template>`;
  }
  const duplicates = options.inputTagDuplicates ? ' allowDuplicates' : '';
  return `import { Field, InputTag } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return (\n    <Field label="关键词"${error}>\n      <InputTag name="keywords"${control}${duplicates} defaultValue={['设计', '前端']} placeholder="输入后按 Enter 添加" />\n    </Field>\n  );\n}`;
}

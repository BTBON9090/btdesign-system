import { AutoComplete, Field } from '@btdesign/react';
import type { DemoOptions, Framework } from './component-types';

type AutoCompletePreviewOptions = DemoOptions & { autoCompleteEmpty?: boolean };
const cities = [
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海', disabled: true },
  { value: '深圳', label: '深圳' },
];

export function AutoCompletePreview({ options }: { options: AutoCompletePreviewOptions }) {
  const invalid = options.state === 'invalid';
  return (
    <Field className="demo-form" label="城市" error={invalid ? '请检查输入内容。' : undefined}>
      <AutoComplete
        name="city"
        options={options.autoCompleteEmpty ? [] : cities}
        controlSize={options.size}
        disabled={options.state === 'disabled'}
        invalid={invalid}
        placeholder="输入城市名称"
      />
    </Field>
  );
}

export function autoCompleteVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: AutoCompletePreviewOptions,
) {
  const invalid = options.state === 'invalid';
  return vue.h(
    ui.Field,
    { class: 'demo-form', label: '城市', error: invalid ? '请检查输入内容。' : undefined },
    () =>
      vue.h(ui.AutoComplete, {
        name: 'city',
        options: options.autoCompleteEmpty ? [] : cities,
        controlSize: options.size,
        disabled: options.state === 'disabled',
        invalid,
        placeholder: '输入城市名称',
      }),
  );
}

export function autoCompleteExample(framework: Framework, options: AutoCompletePreviewOptions) {
  const disabled = options.state === 'disabled' ? ' disabled' : '';
  const invalid = options.state === 'invalid';
  const error = invalid ? ' error="请检查输入内容。"' : '';
  const control = ` controlSize="${options.size}"${disabled}${invalid ? ' invalid' : ''}`;
  const choices = options.autoCompleteEmpty
    ? '[]'
    : "[{ value: '北京', label: '北京' }, { value: '上海', label: '上海', disabled: true }, { value: '深圳', label: '深圳' }]";
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { Field, AutoComplete } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst cities: { value: string; label: string; disabled?: boolean }[] = ${choices};\n</script>\n\n<template>\n<Field label="城市"${error}>\n  <AutoComplete name="city"${control} :options="cities" placeholder="输入城市名称" />\n</Field>\n</template>`;
  }
  return `import { Field, AutoComplete } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  const cities: { value: string; label: string; disabled?: boolean }[] = ${choices};\n  return (\n    <Field label="城市"${error}>\n      <AutoComplete name="city"${control} options={cities} placeholder="输入城市名称" />\n    </Field>\n  );\n}`;
}

import { AutoComplete, Field } from '@btdesign/react';
import type { DemoOptions, Framework } from './component-types';

type AutoCompletePreviewOptions = DemoOptions & {
  autoCompleteEmpty?: boolean;
  autoCompleteDetail?: boolean;
  autoCompleteSuffix?: 'none' | 'arrow' | 'dot';
};
const cities = [
  { value: '北京', label: '北京', description: '28' },
  { value: '上海', label: '上海', description: '12', disabled: true },
  { value: '深圳', label: '深圳', description: '56' },
];
const optionsFor = (options: AutoCompletePreviewOptions) =>
  options.autoCompleteEmpty
    ? []
    : cities.map(({ description, ...city }) =>
        options.autoCompleteDetail ? { ...city, description } : city,
      );
const symbolFor = (style: AutoCompletePreviewOptions['autoCompleteSuffix'], value: string) =>
  style === 'dot' ? '●' : value === '北京' ? '↗' : '›';

export function AutoCompletePreview({ options }: { options: AutoCompletePreviewOptions }) {
  const invalid = options.state === 'invalid';
  const showSuffix = options.autoCompleteSuffix && options.autoCompleteSuffix !== 'none';
  return (
    <Field className="demo-form" label="城市" error={invalid ? '请检查输入内容。' : undefined}>
      <AutoComplete
        name="city"
        options={optionsFor(options)}
        controlSize={options.size}
        disabled={options.state === 'disabled'}
        invalid={invalid}
        placeholder="输入城市名称"
        renderOptionSuffix={
          showSuffix
            ? (option) => <span>{symbolFor(options.autoCompleteSuffix, option.value)}</span>
            : undefined
        }
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
  const showSuffix = options.autoCompleteSuffix && options.autoCompleteSuffix !== 'none';
  return vue.h(
    ui.Field,
    { class: 'demo-form', label: '城市', error: invalid ? '请检查输入内容。' : undefined },
    () =>
      vue.h(ui.AutoComplete, {
        name: 'city',
        options: optionsFor(options),
        controlSize: options.size,
        disabled: options.state === 'disabled',
        invalid,
        placeholder: '输入城市名称',
        renderOptionSuffix: showSuffix
          ? (option: { value: string }) =>
              vue.h('span', symbolFor(options.autoCompleteSuffix, option.value))
          : undefined,
      }),
  );
}

export function autoCompleteExample(framework: Framework, options: AutoCompletePreviewOptions) {
  const disabled = options.state === 'disabled' ? ' disabled' : '';
  const invalid = options.state === 'invalid';
  const error = invalid ? ' error="请检查输入内容。"' : '';
  const control = ` controlSize="${options.size}"${disabled}${invalid ? ' invalid' : ''}`;
  const choices = JSON.stringify(optionsFor(options));
  const suffix = options.autoCompleteSuffix ?? 'none';
  const iconExpression = suffix === 'dot' ? "'●'" : "option.value === '北京' ? '↗' : '›'";
  if (framework === 'vue') {
    const slot =
      suffix === 'none'
        ? ' />'
        : `>\n    <template #option-suffix="{ option }"><span>{{ ${iconExpression} }}</span></template>\n  </AutoComplete>`;
    return `<script setup lang="ts">\nimport { Field, AutoComplete } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst cities: { value: string; label: string; description?: string; disabled?: boolean }[] = ${choices};\n</script>\n\n<template>\n<Field label="城市"${error}>\n  <AutoComplete name="city"${control} :options="cities" placeholder="输入城市名称"${slot}\n</Field>\n</template>`;
  }
  const render =
    suffix === 'none' ? '' : ` renderOptionSuffix={(option) => <span>{${iconExpression}}</span>}`;
  return `import { Field, AutoComplete } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  const cities: { value: string; label: string; description?: string; disabled?: boolean }[] = ${choices};\n  return (\n    <Field label="城市"${error}>\n      <AutoComplete name="city"${control} options={cities} placeholder="输入城市名称"${render} />\n    </Field>\n  );\n}`;
}

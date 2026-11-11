import { Field, Rate } from '@btdesign/react';
import type { DemoOptions, Framework } from './component-types';

type RatePreviewOptions = DemoOptions & {
  rateShape?: 'star' | 'heart';
  rateHalf?: boolean;
  rateClear?: boolean;
  rateCount?: number;
};

export function RatePreview({ options }: { options: RatePreviewOptions }) {
  return (
    <Field className="demo-form" label="满意度">
      <Rate
        key={`${options.rateHalf ? 'half' : 'whole'}:${options.rateCount ?? 5}`}
        name="rating"
        defaultValue={options.rateHalf ? 2.5 : 3}
        count={options.rateCount ?? 5}
        shape={options.rateShape ?? 'star'}
        allowHalf={options.rateHalf}
        allowClear={options.rateClear}
        disabled={options.state === 'disabled'}
      />
    </Field>
  );
}

export function rateVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: RatePreviewOptions,
) {
  return vue.h(ui.Field, { class: 'demo-form', label: '满意度' }, () =>
    vue.h(ui.Rate, {
      name: 'rating',
      defaultValue: options.rateHalf ? 2.5 : 3,
      count: options.rateCount ?? 5,
      shape: options.rateShape ?? 'star',
      allowHalf: options.rateHalf,
      allowClear: options.rateClear,
      disabled: options.state === 'disabled',
    }),
  );
}

export function rateExample(framework: Framework, options: RatePreviewOptions) {
  const value = options.rateHalf ? 2.5 : 3;
  const count = options.rateCount ?? 5;
  const shape = options.rateShape ?? 'star';
  const disabled = options.state === 'disabled' ? ' disabled' : '';
  if (framework === 'vue') {
    const half = options.rateHalf ? ' allow-half' : '';
    const clear = options.rateClear ? ' allow-clear' : '';
    return `<script setup lang="ts">\nimport { Field, Rate } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n<Field label="满意度">\n  <Rate name="rating" :default-value="${value}" :count="${count}" shape="${shape}"${half}${clear}${disabled} />\n</Field>\n</template>`;
  }
  const half = options.rateHalf ? ' allowHalf' : '';
  const clear = options.rateClear ? ' allowClear' : '';
  return `import { Field, Rate } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return (\n    <Field label="满意度">\n      <Rate name="rating" defaultValue={${value}} count={${count}} shape="${shape}"${half}${clear}${disabled} />\n    </Field>\n  );\n}`;
}

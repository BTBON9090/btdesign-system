import type { DemoOptions } from './component-types';

export interface NumberInputPreviewOptions {
  stepperLayout: 'sides' | 'stacked';
  controlSize: 'sm' | 'md' | 'lg';
  disabled: boolean;
  invalid: boolean;
}
export function numberInputPreviewOptions(
  options?: DemoOptions & { numberStepperLayout?: 'sides' | 'stacked' },
): NumberInputPreviewOptions {
  return {
    stepperLayout: options?.numberStepperLayout ?? 'sides',
    controlSize: options?.size ?? 'md',
    disabled: options?.state === 'disabled',
    invalid: options?.state === 'invalid',
  };
}
export function numberInputExampleCode(
  framework: 'react' | 'vue',
  options: NumberInputPreviewOptions,
) {
  const error = options.invalid ? ' error="请检查席位数量"' : '';
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { Field, NumberInput } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst quantity = ref<number | ''>(4);\n</script>\n\n<template>\n  <Field label="成员席位" description="可以设置 1 至 20 个席位"${error}>\n    <NumberInput v-model="quantity" :min="1" :max="20" :step="1" control-size="${options.controlSize}" stepper-layout="${options.stepperLayout}"${options.disabled ? ' disabled' : ''} />\n  </Field>\n</template>`;
  return `import { useState } from 'react';\nimport { Field, NumberInput } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  const [quantity, setQuantity] = useState<number | ''>(4);\n  return (\n    <Field label="成员席位" description="可以设置 1 至 20 个席位"${error}>\n      <NumberInput value={quantity} onValueChange={setQuantity} min={1} max={20} step={1} controlSize="${options.controlSize}" stepperLayout="${options.stepperLayout}"${options.disabled ? ' disabled' : ''} />\n    </Field>\n  );\n}`;
}

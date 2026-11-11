import { useState, type ComponentType } from 'react';
import type { NumberInputProps } from '../../../packages/react/src/composition';
import type { FieldProps } from '../../../packages/react/src/fields';
import type { NumberInputPreviewOptions } from './number-input-example-code';

export function NumberInputDemo({
  component: NumberInput,
  field: Field,
  options,
}: {
  component: ComponentType<NumberInputProps>;
  field: ComponentType<FieldProps>;
  options: NumberInputPreviewOptions;
}) {
  const [quantity, setQuantity] = useState<number | ''>(4);
  return (
    <Field
      label="成员席位"
      description="可以设置 1 至 20 个席位"
      error={options.invalid ? '请检查席位数量' : undefined}
    >
      <NumberInput
        value={quantity}
        onValueChange={setQuantity}
        min={1}
        max={20}
        step={1}
        controlSize={options.controlSize}
        stepperLayout={options.stepperLayout}
        disabled={options.disabled}
      />
    </Field>
  );
}

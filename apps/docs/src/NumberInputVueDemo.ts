import type { Component, PropType } from 'vue';
import type { NumberInputPreviewOptions } from './number-input-example-code';

export function createNumberInputVueDemo(
  vue: typeof import('vue'),
  NumberInput: Component,
  Field: Component,
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    name: 'BTDESIGNNumberInputVueDemo',
    props: { options: { type: Object as PropType<NumberInputPreviewOptions>, required: true } },
    setup(props) {
      const quantity = ref<number | ''>(4);
      return () =>
        h(
          Field,
          {
            label: '成员席位',
            description: '可以设置 1 至 20 个席位',
            error: props.options.invalid ? '请检查席位数量' : undefined,
          },
          () =>
            h(NumberInput, {
              modelValue: quantity.value,
              'onUpdate:modelValue': (value: number | '') => {
                quantity.value = value;
              },
              min: 1,
              max: 20,
              step: 1,
              controlSize: props.options.controlSize,
              stepperLayout: props.options.stepperLayout,
              disabled: props.options.disabled,
            }),
        );
    },
  });
}

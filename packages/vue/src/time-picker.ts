import { defineComponent, h, mergeProps } from 'vue';
import { controlProps, useFieldControl } from './field.js';

/** Native single-time input. Values use the browser's HH:mm / HH:mm:ss form syntax. */
export const TimePicker = defineComponent({
  name: 'BTDESIGNTimePicker',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    ...controlProps,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const field = useFieldControl();
    return () => {
      const bound = field(attrs, props.invalid);
      const invalid = bound['aria-invalid'] === true || bound['aria-invalid'] === 'true';
      return h(
        'input',
        mergeProps(attrs, bound, {
          type: 'time',
          class: ['f-input', `f-control--${props.controlSize}`, invalid && 'f-control--invalid'],
          value: props.modelValue === undefined ? attrs.value : props.modelValue,
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        }),
      );
    };
  },
});

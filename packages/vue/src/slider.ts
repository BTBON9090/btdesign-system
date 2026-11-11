import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { useControlId, useFieldControl } from './field.js';

export interface SliderMark {
  value: number;
  label?: string;
}

/** A native single-value range with the keyboard and form behavior provided by the browser. */
export const Slider = defineComponent({
  name: 'BTDESIGNSlider',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: undefined },
    marks: { type: Array as PropType<SliderMark[]>, default: () => [] },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const field = useFieldControl();
    const markId = useControlId('slider-marks');
    return () => {
      const bound = field(attrs);
      return h('div', { class: 'f-slider' }, [
        h(
          'input',
          mergeProps(attrs, bound, {
            type: 'range',
            class: 'f-slider-control',
            list: props.marks.length ? markId : attrs.list,
            value: props.modelValue === undefined ? attrs.value : props.modelValue,
            onInput: (event: Event) =>
              emit('update:modelValue', (event.target as HTMLInputElement).valueAsNumber),
          }),
        ),
        props.marks.length
          ? h(
              'datalist',
              { id: markId },
              props.marks.map((mark) => h('option', { value: mark.value, label: mark.label })),
            )
          : null,
      ]);
    };
  },
});

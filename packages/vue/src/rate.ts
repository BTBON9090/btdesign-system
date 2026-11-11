import {
  computed,
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties,
  type PropType,
} from 'vue';
import { useControlId, useFieldControl } from './field.js';

/** Single rating built from native radios for keyboard, form and focus behavior. */
export const Rate = defineComponent({
  name: 'BTDESIGNRate',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: undefined },
    defaultValue: { type: Number, default: 0 },
    count: { type: Number, default: 5 },
    allowHalf: Boolean,
    allowClear: Boolean,
    shape: { type: String as PropType<'star' | 'heart'>, default: 'star' },
    label: { type: String, default: '评分' },
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: String,
    getValueLabel: Function as PropType<(value: number, count: number) => string>,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const field = useFieldControl();
    const local = ref(props.defaultValue);
    const input = ref<HTMLInputElement>();
    let form: HTMLFormElement | null = null;
    let active = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (active && !event.defaultPrevented && props.modelValue === undefined)
          local.value = props.defaultValue;
      });
    onMounted(() => {
      form = input.value?.form ?? null;
      form?.addEventListener('reset', reset);
    });
    onBeforeUnmount(() => {
      active = false;
      form?.removeEventListener('reset', reset);
    });
    const generated = useControlId('rate');
    const total = computed(() =>
      Number.isFinite(props.count) ? Math.max(1, Math.min(100, Math.floor(props.count))) : 5,
    );
    const current = computed(() => {
      const raw = props.modelValue ?? local.value,
        step = props.allowHalf ? 0.5 : 1;
      return Number.isFinite(raw)
        ? Math.max(0, Math.min(total.value, Math.round(raw / step) * step))
        : 0;
    });
    const update = (next: number) => {
      if (props.modelValue === undefined) local.value = next;
      emit('update:modelValue', next);
    };
    return () => {
      const bound = field({ ...attrs, disabled: props.disabled, required: props.required });
      const disabled =
        bound.disabled !== undefined && bound.disabled !== null && bound.disabled !== false;
      const { id: _id, ...groupAttrs } = attrs;
      return h(
        'div',
        mergeProps(groupAttrs, {
          class: 'f-rate',
          role: 'radiogroup',
          'aria-label': attrs['aria-label'] ?? props.label,
          'aria-labelledby': bound['aria-labelledby'],
          'aria-describedby': bound['aria-describedby'],
          'aria-invalid': bound['aria-invalid'],
          'aria-required': bound.required || undefined,
          'aria-disabled': disabled || undefined,
        }),
        Array.from({ length: total.value }, (_, index) => {
          const point = index + 1;
          const fill =
            current.value >= point
              ? '100%'
              : props.allowHalf && current.value >= point - 0.5
                ? '50%'
                : '0%';
          const values = props.allowHalf ? [point - 0.5, point] : [point];
          return h('span', { key: point, class: 'f-rate-item' }, [
            h(
              'span',
              {
                class: 'f-rate-icon',
                style: { '--f-rate-fill': fill } as CSSProperties,
                'aria-hidden': 'true',
              },
              props.shape === 'heart' ? '♥' : '★',
            ),
            ...values.map((rating, part) =>
              h(
                'label',
                {
                  key: rating,
                  class: [
                    'f-rate-hit',
                    props.allowHalf && (part === 0 ? 'f-rate-hit--first' : 'f-rate-hit--last'),
                  ],
                },
                [
                  h('input', {
                    type: 'radio',
                    ref: index === 0 && part === 0 ? input : undefined,
                    id: index === 0 && part === 0 ? bound.id : undefined,
                    name: props.name || generated,
                    value: rating,
                    checked: current.value === rating,
                    disabled,
                    required: bound.required,
                    'aria-label':
                      props.getValueLabel?.(rating, total.value) ?? `${rating} / ${total.value}`,
                    onChange: () => {
                      if (current.value !== rating) update(rating);
                    },
                    onClick: () => {
                      if (props.allowClear && current.value === rating && !disabled) {
                        update(0);
                      }
                    },
                  }),
                  h('span', { class: 'f-rate-focus', 'aria-hidden': 'true' }),
                ],
              ),
            ),
          ]);
        }),
      );
    };
  },
});

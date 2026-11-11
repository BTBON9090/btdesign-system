import { computed, defineComponent, getCurrentInstance, h, inject, mergeProps, provide } from 'vue';
import type { AppContext, ComputedRef, InjectionKey, PropType } from 'vue';

export type ControlSize = 'sm' | 'md' | 'lg';
interface FieldContext {
  id: string;
  labelId: string;
  descriptionIds: string[];
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}
const fieldKey: InjectionKey<ComputedRef<FieldContext>> = Symbol('BTDESIGNField');
const sequences = new WeakMap<AppContext, number>();
let fallbackSequence = 0;

// App-scoped counters keep SSR ids deterministic without requiring Vue 3.5's useId.
export function useControlId(prefix: string) {
  const context = getCurrentInstance()?.appContext;
  const index = context ? (sequences.get(context) ?? 0) + 1 : ++fallbackSequence;
  if (context) sequences.set(context, index);
  return `bt-${prefix}-${index}`;
}

export const controlProps = {
  controlSize: { type: String as PropType<ControlSize>, default: 'md' },
  invalid: { type: Boolean, default: undefined },
} as const;

const mergeIds = (...values: unknown[]) => {
  const ids = values.flatMap((value) => (typeof value === 'string' ? value.split(/\s+/) : []));
  return [...new Set(ids.filter(Boolean))].join(' ') || undefined;
};

export function useFieldControl() {
  const context = inject(fieldKey, undefined);
  return (attrs: Record<string, unknown>, invalid?: boolean) => {
    const field = context?.value;
    return {
      id: attrs.id ?? field?.id,
      required: attrs.required ?? field?.required,
      disabled: attrs.disabled ?? field?.disabled,
      'aria-invalid': attrs['aria-invalid'] ?? invalid ?? (field?.invalid || undefined),
      'aria-describedby': mergeIds(attrs['aria-describedby'], ...(field?.descriptionIds ?? [])),
      'aria-labelledby':
        attrs['aria-labelledby'] ?? (attrs['aria-label'] ? undefined : field?.labelId),
    };
  };
}

export const Field = defineComponent({
  name: 'BTDESIGNField',
  inheritAttrs: false,
  props: {
    id: String,
    label: { type: String, required: true },
    description: String,
    layout: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    error: String,
    required: Boolean,
    disabled: Boolean,
  },
  setup(props, { attrs, slots }) {
    const generatedId = useControlId('field');
    const context = computed(() => {
      const id = props.id ?? generatedId;
      return {
        id,
        labelId: `${id}-label`,
        descriptionIds: [
          ...(props.description ? [`${id}-description`] : []),
          ...(props.error ? [`${id}-error`] : []),
        ],
        invalid: Boolean(props.error),
        required: props.required,
        disabled: props.disabled,
      };
    });
    provide(fieldKey, context);
    return () =>
      h(
        'div',
        mergeProps(attrs, {
          class: ['f-field', props.layout === 'horizontal' && 'f-field--horizontal'],
          'data-invalid': props.error ? '' : undefined,
        }),
        [
          h('label', { class: 'f-field-label', id: context.value.labelId, for: context.value.id }, [
            props.label,
            props.required
              ? h('span', { 'aria-hidden': 'true', class: 'f-field-required' }, ' *')
              : null,
          ]),
          slots.default?.(),
          props.description
            ? h(
                'p',
                { class: 'f-field-description', id: `${context.value.id}-description` },
                props.description,
              )
            : null,
          props.error
            ? h(
                'p',
                { class: 'f-field-error', id: `${context.value.id}-error`, role: 'alert' },
                props.error,
              )
            : null,
        ],
      );
  },
});

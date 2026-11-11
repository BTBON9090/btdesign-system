import {
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  type PropType,
} from 'vue';
import { controlProps, useFieldControl } from './field.js';

/** Committed tags are submitted as repeated form values; input draft is kept separate. */
export const InputTag = defineComponent({
  name: 'BTDESIGNInputTag',
  inheritAttrs: false,
  props: {
    modelValue: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    allowDuplicates: { type: Boolean, default: undefined },
    requiredMessage: { type: String, default: '请至少添加一项标签。' },
    ...controlProps,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, expose }) {
    const field = useFieldControl();
    const uncontrolled = ref([...props.defaultValue]);
    const draft = ref('');
    const input = ref<HTMLInputElement>();
    expose({ focus: () => input.value?.focus() });
    let form: HTMLFormElement | null = null;
    let active = true;
    const syncValidity = () => {
      const bound = field(attrs, props.invalid);
      const tags = props.modelValue ?? uncontrolled.value;
      input.value?.setCustomValidity(
        bound.required && tags.length === 0 ? props.requiredMessage || '请至少添加一项标签。' : '',
      );
    };
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!active || event.defaultPrevented) return;
        draft.value = '';
        if (props.modelValue === undefined) uncontrolled.value = [...props.defaultValue];
      });
    };
    onMounted(() => {
      form = input.value?.form ?? null;
      form?.addEventListener('reset', reset);
      syncValidity();
    });
    onUpdated(syncValidity);
    onBeforeUnmount(() => {
      active = false;
      form?.removeEventListener('reset', reset);
    });
    const update = (next: string[]) => {
      if (props.modelValue === undefined) uncontrolled.value = next;
      emit('update:modelValue', next);
    };
    return () => {
      const bound = field(attrs, props.invalid);
      const isDisabled =
        bound.disabled !== undefined && bound.disabled !== null && bound.disabled !== false;
      const readOnly =
        (attrs.readonly !== undefined && attrs.readonly !== false) ||
        (attrs.readOnly !== undefined && attrs.readOnly !== false);
      const tags = props.modelValue ?? uncontrolled.value;
      const { name, class: className, ...inputAttrs } = attrs;
      const remove = (index: number) => {
        if (isDisabled || readOnly) return;
        update(tags.filter((_, itemIndex) => itemIndex !== index));
        input.value?.focus();
      };
      return h(
        'div',
        {
          class: ['f-input-tag', `f-control--${props.controlSize}`, className],
          'data-invalid': bound['aria-invalid'] || undefined,
          'data-disabled': isDisabled || undefined,
        },
        [
          ...tags.map((tag, index) =>
            h('span', { class: 'f-tag f-tag--default f-input-tag-item', key: `${index}-${tag}` }, [
              h('span', tag),
              readOnly
                ? null
                : h(
                    'button',
                    {
                      type: 'button',
                      class: 'f-tag-close',
                      'aria-label': `删除 ${tag}`,
                      disabled: isDisabled,
                      onClick: () => remove(index),
                    },
                    '×',
                  ),
            ]),
          ),
          ...(name
            ? tags.map((tag, index) =>
                h('input', {
                  key: `value-${index}`,
                  type: 'hidden',
                  name,
                  form: attrs.form,
                  value: tag,
                  disabled: isDisabled,
                }),
              )
            : []),
          h(
            'input',
            mergeProps(inputAttrs, bound, {
              ref: input,
              type: 'text',
              class: 'f-input-tag-control',
              value: draft.value,
              required: Boolean(bound.required && tags.length === 0),
              'aria-required': attrs['aria-required'] ?? (bound.required || undefined),
              onInput: (event: Event) => {
                draft.value = (event.target as HTMLInputElement).value;
              },
              onKeydown: (event: KeyboardEvent) => {
                if (
                  event.defaultPrevented ||
                  event.isComposing ||
                  event.keyCode === 229 ||
                  isDisabled ||
                  readOnly
                )
                  return;
                if (event.key === 'Enter' && draft.value.trim()) {
                  event.preventDefault();
                  const next = draft.value.trim();
                  if (props.allowDuplicates !== true && tags.includes(next)) return;
                  update([...tags, next]);
                  draft.value = '';
                } else if (event.key === 'Backspace' && !draft.value && tags.length) {
                  event.preventDefault();
                  remove(tags.length - 1);
                }
              },
            }),
          ),
        ],
      );
    };
  },
});

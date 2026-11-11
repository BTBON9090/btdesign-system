import { defineComponent, h, mergeProps, ref } from 'vue';
import { controlProps, useFieldControl } from './field.js';

/** Password and search controls inherit field semantics and the common input design tokens. */
function createInputVariant(kind: 'password' | 'search') {
  return defineComponent({
    name: kind === 'password' ? 'BTDESIGNPasswordInput' : 'BTDESIGNSearchInput',
    inheritAttrs: false,
    props: {
      modelValue: { type: [String, Number], default: undefined },
      ...controlProps,
      showLabel: { type: String, default: '显示密码' },
      hideLabel: { type: String, default: '隐藏密码' },
      searchLabel: { type: String, default: '搜索' },
    },
    emits: ['update:modelValue', 'search'],
    setup(props, { attrs, emit, expose }) {
      const field = useFieldControl();
      const visible = ref(false);
      const input = ref<HTMLInputElement>();
      expose({ focus: () => input.value?.focus() });
      const search = () => emit('search', input.value?.value ?? '');
      return () => {
        const bound = field(attrs, props.invalid);
        // Do not patch an undefined value into an uncontrolled input on every render.
        // Vue otherwise clears typed text when toggling password visibility.
        const { value: initialValue, ...inputAttrs } = attrs;
        const invalid = bound['aria-invalid'] === true || bound['aria-invalid'] === 'true';
        const label =
          kind === 'password'
            ? visible.value
              ? props.hideLabel
              : props.showLabel
            : props.searchLabel;
        return h('div', { class: 'f-input-group' }, [
          h(
            'input',
            mergeProps(inputAttrs, bound, {
              ref: input,
              type: kind === 'search' ? 'search' : visible.value ? 'text' : 'password',
              class: [
                'f-input',
                `f-control--${props.controlSize}`,
                invalid && 'f-control--invalid',
              ],
              ...(props.modelValue !== undefined
                ? { value: props.modelValue }
                : initialValue !== undefined
                  ? { defaultValue: initialValue }
                  : {}),
              onInput: (event: Event) =>
                emit('update:modelValue', (event.target as HTMLInputElement).value),
              onKeydown: (event: KeyboardEvent) => {
                if (
                  kind === 'search' &&
                  event.key === 'Enter' &&
                  !event.defaultPrevented &&
                  !event.isComposing
                )
                  emit('search', (event.currentTarget as HTMLInputElement).value);
              },
            }),
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'f-number-input-step f-input-variant-action',
              disabled: bound.disabled,
              'aria-label': label,
              'aria-pressed': kind === 'password' ? visible.value : undefined,
              onClick: () => (kind === 'password' ? (visible.value = !visible.value) : search()),
            },
            label,
          ),
        ]);
      };
    },
  });
}
export const PasswordInput = createInputVariant('password');
export const SearchInput = createInputVariant('search');

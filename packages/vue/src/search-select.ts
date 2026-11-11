import {
  computed,
  defineComponent,
  h,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import type { ChoiceOption } from '@btdesign/engine';
import { useControlId, useFieldControl } from './field.js';
import { isDisabled, useValue } from './enterprise-shared.js';

/** Local options only. The application owns asynchronous loading and remote filtering. */
export const SearchSelect = defineComponent({
  name: 'BTDESIGNSearchSelect',
  inheritAttrs: false,
  props: {
    id: String,
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    multiple: Boolean,
    modelValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    label: String,
    placeholder: { type: String, default: '请选择' },
    emptyText: { type: String, default: '没有匹配的选项' },
    name: String,
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const generated = useControlId('search-select');
    const field = useFieldControl();
    const bound = computed(() =>
      field(
        {
          ...attrs,
          id: props.id,
          disabled: props.disabled,
          required: props.required,
          'aria-label': attrs['aria-label'] ?? props.label,
        },
        props.invalid,
      ),
    );
    const blocked = computed(() => isDisabled(bound.value.disabled));
    const id = computed(() => String(bound.value.id ?? generated));
    const listId = computed(() => `${id.value}-listbox`);
    const root = ref<HTMLElement>();
    const input = ref<HTMLInputElement>();
    const open = ref(false),
      query = ref(''),
      active = ref<string | null>(null);
    const state = useValue(
      () => props.modelValue,
      props.defaultValue ?? (props.multiple ? [] : ''),
      (next) => emit('update:modelValue', next),
    );
    const selected = computed(() => [
      ...new Set(
        (Array.isArray(state.value.value)
          ? state.value.value
          : state.value.value
            ? [state.value.value]
            : []
        ).slice(0, props.multiple ? undefined : 1),
      ),
    ]);
    const uniqueOptions = computed(() => {
      const seen = new Set<string>();
      return props.options.filter(
        (option) => option.value !== '' && !seen.has(option.value) && !!seen.add(option.value),
      );
    });
    const filtered = computed(() =>
      uniqueOptions.value.filter((option) =>
        option.label.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase()),
      ),
    );
    const enabled = computed(() => filtered.value.filter((option) => !option.disabled));
    const activeOption = computed(() =>
      enabled.value.find((option) => option.value === active.value),
    );
    const activeIndex = computed(() =>
      activeOption.value ? uniqueOptions.value.indexOf(activeOption.value) : -1,
    );
    const optionId = (index: number) => `${listId.value}-option-${index}`;
    const text = (key: string) =>
      uniqueOptions.value.find((option) => option.value === key)?.label ?? key;
    const close = () => {
      open.value = false;
      query.value = '';
      active.value = null;
    };
    const choose = (option: ChoiceOption) => {
      if (blocked.value || option.disabled) return;
      if (props.multiple) {
        state.set(
          selected.value.includes(option.value)
            ? selected.value.filter((key) => key !== option.value)
            : [...selected.value, option.value],
        );
        query.value = '';
        active.value = null;
        input.value?.focus();
      } else {
        if (selected.value[0] !== option.value) state.set(option.value);
        close();
        input.value?.focus();
      }
    };
    const dismiss = (event: Event) => {
      if (open.value && event.target instanceof Node && !root.value?.contains(event.target))
        close();
    };
    onMounted(() => {
      if (typeof document === 'undefined') return;
      document.addEventListener('pointerdown', dismiss);
      document.addEventListener('focusin', dismiss);
    });
    onBeforeUnmount(() => {
      if (typeof document === 'undefined') return;
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
    });
    watch(blocked, (value) => {
      if (value) close();
    });
    watch([open, activeIndex], ([visible, index]) => {
      if (visible && index >= 0 && typeof document !== 'undefined')
        void nextTick(() =>
          document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' }),
        );
    });
    const keydown = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if (event.key === 'Escape' && open.value) {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        open.value = true;
        if (!enabled.value.length) {
          active.value = null;
          return;
        }
        const index = enabled.value.findIndex((option) => option.value === active.value);
        const next =
          index < 0
            ? event.key === 'ArrowDown'
              ? 0
              : enabled.value.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.value.length) %
              enabled.value.length;
        active.value = enabled.value[next].value;
        return;
      }
      if (event.key === 'Enter' && !open.value) {
        event.preventDefault();
        query.value = '';
        open.value = true;
        return;
      }
      if (event.key === 'Enter' && open.value && activeOption.value) {
        event.preventDefault();
        choose(activeOption.value);
      }
      if (event.key === 'Backspace' && props.multiple && !query.value && selected.value.length) {
        const last = [...selected.value]
          .reverse()
          .find((key) => !uniqueOptions.value.find((option) => option.value === key)?.disabled);
        if (last) {
          event.preventDefault();
          state.set(selected.value.filter((key) => key !== last));
        }
      }
    };
    return () =>
      h(
        'div',
        mergeProps(attrs, {
          ref: root,
          class: 'f-search-select',
          'data-disabled': blocked.value || undefined,
        }),
        [
          h(
            'div',
            {
              class: 'f-search-select-control',
              'data-invalid': bound.value['aria-invalid'] || undefined,
              onClick: (event: MouseEvent) => {
                if (
                  !blocked.value &&
                  (event.target === event.currentTarget ||
                    (event.target as HTMLElement).classList.contains('f-search-select-chevron'))
                ) {
                  input.value?.focus();
                  if (!open.value) {
                    query.value = '';
                    open.value = true;
                  }
                }
              },
            },
            [
              ...(props.multiple
                ? selected.value.map((key) => {
                    const disabled =
                      blocked.value ||
                      uniqueOptions.value.find((option) => option.value === key)?.disabled;
                    return h('span', { class: 'f-search-select-tag', key }, [
                      text(key),
                      h(
                        'button',
                        {
                          type: 'button',
                          disabled,
                          'aria-label': `移除${text(key)}`,
                          onClick: () => {
                            if (!disabled) {
                              state.set(selected.value.filter((item) => item !== key));
                              input.value?.focus();
                            }
                          },
                        },
                        '×',
                      ),
                    ]);
                  })
                : []),
              h('input', {
                ref: input,
                id: id.value,
                class: 'f-search-select-input',
                role: 'combobox',
                type: 'text',
                autocomplete: 'off',
                placeholder:
                  props.multiple && selected.value.length ? undefined : props.placeholder,
                disabled: blocked.value,
                'aria-label':
                  attrs['aria-label'] ??
                  (bound.value['aria-labelledby'] ? undefined : (props.label ?? '选择')),
                'aria-labelledby': bound.value['aria-labelledby'],
                'aria-describedby': bound.value['aria-describedby'],
                'aria-invalid': bound.value['aria-invalid'],
                'aria-required': bound.value.required || undefined,
                'aria-autocomplete': 'list',
                'aria-haspopup': 'listbox',
                'aria-expanded': open.value && !blocked.value,
                'aria-controls': open.value && !blocked.value ? listId.value : undefined,
                'aria-activedescendant':
                  open.value && !blocked.value && activeIndex.value >= 0
                    ? optionId(activeIndex.value)
                    : undefined,
                value: open.value
                  ? query.value
                  : props.multiple
                    ? ''
                    : selected.value[0]
                      ? text(selected.value[0])
                      : '',
                onFocus: () => {
                  if (!blocked.value) {
                    open.value = true;
                    query.value = '';
                  }
                },
                onClick: () => {
                  if (!blocked.value && !open.value) {
                    query.value = '';
                    open.value = true;
                  }
                },
                onInput: (event: Event) => {
                  query.value = (event.target as HTMLInputElement).value;
                  open.value = true;
                  active.value = null;
                },
                onKeydown: keydown,
              }),
              h('span', { class: 'f-search-select-chevron', 'aria-hidden': 'true' }, '⌄'),
            ],
          ),
          ...(props.name
            ? selected.value.map((key) =>
                h('input', {
                  key,
                  type: 'hidden',
                  name: props.name,
                  value: key,
                  disabled: blocked.value,
                }),
              )
            : []),
          open.value && !blocked.value
            ? h('div', { class: 'f-search-select-popup f-overlay' }, [
                h(
                  'div',
                  {
                    id: listId.value,
                    role: 'listbox',
                    'aria-label': props.label ?? attrs['aria-label'] ?? '选项',
                    'aria-multiselectable': props.multiple || undefined,
                  },
                  filtered.value.map((option) =>
                    h(
                      'div',
                      {
                        key: option.value,
                        id: optionId(uniqueOptions.value.indexOf(option)),
                        role: 'option',
                        'aria-selected': selected.value.includes(option.value),
                        'aria-disabled': option.disabled || undefined,
                        class: 'f-search-select-option',
                        'data-active': active.value === option.value || undefined,
                        onMousedown: (event: MouseEvent) => event.preventDefault(),
                        onClick: () => choose(option),
                      },
                      [
                        h('span', option.label),
                        selected.value.includes(option.value)
                          ? h('span', { 'aria-hidden': 'true' }, '✓')
                          : null,
                      ],
                    ),
                  ),
                ),
                !filtered.value.length
                  ? h('div', { class: 'f-search-select-empty', role: 'status' }, props.emptyText)
                  : null,
              ])
            : null,
        ],
      );
  },
});

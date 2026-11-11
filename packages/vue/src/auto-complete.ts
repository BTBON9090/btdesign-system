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
import {
  filterAutocompleteOptions,
  moveAutocompleteFocus,
  type ChoiceOption,
} from '@btdesign/engine';
import { controlProps, useControlId, useFieldControl } from './field.js';

/** Editable local suggestions; the application owns loading any external option data. */
export const AutoComplete = defineComponent({
  name: 'BTDESIGNAutoComplete',
  inheritAttrs: false,
  props: {
    options: { type: Array as PropType<readonly ChoiceOption[]>, required: true },
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    emptyText: { type: String, default: '没有匹配结果' },
    ...controlProps,
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { attrs, emit, expose }) {
    const field = useFieldControl();
    const local = ref(props.defaultValue);
    const current = computed(() => props.modelValue ?? local.value);
    const open = ref(false);
    const active = ref(-1);
    const composing = ref(false);
    const compositionBase = ref('');
    const input = ref<HTMLInputElement>();
    const listId = useControlId('autocomplete');
    const filtered = computed(() =>
      filterAutocompleteOptions(
        props.options,
        composing.value ? compositionBase.value : current.value,
      ),
    );
    const optionId = (index: number) => `${listId}-option-${index}`;
    const update = (next: string) => {
      if (props.modelValue === undefined) local.value = next;
      emit('update:modelValue', next);
    };
    const choose = (option: ChoiceOption, disabled: boolean, readOnly: boolean) => {
      if (disabled || readOnly || option.disabled) return;
      update(option.value);
      emit('select', option);
      open.value = false;
      active.value = -1;
    };
    expose({ focus: () => input.value?.focus() });
    watch([current, () => props.options], () => {
      active.value = -1;
    });
    watch(
      () => [field(attrs, props.invalid).disabled, attrs.readonly, attrs.readOnly],
      ([disabled, readonly, readOnly]) => {
        const blocked =
          (disabled !== undefined && disabled !== null && disabled !== false) ||
          (readonly !== undefined && readonly !== null && readonly !== false) ||
          (readOnly !== undefined && readOnly !== null && readOnly !== false);
        if (blocked) {
          open.value = false;
          active.value = -1;
        }
      },
      { flush: 'sync' },
    );
    watch(active, (index) => {
      if (index >= 0 && open.value && typeof document !== 'undefined')
        void nextTick(() =>
          document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' }),
        );
    });
    let form: HTMLFormElement | null = null;
    let alive = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!alive || event.defaultPrevented) return;
        if (props.modelValue === undefined) local.value = props.defaultValue;
        open.value = false;
        active.value = -1;
      });
    onMounted(() => {
      form = input.value?.form ?? null;
      form?.addEventListener('reset', reset);
    });
    onBeforeUnmount(() => {
      alive = false;
      form?.removeEventListener('reset', reset);
    });
    return () => {
      const bound = field(attrs, props.invalid);
      const disabled =
        bound.disabled !== undefined && bound.disabled !== null && bound.disabled !== false;
      const readOnly =
        (attrs.readonly !== undefined && attrs.readonly !== false) ||
        (attrs.readOnly !== undefined && attrs.readOnly !== false);
      const invalid = bound['aria-invalid'] === true || bound['aria-invalid'] === 'true';
      const displayed = open.value && !disabled && !readOnly;
      const activeItem =
        displayed && active.value >= 0 && !filtered.value[active.value]?.disabled
          ? filtered.value[active.value]
          : undefined;
      const { value: _value, ...inputAttrs } = attrs;
      return h('div', { class: 'f-autocomplete' }, [
        h(
          'input',
          mergeProps(inputAttrs, bound, {
            ref: input,
            type: 'text',
            role: 'combobox',
            class: ['f-input', `f-control--${props.controlSize}`, invalid && 'f-control--invalid'],
            autocomplete: attrs.autocomplete ?? 'off',
            value: current.value,
            'aria-autocomplete': 'list',
            'aria-expanded': displayed,
            'aria-controls': displayed ? listId : undefined,
            'aria-activedescendant': activeItem ? optionId(active.value) : undefined,
            onFocus: (event: FocusEvent) => {
              if (!event.defaultPrevented && !disabled && !readOnly) open.value = true;
            },
            onBlur: () => {
              open.value = false;
              active.value = -1;
            },
            onInput: (event: Event) => {
              update((event.target as HTMLInputElement).value);
              open.value = true;
              active.value = -1;
            },
            onCompositionstart: () => {
              compositionBase.value = current.value;
              composing.value = true;
            },
            onCompositionend: () => {
              composing.value = false;
            },
            onKeydown: (event: KeyboardEvent) => {
              if (
                event.defaultPrevented ||
                event.isComposing ||
                event.keyCode === 229 ||
                composing.value ||
                disabled ||
                readOnly
              )
                return;
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                active.value = moveAutocompleteFocus(
                  filtered.value,
                  displayed ? active.value : -1,
                  event.key === 'ArrowDown' ? 1 : -1,
                );
                open.value = true;
              } else if (event.key === 'Escape' && displayed) {
                event.preventDefault();
                open.value = false;
                active.value = -1;
              } else if (event.key === 'Enter' && activeItem) {
                event.preventDefault();
                choose(activeItem, disabled, readOnly);
              }
            },
          }),
        ),
        displayed
          ? h('div', { class: 'f-overlay f-autocomplete-popup' }, [
              h(
                'ul',
                { role: 'listbox', id: listId, class: 'f-autocomplete-options' },
                filtered.value.map((option, index) =>
                  h(
                    'li',
                    {
                      key: `${option.value}-${index}`,
                      id: optionId(index),
                      role: 'option',
                      'aria-disabled': option.disabled || undefined,
                      'aria-selected': index === active.value,
                      class: 'f-autocomplete-option',
                      onMousemove: () => {
                        if (!option.disabled) active.value = index;
                      },
                      onPointerdown: (event: PointerEvent) => {
                        if (event.pointerType === 'mouse' && event.button !== 0) return;
                        event.preventDefault();
                        choose(option, disabled, readOnly);
                      },
                      onClick: () => choose(option, disabled, readOnly),
                    },
                    [
                      h('span', option.label),
                      option.description
                        ? h('span', { class: 'f-autocomplete-description' }, option.description)
                        : null,
                    ],
                  ),
                ),
              ),
              filtered.value.length
                ? null
                : h('div', { role: 'status', class: 'f-autocomplete-empty' }, props.emptyText),
            ])
          : null,
      ]);
    };
  },
});

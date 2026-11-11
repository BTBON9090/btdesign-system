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

/** Plain-text mentions with local suggestions. Selected labels are inserted as text. */
export const Mention = defineComponent({
  name: 'BTDESIGNMention',
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
    const caret = ref(0);
    const focused = ref(false);
    const dismissed = ref(false);
    const composing = ref(false);
    const active = ref(-1);
    const input = ref<HTMLInputElement>();
    const listId = useControlId('mention');
    const match = computed(() => current.value.slice(0, caret.value).match(/(?:^|\s)@([^\s@]*)$/u));
    const query = computed(() => match.value?.[1] ?? '');
    const filtered = computed(() => filterAutocompleteOptions(props.options, query.value));
    const optionId = (index: number) => `${listId}-option-${index}`;
    const update = (next: string) => {
      if (props.modelValue === undefined) local.value = next;
      emit('update:modelValue', next);
    };
    const syncCaret = (target: HTMLInputElement) => {
      caret.value = target.selectionStart ?? target.value.length;
      dismissed.value = false;
    };
    const choose = (option: ChoiceOption, displayed: boolean) => {
      if (!displayed || option.disabled || !match.value) return;
      const start = caret.value - query.value.length - 1;
      const suffix = current.value.slice(caret.value);
      const insertion = `@${option.label}${suffix && /^\s/u.test(suffix) ? '' : ' '}`;
      const next = current.value.slice(0, start) + insertion + suffix;
      const position = start + insertion.length;
      update(next);
      emit('select', option);
      caret.value = position;
      dismissed.value = true;
      active.value = -1;
      void nextTick(() => {
        if (input.value && current.value === next)
          input.value.setSelectionRange(position, position);
      });
    };
    expose({ focus: () => input.value?.focus() });
    watch([current, caret, () => props.options], () => {
      active.value = -1;
    });
    watch(
      () => [field(attrs, props.invalid).disabled, attrs.readonly, attrs.readOnly],
      ([disabled, readonly, readOnly]) => {
        if (
          [disabled, readonly, readOnly].some((v) => v !== undefined && v !== null && v !== false)
        ) {
          focused.value = false;
          active.value = -1;
        }
      },
      { flush: 'sync' },
    );
    watch(active, (index) => {
      if (index >= 0 && typeof document !== 'undefined')
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
        dismissed.value = true;
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
      const displayed =
        focused.value &&
        !dismissed.value &&
        !composing.value &&
        !!match.value &&
        !disabled &&
        !readOnly;
      const activeItem =
        displayed && active.value >= 0 && !filtered.value[active.value]?.disabled
          ? filtered.value[active.value]
          : undefined;
      const { value: _value, ...inputAttrs } = attrs;
      return h('div', { class: 'f-mention' }, [
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
            onFocus: (e: FocusEvent) => {
              if (!e.defaultPrevented && !disabled && !readOnly) {
                focused.value = true;
                syncCaret(e.target as HTMLInputElement);
              }
            },
            onBlur: () => {
              focused.value = false;
              active.value = -1;
            },
          onMouseup: (e: MouseEvent) => {
            if (!composing.value) syncCaret(e.target as HTMLInputElement);
          },
          onKeyup: (e: KeyboardEvent) => {
            if (!composing.value && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key))
              syncCaret(e.target as HTMLInputElement);
          },
            onInput: (e: Event) => {
              const target = e.target as HTMLInputElement;
              update(target.value);
              syncCaret(target);
              active.value = -1;
            },
            onCompositionstart: () => {
              composing.value = true;
            },
            onCompositionend: (e: CompositionEvent) => {
              composing.value = false;
              syncCaret(e.target as HTMLInputElement);
            },
            onKeydown: (e: KeyboardEvent) => {
              if (
                e.defaultPrevented ||
                e.isComposing ||
                e.keyCode === 229 ||
                composing.value ||
                disabled ||
                readOnly
              )
                return;
              if (displayed && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                active.value = moveAutocompleteFocus(
                  filtered.value,
                  active.value,
                  e.key === 'ArrowDown' ? 1 : -1,
                );
              } else if (displayed && e.key === 'Escape') {
                e.preventDefault();
                dismissed.value = true;
                active.value = -1;
              } else if (e.key === 'Enter' && activeItem) {
                e.preventDefault();
                choose(activeItem, displayed);
              }
            },
          }),
        ),
        displayed
          ? h('div', { class: 'f-overlay f-mention-popup' }, [
              h(
                'ul',
                { role: 'listbox', id: listId, class: 'f-mention-options' },
                filtered.value.map((option, index) =>
                  h(
                    'li',
                    {
                      key: `${option.value}-${index}`,
                      id: optionId(index),
                      role: 'option',
                      'aria-disabled': option.disabled || undefined,
                      'aria-selected': index === active.value,
                      class: 'f-mention-option',
                      onMousemove: () => {
                        if (!option.disabled) active.value = index;
                      },
                      onPointerdown: (e: PointerEvent) => {
                        if (e.pointerType === 'mouse' && e.button !== 0) return;
                        e.preventDefault();
                        choose(option, displayed);
                      },
                      onClick: () => choose(option, displayed),
                    },
                    [
                      h('span', option.label),
                      option.description
                        ? h('span', { class: 'f-mention-description' }, option.description)
                        : null,
                    ],
                  ),
                ),
              ),
              filtered.value.length
                ? null
                : h('div', { role: 'status', class: 'f-mention-empty' }, props.emptyText),
            ])
          : null,
      ]);
    };
  },
});

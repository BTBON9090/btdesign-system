import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  shallowRef,
  Teleport,
  watch,
  type PropType,
} from 'vue';
import type { ChoiceOption, TableNumberRange } from '@btdesign/engine';
import { useControlId } from './field.js';

export const TableFilter = defineComponent({
  name: 'BTDESIGNTableFilter',
  props: {
    title: { type: String, required: true },
    mode: { type: String as PropType<'multiple' | 'numberRange'>, required: true },
    options: { type: Array as PropType<ChoiceOption[]>, default: () => [] },
    selected: [String, Array] as PropType<string | string[]>,
    range: Object as PropType<TableNumberRange>,
    disabled: Boolean,
  },
  emits: {
    'apply-selection': (_value: string[]) => true,
    'apply-range': (_value: TableNumberRange | undefined) => true,
  },
  setup(props, { emit }) {
    const id = useControlId('table-filter');
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const panel = ref<HTMLElement>();
    const host = shallowRef<HTMLElement | null>(null);
    const position = ref<{ left: number; top: number } | null>(null);
    const open = ref(false);
    const search = ref('');
    const draft = ref<string[]>([]);
    const min = ref('');
    const max = ref('');
    const badMin = ref(false);
    const badMax = ref(false);
    const minValue = computed(() => (min.value.trim() === '' ? undefined : Number(min.value)));
    const maxValue = computed(() => (max.value.trim() === '' ? undefined : Number(max.value)));
    const invalid = computed(
      () =>
        badMin.value ||
        badMax.value ||
        (minValue.value !== undefined && !Number.isFinite(minValue.value)) ||
        (maxValue.value !== undefined && !Number.isFinite(maxValue.value)) ||
        (minValue.value !== undefined &&
          maxValue.value !== undefined &&
          minValue.value > maxValue.value),
    );
    const close = (restore = false) => {
      open.value = false;
      if (restore) nextTick(() => trigger.value?.focus());
    };
    const reposition = () => {
      if (
        typeof window === 'undefined' ||
        !trigger.value?.getBoundingClientRect ||
        !panel.value?.getBoundingClientRect
      ) {
        position.value = { left: 0, top: 0 };
        return;
      }
      const anchor = trigger.value.getBoundingClientRect();
      const popup = panel.value.getBoundingClientRect();
      const width = document.documentElement.clientWidth || window.innerWidth;
      const height = document.documentElement.clientHeight || window.innerHeight;
      const left = Math.max(8, Math.min(anchor.right - popup.width, width - popup.width - 8));
      const below = height - anchor.bottom;
      const above = anchor.top;
      const top =
        below >= popup.height + 8 || below >= above
          ? Math.max(8, Math.min(anchor.bottom + 4, height - popup.height - 8))
          : Math.max(8, anchor.top - popup.height - 4);
      position.value = { left, top };
    };
    watch(
      open,
      (visible, _, onCleanup) => {
        if (!visible || typeof document === 'undefined') return;
        const outside = (event: PointerEvent) => {
          if (
            event.target instanceof Node &&
            !root.value?.contains(event.target) &&
            !panel.value?.contains(event.target)
          )
            close();
        };
        const update = () => reposition();
        document.addEventListener('pointerdown', outside);
        document.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        window.visualViewport?.addEventListener('resize', update);
        window.visualViewport?.addEventListener('scroll', update);
        const observer =
          typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
        if (trigger.value) observer?.observe(trigger.value);
        if (panel.value) observer?.observe(panel.value);
        onCleanup(() => {
          document.removeEventListener('pointerdown', outside);
          document.removeEventListener('scroll', update, true);
          window.removeEventListener('resize', update);
          window.visualViewport?.removeEventListener('resize', update);
          window.visualViewport?.removeEventListener('scroll', update);
          observer?.disconnect();
        });
      },
      { flush: 'post' },
    );
    watch([search, invalid], () => {
      if (open.value) nextTick(reposition);
    });
    watch(
      () => props.disabled,
      (value) => {
        if (value) close();
      },
    );
    const show = () => {
      host.value = root.value?.closest<HTMLElement>('.f-data-table') ?? null;
      position.value = null;
      search.value = '';
      draft.value = Array.isArray(props.selected)
        ? [...props.selected]
        : props.selected
          ? [props.selected]
          : [];
      min.value = props.range?.min === undefined ? '' : String(props.range.min);
      max.value = props.range?.max === undefined ? '' : String(props.range.max);
      badMin.value = false;
      badMax.value = false;
      open.value = true;
      nextTick(() => {
        if (!open.value) return;
        reposition();
        nextTick(() => {
          if (open.value) panel.value?.querySelector<HTMLInputElement>('input')?.focus();
        });
      });
    };
    const reset = () => {
      draft.value = [];
      min.value = '';
      max.value = '';
      badMin.value = false;
      badMax.value = false;
    };
    const apply = () => {
      if (props.mode === 'numberRange') {
        if (invalid.value) return;
        emit(
          'apply-range',
          minValue.value === undefined && maxValue.value === undefined
            ? undefined
            : {
                ...(minValue.value !== undefined ? { min: minValue.value } : {}),
                ...(maxValue.value !== undefined ? { max: maxValue.value } : {}),
              },
        );
      } else emit('apply-selection', draft.value);
      close(true);
    };
    const numberInput = (which: 'min' | 'max') => {
      const label = which === 'min' ? '最小值' : '最大值';
      const value = which === 'min' ? min : max;
      const bad = which === 'min' ? badMin : badMax;
      return h('label', [
        label,
        h('input', {
          class: 'f-input',
          type: 'number',
          step: 'any',
          'aria-label': `${props.title}${label}`,
          'aria-invalid': invalid.value || undefined,
          'aria-describedby': invalid.value ? `${id}-error` : undefined,
          value: value.value,
          onInput: (event: Event) => {
            const target = event.target as HTMLInputElement;
            value.value = target.value;
            bad.value = target.validity.badInput;
          },
        }),
      ]);
    };
    return () =>
      h(
        'div',
        {
          ref: root,
          style: { position: 'relative', display: 'inline-block' },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open.value) {
              event.preventDefault();
              event.stopPropagation();
              close(true);
            }
          },
        },
        [
          h(
            'button',
            {
              ref: trigger,
              type: 'button',
              class: 'f-button f-button--ghost',
              'aria-label': `筛选${props.title}`,
              'aria-haspopup': 'dialog',
              'aria-expanded': open.value,
              'aria-controls': open.value ? id : undefined,
              disabled: props.disabled,
              onClick: () => (open.value ? close() : show()),
            },
            '筛选',
          ),
          open.value && host.value
            ? h(Teleport, { to: host.value }, [
                h(
                  'div',
                  {
                    ref: panel,
                    id,
                    role: 'dialog',
                    'aria-label': `筛选${props.title}`,
                    class: 'f-overlay',
                    style: {
                      position: 'fixed',
                      zIndex: 8,
                      left: `${position.value?.left ?? 0}px`,
                      top: `${position.value?.top ?? 0}px`,
                      visibility: position.value ? 'visible' : 'hidden',
                      minWidth: 'min(200px, calc(100vw - 16px))',
                      maxWidth: 'calc(100vw - 16px)',
                      maxHeight: 'calc(100vh - 16px)',
                      overflow: 'auto',
                      textAlign: 'start',
                    },
                    onKeydown: (event: KeyboardEvent) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                        close(true);
                      }
                    },
                  },
                  [
                    props.mode === 'multiple'
                      ? [
                          h('input', {
                            class: 'f-input',
                            type: 'search',
                            'aria-label': `搜索${props.title}选项`,
                            value: search.value,
                            onInput: (event: Event) => {
                              search.value = (event.target as HTMLInputElement).value;
                            },
                          }),
                          h(
                            'div',
                            {
                              style: {
                                display: 'grid',
                                gap: 'var(--f-choice-gap)',
                                maxHeight: '200px',
                                overflow: 'auto',
                              },
                            },
                            props.options
                              .filter((option) =>
                                option.label
                                  .toLocaleLowerCase()
                                  .includes(search.value.trim().toLocaleLowerCase()),
                              )
                              .map((option) =>
                                h('label', { class: 'f-choice', key: option.value }, [
                                  h('input', {
                                    type: 'checkbox',
                                    class: 'f-checkbox',
                                    checked: draft.value.includes(option.value),
                                    disabled: option.disabled,
                                    onChange: (event: Event) => {
                                      draft.value = (event.target as HTMLInputElement).checked
                                        ? [...new Set([...draft.value, option.value])]
                                        : draft.value.filter((value) => value !== option.value);
                                    },
                                  }),
                                  option.label,
                                ]),
                              ),
                          ),
                        ]
                      : [
                          h('div', { style: { display: 'flex', gap: 'var(--f-choice-gap)' } }, [
                            numberInput('min'),
                            numberInput('max'),
                          ]),
                          invalid.value
                            ? h(
                                'p',
                                { id: `${id}-error`, role: 'alert' },
                                '请输入有效范围，最小值不能大于最大值。',
                              )
                            : null,
                        ],
                    h(
                      'div',
                      {
                        style: {
                          display: 'flex',
                          gap: 'var(--f-choice-gap)',
                          justifyContent: 'flex-end',
                        },
                      },
                      [
                        h(
                          'button',
                          { type: 'button', class: 'f-button f-button--ghost', onClick: reset },
                          '重置',
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            class: 'f-button f-button--ghost',
                            onClick: () => close(true),
                          },
                          '取消',
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            class: 'f-button f-button--primary',
                            disabled: props.mode === 'numberRange' && invalid.value,
                            onClick: apply,
                          },
                          '确定',
                        ),
                      ],
                    ),
                  ],
                ),
              ])
            : null,
        ],
      );
  },
});

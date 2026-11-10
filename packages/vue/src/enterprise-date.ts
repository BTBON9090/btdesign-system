import { computed, defineComponent, h, mergeProps, nextTick, ref, watch } from 'vue';
import type { PropType } from 'vue';
import {
  addDays,
  addMonths,
  calendarDays,
  formatDate,
  isDateDisabled,
  normalizeDateRange,
  parseDate,
} from '@btdesign/engine';
import type { DateRange } from '@btdesign/engine';
import { useControlId, useFieldControl } from './field.js';
import { useValue, useDismiss, isDisabled } from './enterprise-shared.js';
const dateProps = {
  modelValue: { type: String, default: undefined },
  defaultValue: { type: String, default: '' },
  min: String,
  max: String,
  disabledDate: Function as PropType<(value: string) => boolean>,
  disabled: { type: Boolean, default: undefined },
} as const;
export const Calendar = defineComponent({
  name: 'BTDESIGNCalendar',
  inheritAttrs: false,
  props: {
    ...dateProps,
    month: String,
    weekStartsOn: { type: Number as PropType<0 | 1>, default: 1 },
    label: { type: String, default: '日历' },
  },
  emits: ['update:modelValue', 'update:month'],
  setup(props, { attrs, emit }) {
    const root = ref<HTMLElement>();
    const today = formatDate(new Date());
    const state = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit('update:modelValue', v),
    );
    const localMonth = ref((parseDate(state.value.value) ? state.value.value : today).slice(0, 7));
    const displayMonth = computed(() =>
      /^\d{4}-\d{2}$/.test(props.month ?? '') && parseDate(`${props.month}-01`)
        ? props.month!
        : localMonth.value,
    );
    const focused = ref(parseDate(state.value.value) ? state.value.value : today);
    const disabled = (date: string) => Boolean(props.disabled) || isDateDisabled(date, props);
    const month = (value: string) => {
      if (!parseDate(`${value}-01`)) return;
      if (props.month === undefined) localMonth.value = value;
      emit('update:month', value);
    };
    const move = (date: string, direction = 1) => {
      if (!parseDate(date)) return;
      let next = date;
      if (props.min && next < props.min) next = props.min;
      if (props.max && next > props.max) next = props.max;
      for (let attempt = 0; attempt < 366 && disabled(next); attempt++) {
        const candidate = addDays(next, direction);
        if ((props.min && candidate < props.min) || (props.max && candidate > props.max)) return;
        next = candidate;
      }
      if (disabled(next)) return;
      focused.value = next;
      month(next.slice(0, 7));
      nextTick(() =>
        root.value?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus(),
      );
    };
    const key = (event: KeyboardEvent, date: string) => {
      let next = '';
      const weekday = parseDate(date) ? new Date(`${date}T12:00:00`).getDay() : 0;
      switch (event.key) {
        case 'ArrowLeft':
          next = addDays(date, -1);
          break;
        case 'ArrowRight':
          next = addDays(date, 1);
          break;
        case 'ArrowUp':
          next = addDays(date, -7);
          break;
        case 'ArrowDown':
          next = addDays(date, 7);
          break;
        case 'Home':
          next = addDays(date, -((weekday - props.weekStartsOn + 7) % 7));
          break;
        case 'End':
          next = addDays(date, 6 - ((weekday - props.weekStartsOn + 7) % 7));
          break;
        case 'PageUp':
          next = addMonths(date, event.shiftKey ? -12 : -1);
          break;
        case 'PageDown':
          next = addMonths(date, event.shiftKey ? 12 : 1);
          break;
      }
      if (next) {
        event.preventDefault();
        move(next, next < date ? -1 : 1);
      }
    };
    watch(
      () => props.modelValue,
      (value) => {
        if (value && parseDate(value)) {
          focused.value = value;
          if (props.month === undefined) localMonth.value = value.slice(0, 7);
        }
      },
    );
    return () => {
      const days = calendarDays(displayMonth.value, props.weekStartsOn);
      const active = days.some((day) => day.value === focused.value && !disabled(day.value))
        ? focused.value
        : days.find((day) => day.currentMonth && !disabled(day.value))?.value;
      const year = Number(displayMonth.value.slice(0, 4));
      const yearStart = Math.max(1, Math.min(Number(props.min?.slice(0, 4)) || year - 100, year));
      const yearEnd = Math.min(9999, Math.max(Number(props.max?.slice(0, 4)) || year + 50, year));
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      return h('div', mergeProps(attrs, { class: 'f-calendar', ref: root }), [
        h('div', { class: 'f-calendar-header' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'f-calendar-nav',
              disabled: props.disabled,
              'aria-label': '上个月',
              onClick: () => month(addMonths(`${displayMonth.value}-01`, -1).slice(0, 7)),
            },
            '‹',
          ),
          h('div', { class: 'f-calendar-selects' }, [
            h(
              'select',
              {
                class: 'f-select',
                'aria-label': '年份',
                disabled: props.disabled,
                value: year,
                onChange: (e: Event) =>
                  month(`${(e.target as HTMLSelectElement).value}-${displayMonth.value.slice(5)}`),
              },
              Array.from(
                { length: Math.min(10000, yearEnd - yearStart + 1) },
                (_, i) => yearStart + i,
              ).map((value) => h('option', { value, selected: value === year }, `${value}年`)),
            ),
            h(
              'select',
              {
                class: 'f-select',
                'aria-label': '月份',
                disabled: props.disabled,
                value: Number(displayMonth.value.slice(5)),
                onChange: (e: Event) =>
                  month(`${year}-${(e.target as HTMLSelectElement).value.padStart(2, '0')}`),
              },
              Array.from({ length: 12 }, (_, i) => i + 1).map((value) =>
                h(
                  'option',
                  { value, selected: value === Number(displayMonth.value.slice(5)) },
                  `${value}月`,
                ),
              ),
            ),
          ]),
          h(
            'button',
            {
              type: 'button',
              class: 'f-calendar-nav',
              disabled: props.disabled,
              'aria-label': '下个月',
              onClick: () => month(addMonths(`${displayMonth.value}-01`, 1).slice(0, 7)),
            },
            '›',
          ),
        ]),
        h(
          'span',
          { class: 'f-sr-only', 'aria-live': 'polite' },
          `${year}年${Number(displayMonth.value.slice(5))}月`,
        ),
        h('table', { role: 'grid', 'aria-label': props.label, class: 'f-calendar-grid' }, [
          h(
            'thead',
            {},
            h(
              'tr',
              {},
              Array.from({ length: 7 }, (_, i) =>
                h('th', { scope: 'col' }, weekdays[(i + props.weekStartsOn) % 7]),
              ),
            ),
          ),
          h(
            'tbody',
            {},
            Array.from({ length: 6 }, (_, week) =>
              h(
                'tr',
                {},
                days.slice(week * 7, week * 7 + 7).map((day) =>
                  h(
                    'td',
                    { 'aria-selected': day.value === state.value.value },
                    h(
                      'button',
                      {
                        type: 'button',
                        class: [
                          'f-calendar-day',
                          !day.currentMonth && 'is-outside',
                          day.value === state.value.value && 'is-selected',
                        ],
                        tabindex: day.value === active ? 0 : -1,
                        disabled: disabled(day.value),
                        'data-date': day.value,
                        'data-outside': !day.currentMonth || undefined,
                        'data-selected': day.value === state.value.value || undefined,
                        'aria-label': day.value,
                        'aria-current': day.value === today ? 'date' : undefined,
                        onFocus: () => (focused.value = day.value),
                        onKeydown: (e: KeyboardEvent) => key(e, day.value),
                        onClick: () => {
                          if (!disabled(day.value)) {
                            state.set(day.value);
                            focused.value = day.value;
                            month(day.month);
                          }
                        },
                      },
                      String(day.day),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ]),
        h(
          'div',
          { class: 'f-calendar-footer' },
          h(
            'button',
            {
              type: 'button',
              class: 'f-calendar-today f-button f-button--ghost f-button--sm',
              disabled: disabled(today),
              onClick: () => {
                state.set(today);
                move(today);
              },
            },
            '今天',
          ),
        ),
      ]);
    };
  },
});
export const DatePicker = defineComponent({
  name: 'BTDESIGNDatePicker',
  inheritAttrs: false,
  props: {
    ...dateProps,
    label: String,
    name: String,
    required: { type: Boolean, default: undefined },
    placeholder: { type: String, default: 'YYYY-MM-DD' },
    clearable: { type: Boolean, default: true },
    showLabel: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const id = useControlId('date');
    const root = ref<HTMLElement>();
    const input = ref<HTMLInputElement>();
    const trigger = ref<HTMLButtonElement>();
    const open = ref(false);
    const state = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit('update:modelValue', v),
    );
    const draft = ref(state.value.value);
    const error = ref('');
    const field = useFieldControl();
    watch(
      () => state.value.value,
      (value) => {
        draft.value = value;
        error.value = '';
        input.value?.setCustomValidity('');
      },
    );
    const close = (restore = false) => {
      open.value = false;
      if (restore) nextTick(() => trigger.value?.focus());
    };
    useDismiss(root, open, () => close());
    return () => {
      const bound = field({
        ...attrs,
        'aria-label': props.label ?? attrs['aria-label'],
        required: props.required,
        disabled: props.disabled,
      });
      const disabled = isDisabled(bound.disabled);
      const readOnly = isDisabled(attrs.readonly ?? attrs.readOnly);
      const choose = (value: string) => {
        if (disabled || readOnly) return;
        draft.value = props.modelValue === undefined ? value : props.modelValue;
        error.value = '';
        input.value?.setCustomValidity('');
        state.set(value);
        close(true);
      };
      const commit = () => {
        if (disabled || readOnly) return;
        const next = draft.value.trim();
        const invalid = next !== '' && isDateDisabled(next, props);
        error.value = invalid ? '请输入可用日期，格式为 YYYY-MM-DD。' : '';
        input.value?.setCustomValidity(error.value);
        if (!invalid) {
          draft.value = props.modelValue === undefined ? next : props.modelValue;
          if (input.value) input.value.value = draft.value;
          state.set(next);
        }
      };
      return h(
        'div',
        {
          class: ['f-date-picker', attrs.class],
          style: attrs.style,
          ref: root,
          onKeydown: (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open.value) {
              e.preventDefault();
              close(true);
            }
          },
        },
        [
          (props.showLabel ?? !field(attrs)['aria-labelledby'])
            ? h('label', { for: bound.id ?? id, class: 'f-date-label' }, props.label ?? '日期')
            : null,
          h('div', { class: 'f-date-input f-input-group' }, [
            h(
              'input',
              mergeProps(attrs, bound, {
                ref: input,
                id: bound.id ?? id,
                class: 'f-input',
                type: 'text',
                placeholder: props.placeholder,
                pattern: '\\d{4}-\\d{2}-\\d{2}',
                name: props.name,
                min: props.min,
                max: props.max,
                value: draft.value,
                disabled,
                required: bound.required,
                'aria-label': props.label ?? attrs['aria-label'],
                'aria-invalid': Boolean(error.value) || bound['aria-invalid'],
                'aria-describedby':
                  [bound['aria-describedby'], error.value ? `${id}-error` : null]
                    .filter(Boolean)
                    .join(' ') || undefined,
                onInput: (event: Event) => {
                  if (disabled || readOnly) return;
                  const target = event.target as HTMLInputElement;
                  draft.value = target.value;
                  error.value = '';
                  target.setCustomValidity(
                    target.value !== '' && isDateDisabled(target.value, props)
                      ? '请输入可用日期，格式为 YYYY-MM-DD。'
                      : '',
                  );
                },
                onBlur: commit,
                onKeydown: (event: KeyboardEvent) => {
                  if (disabled || readOnly) return;
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commit();
                  }
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    open.value = true;
                    nextTick(() =>
                      root.value
                        ?.querySelector<HTMLButtonElement>('.f-calendar-day[tabindex="0"]')
                        ?.focus(),
                    );
                  }
                },
              }),
            ),
            props.clearable && draft.value
              ? h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-date-clear',
                    disabled: disabled || readOnly,
                    'aria-label': `清空${props.label ?? '日期'}`,
                    onClick: () => choose(''),
                  },
                  '×',
                )
              : null,
            h(
              'button',
              {
                type: 'button',
                class: 'f-date-trigger',
                ref: trigger,
                disabled: disabled || readOnly,
                'aria-label': `选择${props.label ?? '日期'}`,
                'aria-haspopup': 'dialog',
                'aria-expanded': open.value,
                'aria-controls': open.value ? `${id}-dialog` : undefined,
                onClick: () => {
                  if (disabled || readOnly) return;
                  open.value = !open.value;
                  if (open.value)
                    nextTick(() =>
                      root.value
                        ?.querySelector<HTMLButtonElement>('.f-calendar-day[tabindex="0"]')
                        ?.focus(),
                    );
                },
              },
              '日历',
            ),
          ]),
          error.value
            ? h('p', { id: `${id}-error`, class: 'f-field-error', role: 'alert' }, error.value)
            : null,
          open.value
            ? h(
                'div',
                {
                  id: `${id}-dialog`,
                  role: 'dialog',
                  'aria-label': `${props.label ?? '日期'}选择`,
                  class: 'f-overlay f-date-popup',
                },
                [
                  h(Calendar, {
                    modelValue: state.value.value,
                    min: props.min,
                    max: props.max,
                    disabledDate: props.disabledDate,
                    disabled,
                    'onUpdate:modelValue': choose,
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'f-button f-button--ghost f-button--sm',
                      onClick: () => close(true),
                    },
                    '关闭',
                  ),
                ],
              )
            : null,
        ],
      );
    };
  },
});
export const DateRangePicker = defineComponent({
  name: 'BTDESIGNDateRangePicker',
  inheritAttrs: false,
  props: {
    modelValue: { type: Array as unknown as PropType<DateRange>, default: undefined },
    defaultValue: { type: Array as unknown as PropType<DateRange>, default: () => ['', ''] },
    label: { type: String, default: '日期范围' },
    name: String,
    min: String,
    max: String,
    disabledDate: Function as PropType<(value: string) => boolean>,
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const generated = useControlId('date-range');
    const field = useFieldControl();
    const state = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit('update:modelValue', v),
    );
    return () =>
      h(
        'div',
        mergeProps(
          { ...attrs, id: undefined },
          { class: 'f-date-range', role: 'group', 'aria-label': props.label },
        ),
        [0, 1].map((index) =>
          h(DatePicker, {
            id:
              index === 0
                ? String(field(attrs).id ?? generated)
                : `${String(field(attrs).id ?? generated)}-end`,
            label: `${props.label}${index === 0 ? '开始' : '结束'}`,
            showLabel: true,
            modelValue: state.value.value[index] ?? '',
            name: props.name ? `${props.name}[${index}]` : undefined,
            min: props.min,
            max: props.max,
            disabledDate: props.disabledDate,
            disabled: props.disabled,
            required: props.required,
            'onUpdate:modelValue': (value: string) => {
              if (props.disabled) return;
              const range = [...state.value.value];
              range[index] = value;
              state.set(normalizeDateRange(range));
            },
          }),
        ),
      );
  },
});

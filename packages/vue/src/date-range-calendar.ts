import { defineComponent, h, nextTick, ref, watch, type PropType } from 'vue';
import {
  addMonths,
  formatDate,
  isDateDisabled,
  normalizeDateRange,
  parseDate,
  selectDateRange,
  type DateRange,
} from '@btdesign/engine';
import { Calendar } from './enterprise-date.js';
import { useControlId } from './field.js';
import { useDismiss } from './enterprise-shared.js';

export interface DateRangePreset {
  label: string;
  /** Resolve on click. Constraints are checked for endpoints, not interior dates. */
  value: DateRange | (() => DateRange);
  disabled?: boolean;
}
const baseMonth = (range: DateRange) => {
  const date = parseDate(range[0]) ? range[0] : formatDate(new Date());
  return date.slice(0, 7) === '9999-12' ? '9999-11' : date.slice(0, 7);
};
export const DateRangeCalendar = defineComponent({
  name: 'BTDESIGNDateRangeCalendar',
  props: {
    value: { type: Array as unknown as PropType<DateRange>, required: true },
    label: { type: String, required: true },
    disabled: Boolean,
    presets: { type: Array as PropType<readonly DateRangePreset[]>, default: () => [] },
    min: String,
    max: String,
    disabledDate: Function as PropType<(value: string) => boolean>,
  },
  emits: ['change'],
  setup(props, { emit }) {
    const id = useControlId('date-range-panel');
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const open = ref(false);
    const left = ref(baseMonth(props.value));
    const error = ref('');
    const close = (restore = false) => {
      open.value = false;
      if (restore) void nextTick(() => trigger.value?.focus());
    };
    useDismiss(root, open, () => close());
    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) close();
      },
    );
    const show = () => {
      left.value = baseMonth(props.value);
      error.value = '';
      open.value = true;
      void nextTick(() =>
        root.value?.querySelector<HTMLButtonElement>('.f-calendar-day[tabindex="0"]')?.focus(),
      );
    };
    const choose = (date: string) => {
      if (props.disabled || isDateDisabled(date, props)) return;
      const next = selectDateRange(props.value, date);
      error.value = '';
      emit('change', next);
      if (next[0] && next[1]) close(true);
    };
    const preset = (item: DateRangePreset) => {
      if (props.disabled || item.disabled) return;
      let next: DateRange;
      try {
        next = typeof item.value === 'function' ? item.value() : item.value;
      } catch {
        error.value = '此快捷范围不可用。';
        return;
      }
      if (
        !Array.isArray(next) ||
        next.length !== 2 ||
        isDateDisabled(next[0], props) ||
        isDateDisabled(next[1], props)
      ) {
        error.value = '此快捷范围不可用。';
        return;
      }
      emit('change', normalizeDateRange(next));
      error.value = '';
      close(true);
    };
    const changeLeft = (month: string) => {
      if (month >= '0001-01' && month <= '9999-11') left.value = month;
    };
    const changeRight = (month: string) => {
      const previous = addMonths(`${month}-01`, -1).slice(0, 7);
      if (previous) changeLeft(previous);
    };
    return () =>
      h(
        'div',
        {
          class: 'f-date-range-calendar',
          ref: root,
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open.value) {
              event.preventDefault();
              close(true);
            }
          },
        },
        [
          h(
            'button',
            {
              type: 'button',
              ref: trigger,
              class: 'f-button f-button--secondary f-date-range-open',
              'aria-label': `选择${props.label}`,
              'aria-haspopup': 'dialog',
              'aria-expanded': open.value,
              'aria-controls': open.value ? id : undefined,
              disabled: props.disabled,
              onClick: () => (open.value ? close() : show()),
            },
            '选择范围',
          ),
          open.value
            ? h(
                'div',
                {
                  id,
                  role: 'dialog',
                  'aria-label': `选择${props.label}`,
                  class: 'f-overlay f-date-range-panel',
                },
                [
                  props.presets.length
                    ? h(
                        'div',
                        { class: 'f-date-range-presets', 'aria-label': '快捷范围' },
                        props.presets.map((item, index) =>
                          h(
                            'button',
                            {
                              type: 'button',
                              class: 'f-button f-button--ghost f-button--sm',
                              key: `${item.label}-${index}`,
                              disabled: item.disabled,
                              onClick: () => preset(item),
                            },
                            item.label,
                          ),
                        ),
                      )
                    : null,
                  h('div', { class: 'f-date-range-calendars' }, [
                    h(Calendar, {
                      label: '开始月份',
                      modelValue: props.value[0],
                      range: props.value,
                      month: left.value,
                      min: props.min,
                      max: props.max,
                      disabledDate: props.disabledDate,
                      'onUpdate:month': changeLeft,
                      'onUpdate:modelValue': choose,
                    }),
                    h(Calendar, {
                      label: '结束月份',
                      modelValue: props.value[1],
                      range: props.value,
                      month: addMonths(`${left.value}-01`, 1).slice(0, 7),
                      min: props.min,
                      max: props.max,
                      disabledDate: props.disabledDate,
                      'onUpdate:month': changeRight,
                      'onUpdate:modelValue': choose,
                    }),
                  ]),
                  error.value
                    ? h('p', { role: 'alert', class: 'f-field-error' }, error.value)
                    : null,
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'f-button f-button--ghost f-button--sm f-date-range-close',
                      onClick: () => close(true),
                    },
                    '关闭',
                  ),
                ],
              )
            : null,
        ],
      );
  },
});

import { defineComponent, h, mergeProps, type PropType } from 'vue';
import { useControlId } from './field.js';

function displayValue(value: number | string, precision?: number, locale?: string) {
  if (typeof value === 'string') return value;
  if (!Number.isFinite(value)) return '—';
  const digits =
    typeof precision === 'number' && Number.isFinite(precision)
      ? Math.max(0, Math.min(20, Math.floor(precision)))
      : undefined;
  const options =
    digits === undefined
      ? { maximumFractionDigits: 20 }
      : { minimumFractionDigits: digits, maximumFractionDigits: digits };
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, options).format(value);
  }
}
const trendLabel = { up: '上升', down: '下降', neutral: '持平' } as const;
const trendGlyph = { up: '↑', down: '↓', neutral: '−' } as const;

export const Statistic = defineComponent({
  name: 'BTDESIGNStatistic',
  inheritAttrs: false,
  props: {
    id: String,
    title: String,
    value: { type: [Number, String] as PropType<number | string>, required: true },
    format: { type: String as PropType<'number' | 'percent'>, default: 'number' },
    precision: Number,
    locale: String,
    prefix: String,
    suffix: String,
    trend: String as PropType<'up' | 'down' | 'neutral'>,
    trendText: String,
  },
  setup(props, { attrs, slots }) {
    const generated = useControlId('statistic');
    return () => {
      const labelId = `${props.id ?? generated}-label`;
      const title = slots.title?.() ?? props.title;
      const prefix = slots.prefix?.() ?? props.prefix;
      const suffix =
        slots.suffix?.() ?? props.suffix ?? (props.format === 'percent' ? '%' : undefined);
      const trendText = slots.trend?.() ?? props.trendText;
      return h(
        'div',
        mergeProps(attrs, {
          id: props.id,
          role: 'group',
          'aria-labelledby': title != null ? labelId : undefined,
          class: 'f-statistic',
        }),
        [
          title != null ? h('div', { id: labelId, class: 'f-statistic-title' }, title) : null,
          h('div', { class: 'f-statistic-value' }, [
            prefix != null ? h('span', { class: 'f-statistic-prefix' }, prefix) : null,
            h('span', {}, displayValue(props.value, props.precision, props.locale)),
            suffix != null ? h('span', { class: 'f-statistic-suffix' }, suffix) : null,
          ]),
          props.trend || trendText != null
            ? h('div', { class: 'f-statistic-trend' }, [
                props.trend
                  ? h(
                      'span',
                      { role: 'img', 'aria-label': trendLabel[props.trend] },
                      trendGlyph[props.trend],
                    )
                  : null,
                trendText != null ? h('span', {}, trendText) : null,
              ])
            : null,
        ],
      );
    };
  },
});

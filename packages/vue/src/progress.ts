import { defineComponent, h, mergeProps, type PropType } from 'vue';
export type ProgressType = 'line' | 'circle' | 'mini';
export type ProgressStatus = 'normal' | 'success' | 'warning' | 'error';
const statusText = { normal: '', success: '成功', warning: '警告', error: '错误' };
export const Progress = defineComponent({
  name: 'BTDESIGNProgress',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    label: String,
    type: { type: String as PropType<ProgressType>, default: 'line' },
    status: { type: String as PropType<ProgressStatus>, default: 'normal' },
    showValue: { type: Boolean, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const max = Number.isFinite(props.max) && props.max > 0 ? props.max : 100;
      const value = Number.isFinite(props.value) ? Math.min(max, Math.max(0, props.value)) : 0;
      const percent = Math.round((value / max) * 100);
      const text = statusText[props.status];
      const showPercent =
        props.showValue ?? (props.type === 'circle' || (props.type === 'line' && !!props.label));
      const aria = {
        role: 'progressbar',
        'aria-label': attrs['aria-label'] ?? props.label ?? '进度',
        'aria-valuenow': value,
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-valuetext': attrs['aria-valuetext'] ?? (text ? `${percent}%，${text}` : undefined),
      };
      if (props.type === 'circle' || props.type === 'mini')
        return h(
          'div',
          {
            class: [
              'f-progress-wrap',
              'f-progress-wrap--circle',
              props.type === 'mini' && 'f-progress-wrap--mini',
              `f-progress--${props.status}`,
            ],
          },
          [
            props.label && props.type === 'circle'
              ? h('span', { class: 'f-progress-circle-label' }, props.label)
              : null,
            h('div', mergeProps(attrs, { class: 'f-progress-circle', ...aria }), [
              h(
                'svg',
                {
                  class: 'f-progress-circle-svg',
                  viewBox: '0 0 40 40',
                  'aria-hidden': 'true',
                  focusable: 'false',
                },
                [
                  h('circle', { class: 'f-progress-circle-track', cx: 20, cy: 20, r: 17 }),
                  h('circle', {
                    class: 'f-progress-circle-fill',
                    cx: 20,
                    cy: 20,
                    r: 17,
                    pathLength: 100,
                    style: {
                      strokeDashoffset: 100 - (value / max) * 100,
                      visibility: value === 0 ? 'hidden' : undefined,
                    },
                  }),
                ],
              ),
              props.type === 'circle' && (showPercent || text)
                ? h('span', { class: 'f-progress-circle-content', 'aria-hidden': 'true' }, [
                    showPercent ? h('span', `${percent}%`) : null,
                    text ? h('small', text) : null,
                  ])
                : null,
            ]),
            props.type === 'mini' && (props.label || showPercent || text)
              ? h('span', { class: 'f-progress-mini-content' }, [
                  props.label ? h('span', props.label) : null,
                  showPercent || text
                    ? h(
                        'span',
                        { 'aria-hidden': 'true' },
                        `${showPercent ? `${percent}%` : ''}${showPercent && text ? ' · ' : ''}${text}`,
                      )
                    : null,
                ])
              : null,
          ],
        );
      return h('div', { class: ['f-progress-wrap', `f-progress--${props.status}`] }, [
        props.label || showPercent || text
          ? h('div', { class: 'f-progress-label' }, [
              h('span', props.label),
              h(
                'span',
                { 'aria-hidden': 'true' },
                `${showPercent ? `${percent}%` : ''}${showPercent && text ? ' · ' : ''}${text}`,
              ),
            ])
          : null,
        h(
          'div',
          mergeProps(attrs, { class: 'f-progress', ...aria }),
          h('div', { class: 'f-progress-fill', style: { width: `${percent}%` } }),
        ),
      ]);
    };
  },
});

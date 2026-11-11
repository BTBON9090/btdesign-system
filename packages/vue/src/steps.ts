import { defineComponent, h, mergeProps, type PropType, type VNodeChild } from 'vue';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export interface StepItem {
  id: string;
  title: VNodeChild;
  description?: VNodeChild;
  status?: StepStatus;
  /** Decorative icon; the step number and status are still announced in text. */
  icon?: VNodeChild;
}
const labels: Record<StepStatus, string> = {
  wait: '待开始',
  process: '进行中',
  finish: '已完成',
  error: '错误',
};

export const Steps = defineComponent({
  name: 'BTDESIGNSteps',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<StepItem[]>, required: true },
    current: { type: Number, default: 0 },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    label: { type: String, default: '步骤' },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const index = Number.isFinite(props.current)
        ? Math.max(0, Math.min(props.items.length - 1, Math.floor(props.current)))
        : 0;
      return h(
        'ol',
        mergeProps(attrs, {
          'aria-label': attrs['aria-label'] ?? props.label,
          class: ['f-steps', `f-steps--${props.orientation}`],
        }),
        props.items.map((item, i) => {
          const status = item.status ?? (i < index ? 'finish' : i === index ? 'process' : 'wait');
          return h(
            'li',
            {
              key: item.id,
              class: ['f-steps-item', `f-steps-item--${status}`],
              'aria-current': i === index ? 'step' : undefined,
            },
            [
              h('span', { class: 'f-steps-marker', 'aria-hidden': 'true' }, [
                slots[`icon-${item.id}`]?.({ item }) ?? item.icon ?? i + 1,
              ]),
              h('div', { class: 'f-steps-content' }, [
                h('span', { class: 'f-sr-only' }, `第 ${i + 1} 步，${labels[status]}：`),
                h('div', { class: 'f-steps-title' }, [
                  slots[`title-${item.id}`]?.({ item }) ?? item.title,
                ]),
                slots[`description-${item.id}`] || item.description != null
                  ? h('div', { class: 'f-steps-description' }, [
                      slots[`description-${item.id}`]?.({ item }) ?? item.description,
                    ])
                  : null,
              ]),
            ],
          );
        }),
      );
    };
  },
});

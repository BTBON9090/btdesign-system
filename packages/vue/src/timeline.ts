import { defineComponent, h, mergeProps, type PropType, type VNodeChild } from 'vue';

export type TimelineTone = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type TimelineState = 'done' | 'current' | 'pending';
export interface TimelineItem {
  id: string;
  title: VNodeChild;
  description?: VNodeChild;
  time?: string;
  dateTime?: string;
  tone?: TimelineTone;
  state?: TimelineState;
}
const stateLabels: Record<TimelineState, string> = {
  done: '已完成',
  current: '进行中',
  pending: '待开始',
};

export const Timeline = defineComponent({
  name: 'BTDESIGNTimeline',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<TimelineItem[]>, required: true },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    label: { type: String, default: '时间轴' },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'ol',
        mergeProps(attrs, {
          'aria-label': attrs['aria-label'] ?? props.label,
          class: ['f-timeline', `f-timeline--${props.orientation}`],
        }),
        props.items.map((item) =>
          h(
            'li',
            {
              key: item.id,
              class: ['f-timeline-item', `f-timeline-item--${item.tone ?? 'default'}`],
              'data-state': item.state,
              'aria-current': item.state === 'current' ? 'step' : undefined,
            },
            [
              h('span', { class: 'f-timeline-marker', 'aria-hidden': 'true' }),
              h('div', { class: 'f-timeline-content' }, [
                item.state
                  ? h('span', { class: 'f-sr-only' }, `${stateLabels[item.state]}：`)
                  : null,
                h('div', { class: 'f-timeline-title' }, [
                  slots[`title-${item.id}`]?.({ item }) ?? item.title,
                ]),
                slots[`description-${item.id}`] || item.description != null
                  ? h('div', { class: 'f-timeline-description' }, [
                      slots[`description-${item.id}`]?.({ item }) ?? item.description,
                    ])
                  : null,
                item.time
                  ? h('time', { class: 'f-timeline-time', datetime: item.dateTime }, item.time)
                  : null,
              ]),
            ],
          ),
        ),
      );
  },
});

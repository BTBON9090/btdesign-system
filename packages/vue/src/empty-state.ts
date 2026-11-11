import { defineComponent, h, mergeProps, type PropType } from 'vue';

export type EmptyStateVariant =
  | 'no-content'
  | 'initial'
  | 'no-messages'
  | 'no-results'
  | 'no-permission'
  | 'offline'
  | 'not-found'
  | 'error';
export type EmptyStateSize = 'compact' | 'default' | 'page';
const titles: Record<EmptyStateVariant, string> = {
  'no-content': '暂无内容',
  initial: '从这里开始',
  'no-messages': '暂无消息',
  'no-results': '没有找到结果',
  'no-permission': '暂无访问权限',
  offline: '连接已断开',
  'not-found': '内容不存在',
  error: '暂时无法加载',
};
export const EmptyState = defineComponent({
  name: 'BTDESIGNEmptyState',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<EmptyStateVariant>, default: 'no-content' },
    size: { type: String as PropType<EmptyStateSize>, default: 'default' },
    title: String,
    description: String,
    headingLevel: { type: Number as PropType<2 | 3 | 4 | 5 | 6>, default: 3 },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        mergeProps(attrs, {
          class: ['f-empty-state', props.size !== 'default' && `f-empty-state--${props.size}`],
          'data-variant': props.variant,
        }),
        [
          slots.icon
            ? h('div', { class: 'f-empty-state-icon', 'aria-hidden': 'true' }, slots.icon())
            : null,
          h(
            `h${props.headingLevel}`,
            { class: 'f-empty-state-title' },
            slots.title?.() ?? props.title ?? titles[props.variant],
          ),
          slots.description || props.description
            ? h(
                'p',
                { class: 'f-empty-state-description' },
                slots.description?.() ?? props.description,
              )
            : null,
          slots.default?.(),
          slots.action ? h('div', { class: 'f-empty-state-action' }, slots.action()) : null,
        ],
      );
  },
});

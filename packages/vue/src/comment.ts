import { defineComponent, h, mergeProps, type PropType, type VNodeChild } from 'vue';

export const Comment = defineComponent({
  name: 'BTDESIGNComment',
  inheritAttrs: false,
  props: {
    author: { type: String, required: true },
    time: String,
    dateTime: String,
    content: String,
    alignment: { type: String as PropType<'start' | 'end'>, default: 'start' },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const avatar = slots.avatar?.();
      const actions = slots.actions?.();
      const replies = slots.default?.();
      const content: VNodeChild = slots.content?.() ?? props.content;
      return h(
        'article',
        mergeProps(attrs, { class: ['f-comment', `f-comment--${props.alignment}`] }),
        [
          avatar ? h('div', { class: 'f-comment-avatar' }, avatar) : null,
          h('div', { class: 'f-comment-body' }, [
            h('header', { class: 'f-comment-header' }, [
              h('span', { class: 'f-comment-author' }, slots.author?.() ?? props.author),
              props.time || slots.time
                ? h(
                    'time',
                    { class: 'f-comment-time', datetime: props.dateTime },
                    slots.time?.() ?? props.time,
                  )
                : null,
            ]),
            content != null ? h('div', { class: 'f-comment-content' }, [content]) : null,
            actions ? h('div', { class: 'f-comment-actions' }, actions) : null,
            replies ? h('div', { class: 'f-comment-replies' }, replies) : null,
          ]),
        ],
      );
    };
  },
});

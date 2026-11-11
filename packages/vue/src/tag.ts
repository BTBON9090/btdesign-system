import { defineComponent, h, mergeProps, type PropType } from 'vue';

export type TagTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

/** Visibility belongs to the parent: listen for close and remove the tag there. */
export const Tag = defineComponent({
  name: 'BTDESIGNTag',
  inheritAttrs: false,
  props: {
    tone: { type: String as PropType<TagTone>, default: 'default' },
    closable: Boolean,
    disabled: Boolean,
    closeLabel: { type: String, default: '移除标签' },
  },
  emits: { close: (_event: MouseEvent) => true },
  setup(props, { attrs, slots, emit }) {
    return () =>
      h(
        'span',
        mergeProps(attrs, {
          class: ['f-tag', `f-tag--${props.tone}`, props.disabled && 'f-tag--disabled'],
          'aria-disabled': props.disabled || undefined,
        }),
        [
          h('span', { class: 'f-tag-content' }, slots.default?.()),
          props.closable
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'f-tag-close',
                  disabled: props.disabled,
                  'aria-label': props.closeLabel,
                  onClick: (event: MouseEvent) => emit('close', event),
                },
                h('span', { 'aria-hidden': 'true' }, '×'),
              )
            : null,
        ],
      );
  },
});

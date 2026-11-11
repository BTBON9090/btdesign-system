import {
  Comment,
  Fragment,
  Text,
  defineComponent,
  h,
  isVNode,
  mergeProps,
  type PropType,
  type VNodeChild,
} from 'vue';

function flattenChildren(children: VNodeChild): VNodeChild[] {
  if (Array.isArray(children)) return children.flatMap(flattenChildren);
  if (children == null || typeof children === 'boolean') return [];
  if (typeof children === 'string') return children.trim() ? [children] : [];
  if (isVNode(children)) {
    if (children.type === Comment) return [];
    if (
      children.type === Text &&
      typeof children.children === 'string' &&
      !children.children.trim()
    )
      return [];
    if (children.type === Fragment && Array.isArray(children.children))
      return flattenChildren(children.children as VNodeChild[]);
  }
  return [children];
}

export const AvatarGroup = defineComponent({
  name: 'BTDESIGNAvatarGroup',
  inheritAttrs: false,
  props: {
    max: Number,
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
    shape: { type: String as PropType<'circle' | 'square'>, default: 'circle' },
    label: { type: String, default: '头像组' },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const avatars = flattenChildren(slots.default?.());
      const limit =
        typeof props.max === 'number' && Number.isFinite(props.max)
          ? Math.max(0, Math.floor(props.max))
          : avatars.length;
      const remaining = Math.max(0, avatars.length - limit);
      return h(
        'div',
        mergeProps(attrs, {
          role: 'group',
          'aria-label': attrs['aria-label'] ?? props.label,
          class: 'f-avatar-group',
        }),
        [
          ...avatars.slice(0, limit),
          remaining > 0
            ? h(
                'span',
                {
                  class: [
                    'f-avatar',
                    `f-avatar--${props.size}`,
                    props.shape === 'square' && 'f-avatar--square',
                    'f-avatar-group-overflow',
                  ],
                  role: 'img',
                  'aria-label': `还有 ${remaining} 个头像`,
                },
                `+${remaining}`,
              )
            : null,
        ],
      );
    };
  },
});

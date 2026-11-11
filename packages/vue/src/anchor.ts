import { defineComponent, h, mergeProps, type PropType, type VNodeChild } from 'vue';

export interface AnchorItem {
  id: string;
  href: string;
  title: VNodeChild;
  children?: AnchorItem[];
}
const isFragment = (href: string) => /^#[^\s#]+$/.test(href);

/** Native fragment links; @navigate may prevent default for an application's hash router. */
export const Anchor = defineComponent({
  name: 'BTDESIGNAnchor',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<AnchorItem[]>, required: true },
    activeHref: String,
    label: { type: String, default: '页面目录' },
  },
  emits: { navigate: (_href: string, _event: MouseEvent) => true },
  setup(props, { attrs, slots, emit }) {
    const renderItems = (items: AnchorItem[]): VNodeChild =>
      h(
        'ol',
        { class: 'f-anchor-list' },
        items.map((item) =>
          h('li', { key: item.id, class: 'f-anchor-item' }, [
            isFragment(item.href)
              ? h(
                  'a',
                  {
                    class: 'f-anchor-link',
                    href: item.href,
                    'aria-current': props.activeHref === item.href ? 'location' : undefined,
                    onClick: (event: MouseEvent) => emit('navigate', item.href, event),
                  },
                  [slots[`item-${item.id}`]?.({ item }) ?? item.title],
                )
              : h(
                  'span',
                  { class: ['f-anchor-link', 'f-anchor-link--invalid'], 'aria-disabled': 'true' },
                  [slots[`item-${item.id}`]?.({ item }) ?? item.title],
                ),
            item.children?.length ? renderItems(item.children) : null,
          ]),
        ),
      );
    return () =>
      h(
        'nav',
        mergeProps(attrs, { 'aria-label': attrs['aria-label'] ?? props.label, class: 'f-anchor' }),
        [renderItems(props.items)],
      );
  },
});

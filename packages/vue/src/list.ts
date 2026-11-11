import { defineComponent, h, mergeProps, type PropType } from 'vue';
export const List = defineComponent({
  name: 'BTDESIGNList',
  inheritAttrs: false,
  props: {
    layout: { type: String as PropType<'vertical' | 'grid'>, default: 'vertical' },
    columns: { type: Number as PropType<1 | 2 | 3 | 4>, default: 3 },
    bordered: Boolean,
    split: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'ul',
        mergeProps(attrs, {
          class: [
            'f-list',
            props.layout === 'grid' && 'f-list--grid',
            props.bordered && 'f-list--bordered',
            !props.split && 'f-list--no-split',
          ],
          style: { '--f-list-columns': props.columns },
        }),
        slots.default?.(),
      );
  },
});
export const ListItem = defineComponent({
  name: 'BTDESIGNListItem',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h('li', mergeProps(attrs, { class: 'f-list-item' }), [
        slots.leading ? h('div', { class: 'f-list-item-leading' }, slots.leading()) : null,
        slots.default?.(),
        slots.extra ? h('div', { class: 'f-list-item-extra' }, slots.extra()) : null,
      ]);
  },
});
function part(name: string, css: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h('div', mergeProps(attrs, { class: css }), slots.default?.());
    },
  });
}
export const ListItemContent = part('BTDESIGNListItemContent', 'f-list-item-content');
export const ListItemActions = part('BTDESIGNListItemActions', 'f-list-item-actions');

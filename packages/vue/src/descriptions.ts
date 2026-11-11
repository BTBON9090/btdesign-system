import { defineComponent, h, mergeProps, type PropType, type VNodeChild } from 'vue';

export interface DescriptionsItem {
  key: string;
  label: VNodeChild;
  value: VNodeChild;
  span?: number;
}
const normalize = (value: number | undefined, fallback: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(1, Math.floor(value!))) : fallback;

export const Descriptions = defineComponent({
  name: 'BTDESIGNDescriptions',
  inheritAttrs: false,
  props: {
    title: String,
    items: { type: Array as PropType<DescriptionsItem[]>, required: true },
    column: { type: Number, default: 3 },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    bordered: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const columns = normalize(props.column, 3, 6);
      return h(
        'div',
        mergeProps(attrs, {
          class: 'f-descriptions',
          style: { '--f-descriptions-columns': columns },
        }),
        [
          props.title || slots.title
            ? h('h3', { class: 'f-descriptions-title' }, slots.title?.() ?? props.title)
            : null,
          h(
            'dl',
            {
              class: [
                'f-descriptions-grid',
                `f-descriptions-grid--${props.orientation}`,
                props.bordered && 'f-descriptions-grid--bordered',
              ],
            },
            props.items.map((item) =>
              h(
                'div',
                {
                  key: item.key,
                  class: 'f-descriptions-item',
                  style: { '--f-descriptions-span': normalize(item.span, 1, columns) },
                },
                [
                  h('dt', { class: 'f-descriptions-label' }, [
                    slots[`label-${item.key}`]?.() ?? item.label,
                  ]),
                  h('dd', { class: 'f-descriptions-value' }, [
                    slots[`value-${item.key}`]?.() ?? item.value,
                  ]),
                ],
              ),
            ),
          ),
        ],
      );
    };
  },
});

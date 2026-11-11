import { defineComponent, h, mergeProps, type PropType, type VNodeChild } from 'vue';
import { useValue } from './enterprise-shared.js';

export interface CarouselItem {
  key: string;
  content: VNodeChild;
  label?: string;
}
const clampIndex = (index: number, count: number) =>
  Number.isFinite(index) ? Math.max(0, Math.min(Math.max(0, count - 1), Math.floor(index))) : 0;

export const Carousel = defineComponent({
  name: 'BTDESIGNCarousel',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<CarouselItem[]>, required: true },
    modelValue: { type: Number, default: undefined },
    defaultIndex: { type: Number, default: 0 },
    label: { type: String, default: '图片轮播' },
    loop: Boolean,
    indicatorStyle: { type: String as PropType<'dots' | 'lines'>, default: 'dots' },
    indicatorPlacement: { type: String as PropType<'bottom' | 'start' | 'end'>, default: 'bottom' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const state = useValue(
      () => props.modelValue,
      props.defaultIndex,
      (value) => emit('update:modelValue', value),
    );
    function goTo(next: number, current: number) {
      if (props.items.length < 2) return;
      const target = props.loop
        ? (next + props.items.length) % props.items.length
        : clampIndex(next, props.items.length);
      if (target !== current) state.set(target);
    }
    function onKeys(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        (typeof HTMLElement !== 'undefined' &&
          event.target instanceof HTMLElement &&
          event.target.closest('input,textarea,select,[contenteditable="true"]'))
      )
        return;
      const current = clampIndex(state.value.value, props.items.length);
      const delta =
        event.key === 'ArrowRight' || event.key === 'ArrowDown'
          ? 1
          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
            ? -1
            : 0;
      if (delta) {
        event.preventDefault();
        goTo(current + delta, current);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        goTo(event.key === 'Home' ? 0 : props.items.length - 1, current);
      }
    }
    return () => {
      const current = clampIndex(state.value.value, props.items.length);
      return h(
        'section',
        mergeProps(attrs, {
          role: 'region',
          'aria-label': attrs['aria-label'] ?? props.label,
          'aria-roledescription': '轮播',
          tabindex: attrs.tabindex ?? 0,
          class: 'f-carousel',
          onKeydown: onKeys,
        }),
        props.items.length === 0
          ? [h('p', { class: 'f-carousel-empty' }, '暂无轮播内容')]
          : [
              h(
                'div',
                { class: 'f-carousel-slides', 'aria-live': 'polite' },
                props.items.map((item, i) =>
                  h(
                    'div',
                    {
                      key: item.key,
                      class: 'f-carousel-slide',
                      role: 'group',
                      'aria-roledescription': '幻灯片',
                      'aria-label': item.label ?? `${i + 1} / ${props.items.length}`,
                      hidden: i !== current,
                    },
                    [slots[`slide-${item.key}`]?.() ?? item.content],
                  ),
                ),
              ),
              h('div', { class: 'f-carousel-controls' }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-carousel-arrow',
                    'aria-label': '上一张',
                    disabled: props.items.length < 2 || (!props.loop && current === 0),
                    onClick: () => goTo(current - 1, current),
                  },
                  '‹',
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-carousel-arrow',
                    'aria-label': '下一张',
                    disabled:
                      props.items.length < 2 || (!props.loop && current === props.items.length - 1),
                    onClick: () => goTo(current + 1, current),
                  },
                  '›',
                ),
              ]),
              h(
                'div',
                {
                  role: 'group',
                  'aria-label': '选择幻灯片',
                  class: [
                    'f-carousel-indicators',
                    `f-carousel-indicators--${props.indicatorStyle}`,
                    `f-carousel-indicators--${props.indicatorPlacement}`,
                  ],
                },
                props.items.map((item, i) =>
                  h('button', {
                    key: item.key,
                    type: 'button',
                    class: 'f-carousel-indicator',
                    'aria-label': item.label ?? `第 ${i + 1} 张`,
                    'aria-current': i === current ? 'true' : undefined,
                    onClick: () => goTo(i, current),
                  }),
                ),
              ),
            ],
      );
    };
  },
});

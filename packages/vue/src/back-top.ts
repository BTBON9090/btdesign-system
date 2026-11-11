import {
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';

export type BackTopTarget = Window | HTMLElement;
export const BackTop = defineComponent({
  name: 'BTDESIGNBackTop',
  inheritAttrs: false,
  props: {
    target: Function as PropType<() => BackTopTarget | null>,
    visibilityHeight: { type: Number, default: 400 },
    top: { type: Number, default: 0 },
    behavior: { type: String as PropType<'smooth' | 'auto'>, default: 'smooth' },
    shape: { type: String as PropType<'square' | 'circle'>, default: 'square' },
    variant: { type: String as PropType<'neutral' | 'primary'>, default: 'neutral' },
    content: { type: String as PropType<'arrow' | 'up' | 'top'>, default: 'arrow' },
    position: { type: String as PropType<'fixed' | 'inline'>, default: 'fixed' },
  },
  setup(props, { attrs, slots }) {
    const visible = ref(false);
    let container: BackTopTarget | null = null;
    const update = () => {
      if (!container) {
        visible.value = false;
        return;
      }
      visible.value =
        (container === window ? window.scrollY : (container as HTMLElement).scrollTop) >=
        Math.max(0, props.visibilityHeight);
    };
    const attach = () => {
      container?.removeEventListener('scroll', update);
      container = props.target ? props.target() : window;
      update();
      container?.addEventListener('scroll', update, { passive: true });
    };
    onMounted(attach);
    watch(() => props.target, attach);
    watch(() => props.visibilityHeight, update);
    onBeforeUnmount(() => container?.removeEventListener('scroll', update));
    return () =>
      visible.value
        ? h(
            'button',
            mergeProps(attrs, {
              type: 'button',
              'aria-label': attrs['aria-label'] ?? '返回顶部',
              class: [
                'f-back-top',
                `f-back-top--${props.shape}`,
                `f-back-top--${props.variant}`,
                `f-back-top--${props.position}`,
              ],
              onClick: (event: MouseEvent) => {
                if (event.defaultPrevented) return;
                const target = props.target ? props.target() : window;
                if (!target) return;
                const reduceMotion = window.matchMedia?.(
                  '(prefers-reduced-motion: reduce)',
                ).matches;
                target.scrollTo({
                  top: Math.max(0, props.top),
                  behavior: reduceMotion ? 'instant' : props.behavior,
                });
              },
            }),
            slots.default?.() ??
              (props.content === 'arrow'
                ? h('span', { 'aria-hidden': 'true' }, '↑')
                : props.content === 'up'
                  ? 'UP'
                  : 'TOP'),
          )
        : null;
  },
});

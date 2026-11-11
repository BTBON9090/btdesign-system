import { defineComponent, h, mergeProps, nextTick, ref, watch, type PropType } from 'vue';
import { useControlId } from './field.js';
import { useValue } from './enterprise-shared.js';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
export const Popover = defineComponent({
  name: 'BTDESIGNPopover',
  inheritAttrs: false,
  props: {
    id: String,
    triggerLabel: { type: String, default: '查看详情' },
    title: String,
    content: String,
    label: { type: String, default: '详情' },
    placement: { type: String as PropType<PopoverPlacement>, default: 'bottom' },
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    showArrow: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const generated = useControlId('popover');
    const root = ref<HTMLElement>();
    const button = ref<HTMLButtonElement>();
    const panel = ref<HTMLElement>();
    const state = useValue(
      () => props.modelValue,
      props.defaultOpen,
      (value) => emit('update:modelValue', value),
    );
    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled && state.value.value && props.modelValue === undefined) state.set(false);
      },
    );
    watch(
      () => state.value.value && !props.disabled,
      (visible, _, onCleanup) => {
        if (!visible || typeof document === 'undefined') return;
        let cancelled = false;
        const dismissOutside = (event: Event) => {
          if (event.target instanceof Node && !root.value?.contains(event.target)) state.set(false);
        };
        void nextTick(() => {
          if (cancelled) return;
          const candidates = panel.value?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
          );
          const first = Array.from(candidates ?? []).find(
            (element) => element.getClientRects().length > 0,
          );
          (first ?? panel.value)?.focus();
          document.addEventListener('pointerdown', dismissOutside);
          document.addEventListener('focusin', dismissOutside);
        });
        onCleanup(() => {
          cancelled = true;
          document.removeEventListener('pointerdown', dismissOutside);
          document.removeEventListener('focusin', dismissOutside);
          if (panel.value?.contains(document.activeElement)) button.value?.focus();
        });
      },
      { immediate: true },
    );
    return () => {
      const visible = state.value.value && !props.disabled;
      const panelId = `${props.id ?? generated}-panel`;
      const titleId = `${panelId}-title`;
      const title = slots.title?.() ?? props.title;
      return h(
        'div',
        mergeProps(attrs, {
          id: props.id,
          ref: root,
          class: 'f-popover',
          onKeydown: (event: KeyboardEvent) => {
            if (!event.defaultPrevented && event.key === 'Escape' && visible) {
              event.preventDefault();
              event.stopPropagation();
              state.set(false);
              button.value?.focus();
            }
          },
        }),
        [
          h(
            'button',
            {
              ref: button,
              type: 'button',
              class: 'f-popover-trigger',
              'aria-label': props.triggerLabel,
              'aria-haspopup': 'dialog',
              'aria-expanded': visible,
              'aria-controls': visible ? panelId : undefined,
              disabled: props.disabled,
              onClick: () => state.set(!visible),
            },
            slots.trigger?.() ?? props.triggerLabel,
          ),
          visible
            ? h(
                'div',
                {
                  ref: panel,
                  id: panelId,
                  class: [
                    'f-popover-panel',
                    `f-popover-panel--${props.placement}`,
                    props.showArrow && 'f-popover-panel--arrow',
                  ],
                  role: 'dialog',
                  'aria-labelledby': title != null ? titleId : undefined,
                  'aria-label': title == null ? props.label : undefined,
                  tabindex: -1,
                },
                [
                  title != null ? h('div', { id: titleId, class: 'f-popover-title' }, title) : null,
                  h('div', { class: 'f-popover-content' }, slots.default?.() ?? props.content),
                ],
              )
            : null,
        ],
      );
    };
  },
});

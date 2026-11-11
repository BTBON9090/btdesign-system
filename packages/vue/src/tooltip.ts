import {
  cloneVNode,
  Comment,
  computed,
  defineComponent,
  Fragment,
  Text,
  h,
  isVNode,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { useControlId } from './field.js';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** One focusable default-slot trigger; tooltip content must be noninteractive. */
export const Tooltip = defineComponent({
  name: 'BTDESIGNTooltip',
  inheritAttrs: false,
  props: {
    id: String,
    content: { type: [String, Number], default: '' },
    placement: { type: String as PropType<TooltipPlacement>, default: 'top' },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
  },
  emits: {
    'update:open': (_open: boolean) => true,
    openChange: (_open: boolean) => true,
  },
  setup(props, { attrs, slots, emit }) {
    const generatedId = useControlId('tooltip');
    const internalOpen = ref(props.defaultOpen);
    const active = computed(() => !props.disabled && (props.open ?? internalOpen.value));
    let pointerInside = false;
    let focusInside = false;
    let dismissed = false;
    const request = (next: boolean) => {
      if (next === active.value) return;
      if (props.open === undefined) internalOpen.value = next;
      emit('update:open', next);
      emit('openChange', next);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !active.value) return;
      dismissed = true;
      request(false);
    };
    watch(
      () => props.disabled,
      (disabled) => {
        if (!disabled) return;
        internalOpen.value = false;
        dismissed = false;
      },
    );
    onMounted(() => document.addEventListener('keydown', onKey, true));
    onBeforeUnmount(() => document.removeEventListener('keydown', onKey, true));
    return () => {
      const children = (slots.default?.() ?? []).filter(
        (child) =>
          child.type !== Comment &&
          !(child.type === Text && typeof child.children === 'string' && !child.children.trim()),
      );
      const trigger = children[0];
      if (children.length !== 1 || !isVNode(trigger) || trigger.type === Fragment)
        throw new Error('Tooltip requires one focusable trigger that forwards aria-describedby.');
      const id = props.id ?? generatedId;
      const describedBy = [
        ...new Set(
          [trigger.props?.['aria-describedby'], id]
            .filter((value): value is string => typeof value === 'string' && !!value)
            .flatMap((value) => value.split(/\s+/))
            .filter(Boolean),
        ),
      ].join(' ');
      return h(
        'span',
        mergeProps(attrs, {
          class: 'f-tooltip',
          onPointerenter: () => {
            if (props.disabled) return;
            pointerInside = true;
            if (!dismissed) request(true);
          },
          onPointerleave: () => {
            pointerInside = false;
            if (!focusInside) {
              dismissed = false;
              request(false);
            }
          },
          onFocusin: () => {
            if (props.disabled) return;
            focusInside = true;
            if (!dismissed) request(true);
          },
          onFocusout: (event: FocusEvent) => {
            if (
              event.relatedTarget &&
              event.currentTarget instanceof Node &&
              event.relatedTarget instanceof Node &&
              event.currentTarget.contains(event.relatedTarget)
            )
              return;
            focusInside = false;
            if (!pointerInside) {
              dismissed = false;
              request(false);
            }
          },
        }),
        [
          cloneVNode(trigger, { 'aria-describedby': describedBy }),
          h(
            'span',
            {
              id,
              role: 'tooltip',
              class: ['f-tooltip-content', `f-tooltip-content--${props.placement}`],
              hidden: !active.value,
            },
            slots.content?.() ?? props.content,
          ),
        ],
      );
    };
  },
});

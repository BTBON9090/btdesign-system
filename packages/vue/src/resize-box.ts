import { computed, defineComponent, h, mergeProps, ref, type PropType } from 'vue';
import { useControlId } from './field.js';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const ResizeBox = defineComponent({
  name: 'BTDESIGNResizeBox',
  inheritAttrs: false,
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    size: Number,
    defaultSize: { type: Number, default: 50 },
    min: { type: Number, default: 10 },
    max: { type: Number, default: 90 },
    step: { type: Number, default: 1 },
    disabled: Boolean,
    handleLabel: { type: String, default: '调整面板大小' },
  },
  emits: { 'update:size': (_value: number) => true },
  setup(props, { attrs, slots, emit }) {
    const id = useControlId('resize');
    const root = ref<HTMLElement>();
    const local = ref(props.defaultSize);
    let dragging: number | null = null;
    const lower = computed(() => clamp(Number.isFinite(props.min) ? props.min : 10, 0, 100));
    const upper = computed(() =>
      clamp(Number.isFinite(props.max) ? props.max : 90, lower.value, 100),
    );
    const current = computed(() =>
      clamp(
        Number.isFinite(props.size ?? local.value) ? (props.size ?? local.value) : 50,
        lower.value,
        upper.value,
      ),
    );
    const change = (next: number) => {
      const value = Math.round(clamp(next, lower.value, upper.value) * 100) / 100;
      if (value === current.value) return;
      if (props.size === undefined) local.value = value;
      emit('update:size', value);
    };
    const keydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      const increment = Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
      const increase = props.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const decrease = props.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const next =
        event.key === increase
          ? current.value + increment
          : event.key === decrease
            ? current.value - increment
            : event.key === 'Home'
              ? lower.value
              : event.key === 'End'
                ? upper.value
                : undefined;
      if (next !== undefined) {
        event.preventDefault();
        change(next);
      }
    };
    const pointerdown = (event: PointerEvent) => {
      if (props.disabled || event.button !== 0) return;
      event.preventDefault();
      (event.currentTarget as HTMLElement).focus();
      dragging = event.pointerId;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };
    const pointermove = (event: PointerEvent) => {
      if (props.disabled || dragging !== event.pointerId || !root.value) return;
      const rect = root.value.getBoundingClientRect();
      const handleRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const handleExtent =
        props.orientation === 'horizontal' ? handleRect.width : handleRect.height;
      const extent = (props.orientation === 'horizontal' ? rect.width : rect.height) - handleExtent;
      if (extent <= 0) return;
      change(
        (((props.orientation === 'horizontal'
          ? event.clientX - rect.left
          : event.clientY - rect.top) -
          handleExtent / 2) /
          extent) *
          100,
      );
    };
    const pointerup = (event: PointerEvent) => {
      if (dragging !== event.pointerId) return;
      dragging = null;
      const target = event.currentTarget as HTMLElement;
      if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    };
    return () =>
      h(
        'div',
        mergeProps(attrs, {
          ref: root,
          class: ['f-resize-box', `f-resize-box--${props.orientation}`],
        }),
        [
          h(
            'div',
            {
              id: `${id}-first`,
              class: 'f-resize-box-pane f-resize-box-pane--first',
              style: { flex: `${current.value} 1 0%` },
            },
            slots.first?.(),
          ),
          h('div', {
            class: 'f-resize-box-handle',
            role: 'separator',
            'aria-label': props.handleLabel,
            'aria-orientation': props.orientation === 'horizontal' ? 'vertical' : 'horizontal',
            'aria-controls': `${id}-first`,
            'aria-valuemin': lower.value,
            'aria-valuemax': upper.value,
            'aria-valuenow': current.value,
            'aria-disabled': props.disabled || undefined,
            tabindex: props.disabled ? -1 : 0,
            onKeydown: keydown,
            onPointerdown: pointerdown,
            onPointermove: pointermove,
            onPointerup: pointerup,
            onPointercancel: pointerup,
            onLostpointercapture: () => {
              dragging = null;
            },
          }),
          h(
            'div',
            {
              class: 'f-resize-box-pane f-resize-box-pane--second',
              style: { flex: `${100 - current.value} 1 0%` },
            },
            slots.second?.(),
          ),
        ],
      );
  },
});

import { computed, defineComponent, h, mergeProps, ref, type PropType, type VNodeChild } from 'vue';
import { useControlId } from './field.js';
import { useValue } from './enterprise-shared.js';

export interface CollapseItem {
  value: string;
  label: string;
  content?: VNodeChild;
  disabled?: boolean;
  extra?: VNodeChild;
}

export const Collapse = defineComponent({
  name: 'BTDESIGNCollapse',
  inheritAttrs: false,
  props: {
    id: String,
    items: { type: Array as PropType<CollapseItem[]>, required: true },
    modelValue: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    accordion: Boolean,
    disabled: Boolean,
    expandIconPosition: { type: String as PropType<'start' | 'end' | 'none'>, default: 'start' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const generated = useControlId('collapse');
    const root = ref<HTMLElement>();
    const state = useValue(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    );
    const open = computed(() =>
      props.accordion ? state.value.value.slice(0, 1) : state.value.value,
    );
    function moveFocus(event: KeyboardEvent) {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const buttons = Array.from(
        root.value?.querySelectorAll<HTMLButtonElement>('[data-collapse-trigger]:not(:disabled)') ??
          [],
      );
      const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
      if (index < 0 || !buttons.length) return;
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      event.preventDefault();
      buttons[next]?.focus();
    }
    return () =>
      h(
        'div',
        mergeProps(attrs, { id: props.id, ref: root, class: 'f-collapse' }),
        props.items.map((item, index) => {
          const expanded = open.value.includes(item.value);
          const trigger = `${props.id ?? generated}-trigger-${index}`;
          const panel = `${props.id ?? generated}-panel-${index}`;
          return h('div', { key: item.value, class: 'f-collapse-item' }, [
            h('div', { class: 'f-collapse-heading' }, [
              h('div', { role: 'heading', 'aria-level': 3, class: 'f-collapse-heading-inner' }, [
                h(
                  'button',
                  {
                    type: 'button',
                    id: trigger,
                    class: 'f-collapse-trigger',
                    'data-collapse-trigger': '',
                    'aria-expanded': expanded,
                    'aria-controls': panel,
                    disabled: props.disabled || item.disabled,
                    onKeydown: moveFocus,
                    onClick: () => {
                      const next = expanded
                        ? open.value.filter((key) => key !== item.value)
                        : props.accordion
                          ? [item.value]
                          : [...open.value, item.value];
                      state.set(next);
                    },
                  },
                  [
                    props.expandIconPosition !== 'none'
                      ? h('span', {
                          'aria-hidden': 'true',
                          class: [
                            'f-collapse-icon',
                            props.expandIconPosition === 'end' && 'f-collapse-icon--end',
                          ],
                        })
                      : null,
                    h('span', { class: 'f-collapse-label' }, item.label),
                  ],
                ),
              ]),
              item.extra != null || slots[`extra-${item.value}`]
                ? h(
                    'div',
                    { class: 'f-collapse-extra' },
                    [slots[`extra-${item.value}`]?.() ?? item.extra],
                  )
                : null,
            ]),
            h(
              'div',
              {
                id: panel,
                role: 'region',
                'aria-labelledby': trigger,
                class: 'f-collapse-panel',
                hidden: !expanded,
              },
              [slots[`content-${item.value}`]?.() ?? item.content],
            ),
          ]);
        }),
      );
  },
});

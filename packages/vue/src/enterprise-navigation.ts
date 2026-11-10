import { defineComponent, h, mergeProps, ref, nextTick } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import type { NavItem } from '@btdesign/engine';
import { safeHref } from '@btdesign/engine';
import { useControlId } from './field.js';
import { useDismiss } from './enterprise-shared.js';
function nav(name: string, layout: 'sidebar' | 'top') {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      items: { type: Array as PropType<NavItem[]>, required: true },
      activeKey: String,
      label: { type: String, default: '导航' },
      disabled: Boolean,
    },
    emits: ['select'],
    setup(props, { attrs, emit }) {
      const collapsed = ref<string[]>([]);
      const id = useControlId('nav');
      const render = (items: NavItem[], level = 0, parentDisabled = false): VNodeChild =>
        h(
          'ul',
          { class: 'f-nav-list' },
          items.map((item) => {
            const disabled = props.disabled || parentDisabled || item.disabled;
            const children = Boolean(item.children?.length);
            const closed = collapsed.value.includes(item.key);
            return h('li', { class: 'f-nav-item', key: item.key }, [
              children
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: 'f-nav-group-toggle',
                      disabled,
                      'aria-expanded': !closed,
                      'aria-controls': `${id}-${encodeURIComponent(item.key)}`,
                      onClick: () => {
                        if (!disabled)
                          collapsed.value = closed
                            ? collapsed.value.filter((k) => k !== item.key)
                            : [...collapsed.value, item.key];
                      },
                    },
                    [item.label, h('span', { 'aria-hidden': 'true' }, closed ? '›' : '⌄')],
                  )
                : safeHref(item.href) && !disabled
                  ? h(
                      'a',
                      {
                        href: safeHref(item.href),
                        class: 'f-nav-link',
                        'aria-current': props.activeKey === item.key ? 'page' : undefined,
                        onClick: () => emit('select', item.key),
                      },
                      item.label,
                    )
                  : h(
                      'button',
                      {
                        type: 'button',
                        class: 'f-nav-link',
                        disabled,
                        'aria-current': props.activeKey === item.key ? 'page' : undefined,
                        onClick: () => {
                          if (!disabled) emit('select', item.key);
                        },
                      },
                      item.label,
                    ),
              children && !closed
                ? h(
                    'div',
                    { id: `${id}-${encodeURIComponent(item.key)}`, class: 'f-nav-children' },
                    [render(item.children!, level + 1, Boolean(disabled))],
                  )
                : null,
            ]);
          }),
        );
      return () =>
        h(
          'nav',
          mergeProps(attrs, { class: ['f-nav', `f-nav--${layout}`], 'aria-label': props.label }),
          [render(props.items)],
        );
    },
  });
}
export const SidebarNav = nav('BTDESIGNSidebarNav', 'sidebar');
export const TopNav = nav('BTDESIGNTopNav', 'top');
export const DropdownMenu = defineComponent({
  name: 'BTDESIGNDropdownMenu',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<(NavItem & { separator?: boolean })[]>, required: true },
    label: { type: String, default: '更多操作' },
    disabled: Boolean,
  },
  emits: ['select'],
  setup(props, { attrs, emit, slots }) {
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const menu = ref<HTMLElement>();
    const open = ref(false);
    const id = useControlId('menu');
    const close = (restore = false) => {
      open.value = false;
      if (restore) nextTick(() => trigger.value?.focus());
    };
    useDismiss(root, open, () => close());
    const focus = (index: number) =>
      nextTick(() => {
        const nodes = menu.value?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([disabled])',
        );
        if (nodes?.length) nodes[(index + nodes.length) % nodes.length]?.focus();
      });
    const show = (last = false) => {
      if (props.disabled) return;
      open.value = true;
      focus(last ? -1 : 0);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      } else if (event.key === 'Tab') close();
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const nodes = Array.from(
          menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [],
        );
        const index = nodes.indexOf(event.target as HTMLElement);
        focus(
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? -1
              : index + (event.key === 'ArrowDown' ? 1 : -1),
        );
      }
    };
    return () =>
      h('div', mergeProps(attrs, { class: 'f-dropdown', ref: root }), [
        h(
          'button',
          {
            type: 'button',
            class: 'f-button f-button--secondary f-dropdown-trigger',
            ref: trigger,
            disabled: props.disabled,
            'aria-haspopup': 'menu',
            'aria-expanded': open.value,
            'aria-controls': open.value ? id : undefined,
            onClick: () => (open.value ? close() : show()),
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                show(e.key === 'ArrowUp');
              }
            },
          },
          slots.default?.() ?? [props.label, h('span', { 'aria-hidden': 'true' }, '⌄')],
        ),
        open.value
          ? h(
              'div',
              {
                id,
                role: 'menu',
                'aria-label': props.label,
                class: 'f-dropdown-menu f-overlay',
                ref: menu,
                onKeydown: key,
              },
              props.items.map((item) =>
                item.separator
                  ? h('div', { role: 'separator', class: 'f-menu-separator', key: item.key })
                  : h(
                      'button',
                      {
                        role: 'menuitem',
                        type: 'button',
                        class: 'f-menu-item',
                        disabled: item.disabled || props.disabled,
                        tabindex: -1,
                        key: item.key,
                        onClick: () => {
                          if (item.disabled || props.disabled) return;
                          emit('select', item.key);
                          close(true);
                        },
                      },
                      item.label,
                    ),
              ),
            )
          : null,
      ]);
  },
});

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
export type DropdownMenuItem = Omit<NavItem, 'children'> & {
  children?: DropdownMenuItem[];
  group?: boolean;
  danger?: boolean;
};
export const DropdownMenu = defineComponent({
  name: 'BTDESIGNDropdownMenu',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<DropdownMenuItem[]>, required: true },
    label: { type: String, default: '更多操作' },
    disabled: Boolean,
  },
  emits: ['select'],
  setup(props, { attrs, emit, slots }) {
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const open = ref(false);
    const chain = ref<string[]>([]);
    const menus = new Map<string, HTMLElement>();
    const menuItems = new Map<string, HTMLElement>();
    const id = useControlId('menu');
    const close = (restore = false) => {
      open.value = false;
      chain.value = [];
      if (restore) nextTick(() => trigger.value?.focus());
    };
    useDismiss(root, open, () => close());
    const focusMenu = (path: string, last = false) =>
      nextTick(() => {
        const menu = menus.get(path);
        const nodes = Array.from(
          menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? [],
        ).filter((node) => node.closest('[role="menu"]') === menu);
        (last ? nodes.at(-1) : nodes[0])?.focus();
      });
    const show = (last = false) => {
      if (props.disabled) return;
      chain.value = [];
      open.value = true;
      focusMenu('[]', last);
    };
    const openSubmenu = (path: string, depth: number) => {
      chain.value = [...chain.value.slice(0, depth), path];
      focusMenu(path);
    };
    const keydown = (event: KeyboardEvent, path: string, depth: number) => {
      if (event.key === 'Tab') {
        setTimeout(() => close(), 0);
        return;
      }
      if (event.key === 'Escape' || (event.key === 'ArrowLeft' && depth > 0)) {
        event.preventDefault();
        event.stopPropagation();
        if (depth === 0) close(true);
        else {
          const parent = chain.value[depth - 1];
          chain.value = chain.value.slice(0, depth - 1);
          nextTick(() => menuItems.get(parent)?.focus());
        }
        return;
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        const menu = menus.get(path);
        const nodes = Array.from(
          menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? [],
        ).filter((node) => node.closest('[role="menu"]') === menu);
        if (!nodes.length) return;
        const index = nodes.indexOf(document.activeElement as HTMLElement);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? nodes.length - 1
              : (index + (event.key === 'ArrowDown' ? 1 : -1) + nodes.length) % nodes.length;
        nodes[next]?.focus();
      }
    };
    const renderEntries = (
      entries: DropdownMenuItem[],
      parentPath: string[],
      depth: number,
      inheritedDisabled = false,
    ): VNodeChild =>
      entries.map((item) => {
        const path = [...parentPath, item.key];
        const pathId = JSON.stringify(path);
        const blocked = !!(props.disabled || inheritedDisabled || item.disabled);
        if (item.separator)
          return h('div', { key: item.key, role: 'separator', class: 'f-menu-separator' });
        if (item.group)
          return h(
            'div',
            { key: item.key, role: 'group', 'aria-label': item.label, class: 'f-menu-group' },
            [
              h('div', { class: 'f-menu-group-label' }, item.label),
              renderEntries(item.children ?? [], path, depth, blocked),
            ],
          );
        const hasChildren = !!item.children?.length;
        const expanded = chain.value[depth] === pathId;
        const href = !hasChildren && !blocked ? safeHref(item.href) : undefined;
        const control = h(
          href ? 'a' : 'button',
          {
            role: 'menuitem',
            tabindex: -1,
            class: 'f-menu-item',
            'data-danger': item.danger || undefined,
            ...(href ? { href } : { type: 'button', disabled: blocked }),
            'aria-haspopup': hasChildren ? 'menu' : undefined,
            'aria-expanded': hasChildren ? expanded : undefined,
            ref: (node: unknown) => {
              if (node) menuItems.set(pathId, node as HTMLElement);
              else menuItems.delete(pathId);
            },
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'ArrowRight' && hasChildren && !blocked) {
                event.preventDefault();
                event.stopPropagation();
                openSubmenu(pathId, depth);
              }
            },
            onClick: () => {
              if (blocked) return;
              if (hasChildren) openSubmenu(pathId, depth);
              else {
                emit('select', item.key);
                close(true);
              }
            },
          },
          [
            item.label,
            hasChildren
              ? h('span', { class: 'f-menu-submenu-arrow', 'aria-hidden': 'true' }, '›')
              : null,
          ],
        );
        return hasChildren
          ? h('div', { key: item.key, class: 'f-menu-submenu' }, [
              control,
              expanded ? renderMenu(item.children!, path, depth + 1, item.label) : null,
            ])
          : h('div', { key: item.key, class: 'f-menu-entry' }, [control]);
      });
    const renderMenu = (
      entries: DropdownMenuItem[],
      path: string[],
      depth: number,
      menuLabel: string,
    ): VNodeChild => {
      const pathId = JSON.stringify(path);
      return h(
        'div',
        {
          id: depth === 0 ? id : undefined,
          role: 'menu',
          'aria-label': menuLabel,
          class: ['f-dropdown-menu', 'f-overlay', depth > 0 && 'f-dropdown-submenu'],
          ref: (node: unknown) => {
            if (node) menus.set(pathId, node as HTMLElement);
            else menus.delete(pathId);
          },
          onKeydown: (event: KeyboardEvent) => keydown(event, pathId, depth),
        },
        [renderEntries(entries, path, depth)],
      );
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
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                show(event.key === 'ArrowUp');
              }
            },
          },
          slots.default?.() ?? [props.label, h('span', { 'aria-hidden': 'true' }, '⌄')],
        ),
        open.value ? renderMenu(props.items, [], 0, props.label) : null,
      ]);
  },
});

import {
  Comment,
  Fragment,
  Text,
  isVNode,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  mergeProps,
  ref,
  nextTick,
  watch,
} from 'vue';
import type { PropType, VNodeChild } from 'vue';
import type { NavItem } from '@btdesign/engine';
import { safeHref } from '@btdesign/engine';
import { useControlId } from './field.js';
import { useDismiss, useValue } from './enterprise-shared.js';

export type NavigationItem = Omit<NavItem, 'children'> & {
  children?: NavigationItem[];
  /** Explicitly opt a group with an href into a separate link and disclosure button. */
  parentLink?: boolean;
};
export type NavMenuItem = NavigationItem;
/** A blank slot must not hide the only visible label in compact mode. */
function hasVisibleIcon(content: unknown): boolean {
  if (Array.isArray(content)) return content.some(hasVisibleIcon);
  if (content == null || typeof content === 'boolean') return false;
  if (!isVNode(content)) return String(content).trim().length > 0;
  if (content.type === Comment) return false;
  if (content.type === Text)
    return typeof content.children === 'string' && content.children.trim().length > 0;
  if (content.type === Fragment) return hasVisibleIcon(content.children);
  return true;
}
function nav(name: string, layout: 'sidebar' | 'top') {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      items: { type: Array as PropType<NavigationItem[]>, required: true },
      activeKey: String,
      label: { type: String, default: '导航' },
      disabled: Boolean,
      expandedKeys: { type: Array as PropType<string[]>, default: undefined },
      defaultExpandedKeys: {
        type: Array as PropType<string[]>,
        default: undefined,
      },
      collapsed: { type: Boolean, default: undefined },
      defaultCollapsed: Boolean,
      showCollapseControl: Boolean,
    },
    emits: ['select', 'update:expandedKeys', 'update:collapsed'],
    setup(props, { attrs, emit, slots }) {
      const root = ref<HTMLElement>();
      const popup = ref<string>();
      const triggerRefs = new Map<string, HTMLButtonElement>();
      const itemRefs = new Map<string, HTMLElement>();
      const id = useControlId('nav');
      const defaultProvided = props.defaultExpandedKeys !== undefined;
      const exceptions = ref<string[]>([]);
      const expanded = useValue(
        () => props.expandedKeys,
        props.defaultExpandedKeys ?? [],
        (keys) => emit('update:expandedKeys', keys),
      );
      const collapsed = useValue(
        () => props.collapsed,
        props.defaultCollapsed,
        (value) => emit('update:collapsed', value),
      );
      const compact = computed(() => layout === 'sidebar' && collapsed.value.value);
      const legacy = computed(() => props.expandedKeys === undefined && !defaultProvided);
      const groupKeys = () => {
        const keys: string[] = [];
        const walk = (nodes: NavigationItem[]) =>
          nodes.forEach((node) => {
            if (node.children?.length) {
              keys.push(node.key);
              walk(node.children);
            }
          });
        walk(props.items);
        return keys;
      };
      const isExpanded = (key: string) =>
        legacy.value ? !exceptions.value.includes(key) : expanded.value.value.includes(key);
      const toggleGroup = (key: string) => {
        if (legacy.value) {
          exceptions.value = isExpanded(key)
            ? [...exceptions.value, key]
            : exceptions.value.filter((item) => item !== key);
          emit(
            'update:expandedKeys',
            groupKeys().filter((item) => !exceptions.value.includes(item)),
          );
        } else {
          const keys = expanded.value.value;
          expanded.set(isExpanded(key) ? keys.filter((item) => item !== key) : [...keys, key]);
        }
      };
      const closePopup = (restore = false) => {
        const previous = popup.value;
        popup.value = undefined;
        if (restore && previous) nextTick(() => triggerRefs.get(previous)?.focus());
      };
      useDismiss(
        root,
        computed(() => Boolean(popup.value)),
        () => closePopup(),
      );
      watch([compact, () => props.disabled], ([isCompact, disabled]) => {
        if (!isCompact || disabled) closePopup();
      });
      watch(
        () =>
          props.items.map(
            (item) => [item.key, item.disabled, Boolean(item.children?.length)] as const,
          ),
        (items) => {
          if (
            popup.value &&
            !items.some(
              ([key, disabled, hasChildren]) => key === popup.value && !disabled && hasChildren,
            )
          )
            closePopup();
        },
      );
      const render = (items: NavigationItem[], depth = 0, parentDisabled = false): VNodeChild =>
        h(
          'ul',
          { class: 'f-nav-list' },
          items.map((item) => {
            const blocked = Boolean(props.disabled || parentDisabled || item.disabled);
            const hasChildren = Boolean(item.children?.length);
            const topPopup = compact.value && depth === 0 && hasChildren;
            const open = topPopup ? popup.value === item.key : isExpanded(item.key);
            const contentId = `${id}-${encodeURIComponent(item.key)}`;
            const source = safeHref(item.href);
            const parentLink = hasChildren && item.parentLink === true && Boolean(source);
            const icons = slots.icon?.({ item, depth });
            const hasIcon = hasVisibleIcon(icons);
            const compactItem = compact.value && depth === 0;
            const contents = () => [
              hasIcon ? h('span', { class: 'f-nav-icon', 'aria-hidden': 'true' }, icons) : null,
              h(
                'span',
                {
                  class:
                    compactItem && hasIcon
                      ? 'f-nav-label f-nav-label--visually-hidden'
                      : 'f-nav-label',
                },
                item.label,
              ),
            ];
            const select = () => {
              if (!blocked) {
                emit('select', item.key);
              }
            };
            const link = () =>
              source && !blocked
                ? h(
                    'a',
                    {
                      class: 'f-nav-link',
                      href: source,
                      'aria-current': props.activeKey === item.key ? 'page' : undefined,
                      title: compactItem && hasIcon ? item.label : undefined,
                      onClick: select,
                    },
                    contents(),
                  )
                : h(
                    'button',
                    {
                      type: 'button',
                      class: 'f-nav-link',
                      disabled: blocked,
                      'aria-current': props.activeKey === item.key ? 'page' : undefined,
                      title: compactItem && hasIcon ? item.label : undefined,
                      onClick: select,
                    },
                    contents(),
                  );
            const button = hasChildren
              ? h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-nav-group-toggle',
                    disabled: blocked,
                    'aria-label': parentLink ? `${open ? '收起' : '展开'}${item.label}` : undefined,
                    'aria-expanded': open,
                    'aria-controls': open ? contentId : undefined,
                    title: compactItem && hasIcon ? item.label : undefined,
                    ref: (element: unknown) => {
                      if (element) triggerRefs.set(item.key, element as HTMLButtonElement);
                      else triggerRefs.delete(item.key);
                    },
                    onClick: () => {
                      if (blocked) return;
                      if (topPopup) popup.value = open ? undefined : item.key;
                      else toggleGroup(item.key);
                    },
                  },
                  [
                    parentLink ? null : contents(),
                    h('span', { 'aria-hidden': 'true' }, open ? '⌄' : '›'),
                  ],
                )
              : null;
            return h(
              'li',
              {
                class: ['f-nav-item', topPopup && 'f-nav-item--popup'],
                ref: topPopup
                  ? (element: unknown) => {
                      if (element) itemRefs.set(item.key, element as HTMLElement);
                      else itemRefs.delete(item.key);
                    }
                  : undefined,
                key: item.key,
              },
              [
                hasChildren
                  ? parentLink
                    ? h('div', { class: 'f-nav-parent' }, [link(), button])
                    : button
                  : link(),
                hasChildren && open
                  ? h(
                      'div',
                      {
                        id: contentId,
                        class: ['f-nav-children', topPopup && 'f-nav-children--popup'],
                      },
                      [render(item.children!, depth + 1, blocked)],
                    )
                  : null,
              ],
            );
          }),
        );
      return () =>
        h(
          'nav',
          mergeProps(attrs, {
            ref: root,
            class: ['f-nav', `f-nav--${layout}`, compact.value && 'f-nav--collapsed'],
            'aria-label': props.label,
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'Escape' && popup.value) {
                event.preventDefault();
                event.stopPropagation();
                closePopup(true);
              }
            },
            onFocusout: (event: FocusEvent) => {
              if (!popup.value) return;
              const next = event.relatedTarget as Node | null;
              if (!itemRefs.get(popup.value)?.contains(next)) closePopup();
            },
          }),
          [
            render(props.items),
            layout === 'sidebar' && props.showCollapseControl
              ? h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-nav-collapse-control f-button f-button--ghost',
                    disabled: props.disabled,
                    'aria-label': compact.value ? '展开侧栏' : '收起侧栏',
                    onClick: () => {
                      if (!props.disabled) collapsed.set(!collapsed.value.value);
                    },
                  },
                  compact.value ? '展开侧栏' : '收起侧栏',
                )
              : null,
          ],
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
  kind?: 'action' | 'checkbox';
};
export const DropdownMenu = defineComponent({
  name: 'BTDESIGNDropdownMenu',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<DropdownMenuItem[]>, required: true },
    label: { type: String, default: '更多操作' },
    disabled: Boolean,
    checkedKeys: { type: Array as PropType<string[]>, default: undefined },
    defaultCheckedKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    highlightedKeys: { type: Array as PropType<string[]>, default: () => [] },
    closeOnAction: { type: Boolean, default: true },
    closeOnCheck: { type: Boolean, default: false },
    triggerMode: {
      type: String as PropType<'single' | 'split'>,
      default: 'single',
    },
    primaryDisabled: Boolean,
    menuDisabled: Boolean,
  },
  emits: ['select', 'update:checkedKeys', 'primary-action'],
  setup(props, { attrs, emit, slots }) {
    const instance = getCurrentInstance();
    const onceConsumed = ref(false);
    const hasPrimaryListener = () =>
      Boolean(
        instance?.vnode.props?.onPrimaryAction ||
        (!onceConsumed.value && instance?.vnode.props?.onPrimaryActionOnce),
      );
    const checked = useValue(
      () => props.checkedKeys,
      props.defaultCheckedKeys,
      (keys) => emit('update:checkedKeys', keys),
    );
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
    watch(
      () => props.disabled || props.menuDisabled,
      (disabled) => {
        if (disabled && open.value) close();
      },
    );
    const focusMenu = (path: string, last = false) =>
      nextTick(() => {
        const menu = menus.get(path);
        const nodes = Array.from(
          menu?.querySelectorAll<HTMLElement>(
            '[role="menuitem"]:not(:disabled), [role="menuitemcheckbox"]:not(:disabled)',
          ) ?? [],
        ).filter((node) => node.closest('[role="menu"]') === menu);
        (last ? nodes.at(-1) : nodes[0])?.focus();
      });
    const show = (last = false) => {
      if (props.disabled || props.menuDisabled) return;
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
          menu?.querySelectorAll<HTMLElement>(
            '[role="menuitem"]:not(:disabled), [role="menuitemcheckbox"]:not(:disabled)',
          ) ?? [],
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
          return h('div', {
            key: item.key,
            role: 'separator',
            class: 'f-menu-separator',
          });
        if (item.group)
          return h(
            'div',
            {
              key: item.key,
              role: 'group',
              'aria-label': item.label,
              class: 'f-menu-group',
            },
            [
              h('div', { class: 'f-menu-group-label' }, item.label),
              renderEntries(item.children ?? [], path, depth, blocked),
            ],
          );
        const hasChildren = !!item.children?.length;
        const expanded = chain.value[depth] === pathId;
        const checkbox = item.kind === 'checkbox' && !hasChildren && item.href === undefined;
        const selected = checkbox && checked.value.value.includes(item.key);
        const href = !checkbox && !hasChildren && !blocked ? safeHref(item.href) : undefined;
        const control = h(
          href ? 'a' : 'button',
          {
            role: checkbox ? 'menuitemcheckbox' : 'menuitem',
            'aria-checked': checkbox ? selected : undefined,
            'data-highlighted': props.highlightedKeys.includes(item.key) || undefined,
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
              else if (checkbox) {
                const current = checked.value.value;
                checked.set(
                  selected ? current.filter((key) => key !== item.key) : [...current, item.key],
                );
                if (props.closeOnCheck) close(true);
              } else {
                emit('select', item.key);
                if (props.closeOnAction) close(true);
              }
            },
          },
          [
            checkbox
              ? h('span', { class: 'f-menu-check', 'aria-hidden': 'true' }, selected ? '✓' : '')
              : null,
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
      h(
        'div',
        mergeProps(attrs, {
          class: ['f-dropdown', props.triggerMode === 'split' && 'f-dropdown--split'],
          ref: root,
        }),
        [
          props.triggerMode === 'split'
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'f-button f-button--secondary f-dropdown-primary',
                  disabled: props.disabled || props.primaryDisabled || !hasPrimaryListener(),
                  onClick: () => {
                    if (!props.disabled && !props.primaryDisabled && hasPrimaryListener()) {
                      if (instance?.vnode.props?.onPrimaryActionOnce) onceConsumed.value = true;
                      emit('primary-action');
                    }
                  },
                },
                props.label,
              )
            : null,
          h(
            'button',
            {
              type: 'button',
              class: 'f-button f-button--secondary f-dropdown-trigger',
              ref: trigger,
              disabled: props.disabled || props.menuDisabled,
              'aria-haspopup': 'menu',
              'aria-label': props.triggerMode === 'split' ? `${props.label}菜单` : undefined,
              'aria-expanded': open.value,
              'aria-controls': open.value ? id : undefined,
              onClick: () => {
                if (!props.disabled && !props.menuDisabled) open.value ? close() : show();
              },
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  show(event.key === 'ArrowUp');
                }
              },
            },
            props.triggerMode === 'split'
              ? h('span', { 'aria-hidden': 'true' }, '⌄')
              : (slots.default?.() ?? [props.label, h('span', { 'aria-hidden': 'true' }, '⌄')]),
          ),
          open.value ? renderMenu(props.items, [], 0, props.label) : null,
        ],
      );
  },
});

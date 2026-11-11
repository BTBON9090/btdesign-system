import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { safeHref, type NavItem } from '@btdesign/engine';
import { cx, useControllable, usePopup } from './enterprise-utils.js';

export interface NavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: NavItem[];
  activeKey?: string;
  label?: string;
  disabled?: boolean;
  onSelect?: (key: string) => void;
}
function Navigation({
  items,
  activeKey,
  label,
  disabled,
  onSelect,
  className,
  orientation,
  ...props
}: NavigationProps & { orientation: 'sidebar' | 'top' }) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const render = (nodes: NavItem[], inheritedDisabled = false): React.ReactNode => (
    <ul className="f-nav-list">
      {nodes.map((item) => {
        const blocked = disabled || inheritedDisabled || item.disabled;
        return (
          <li key={item.key} className="f-nav-item">
            {item.children?.length ? (
              <>
                <button
                  type="button"
                  className="f-nav-group-toggle"
                  disabled={blocked}
                  aria-expanded={!collapsed.includes(item.key)}
                  onClick={() =>
                    setCollapsed((previous) =>
                      previous.includes(item.key)
                        ? previous.filter((key) => key !== item.key)
                        : [...previous, item.key],
                    )
                  }
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">{collapsed.includes(item.key) ? '›' : '⌄'}</span>
                </button>
                {!collapsed.includes(item.key) && (
                  <div className="f-nav-children">{render(item.children, !!blocked)}</div>
                )}
              </>
            ) : safeHref(item.href) && !blocked ? (
              <a
                className="f-nav-link"
                href={safeHref(item.href)}
                aria-current={activeKey === item.key ? 'page' : undefined}
                onClick={() => onSelect?.(item.key)}
              >
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                className="f-nav-link"
                disabled={blocked}
                aria-current={activeKey === item.key ? 'page' : undefined}
                onClick={() => onSelect?.(item.key)}
              >
                {item.label}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
  return (
    <nav
      {...props}
      className={cx('f-nav', `f-nav--${orientation}`, className)}
      aria-label={label ?? (orientation === 'sidebar' ? '侧边导航' : '顶部导航')}
    >
      {render(items)}
    </nav>
  );
}
export function SidebarNav(props: NavigationProps) {
  return <Navigation {...props} orientation="sidebar" />;
}
export function TopNav(props: NavigationProps) {
  return <Navigation {...props} orientation="top" />;
}
export type DropdownMenuItem = Omit<NavItem, 'children'> & {
  children?: DropdownMenuItem[];
  group?: boolean;
  danger?: boolean;
  /** Checkbox applies only to leaf items without href; conflicts retain action/submenu semantics. */
  kind?: 'action' | 'checkbox';
};
export interface DropdownMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: DropdownMenuItem[];
  label?: string;
  disabled?: boolean;
  onSelect?: (key: string) => void;
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheckedKeysChange?: (keys: string[]) => void;
  highlightedKeys?: string[];
  closeOnAction?: boolean;
  closeOnCheck?: boolean;
  triggerMode?: 'single' | 'split';
  primaryDisabled?: boolean;
  menuDisabled?: boolean;
  onPrimaryAction?: () => void;
}
export function DropdownMenu({
  items,
  label = '更多操作',
  disabled,
  onSelect,
  checkedKeys,
  defaultCheckedKeys = [],
  onCheckedKeysChange,
  highlightedKeys = [],
  closeOnAction = true,
  closeOnCheck = false,
  triggerMode = 'single',
  primaryDisabled = false,
  menuDisabled = false,
  onPrimaryAction,
  className,
  ...props
}: DropdownMenuProps) {
  const popup = usePopup(!!disabled || menuDisabled);
  const [checked, setChecked] = useControllable(
    checkedKeys,
    defaultCheckedKeys,
    onCheckedKeysChange,
  );
  const id = useId();
  const [chain, setChain] = useState<string[]>([]);
  const menus = useRef(new Map<string, HTMLDivElement>());
  const menuItems = useRef(new Map<string, HTMLElement>());
  const pending = useRef<{
    menu?: string;
    item?: string;
    last?: boolean;
  } | null>(null);
  const rootPath = '[]';
  const focusMenu = (path: string, last = false) => {
    const menu = menus.current.get(path);
    const nodes = Array.from(
      menu?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled), [role="menuitemcheckbox"]:not(:disabled)',
      ) ?? [],
    ).filter((node) => node.closest('[role="menu"]') === menu);
    (last ? nodes.at(-1) : nodes[0])?.focus();
  };
  useEffect(() => {
    if (!popup.open) return;
    const request = pending.current;
    pending.current = null;
    if (request?.item) menuItems.current.get(request.item)?.focus();
    else focusMenu(request?.menu ?? rootPath, request?.last);
  }, [popup.open, chain]);
  const openSubmenu = (path: string, depth: number) => {
    pending.current = { menu: path };
    setChain((previous) => [...previous.slice(0, depth), path]);
  };
  const keydown = (event: KeyboardEvent<HTMLDivElement>, menuPath: string, depth: number) => {
    if (event.key === 'Tab') {
      setTimeout(() => popup.close(), 0);
      return;
    }
    if (event.key === 'Escape' || (event.key === 'ArrowLeft' && depth > 0)) {
      event.preventDefault();
      event.stopPropagation();
      if (depth === 0) popup.close(true);
      else {
        pending.current = { item: chain[depth - 1] };
        setChain((previous) => previous.slice(0, depth - 1));
      }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      const menu = menus.current.get(menuPath);
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
  ): React.ReactNode =>
    entries.map((item) => {
      const path = [...parentPath, item.key];
      const pathId = JSON.stringify(path);
      const blocked = !!(disabled || menuDisabled || inheritedDisabled || item.disabled);
      if (item.separator)
        return <div key={item.key} role="separator" className="f-menu-separator" />;
      if (item.group)
        return (
          <div key={item.key} role="group" aria-label={item.label} className="f-menu-group">
            <div className="f-menu-group-label">{item.label}</div>
            {renderEntries(item.children ?? [], path, depth, blocked)}
          </div>
        );
      const hasChildren = !!item.children?.length;
      const checkable = item.kind === 'checkbox' && !hasChildren && item.href === undefined;
      const expanded = chain[depth] === pathId;
      const href = !hasChildren && !blocked ? safeHref(item.href) : undefined;
      const common = {
        role: checkable ? ('menuitemcheckbox' as const) : ('menuitem' as const),
        'aria-checked': checkable ? checked.includes(item.key) : undefined,
        tabIndex: -1,
        className: 'f-menu-item',
        'data-danger': item.danger || undefined,
        'data-highlighted': highlightedKeys.includes(item.key) || undefined,
        ref: (node: HTMLElement | null) => {
          if (node) menuItems.current.set(pathId, node);
          else menuItems.current.delete(pathId);
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'ArrowRight' && hasChildren && !blocked) {
            event.preventDefault();
            event.stopPropagation();
            openSubmenu(pathId, depth);
          }
        },
        onClick: () => {
          if (blocked) return;
          if (hasChildren) openSubmenu(pathId, depth);
          else if (checkable) {
            setChecked(
              checked.includes(item.key)
                ? checked.filter((key) => key !== item.key)
                : [...checked, item.key],
            );
            if (closeOnCheck) popup.close(true);
          } else {
            onSelect?.(item.key);
            if (closeOnAction) popup.close(true);
          }
        },
      };
      const content = (
        <>
          {checkable && (
            <span className="f-menu-check" aria-hidden="true">
              {checked.includes(item.key) ? '✓' : ''}
            </span>
          )}
          {item.label}
          {hasChildren && (
            <span className="f-menu-submenu-arrow" aria-hidden="true">
              ›
            </span>
          )}
        </>
      );
      const control = href ? (
        <a {...common} href={href}>
          {content}
        </a>
      ) : (
        <button
          {...common}
          type="button"
          disabled={blocked}
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-expanded={hasChildren ? expanded : undefined}
        >
          {content}
        </button>
      );
      return hasChildren ? (
        <div key={item.key} className="f-menu-submenu">
          {control}
          {expanded && renderMenu(item.children!, path, depth + 1, item.label)}
        </div>
      ) : (
        <React.Fragment key={item.key}>{control}</React.Fragment>
      );
    });
  function renderMenu(
    entries: DropdownMenuItem[],
    path: string[],
    depth: number,
    menuLabel: string,
  ): React.ReactNode {
    const pathId = JSON.stringify(path);
    return (
      <div
        id={depth === 0 ? id : undefined}
        ref={(node) => {
          if (node) menus.current.set(pathId, node);
          else menus.current.delete(pathId);
        }}
        role="menu"
        aria-label={menuLabel}
        className={cx('f-dropdown-menu', 'f-overlay', depth > 0 && 'f-dropdown-submenu')}
        onKeyDown={(event) => keydown(event, pathId, depth)}
      >
        {renderEntries(entries, path, depth)}
      </div>
    );
  }
  return (
    <div
      {...props}
      ref={popup.root}
      className={cx('f-dropdown', triggerMode === 'split' && 'f-dropdown--split', className)}
    >
      {triggerMode === 'split' && (
        <button
          type="button"
          className="f-dropdown-primary f-button f-button--secondary f-button--md"
          disabled={!!disabled || primaryDisabled || !onPrimaryAction}
          onClick={onPrimaryAction}
        >
          {label}
        </button>
      )}
      <button
        className="f-dropdown-trigger f-button f-button--secondary f-button--md"
        type="button"
        ref={popup.trigger}
        disabled={!!disabled || menuDisabled}
        aria-label={triggerMode === 'split' ? `${label}菜单` : undefined}
        aria-haspopup="menu"
        aria-expanded={popup.open}
        aria-controls={popup.open ? id : undefined}
        onClick={() => {
          if (popup.open) popup.close();
          else {
            pending.current = { menu: rootPath };
            setChain([]);
            popup.setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            pending.current = { menu: rootPath, last: event.key === 'ArrowUp' };
            setChain([]);
            popup.setOpen(true);
          }
        }}
      >
        {triggerMode === 'single' && label}
        <span aria-hidden="true">⌄</span>
      </button>
      {popup.open && renderMenu(items, [], 0, label)}
    </div>
  );
}

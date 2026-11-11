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

/** Keys must be stable and unique throughout the navigation tree. */
export type NavMenuItem = Omit<NavItem, 'children'> & {
  children?: NavMenuItem[];
  /** Opt in to a separate parent link; disclosure remains an independent button. */
  parentLink?: boolean;
};
export interface NavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: NavMenuItem[];
  activeKey?: string;
  label?: string;
  disabled?: boolean;
  onSelect?: (key: string) => void;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  /** Decorative non-interactive content only; item.label remains the accessible name. */
  renderIcon?: (item: NavMenuItem, depth: number) => React.ReactNode;
}
export interface SidebarNavProps extends NavigationProps {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  showCollapseControl?: boolean;
}
function hasDecorativeIcon(node: React.ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false;
  if (typeof node === 'string') return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasDecorativeIcon);
  if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === React.Fragment)
    return hasDecorativeIcon(node.props.children);
  return true;
}
function branchKeys(items: NavMenuItem[]): string[] {
  return items.flatMap((item) =>
    item.children?.length ? [item.key, ...branchKeys(item.children)] : [],
  );
}
function Navigation({
  items,
  activeKey,
  label,
  disabled,
  onSelect,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  renderIcon,
  className,
  orientation,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  showCollapseControl = false,
  ...props
}: SidebarNavProps & { orientation: 'sidebar' | 'top' }) {
  // The legacy default uses collapsed exceptions so newly added groups are open as before.
  const implicit = useRef(defaultExpandedKeys === undefined);
  const [closed, setClosed] = useState<string[]>([]);
  const [localExpanded, setLocalExpanded] = useState(defaultExpandedKeys ?? []);
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed);
  const [flyout, setFlyout] = useState<string | null>(null);
  const nav = useRef<HTMLElement>(null);
  const flyoutButtons = useRef(new Map<string, HTMLButtonElement>());
  const id = useId();
  const isCollapsed = orientation === 'sidebar' && (collapsed ?? localCollapsed);
  const allBranches = branchKeys(items);
  const expanded =
    expandedKeys ??
    (implicit.current ? allBranches.filter((key) => !closed.includes(key)) : localExpanded);
  const changeExpanded = (key: string) => {
    const wasExpanded = expanded.includes(key);
    const next = wasExpanded ? expanded.filter((value) => value !== key) : [...expanded, key];
    if (expandedKeys === undefined) {
      if (implicit.current)
        setClosed((previous) =>
          wasExpanded ? [...previous, key] : previous.filter((value) => value !== key),
        );
      else setLocalExpanded(next);
    }
    onExpandedChange?.(next);
  };
  const changeCollapsed = () => {
    if (disabled) return;
    const next = !isCollapsed;
    if (collapsed === undefined) setLocalCollapsed(next);
    onCollapsedChange?.(next);
  };
  useEffect(() => {
    if (!isCollapsed || disabled) setFlyout(null);
  }, [isCollapsed, disabled]);
  useEffect(() => {
    if (
      flyout &&
      !items.some((item) => item.key === flyout && !item.disabled && item.children?.length)
    )
      setFlyout(null);
  }, [flyout, items]);
  useEffect(() => {
    if (!flyout) return;
    const close = (event: PointerEvent) => {
      const group = flyoutButtons.current.get(flyout)?.closest('.f-nav-item');
      if (event.target instanceof Node && !group?.contains(event.target)) setFlyout(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [flyout]);
  const render = (nodes: NavMenuItem[], depth = 0, inheritedDisabled = false): React.ReactNode => (
    <ul className="f-nav-list">
      {nodes.map((item) => {
        const pathId = item.key;
        const blocked = !!(disabled || inheritedDisabled || item.disabled);
        const hasChildren = !!item.children?.length;
        const icon = renderIcon?.(item, depth);
        const hasIcon = hasDecorativeIcon(icon);
        const compactItem = isCollapsed && depth === 0;
        const flyoutItem = compactItem && hasChildren;
        const open = flyoutItem ? flyout === pathId : expanded.includes(item.key);
        const panelId = `${id}-nav-${encodeURIComponent(pathId)}`;
        const safeLink = !blocked ? safeHref(item.href) : undefined;
        const content = (
          <>
            {hasIcon && (
              <span className="f-nav-icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <span
              className={cx(
                'f-nav-label',
                compactItem && hasIcon && 'f-nav-label--visually-hidden',
              )}
            >
              {item.label}
            </span>
          </>
        );
        const select = () => {
          if (!blocked) onSelect?.(item.key);
        };
        const groupButton = (
          <button
            type="button"
            className="f-nav-group-toggle"
            title={compactItem && hasIcon ? item.label : undefined}
            disabled={blocked}
            ref={
              flyoutItem
                ? (node) => {
                    if (node) flyoutButtons.current.set(pathId, node);
                    else flyoutButtons.current.delete(pathId);
                  }
                : undefined
            }
            aria-label={
              item.parentLink && safeLink ? `${open ? '收起' : '展开'}${item.label}` : undefined
            }
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={() => {
              if (blocked) return;
              if (flyoutItem) setFlyout(open ? null : pathId);
              else changeExpanded(item.key);
            }}
          >
            {!(item.parentLink && safeLink) && content}
            <span aria-hidden="true">{open ? '⌄' : '›'}</span>
          </button>
        );
        const control = hasChildren ? (
          item.parentLink && safeLink ? (
            <div className="f-nav-parent">
              <a
                className="f-nav-link f-nav-parent-link"
                title={compactItem && hasIcon ? item.label : undefined}
                href={safeLink}
                aria-current={activeKey === item.key ? 'page' : undefined}
                onClick={select}
              >
                {content}
              </a>
              {groupButton}
            </div>
          ) : (
            groupButton
          )
        ) : safeLink ? (
          <a
            className="f-nav-link"
            title={compactItem && hasIcon ? item.label : undefined}
            href={safeLink}
            aria-current={activeKey === item.key ? 'page' : undefined}
            onClick={select}
          >
            {content}
          </a>
        ) : (
          <button
            type="button"
            className="f-nav-link"
            title={compactItem && hasIcon ? item.label : undefined}
            disabled={blocked}
            aria-current={activeKey === item.key ? 'page' : undefined}
            onClick={select}
          >
            {content}
          </button>
        );
        return (
          <li key={item.key} className={cx('f-nav-item', flyoutItem && 'f-nav-item--popup')}>
            {control}
            {hasChildren && open && (
              <div
                id={panelId}
                className={cx('f-nav-children', flyoutItem && 'f-nav-children--popup')}
              >
                {render(item.children!, depth + 1, blocked)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
  return (
    <nav
      {...props}
      ref={nav}
      className={cx('f-nav', `f-nav--${orientation}`, isCollapsed && 'f-nav--collapsed', className)}
      aria-label={label ?? (orientation === 'sidebar' ? '侧边导航' : '顶部导航')}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === 'Escape' && flyout) {
          event.preventDefault();
          event.stopPropagation();
          const target = flyoutButtons.current.get(flyout);
          setFlyout(null);
          target?.focus();
        }
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        if (flyout) {
          const group = flyoutButtons.current.get(flyout)?.closest('.f-nav-item');
          if (!(event.relatedTarget instanceof Node && group?.contains(event.relatedTarget)))
            setFlyout(null);
        }
      }}
    >
      {render(items)}
      {orientation === 'sidebar' && showCollapseControl && (
        <button
          type="button"
          className="f-nav-collapse-control f-button f-button--ghost"
          disabled={disabled}
          onClick={changeCollapsed}
        >
          {isCollapsed ? '展开侧栏' : '收起侧栏'}
        </button>
      )}
    </nav>
  );
}
export function SidebarNav(props: SidebarNavProps) {
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

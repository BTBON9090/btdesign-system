import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import { safeHref, type NavItem } from '@btdesign/engine';
import { cx, moveFocus, usePopup } from './enterprise-utils.js';

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
export interface DropdownMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: (NavItem & { separator?: boolean; danger?: boolean })[];
  label?: string;
  disabled?: boolean;
  onSelect?: (key: string) => void;
}
export function DropdownMenu({
  items,
  label = '更多操作',
  disabled,
  onSelect,
  className,
  ...props
}: DropdownMenuProps) {
  const popup = usePopup(!!disabled);
  const id = useId();
  const lastRequested = useRef(false);
  useEffect(() => {
    if (popup.open) {
      const items = Array.from(
        popup.panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ??
          [],
      );
      (lastRequested.current ? items.at(-1) : items[0])?.focus();
      lastRequested.current = false;
    }
  }, [popup.open]);
  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      popup.close(true);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      moveFocus(event.currentTarget, '[role="menuitem"]', event.key);
    } else if (event.key === 'Tab') popup.close(true);
  };
  return (
    <div {...props} ref={popup.root} className={cx('f-dropdown', className)}>
      <button
        className="f-dropdown-trigger f-button f-button--secondary f-button--md"
        type="button"
        ref={popup.trigger}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={popup.open}
        aria-controls={popup.open ? id : undefined}
        onClick={() => popup.setOpen(!popup.open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            lastRequested.current = event.key === 'ArrowUp';
            popup.setOpen(true);
          }
        }}
      >
        {label}
        <span aria-hidden="true">⌄</span>
      </button>
      {popup.open && (
        <div
          id={id}
          ref={popup.panel}
          role="menu"
          aria-label={label}
          className="f-dropdown-menu f-overlay"
          onKeyDown={keydown}
        >
          {items.map((item) =>
            item.separator ? (
              <div key={item.key} role="separator" className="f-menu-separator" />
            ) : safeHref(item.href) && !item.disabled ? (
              <a
                key={item.key}
                role="menuitem"
                tabIndex={-1}
                className="f-menu-item"
                href={safeHref(item.href)}
                onClick={() => {
                  onSelect?.(item.key);
                  popup.close(true);
                }}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.key}
                role="menuitem"
                tabIndex={-1}
                className="f-menu-item"
                type="button"
                disabled={item.disabled}
                data-danger={item.danger || undefined}
                onClick={() => {
                  if (item.disabled) return;
                  onSelect?.(item.key);
                  popup.close(true);
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

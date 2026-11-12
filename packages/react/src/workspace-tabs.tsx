import {
  Fragment,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { safeHref } from '@btdesign/engine';
import {
  workspaceItemIsVisible,
  workspaceRevealDistance,
  workspaceScrollDistance,
  workspaceScrollState,
  type WorkspaceScrollState,
} from './workspace-tabs-utils.js';

export interface WorkspaceTabItem {
  key: string;
  label: string;
  href?: string;
  disabled?: boolean;
  closable?: boolean;
}
export interface WorkspaceTabsProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'onSelect' | 'onClose'
> {
  items: WorkspaceTabItem[];
  activeKey: string | null;
  label?: string;
  onSelect?: (key: string) => void;
  onClose?: (key: string) => void;
  more?: ReactNode;
}
function hasContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false;
  if (typeof node === 'string') return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasContent);
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment)
    return hasContent(node.props.children);
  return true;
}
const noOverflow: WorkspaceScrollState = { overflow: false, canPrevious: false, canNext: false };
/** A controlled navigation list. Closing and selection remain application decisions. */
export const WorkspaceTabs = forwardRef<HTMLElement, WorkspaceTabsProps>(function WorkspaceTabs(
  { items, activeKey, label = '工作区标签', onSelect, onClose, more, className, ...props },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const previousButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const links = useRef(new Map<string, HTMLElement>());
  const pendingClose = useRef<{
    key: string;
    index: number;
    keys: string[];
    button: HTMLButtonElement;
  } | null>(null);
  const activeSeen = useRef<{ key: string | null; node?: HTMLElement }>({ key: null });
  const pendingReveal = useRef<HTMLElement | null>(null);
  const activeWasVisible = useRef(false);
  const observedSize = useRef<{ width: number; scrollWidth: number; listWidth: number } | null>(
    null,
  );
  const userIntent = useRef(false);
  const intentFrame = useRef<number | null>(null);
  const [scroll, setScroll] = useState<WorkspaceScrollState>(noOverflow);
  const measure = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const next = workspaceScrollState({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      scrollLeft: element.scrollLeft,
      direction: getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr',
    });
    setScroll((previous) =>
      previous.overflow === next.overflow &&
      previous.canPrevious === next.canPrevious &&
      previous.canNext === next.canNext
        ? previous
        : next,
    );
  }, []);
  useEffect(() => {
    measure();
  });
  const geometry = useCallback((node: HTMLElement) => {
    const element = viewport.current;
    if (!element || !element.clientWidth) return undefined;
    const state = workspaceScrollState({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      scrollLeft: element.scrollLeft,
      direction: getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr',
    });
    if (state.overflow && (!previousButton.current || !nextButton.current)) return undefined;
    const area = element.getBoundingClientRect();
    const target = (node.closest('.f-workspace-tabs-item') ?? node).getBoundingClientRect();
    let leftInset = 0,
      rightInset = 0;
    for (const [button, enabled] of [
      [previousButton.current, state.canPrevious],
      [nextButton.current, state.canNext],
    ] as const) {
      if (!button || !enabled) continue;
      const rect = button.getBoundingClientRect();
      if (
        rect.bottom <= area.top ||
        rect.top >= area.bottom ||
        rect.right <= area.left ||
        rect.left >= area.right
      )
        continue;
      if ((rect.left + rect.right) / 2 <= (area.left + area.right) / 2)
        leftInset = Math.max(leftInset, Math.min(area.right, rect.right) - area.left);
      else rightInset = Math.max(rightInset, area.right - Math.max(area.left, rect.left));
    }
    return { area, target, leftInset, rightInset };
  }, []);
  const captureVisibility = useCallback(() => {
    const node = activeSeen.current.node;
    if (!node) {
      activeWasVisible.current = false;
      return;
    }
    const bounds = geometry(node);
    if (!bounds) return;
    const { area, target, leftInset, rightInset } = bounds;
    activeWasVisible.current = workspaceItemIsVisible(area, target, leftInset, rightInset);
  }, [geometry]);
  const reveal = useCallback(
    (node: HTMLElement) => {
      const element = viewport.current;
      if (!element) return;
      const bounds = geometry(node);
      if (!bounds) {
        pendingReveal.current = node;
        return;
      }
      if (pendingReveal.current === node) pendingReveal.current = null;
      const left = workspaceRevealDistance(
        bounds.area,
        bounds.target,
        bounds.leftInset,
        bounds.rightInset,
      );
      if (left) {
        if (typeof element.scrollBy === 'function') element.scrollBy({ left, behavior: 'auto' });
        else element.scrollLeft += left;
        measure();
      }
      if (activeSeen.current.node === node) captureVisibility();
    },
    [captureVisibility, geometry, measure],
  );
  const markUserIntent = useCallback(() => {
    userIntent.current = true;
    pendingReveal.current = null;
    if (intentFrame.current !== null) cancelAnimationFrame(intentFrame.current);
    intentFrame.current = requestAnimationFrame(() => {
      userIntent.current = false;
      intentFrame.current = null;
    });
  }, []);
  useEffect(() => {
    const pending = pendingClose.current;
    if (pending) {
      if (items.some((item) => item.key === pending.key)) {
        if (document.activeElement !== pending.button) pendingClose.current = null;
      } else {
        pendingClose.current = null;
        if (!pending.button.isConnected && document.activeElement === document.body) {
          const candidates = [
            ...pending.keys.slice(pending.index + 1),
            ...pending.keys.slice(0, pending.index).reverse(),
          ];
          const target = candidates
            .map((key) => ({
              item: items.find((item) => item.key === key),
              node: links.current.get(key),
            }))
            .find(({ item, node }) => item && !item.disabled && node);
          if (target?.node) {
            try {
              target.node.focus({ preventScroll: true });
            } catch {
              target.node.focus();
            }
            reveal(target.node);
          }
        }
      }
    }
    const node = activeKey === null ? undefined : links.current.get(activeKey);
    if (activeSeen.current.key !== activeKey || activeSeen.current.node !== node) {
      activeSeen.current = { key: activeKey, node };
      activeWasVisible.current = false;
      pendingReveal.current = null;
      if (node) reveal(node);
    } else if (pendingReveal.current && pendingReveal.current === node) reveal(node);
  });
  useEffect(
    () => () => {
      pendingClose.current = null;
    },
    [],
  );

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const dimensions = () => ({
      width: element.clientWidth,
      scrollWidth: element.scrollWidth,
      listWidth: list.current?.getBoundingClientRect().width ?? 0,
    });
    observedSize.current = dimensions();
    const handleScroll = () => {
      const before = observedSize.current,
        now = dimensions();
      const sizeChanged =
        !!before &&
        (before.width !== now.width ||
          before.scrollWidth !== now.scrollWidth ||
          before.listWidth !== now.listWidth);
      measure();
      // A resize can clamp scrollLeft before ResizeObserver fires; preserve its pre-resize snapshot.
      if (!sizeChanged || userIntent.current) captureVisibility();
    };
    const resize = () => {
      const before = observedSize.current,
        now = dimensions();
      const sizeChanged =
        !!before &&
        (before.width !== now.width ||
          before.scrollWidth !== now.scrollWidth ||
          before.listWidth !== now.listWidth);
      observedSize.current = now;
      measure();
      const node = activeSeen.current.node;
      if (pendingReveal.current && pendingReveal.current === node) reveal(pendingReveal.current);
      else if (sizeChanged && activeWasVisible.current && !userIntent.current && node) reveal(node);
      else if (sizeChanged && userIntent.current) captureVisibility();
    };
    element.addEventListener('scroll', handleScroll, { passive: true });
    element.addEventListener('wheel', markUserIntent, { passive: true });
    element.addEventListener('touchstart', markUserIntent, { passive: true });
    element.addEventListener('pointerdown', markUserIntent, { passive: true });
    element.addEventListener('keydown', markUserIntent);
    window.addEventListener('resize', resize);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
    observer?.observe(element);
    if (list.current) observer?.observe(list.current);
    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('wheel', markUserIntent);
      element.removeEventListener('touchstart', markUserIntent);
      element.removeEventListener('pointerdown', markUserIntent);
      element.removeEventListener('keydown', markUserIntent);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
      if (intentFrame.current !== null) cancelAnimationFrame(intentFrame.current);
    };
  }, [captureVisibility, markUserIntent, measure, reveal]);
  const move = (direction: 'previous' | 'next') => {
    const element = viewport.current;
    if (!element) return;
    markUserIntent();
    const left = workspaceScrollDistance(element.clientWidth, direction);
    if (typeof element.scrollBy === 'function') element.scrollBy({ left, behavior: 'auto' });
    else element.scrollLeft += left;
    measure();
  };
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={label}
      className={['f-workspace-tabs', className].filter(Boolean).join(' ')}
    >
      {scroll.overflow && (
        <button
          type="button"
          className="f-workspace-tabs-scroll f-workspace-tabs-scroll--previous f-button f-button--ghost"
          ref={previousButton}
          aria-label="向左滚动标签"
          disabled={!scroll.canPrevious}
          onClick={() => move('previous')}
        >
          <span aria-hidden="true">‹</span>
        </button>
      )}
      <div className="f-workspace-tabs-viewport" ref={viewport}>
        <ul className="f-workspace-tabs-list" ref={list}>
          {items.map((item, index) => {
            const href = !item.disabled ? safeHref(item.href) : undefined;
            const current = activeKey === item.key ? 'page' : undefined;
            return (
              <li key={item.key} className="f-workspace-tabs-item">
                {href ? (
                  <a
                    className="f-workspace-tabs-link"
                    ref={(node) => {
                      if (node) links.current.set(item.key, node);
                      else links.current.delete(item.key);
                    }}
                    href={href}
                    aria-current={current}
                    onClick={() => onSelect?.(item.key)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="f-workspace-tabs-link"
                    ref={(node) => {
                      if (node) links.current.set(item.key, node);
                      else links.current.delete(item.key);
                    }}
                    disabled={item.disabled}
                    aria-current={current}
                    onClick={() => {
                      if (!item.disabled) onSelect?.(item.key);
                    }}
                  >
                    {item.label}
                  </button>
                )}
                {item.closable && onClose && (
                  <button
                    type="button"
                    className="f-workspace-tabs-close f-button f-button--ghost"
                    disabled={item.disabled}
                    aria-label={`关闭${item.label}`}
                    onClick={(event) => {
                      if (item.disabled) return;
                      pendingClose.current =
                        document.activeElement === event.currentTarget
                          ? {
                              key: item.key,
                              index,
                              keys: items.map((entry) => entry.key),
                              button: event.currentTarget,
                            }
                          : null;
                      onClose(item.key);
                    }}
                    onBlur={(event) => {
                      if (pendingClose.current?.button === event.currentTarget)
                        pendingClose.current = null;
                    }}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {scroll.overflow && (
        <button
          type="button"
          className="f-workspace-tabs-scroll f-workspace-tabs-scroll--next f-button f-button--ghost"
          ref={nextButton}
          aria-label="向右滚动标签"
          disabled={!scroll.canNext}
          onClick={() => move('next')}
        >
          <span aria-hidden="true">›</span>
        </button>
      )}
      {hasContent(more) && <div className="f-workspace-tabs-more">{more}</div>}
    </nav>
  );
});

import { useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx, useControllable } from './enterprise-utils.js';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
export interface PopoverProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'content' | 'onChange'
> {
  trigger: ReactNode;
  triggerLabel?: string;
  title?: ReactNode;
  content: ReactNode;
  label?: string;
  placement?: PopoverPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  showArrow?: boolean;
}

/** Nonmodal, interactive popover. Position is explicit and does not auto-flip. */
export function Popover({
  trigger,
  triggerLabel,
  title,
  content,
  label = '详情',
  placement = 'bottom',
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  showArrow = true,
  className,
  id,
  ...attrs
}: PopoverProps) {
  const generated = useId();
  const panelId = `${id ?? `bt-popover-${generated}`}-panel`;
  const titleId = `${panelId}-title`;
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [requested, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const visible = requested && !disabled;
  const latestClose = useRef(setOpen);
  latestClose.current = setOpen;
  useEffect(() => {
    if (disabled && requested && open === undefined) latestClose.current(false);
  }, [disabled, requested, open]);
  useEffect(() => {
    if (!visible) return;
    const rootElement = root.current;
    const panelElement = panel.current;
    const triggerElement = button.current;
    const candidates = panelElement?.querySelectorAll<HTMLElement>(
      'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
    );
    const first = Array.from(candidates ?? []).find(
      (element) => element.getClientRects().length > 0,
    );
    (first ?? panelElement)?.focus();
    const dismissOutside = (event: Event) => {
      if (event.target instanceof Node && !rootElement?.contains(event.target))
        latestClose.current(false);
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      if (panelElement?.contains(document.activeElement)) triggerElement?.focus();
    };
  }, [visible]);
  return (
    <div
      {...attrs}
      id={id}
      ref={root}
      className={cx('f-popover', className)}
      onKeyDown={(event) => {
        attrs.onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === 'Escape' && visible) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        className="f-popover-trigger"
        aria-label={triggerLabel ?? (typeof trigger === 'string' ? undefined : '打开详情')}
        aria-haspopup="dialog"
        aria-expanded={visible}
        aria-controls={visible ? panelId : undefined}
        disabled={disabled}
        onClick={() => setOpen(!visible)}
      >
        {trigger}
      </button>
      {visible && (
        <div
          ref={panel}
          id={panelId}
          className={cx(
            'f-popover-panel',
            `f-popover-panel--${placement}`,
            showArrow && 'f-popover-panel--arrow',
          )}
          role="dialog"
          aria-labelledby={title != null ? titleId : undefined}
          aria-label={title == null ? label : undefined}
          tabIndex={-1}
        >
          {title != null && (
            <div id={titleId} className="f-popover-title">
              {title}
            </div>
          )}
          <div className="f-popover-content">{content}</div>
        </div>
      )}
    </div>
  );
}

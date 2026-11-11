import { useId, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx, useControllable } from './enterprise-utils.js';

export interface CollapseItem {
  value: string;
  label: string;
  content?: ReactNode;
  disabled?: boolean;
  extra?: ReactNode;
}
export interface CollapseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  items: CollapseItem[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  accordion?: boolean;
  disabled?: boolean;
  expandIconPosition?: 'start' | 'end' | 'none';
}

/** Data-driven accordion. Values must be unique within one Collapse. */
export function Collapse({
  items,
  value,
  defaultValue = [],
  onValueChange,
  accordion = false,
  disabled = false,
  expandIconPosition = 'start',
  className,
  id,
  ...attrs
}: CollapseProps) {
  const generated = useId();
  const base = id ?? `bt-collapse-${generated}`;
  const root = useRef<HTMLDivElement>(null);
  const [selected, update] = useControllable(value, defaultValue, onValueChange);
  const open = accordion ? selected.slice(0, 1) : selected;
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(
      root.current?.querySelectorAll<HTMLButtonElement>('[data-collapse-trigger]:not(:disabled)') ??
        [],
    );
    const index = buttons.indexOf(event.currentTarget);
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
  return (
    <div {...attrs} id={id} ref={root} className={cx('f-collapse', className)}>
      {items.map((item, index) => {
        const expanded = open.includes(item.value);
        const trigger = `${base}-trigger-${index}`;
        const panel = `${base}-panel-${index}`;
        return (
          <div key={item.value} className="f-collapse-item">
            <div className="f-collapse-heading">
              <div role="heading" aria-level={3} className="f-collapse-heading-inner">
                <button
                  type="button"
                  id={trigger}
                  className="f-collapse-trigger"
                  data-collapse-trigger=""
                  aria-expanded={expanded}
                  aria-controls={panel}
                  disabled={disabled || item.disabled}
                  onKeyDown={moveFocus}
                  onClick={() => {
                    const next = expanded
                      ? open.filter((key) => key !== item.value)
                      : accordion
                        ? [item.value]
                        : [...open, item.value];
                    update(next);
                  }}
                >
                  {expandIconPosition !== 'none' && (
                    <span
                      aria-hidden="true"
                      className={cx(
                        'f-collapse-icon',
                        expandIconPosition === 'end' && 'f-collapse-icon--end',
                      )}
                    />
                  )}
                  <span className="f-collapse-label">{item.label}</span>
                </button>
              </div>
              {item.extra != null && <div className="f-collapse-extra">{item.extra}</div>}
            </div>
            <div
              id={panel}
              role="region"
              aria-labelledby={trigger}
              className="f-collapse-panel"
              hidden={!expanded}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

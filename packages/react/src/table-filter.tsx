import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ChoiceOption, TableNumberRange } from '@btdesign/engine';

interface TableFilterProps {
  title: string;
  mode: 'multiple' | 'numberRange';
  options?: ChoiceOption[];
  selected?: string | string[];
  range?: TableNumberRange;
  disabled?: boolean;
  onApplySelection: (value: string[]) => void;
  onApplyRange: (value: TableNumberRange | undefined) => void;
}
/** Draft is intentionally separate from committed, possibly controlled, table state. */
export function TableFilter({
  title,
  mode,
  options = [],
  selected,
  range,
  disabled,
  onApplySelection,
  onApplyRange,
}: TableFilterProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<string[]>([]);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [badMin, setBadMin] = useState(false);
  const [badMax, setBadMax] = useState(false);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target) &&
        !panel.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const close = (restore = false) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  const show = () => {
    setHost(root.current?.closest<HTMLElement>('.f-data-table') ?? null);
    setPosition(null);
    setSearch('');
    setDraft(Array.isArray(selected) ? [...selected] : selected ? [selected] : []);
    setMin(range?.min === undefined ? '' : String(range.min));
    setMax(range?.max === undefined ? '' : String(range.max));
    setBadMin(false);
    setBadMax(false);
    setOpen(true);
  };
  const minValue = min.trim() === '' ? undefined : Number(min);
  const maxValue = max.trim() === '' ? undefined : Number(max);
  const invalid =
    badMin ||
    badMax ||
    (minValue !== undefined && !Number.isFinite(minValue)) ||
    (maxValue !== undefined && !Number.isFinite(maxValue)) ||
    (minValue !== undefined && maxValue !== undefined && minValue > maxValue);
  const reposition = () => {
    if (!trigger.current || !panel.current) return;
    const anchor = trigger.current.getBoundingClientRect();
    const popup = panel.current.getBoundingClientRect();
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = document.documentElement.clientHeight || window.innerHeight;
    const left = Math.max(8, Math.min(anchor.right - popup.width, width - popup.width - 8));
    const below = height - anchor.bottom;
    const above = anchor.top;
    const top =
      below >= popup.height + 8 || below >= above
        ? Math.max(8, Math.min(anchor.bottom + 4, height - popup.height - 8))
        : Math.max(8, anchor.top - popup.height - 4);
    setPosition({ left, top });
  };
  useLayoutEffect(() => {
    if (open && host) reposition();
  }, [open, host, search, invalid]);
  useEffect(() => {
    if (open && position) panel.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, [open, Boolean(position)]);
  useEffect(() => {
    if (!open) return;
    const update = () => reposition();
    document.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    if (trigger.current) observer?.observe(trigger.current);
    if (panel.current) observer?.observe(panel.current);
    return () => {
      document.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [open]);
  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (open && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };
  const apply = () => {
    if (mode === 'numberRange') {
      if (invalid) return;
      onApplyRange(
        minValue === undefined && maxValue === undefined
          ? undefined
          : {
              ...(minValue !== undefined ? { min: minValue } : {}),
              ...(maxValue !== undefined ? { max: maxValue } : {}),
            },
      );
    } else onApplySelection(draft);
    close(true);
  };
  const reset = () => {
    setDraft([]);
    setMin('');
    setMax('');
    setBadMin(false);
    setBadMax(false);
  };
  return (
    <div ref={root} onKeyDown={keydown} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={trigger}
        type="button"
        className="f-button f-button--ghost"
        aria-label={`筛选${title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : show())}
      >
        筛选
      </button>
      {open &&
        host &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label={`筛选${title}`}
            className="f-overlay"
            style={{
              position: 'fixed',
              zIndex: 8,
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              visibility: position ? 'visible' : 'hidden',
              minWidth: 'min(200px, calc(100vw - 16px))',
              maxWidth: 'calc(100vw - 16px)',
              maxHeight: 'calc(100vh - 16px)',
              overflow: 'auto',
              textAlign: 'start',
            }}
          >
            {mode === 'multiple' ? (
              <>
                <input
                  className="f-input"
                  type="search"
                  aria-label={`搜索${title}选项`}
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />
                <div
                  style={{
                    display: 'grid',
                    gap: 'var(--f-choice-gap)',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {options
                    .filter((option) =>
                      option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
                    )
                    .map((option) => (
                      <label className="f-choice" key={option.value}>
                        <input
                          type="checkbox"
                          className="f-checkbox"
                          checked={draft.includes(option.value)}
                          disabled={option.disabled}
                          onChange={(event) =>
                            setDraft(
                              event.currentTarget.checked
                                ? [...new Set([...draft, option.value])]
                                : draft.filter((value) => value !== option.value),
                            )
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 'var(--f-choice-gap)' }}>
                  <label>
                    最小值
                    <input
                      className="f-input"
                      type="number"
                      step="any"
                      aria-label={`${title}最小值`}
                      aria-invalid={invalid || undefined}
                      aria-describedby={invalid ? `${id}-error` : undefined}
                      value={min}
                      onChange={(event) => {
                        setMin(event.currentTarget.value);
                        setBadMin(event.currentTarget.validity.badInput);
                      }}
                    />
                  </label>
                  <label>
                    最大值
                    <input
                      className="f-input"
                      type="number"
                      step="any"
                      aria-label={`${title}最大值`}
                      aria-invalid={invalid || undefined}
                      aria-describedby={invalid ? `${id}-error` : undefined}
                      value={max}
                      onChange={(event) => {
                        setMax(event.currentTarget.value);
                        setBadMax(event.currentTarget.validity.badInput);
                      }}
                    />
                  </label>
                </div>
                {invalid && (
                  <p id={`${id}-error`} role="alert">
                    请输入有效范围，最小值不能大于最大值。
                  </p>
                )}
              </>
            )}
            <div
              style={{ display: 'flex', gap: 'var(--f-choice-gap)', justifyContent: 'flex-end' }}
            >
              <button type="button" className="f-button f-button--ghost" onClick={reset}>
                重置
              </button>
              <button
                type="button"
                className="f-button f-button--ghost"
                onClick={() => close(true)}
              >
                取消
              </button>
              <button
                type="button"
                className="f-button f-button--primary"
                disabled={mode === 'numberRange' && invalid}
                onClick={apply}
              >
                确定
              </button>
            </div>
          </div>,
          host,
        )}
    </div>
  );
}

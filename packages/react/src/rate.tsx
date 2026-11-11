import { useEffect, useId, useRef, useState, type HTMLAttributes } from 'react';
import { useFieldControl } from './fields.js';

export interface RateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  shape?: 'star' | 'heart';
  label?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  getValueLabel?: (value: number, count: number) => string;
}

/** Single rating built from native radios so arrow keys, form submission and focus remain native. */
export function Rate({
  value,
  defaultValue = 0,
  onValueChange,
  count = 5,
  allowHalf = false,
  allowClear = false,
  shape = 'star',
  label = '评分',
  disabled,
  required,
  name,
  getValueLabel,
  className,
  id,
  ...props
}: RateProps) {
  const [local, setLocal] = useState(defaultValue);
  const generated = useId();
  const input = useRef<HTMLInputElement | null>(null);
  const resetState = useRef({ value, defaultValue });
  resetState.current = { value, defaultValue };
  const field = useFieldControl({ ...props, id, disabled, required });
  const total = Number.isFinite(count) ? Math.max(1, Math.min(100, Math.floor(count))) : 5;
  const step = allowHalf ? 0.5 : 1;
  const raw = value ?? local;
  const current = Number.isFinite(raw)
    ? Math.max(0, Math.min(total, Math.round(raw / step) * step))
    : 0;
  const groupName = name || `bt-rate-${generated}`;
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    let active = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (active && !event.defaultPrevented && resetState.current.value === undefined)
          setLocal(resetState.current.defaultValue);
      });
    form.addEventListener('reset', reset);
    return () => {
      active = false;
      form.removeEventListener('reset', reset);
    };
  }, []);
  const update = (next: number) => {
    if (value === undefined) setLocal(next);
    onValueChange?.(next);
  };
  return (
    <div
      {...props}
      className={['f-rate', className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={props['aria-label'] ?? label}
      aria-labelledby={field['aria-labelledby']}
      aria-describedby={field['aria-describedby']}
      aria-invalid={field['aria-invalid']}
      aria-required={field.required || undefined}
      aria-disabled={field.disabled || undefined}
    >
      {Array.from({ length: total }, (_, index) => {
        const point = index + 1;
        const fill = current >= point ? '100%' : allowHalf && current >= point - 0.5 ? '50%' : '0%';
        const values = allowHalf ? [point - 0.5, point] : [point];
        return (
          <span key={point} className="f-rate-item">
            <span
              className="f-rate-icon"
              style={{ '--f-rate-fill': fill } as React.CSSProperties}
              aria-hidden="true"
            >
              {shape === 'heart' ? '♥' : '★'}
            </span>
            {values.map((rating, part) => (
              <label
                key={rating}
                className={`f-rate-hit ${allowHalf ? (part === 0 ? 'f-rate-hit--first' : 'f-rate-hit--last') : ''}`}
              >
                <input
                  type="radio"
                  ref={index === 0 && part === 0 ? input : undefined}
                  id={index === 0 && part === 0 ? field.id : undefined}
                  name={groupName}
                  value={rating}
                  checked={current === rating}
                  disabled={field.disabled}
                  required={field.required}
                  aria-label={getValueLabel?.(rating, total) ?? `${rating} / ${total}`}
                  onChange={() => {
                    if (current !== rating) update(rating);
                  }}
                  onClick={() => {
                    if (allowClear && current === rating && !field.disabled) {
                      update(0);
                    }
                  }}
                />
                <span className="f-rate-focus" aria-hidden="true" />
              </label>
            ))}
          </span>
        );
      })}
    </div>
  );
}

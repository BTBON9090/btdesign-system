import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import {
  addDays,
  addMonths,
  calendarDays,
  formatDate,
  isDateDisabled,
  normalizeDateRange,
  parseDate,
  type DateConstraints,
  type DateRange,
} from '@btdesign/engine';
import { Input, useFieldControl } from './fields.js';
import { cx, useControllable, usePopup } from './enterprise-utils.js';

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>, DateConstraints {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  month?: string;
  onMonthChange?: (month: string) => void;
  disabled?: boolean;
  weekStartsOn?: 0 | 1;
  autoFocus?: boolean;
  label?: string;
}
export function Calendar({
  value,
  defaultValue = '',
  onValueChange,
  month,
  onMonthChange,
  min,
  max,
  disabledDate,
  disabled,
  weekStartsOn = 1,
  autoFocus = false,
  label = '日历',
  className,
  ...props
}: CalendarProps) {
  const today = formatDate(new Date());
  const [selected, update] = useControllable(value, defaultValue, onValueChange);
  const initialMonth = parseDate(selected) ? selected.slice(0, 7) : today.slice(0, 7);
  const [displayed, changeMonth] = useControllable(month, initialMonth, onMonthChange);
  const safeMonth =
    /^\d{4}-\d{2}$/.test(displayed) && parseDate(`${displayed}-01`) ? displayed : initialMonth;
  const [focused, setFocused] = useState(selected || today);
  const root = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(autoFocus);
  const days = calendarDays(safeMonth, weekStartsOn);
  const constraints = { min, max, disabledDate };
  const allowed = (date: string) => !disabled && !isDateDisabled(date, constraints);
  const fallback =
    days.find((day) => day.currentMonth && allowed(day.value))?.value ??
    days.find((day) => allowed(day.value))?.value;
  const focusDay = days.some((day) => day.value === focused && allowed(day.value))
    ? focused
    : fallback;
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    root.current?.querySelector<HTMLButtonElement>('[data-calendar-day][tabindex="0"]')?.focus();
  }, [safeMonth, focusDay]);
  const move = (date: string, direction = 1) => {
    let next = date;
    for (let n = 0; n < 366 && parseDate(next) && !allowed(next); n++)
      next = addDays(next, direction);
    if (!allowed(next)) return;
    shouldFocus.current = true;
    setFocused(next);
    if (next.slice(0, 7) !== safeMonth) changeMonth(next.slice(0, 7));
  };
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    let next: string | undefined;
    const weekday = days.find((day) => day.value === date)?.weekday ?? weekStartsOn;
    if (event.key === 'ArrowLeft') next = addDays(date, -1);
    if (event.key === 'ArrowRight') next = addDays(date, 1);
    if (event.key === 'ArrowUp') next = addDays(date, -7);
    if (event.key === 'ArrowDown') next = addDays(date, 7);
    if (event.key === 'Home') next = addDays(date, -((weekday - weekStartsOn + 7) % 7));
    if (event.key === 'End') next = addDays(date, 6 - ((weekday - weekStartsOn + 7) % 7));
    if (event.key === 'PageUp') next = addMonths(date, event.shiftKey ? -12 : -1);
    if (event.key === 'PageDown') next = addMonths(date, event.shiftKey ? 12 : 1);
    if (next) {
      event.preventDefault();
      move(next, ['ArrowLeft', 'ArrowUp', 'PageUp', 'Home'].includes(event.key) ? -1 : 1);
    }
  };
  const year = Number(safeMonth.slice(0, 4));
  const years = Array.from({ length: 201 }, (_, n) => Math.max(1, Math.min(9799, year - 100)) + n);
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  return (
    <div
      {...props}
      ref={root}
      className={cx('f-calendar', className)}
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
    >
      <div className="f-calendar-header">
        <button
          type="button"
          className="f-calendar-nav"
          aria-label="上个月"
          disabled={disabled || safeMonth === '0001-01'}
          onClick={() => changeMonth(addMonths(`${safeMonth}-01`, -1).slice(0, 7))}
        >
          ‹
        </button>
        <div className="f-calendar-selects">
          <select
            className="f-select"
            aria-label="年份"
            disabled={disabled}
            value={year}
            onChange={(event) =>
              changeMonth(`${event.currentTarget.value.padStart(4, '0')}-${safeMonth.slice(5)}`)
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y} 年
              </option>
            ))}
          </select>
          <select
            className="f-select"
            aria-label="月份"
            disabled={disabled}
            value={Number(safeMonth.slice(5))}
            onChange={(event) =>
              changeMonth(`${safeMonth.slice(0, 4)}-${event.currentTarget.value.padStart(2, '0')}`)
            }
          >
            {Array.from({ length: 12 }, (_, n) => (
              <option key={n} value={n + 1}>
                {n + 1} 月
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="f-calendar-nav"
          aria-label="下个月"
          disabled={disabled || safeMonth === '9999-12'}
          onClick={() => changeMonth(addMonths(`${safeMonth}-01`, 1).slice(0, 7))}
        >
          ›
        </button>
      </div>
      <span className="f-sr-only" aria-live="polite">
        {year}年{Number(safeMonth.slice(5))}月
      </span>
      <table
        className="f-calendar-grid"
        role="grid"
        aria-label={`${year}年${Number(safeMonth.slice(5))}月`}
      >
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, index) => (
              <th scope="col" key={index}>
                {names[(weekStartsOn + index) % 7]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, row) => (
            <tr key={row}>
              {days.slice(row * 7, row * 7 + 7).map((day) => (
                <td key={day.value} aria-selected={selected === day.value}>
                  <button
                    type="button"
                    className="f-calendar-day"
                    data-calendar-day
                    data-outside={!day.currentMonth || undefined}
                    data-selected={selected === day.value || undefined}
                    aria-label={day.value}
                    aria-current={day.value === today ? 'date' : undefined}
                    disabled={!allowed(day.value)}
                    tabIndex={focusDay === day.value ? 0 : -1}
                    onFocus={() => setFocused(day.value)}
                    onKeyDown={(event) => keyboard(event, day.value)}
                    onClick={() => {
                      if (!allowed(day.value)) return;
                      setFocused(day.value);
                      if (!day.currentMonth) changeMonth(day.month);
                      update(day.value);
                    }}
                  >
                    {day.day}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="f-calendar-today f-button f-button--ghost f-button--sm"
        disabled={!allowed(today)}
        onClick={() => {
          changeMonth(today.slice(0, 7));
          update(today);
        }}
      >
        今天
      </button>
    </div>
  );
}
export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>, DateConstraints {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  showLabel?: boolean;
}
export function DatePicker({
  value,
  defaultValue = '',
  onValueChange,
  label,
  name,
  disabled,
  required,
  placeholder = 'YYYY-MM-DD',
  min,
  max,
  disabledDate,
  className,
  showLabel,
  ...props
}: DatePickerProps) {
  const generated = useId();
  const inherited = useFieldControl({ id: props.id, disabled, required });
  const inheritedName = !showLabel && inherited['aria-labelledby'];
  const field = useFieldControl({
    ...props,
    disabled,
    required,
    'aria-label': props['aria-label'] ?? (inheritedName ? undefined : label),
  });
  const [selected, update] = useControllable(value, defaultValue, onValueChange);
  const [draft, setDraft] = useState(selected);
  const [invalid, setInvalid] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const markInvalid = (next: boolean) => {
    setInvalid(next);
    input.current?.setCustomValidity(next ? '请输入可用日期，格式为 YYYY-MM-DD。' : '');
  };
  useEffect(() => {
    setDraft(selected);
    markInvalid(false);
  }, [selected]);
  useEffect(() => {
    input.current?.setCustomValidity(
      draft !== '' && isDateDisabled(draft, { min, max, disabledDate })
        ? '请输入可用日期，格式为 YYYY-MM-DD。'
        : '',
    );
  }, [draft, min, max, disabledDate]);
  const popup = usePopup(!!field.disabled);
  const id = field.id ?? generated;
  const accessibleLabel = label ?? '日期';
  const commit = () => {
    if (field.disabled) return;
    if (draft === '') {
      if (value !== undefined) setDraft(selected);
      update('');
      markInvalid(false);
      return;
    }
    if (isDateDisabled(draft, { min, max, disabledDate })) {
      markInvalid(true);
      return;
    }
    if (value !== undefined) setDraft(selected);
    update(draft);
    markInvalid(false);
  };
  return (
    <div
      {...props}
      id={undefined}
      ref={popup.root}
      className={cx('f-date-picker', className)}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.key === 'Escape' && popup.open) {
          event.preventDefault();
          popup.close(true);
        }
      }}
    >
      {(showLabel || !inherited['aria-labelledby']) && (
        <label htmlFor={id} className="f-date-label">
          {accessibleLabel}
        </label>
      )}
      <div className="f-date-input f-input-group">
        <Input
          {...field}
          ref={input}
          id={id}
          aria-label={props['aria-label'] ?? (inheritedName ? undefined : label)}
          type="text"
          name={name}
          placeholder={placeholder}
          value={draft}
          disabled={field.disabled}
          required={field.required}
          invalid={invalid}
          aria-describedby={
            [field['aria-describedby'], invalid && `${generated}-error`]
              .filter(Boolean)
              .join(' ') || undefined
          }
          onChange={(event) => {
            const next = event.currentTarget.value;
            setDraft(next);
            markInvalid(false);
            event.currentTarget.setCustomValidity(
              next !== '' && isDateDisabled(next, { min, max, disabledDate })
                ? '请输入可用日期，格式为 YYYY-MM-DD。'
                : '',
            );
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              popup.setOpen(true);
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            }
          }}
        />
        <button
          className="f-date-trigger"
          ref={popup.trigger}
          type="button"
          aria-label={`选择${accessibleLabel}`}
          aria-expanded={popup.open}
          aria-haspopup="dialog"
          aria-controls={popup.open ? `${generated}-calendar` : undefined}
          disabled={field.disabled}
          onClick={() => popup.setOpen(!popup.open)}
        >
          ▦
        </button>
        {selected && (
          <button
            type="button"
            className="f-date-clear"
            disabled={field.disabled}
            aria-label={`清空${accessibleLabel}`}
            onClick={() => {
              setDraft(value === undefined ? '' : selected);
              markInvalid(false);
              update('');
            }}
          >
            ×
          </button>
        )}
      </div>
      {invalid && (
        <p className="f-field-error" role="alert" id={`${generated}-error`}>
          请输入可用日期，格式为 YYYY-MM-DD。
        </p>
      )}
      {popup.open && (
        <div
          ref={popup.panel}
          id={`${generated}-calendar`}
          role="dialog"
          aria-label={`选择${accessibleLabel}`}
          className="f-date-popup f-overlay"
        >
          <Calendar
            value={selected}
            min={min}
            max={max}
            disabledDate={disabledDate}
            autoFocus
            onValueChange={(date) => {
              setDraft(value === undefined ? date : selected);
              markInvalid(false);
              update(date);
              popup.close(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
export interface DateRangePickerProps extends Omit<
  DatePickerProps,
  'value' | 'defaultValue' | 'onValueChange'
> {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
}
export function DateRangePicker({
  value,
  defaultValue = ['', ''],
  onValueChange,
  label = '日期范围',
  name,
  className,
  ...props
}: DateRangePickerProps) {
  const [range, update] = useControllable(value, defaultValue, onValueChange);
  const generated = useId();
  const field = useFieldControl(props);
  const id = field.id ?? generated;
  return (
    <div className={cx('f-date-range', className)} role="group" aria-label={label}>
      <DatePicker
        {...props}
        id={id}
        showLabel
        label={`${label}开始`}
        name={name ? `${name}[0]` : undefined}
        value={range[0]}
        onValueChange={(next) => update(normalizeDateRange([next, range[1]]))}
      />
      <span className="f-date-range-separator" aria-hidden="true">
        —
      </span>
      <DatePicker
        {...props}
        id={`${id}-end`}
        showLabel
        label={`${label}结束`}
        name={name ? `${name}[1]` : undefined}
        value={range[1]}
        onValueChange={(next) => update(normalizeDateRange([range[0], next]))}
      />
    </div>
  );
}

import { useEffect, useId, useState } from 'react';
import {
  addMonths,
  formatDate,
  isDateDisabled,
  normalizeDateRange,
  parseDate,
  selectDateRange,
  type DateConstraints,
  type DateRange,
} from '@btdesign/engine';
import { Calendar } from './enterprise-date.js';
import { usePopup } from './enterprise-utils.js';

export interface DateRangePreset {
  label: string;
  /** Resolve on click. Constraints are checked for endpoints, not interior dates. */
  value: DateRange | (() => DateRange);
  disabled?: boolean;
}
export interface DateRangeCalendarProps extends DateConstraints {
  value: DateRange;
  onValueChange: (range: DateRange) => void;
  label: string;
  disabled?: boolean;
  presets?: readonly DateRangePreset[];
}
const baseMonth = (range: DateRange) => {
  const date = parseDate(range[0]) ? range[0] : formatDate(new Date());
  return date.slice(0, 7) === '9999-12' ? '9999-11' : date.slice(0, 7);
};
export function DateRangeCalendar({
  value,
  onValueChange,
  label,
  disabled,
  presets = [],
  min,
  max,
  disabledDate,
}: DateRangeCalendarProps) {
  const popup = usePopup(disabled);
  const id = useId();
  const [left, setLeft] = useState(() => baseMonth(value));
  const [error, setError] = useState('');
  const right = addMonths(`${left}-01`, 1).slice(0, 7);
  useEffect(() => {
    if (!popup.open) setError('');
  }, [popup.open]);
  const open = () => {
    setLeft(baseMonth(value));
    setError('');
    popup.setOpen(true);
  };
  const choose = (date: string) => {
    if (disabled || isDateDisabled(date, { min, max, disabledDate })) return;
    const next = selectDateRange(value, date);
    setError('');
    onValueChange(next);
    if (next[0] && next[1]) popup.close(true);
  };
  const preset = (item: DateRangePreset) => {
    if (disabled || item.disabled) return;
    let next: DateRange;
    try {
      next = typeof item.value === 'function' ? item.value() : item.value;
    } catch {
      setError('此快捷范围不可用。');
      return;
    }
    if (
      !Array.isArray(next) ||
      next.length !== 2 ||
      isDateDisabled(next[0], { min, max, disabledDate }) ||
      isDateDisabled(next[1], { min, max, disabledDate })
    ) {
      setError('此快捷范围不可用。');
      return;
    }
    onValueChange(normalizeDateRange(next));
    setError('');
    popup.close(true);
  };
  const changeLeft = (month: string) => {
    if (month >= '0001-01' && month <= '9999-11') setLeft(month);
  };
  const changeRight = (month: string) => {
    const previous = addMonths(`${month}-01`, -1).slice(0, 7);
    if (previous) changeLeft(previous);
  };
  return (
    <div
      className="f-date-range-calendar"
      ref={popup.root}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && popup.open) {
          event.preventDefault();
          popup.close(true);
        }
      }}
    >
      <button
        type="button"
        ref={popup.trigger}
        className="f-button f-button--secondary f-date-range-open"
        aria-label={`选择${label}`}
        aria-haspopup="dialog"
        aria-expanded={popup.open}
        aria-controls={popup.open ? id : undefined}
        disabled={disabled}
        onClick={() => (popup.open ? popup.close() : open())}
      >
        选择范围
      </button>
      {popup.open && (
        <div
          ref={popup.panel}
          id={id}
          role="dialog"
          aria-label={`选择${label}`}
          className="f-overlay f-date-range-panel"
        >
          {presets.length > 0 && (
            <div className="f-date-range-presets" aria-label="快捷范围">
              {presets.map((item, index) => (
                <button
                  type="button"
                  className="f-button f-button--ghost f-button--sm"
                  key={`${item.label}-${index}`}
                  disabled={item.disabled}
                  onClick={() => preset(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <div className="f-date-range-calendars">
            <Calendar
              label="开始月份"
              value={value[0]}
              range={value}
              month={left}
              onMonthChange={changeLeft}
              onValueChange={choose}
              min={min}
              max={max}
              disabledDate={disabledDate}
              autoFocus
            />
            <Calendar
              label="结束月份"
              value={value[1]}
              range={value}
              month={right}
              onMonthChange={changeRight}
              onValueChange={choose}
              min={min}
              max={max}
              disabledDate={disabledDate}
            />
          </div>
          {error && (
            <p role="alert" className="f-field-error">
              {error}
            </p>
          )}
          <button
            type="button"
            className="f-button f-button--ghost f-button--sm f-date-range-close"
            onClick={() => popup.close(true)}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}

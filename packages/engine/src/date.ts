import type { CalendarDay, DateConstraints, DateParts, DateRange } from './types.js';

const pad = (value: number, length = 2) => String(value).padStart(length, '0');
function utcDate(parts: DateParts) {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}
const partsOf = (date: Date): DateParts => ({
  year: date.getUTCFullYear(),
  month: date.getUTCMonth() + 1,
  day: date.getUTCDate(),
});
function validParts(parts: DateParts) {
  if (
    ![parts.year, parts.month, parts.day].every(Number.isInteger) ||
    parts.year < 1 ||
    parts.year > 9999 ||
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31
  )
    return false;
  const date = partsOf(utcDate(parts));
  return date.year === parts.year && date.month === parts.month && date.day === parts.day;
}

/** Strict date-only parsing; no timezone conversion or rollover of impossible dates. */
export function parseDate(value: string): DateParts | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const parts = { year, month, day };
  return validParts(parts) ? parts : null;
}
export function formatDate(value: DateParts | Date): string {
  const parts =
    value instanceof Date
      ? { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() }
      : value;
  return parts && validParts(parts)
    ? `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}`
    : '';
}
export function addDays(value: string, amount: number): string {
  const parts = parseDate(value);
  if (!parts || !Number.isFinite(amount)) return '';
  const date = utcDate(parts);
  date.setUTCDate(date.getUTCDate() + Math.trunc(amount));
  return formatDate(partsOf(date));
}
export function addMonths(value: string, amount: number): string {
  const parts = parseDate(value);
  if (!parts || !Number.isFinite(amount)) return '';
  const target = utcDate({ ...parts, day: 1 });
  target.setUTCMonth(target.getUTCMonth() + Math.trunc(amount));
  const end = new Date(target);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  return formatDate({ ...partsOf(target), day: Math.min(parts.day, end.getUTCDate()) });
}
export function calendarDays(month: string, weekStartsOn: 0 | 1 = 1): CalendarDay[] {
  const first = parseDate(`${month}-01`);
  if (!first || !/^\d{4}-\d{2}$/.test(month)) return [];
  const date = utcDate(first);
  const offset = (date.getUTCDay() - (weekStartsOn === 0 ? 0 : 1) + 7) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(date);
    day.setUTCDate(day.getUTCDate() + index);
    const parts = partsOf(day);
    const cellMonth = `${pad(parts.year, 4)}-${pad(parts.month)}`;
    return {
      value: formatDate(parts),
      day: parts.day,
      month: cellMonth,
      currentMonth: cellMonth === month,
      weekday: day.getUTCDay(),
    };
  });
}
export function isDateDisabled(value: string, constraints: DateConstraints = {}): boolean {
  if (!parseDate(value)) return true;
  if (constraints.min && parseDate(constraints.min) && value < constraints.min) return true;
  if (constraints.max && parseDate(constraints.max) && value > constraints.max) return true;
  if (constraints.disabledDate) {
    try {
      return Boolean(constraints.disabledDate(value));
    } catch {
      return true;
    }
  }
  return false;
}
export function normalizeDateRange(range: readonly string[]): DateRange {
  const start = parseDate(range[0]) ? range[0] : '';
  const end = parseDate(range[1]) ? range[1] : '';
  return start && end && start > end ? [end, start] : [start, end];
}
export function selectDateRange(current: readonly string[], next: string): DateRange {
  const [start, end] = normalizeDateRange(current);
  if (!parseDate(next)) return [start, end];
  return !start || end ? [next, ''] : normalizeDateRange([start, next]);
}

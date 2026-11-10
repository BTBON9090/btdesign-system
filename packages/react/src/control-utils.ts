/** Deterministic numeric boundaries shared by native input handlers. */
export function numberBounds(min?: number, max?: number) {
  const lower = Number.isFinite(min) ? min : undefined;
  const upper = Number.isFinite(max) ? max : undefined;
  return {
    min: lower,
    max: lower !== undefined && upper !== undefined && upper < lower ? lower : upper,
  };
}
export function safeNumber(value: unknown): number | '' {
  return typeof value === 'number' && Number.isFinite(value) ? value : '';
}
export function clampNumber(value: number | '', min?: number, max?: number): number | '' {
  if (value === '' || !Number.isFinite(value)) return '';
  return Math.max(min ?? -Infinity, Math.min(max ?? Infinity, value));
}
/** The actual blur path, kept separate so read-only and cancelled events are testable. */
export function commitNumberInputBlur(
  event: { defaultPrevented: boolean; target: { value: string; valueAsNumber: number } },
  options: { disabled?: boolean; readOnly?: boolean; min?: number; max?: number },
  commit: (value: number | '') => void,
) {
  if (event.defaultPrevented || options.disabled || options.readOnly) return;
  commit(
    clampNumber(
      event.target.value === '' ? '' : safeNumber(event.target.valueAsNumber),
      options.min,
      options.max,
    ),
  );
}

/** Delegate stepping to the native input so its min/value step base and floating-point rules apply.
 * Restore the DOM before committing: a controlled parent may decline the proposed value.
 */
export function stepNativeNumber(
  input:
    | Pick<HTMLInputElement, 'value' | 'valueAsNumber' | 'validity' | 'stepUp' | 'stepDown'>
    | null
    | undefined,
  direction: -1 | 1,
  fallback: number | '',
): number | '' {
  const previousValue = typeof fallback === 'number' && Number.isFinite(fallback) ? fallback : '';
  if (!input) return previousValue;
  const original = input.value;
  try {
    if (direction > 0) input.stepUp();
    else input.stepDown();
    const next = input.valueAsNumber;
    const validity = input.validity;
    if (
      !Number.isFinite(next) ||
      validity?.badInput ||
      validity?.stepMismatch ||
      validity?.rangeUnderflow ||
      validity?.rangeOverflow
    )
      return previousValue;
    return next;
  } catch {
    return previousValue;
  } finally {
    input.value = original;
  }
}

export function paginationState(page: number, total: number, pageSize = 10, siblingCount = 1) {
  const safeTotal = Number.isFinite(total)
    ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(total)))
    : 0;
  const size = Number.isFinite(pageSize) && pageSize >= 1 ? Math.floor(pageSize) : 10;
  const count = Math.max(1, Math.ceil(safeTotal / size));
  const current = Math.max(1, Math.min(count, Number.isFinite(page) ? Math.floor(page) : 1));
  const siblings = Number.isFinite(siblingCount)
    ? Math.max(0, Math.min(5, Math.floor(siblingCount)))
    : 1;
  const selected = new Set([1, count]);
  for (let n = Math.max(1, current - siblings); n <= Math.min(count, current + siblings); n++)
    selected.add(n);
  const sorted = [...selected].sort((a, b) => a - b);
  const pages: (number | 'ellipsis')[] = [];
  for (const [index, number] of sorted.entries()) {
    const previous = sorted[index - 1];
    if (previous !== undefined && number - previous === 2) pages.push(previous + 1);
    else if (previous !== undefined && number - previous > 2) pages.push('ellipsis');
    pages.push(number);
  }
  return { total: safeTotal, page: current, pageCount: count, pages };
}

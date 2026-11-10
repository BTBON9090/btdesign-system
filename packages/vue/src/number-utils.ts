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

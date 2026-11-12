/** Page-size choices are explicit positive safe integers, in caller-supplied order. */
export function paginationSizeOptions(values: readonly number[] | undefined): number[] {
  return [...new Set((values ?? []).filter((value) => Number.isSafeInteger(value) && value > 0))];
}
/** Empty, non-integer and non-finite values are rejected; other integers clamp to the page range. */
export function paginationJumpTarget(text: string, pageCount: number): number | undefined {
  const value = text.trim();
  if (!/^[+-]?\d+$/.test(value)) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.max(1, Math.min(pageCount, number));
}

/** Resolve a submitted jump only when the controlled page has changed. */
export function paginationJumpResolution(
  pending: { from: number; target: number } | null,
  page: number,
): { pending: { from: number; target: number } | null; value?: string } {
  if (!pending || pending.from === page) return { pending };
  return page === pending.target ? { pending: null, value: String(page) } : { pending: null };
}

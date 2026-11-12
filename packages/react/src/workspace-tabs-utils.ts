export interface WorkspaceScrollMetrics {
  clientWidth: number;
  scrollWidth: number;
  scrollLeft: number;
  direction?: 'ltr' | 'rtl';
}
export interface WorkspaceScrollState {
  overflow: boolean;
  canPrevious: boolean;
  canNext: boolean;
}
/** Modern RTL scroll offsets run from -maximum (left edge) to zero (right edge). */
export function workspaceScrollState(metrics: WorkspaceScrollMetrics): WorkspaceScrollState {
  const width = Math.max(0, metrics.clientWidth);
  const max = Math.max(0, metrics.scrollWidth - width);
  const overflow = width > 0 && max > 0;
  const tolerance = Math.min(1, max / 2);
  const offset = Math.min(
    max,
    Math.max(0, metrics.direction === 'rtl' ? max + metrics.scrollLeft : metrics.scrollLeft),
  );
  return {
    overflow,
    canPrevious: overflow && offset > tolerance,
    canNext: overflow && offset < max - tolerance,
  };
}
export function workspaceScrollDistance(width: number, direction: 'previous' | 'next'): number {
  return Math.max(0, width) * 0.8 * (direction === 'previous' ? -1 : 1);
}

/** Horizontal delta that reveals an item inside the viewport's unobscured bounds. */
export function workspaceRevealDistance(
  area: { left: number; right: number },
  item: { left: number; right: number },
  leftInset: number,
  rightInset: number,
): number {
  const visibleLeft = area.left + Math.max(0, leftInset);
  const visibleRight = area.right - Math.max(0, rightInset);
  const delta =
    item.left < visibleLeft
      ? item.left - visibleLeft
      : item.right > visibleRight
        ? item.right - visibleRight
        : 0;
  // Browser scroll offsets may be rounded to device pixels; round away from zero.
  return delta < 0 ? Math.floor(delta) : Math.ceil(delta);
}

/** Subpixel tolerance accounts for browser scroll offsets rounded at either boundary. */
export function workspaceItemIsVisible(
  area: { left: number; right: number },
  item: { left: number; right: number },
  leftInset: number,
  rightInset: number,
): boolean {
  return (
    item.left >= area.left + Math.max(0, leftInset) - 0.75 &&
    item.right <= area.right - Math.max(0, rightInset) + 0.75
  );
}

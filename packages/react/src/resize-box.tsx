import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

export interface ResizeBoxProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'children'
> {
  first?: ReactNode;
  second?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: number;
  defaultSize?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  handleLabel?: string;
  onSizeChange?: (size: number) => void;
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export function ResizeBox({
  first,
  second,
  orientation = 'horizontal',
  size,
  defaultSize = 50,
  min = 10,
  max = 90,
  step = 1,
  disabled = false,
  handleLabel = '调整面板大小',
  onSizeChange,
  className,
  ...props
}: ResizeBoxProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const dragging = useRef<number | null>(null);
  const [local, setLocal] = useState(defaultSize);
  const lower = clamp(Number.isFinite(min) ? min : 10, 0, 100);
  const upper = clamp(Number.isFinite(max) ? max : 90, lower, 100);
  const current = clamp(Number.isFinite(size ?? local) ? (size ?? local) : 50, lower, upper);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const change = (next: number) => {
    const value = Math.round(clamp(next, lower, upper) * 100) / 100;
    if (value === current) return;
    if (size === undefined) setLocal(value);
    onSizeChange?.(value);
  };
  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const increase = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const decrease = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const next =
      event.key === increase
        ? current + increment
        : event.key === decrease
          ? current - increment
          : event.key === 'Home'
            ? lower
            : event.key === 'End'
              ? upper
              : undefined;
    if (next !== undefined) {
      event.preventDefault();
      change(next);
    }
  };
  const pointerdown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    dragging.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointermove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || dragging.current !== event.pointerId || !root.current) return;
    const rect = root.current.getBoundingClientRect();
    const handleRect = event.currentTarget.getBoundingClientRect();
    const handleExtent = orientation === 'horizontal' ? handleRect.width : handleRect.height;
    const extent = (orientation === 'horizontal' ? rect.width : rect.height) - handleExtent;
    if (extent <= 0) return;
    change(
      (((orientation === 'horizontal' ? event.clientX - rect.left : event.clientY - rect.top) -
        handleExtent / 2) /
        extent) *
        100,
    );
  };
  const pointerup = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== event.pointerId) return;
    dragging.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return (
    <div
      {...props}
      ref={root}
      className={['f-resize-box', `f-resize-box--${orientation}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        id={`${id}-first`}
        className="f-resize-box-pane f-resize-box-pane--first"
        style={{ flex: `${current} 1 0%` }}
      >
        {first}
      </div>
      <div
        className="f-resize-box-handle"
        role="separator"
        aria-label={handleLabel}
        aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        aria-controls={`${id}-first`}
        aria-valuemin={lower}
        aria-valuemax={upper}
        aria-valuenow={current}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={keydown}
        onPointerDown={pointerdown}
        onPointerMove={pointermove}
        onPointerUp={pointerup}
        onPointerCancel={pointerup}
        onLostPointerCapture={() => {
          dragging.current = null;
        }}
      />
      <div
        className="f-resize-box-pane f-resize-box-pane--second"
        style={{ flex: `${100 - current} 1 0%` }}
      >
        {second}
      </div>
    </div>
  );
}

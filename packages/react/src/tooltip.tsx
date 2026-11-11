import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'content' | 'onChange'
> {
  /** One focusable element, or a component that forwards aria-describedby to one. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  content: ReactNode;
  placement?: TooltipPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/** Noninteractive text that describes the trigger. The parent owns controlled visibility. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  {
    children,
    content,
    placement = 'top',
    open,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    id,
    className,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const tooltipId = id ?? `tooltip-${generatedId}`;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const active = !disabled && (open ?? internalOpen);
  const pointerInside = useRef(false);
  const focusInside = useRef(false);
  const dismissed = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const openRef = useRef(open);
  openRef.current = open;
  const callbackRef = useRef(onOpenChange);
  callbackRef.current = onOpenChange;
  const request = (next: boolean) => {
    if (next === activeRef.current) return;
    if (openRef.current === undefined) setInternalOpen(next);
    callbackRef.current?.(next);
  };
  const requestRef = useRef(request);
  requestRef.current = request;
  useEffect(() => {
    if (!disabled) return;
    setInternalOpen(false);
    dismissed.current = false;
  }, [disabled]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !activeRef.current) return;
      dismissed.current = true;
      requestRef.current(false);
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);
  const trigger = Children.only(children);
  if (!isValidElement<{ 'aria-describedby'?: string }>(trigger) || trigger.type === Fragment)
    throw new Error('Tooltip requires one focusable trigger that forwards aria-describedby.');
  const describedBy = [
    ...new Set(
      [trigger.props['aria-describedby'], tooltipId]
        .filter(Boolean)
        .flatMap((value) => value!.split(/\s+/))
        .filter(Boolean),
    ),
  ].join(' ');
  return (
    <span
      {...props}
      ref={ref}
      className={['f-tooltip', className].filter(Boolean).join(' ')}
      onPointerEnter={(event) => {
        props.onPointerEnter?.(event);
        if (disabled) return;
        pointerInside.current = true;
        if (!dismissed.current) request(true);
      }}
      onPointerLeave={(event) => {
        props.onPointerLeave?.(event);
        pointerInside.current = false;
        if (!focusInside.current) {
          dismissed.current = false;
          request(false);
        }
      }}
      onFocusCapture={(event) => {
        props.onFocusCapture?.(event);
        if (disabled) return;
        focusInside.current = true;
        if (!dismissed.current) request(true);
      }}
      onBlurCapture={(event) => {
        props.onBlurCapture?.(event);
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        )
          return;
        focusInside.current = false;
        if (!pointerInside.current) {
          dismissed.current = false;
          request(false);
        }
      }}
    >
      {cloneElement(trigger, { 'aria-describedby': describedBy })}
      <span
        id={tooltipId}
        role="tooltip"
        className={`f-tooltip-content f-tooltip-content--${placement}`}
        hidden={!active}
      >
        {content}
      </span>
    </span>
  );
});

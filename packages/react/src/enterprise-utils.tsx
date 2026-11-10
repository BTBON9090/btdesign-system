import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export const cx = (...values: (string | false | null | undefined)[]) =>
  values.filter(Boolean).join(' ');
export function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [local, setLocal] = useState(initial);
  return [
    value === undefined ? local : value,
    (next) => {
      if (value === undefined) setLocal(next);
      onChange?.(next);
    },
  ];
}
export function usePopup(disabled = false) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = (restore = false) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useEffect(() => {
    if (!open) return;
    const pointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const focus = (event: FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('focusin', focus);
    };
  }, [open]);
  return { open, setOpen, root, trigger, panel, close };
}
export function moveFocus(container: HTMLElement, selector: string, key: string) {
  const items = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (item) => !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true',
  );
  if (!items.length) return;
  const current = items.indexOf(document.activeElement as HTMLElement);
  const next =
    key === 'Home'
      ? 0
      : key === 'End'
        ? items.length - 1
        : key === 'ArrowUp' || key === 'ArrowLeft'
          ? (current - 1 + items.length) % items.length
          : (current + 1) % items.length;
  items[next]?.focus();
}
export function checkedRef(value: boolean | 'mixed') {
  return (node: HTMLInputElement | null) => {
    if (node) node.indeterminate = value === 'mixed';
  };
}

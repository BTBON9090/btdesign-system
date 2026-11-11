import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from './enterprise-utils.js';

export type BackTopTarget = Window | HTMLElement;
export interface BackTopProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Return the scrolling container; defaults to the page. */
  target?: () => BackTopTarget | null;
  visibilityHeight?: number;
  top?: number;
  behavior?: 'smooth' | 'auto';
  shape?: 'square' | 'circle';
  variant?: 'neutral' | 'primary';
  content?: 'arrow' | 'up' | 'top';
  position?: 'fixed' | 'inline';
  children?: ReactNode;
}

/** A scroll-aware button. The target callback must return a mounted scrolling element. */
export function BackTop({
  target,
  visibilityHeight = 400,
  top = 0,
  behavior = 'smooth',
  shape = 'square',
  variant = 'neutral',
  content = 'arrow',
  position = 'fixed',
  children,
  className,
  onClick,
  ...props
}: BackTopProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = target ? target() : window;
    if (!container) {
      setVisible(false);
      return;
    }
    const update = () =>
      setVisible(
        (container === window ? window.scrollY : (container as HTMLElement).scrollTop) >=
          Math.max(0, visibilityHeight),
      );
    update();
    container.addEventListener('scroll', update, { passive: true });
    return () => container.removeEventListener('scroll', update);
  }, [target, visibilityHeight]);
  if (!visible) return null;
  return (
    <button
      {...props}
      type="button"
      aria-label={props['aria-label'] ?? '返回顶部'}
      className={cx(
        'f-back-top',
        `f-back-top--${shape}`,
        `f-back-top--${variant}`,
        `f-back-top--${position}`,
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const container = target ? target() : window;
        if (!container) return;
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        container.scrollTo({
          top: Math.max(0, top),
          behavior: reduceMotion ? 'instant' : behavior,
        });
      }}
    >
      {children ??
        (content === 'arrow' ? <span aria-hidden="true">↑</span> : content === 'up' ? 'UP' : 'TOP')}
    </button>
  );
}

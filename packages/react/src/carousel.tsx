import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { cx, useControllable } from './enterprise-utils.js';

export interface CarouselItem {
  key: string;
  content: ReactNode;
  label?: string;
}
export interface CarouselProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'defaultValue' | 'onChange'
> {
  items: CarouselItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  label?: string;
  loop?: boolean;
  indicatorStyle?: 'dots' | 'lines';
  indicatorPlacement?: 'bottom' | 'start' | 'end';
}
const clampIndex = (index: number, count: number) =>
  Number.isFinite(index) ? Math.max(0, Math.min(Math.max(0, count - 1), Math.floor(index))) : 0;

/** No automatic playback: navigation changes only in response to the user. */
export function Carousel({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  label = '图片轮播',
  loop = false,
  indicatorStyle = 'dots',
  indicatorPlacement = 'bottom',
  className,
  onKeyDown,
  ...attrs
}: CarouselProps) {
  const [selected, update] = useControllable(index, defaultIndex, onIndexChange);
  const current = clampIndex(selected, items.length);
  function goTo(next: number) {
    if (items.length < 2) return;
    const target = loop ? (next + items.length) % items.length : clampIndex(next, items.length);
    if (target !== current) update(target);
  }
  function onKeys(event: KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (
      event.defaultPrevented ||
      (typeof HTMLElement !== 'undefined' &&
        event.target instanceof HTMLElement &&
        event.target.closest('input,textarea,select,[contenteditable="true"]'))
    )
      return;
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (delta) {
      event.preventDefault();
      goTo(current + delta);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      goTo(event.key === 'Home' ? 0 : items.length - 1);
    }
  }
  return (
    <section
      {...attrs}
      role="region"
      aria-label={attrs['aria-label'] ?? label}
      aria-roledescription="轮播"
      tabIndex={attrs.tabIndex ?? 0}
      className={cx('f-carousel', className)}
      onKeyDown={onKeys}
    >
      {items.length === 0 ? (
        <p className="f-carousel-empty">暂无轮播内容</p>
      ) : (
        <>
          <div className="f-carousel-slides" aria-live="polite">
            {items.map((item, i) => (
              <div
                key={item.key}
                className="f-carousel-slide"
                role="group"
                aria-roledescription="幻灯片"
                aria-label={item.label ?? `${i + 1} / ${items.length}`}
                hidden={i !== current}
              >
                {item.content}
              </div>
            ))}
          </div>
          <div className="f-carousel-controls">
            <button
              type="button"
              className="f-carousel-arrow"
              aria-label="上一张"
              disabled={items.length < 2 || (!loop && current === 0)}
              onClick={() => goTo(current - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="f-carousel-arrow"
              aria-label="下一张"
              disabled={items.length < 2 || (!loop && current === items.length - 1)}
              onClick={() => goTo(current + 1)}
            >
              ›
            </button>
          </div>
          <div
            role="group"
            aria-label="选择幻灯片"
            className={cx(
              'f-carousel-indicators',
              `f-carousel-indicators--${indicatorStyle}`,
              `f-carousel-indicators--${indicatorPlacement}`,
            )}
          >
            {items.map((item, i) => (
              <button
                key={item.key}
                type="button"
                className="f-carousel-indicator"
                aria-label={item.label ?? `第 ${i + 1} 张`}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type TimelineTone = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type TimelineState = 'done' | 'current' | 'pending';
export interface TimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  time?: string;
  dateTime?: string;
  tone?: TimelineTone;
  state?: TimelineState;
}
export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  label?: string;
}
const stateLabels: Record<TimelineState, string> = {
  done: '已完成',
  current: '进行中',
  pending: '待开始',
};

/** An ordered sequence; labels and text remain available without relying on marker color. */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { items, orientation = 'vertical', label = '时间轴', className, ...props },
  ref,
) {
  return (
    <ol
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? label}
      className={['f-timeline', `f-timeline--${orientation}`, className].filter(Boolean).join(' ')}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className={`f-timeline-item f-timeline-item--${item.tone ?? 'default'}`}
          data-state={item.state}
          aria-current={item.state === 'current' ? 'step' : undefined}
        >
          <span className="f-timeline-marker" aria-hidden="true" />
          <div className="f-timeline-content">
            {item.state && <span className="f-sr-only">{stateLabels[item.state]}：</span>}
            <div className="f-timeline-title">{item.title}</div>
            {item.description != null && (
              <div className="f-timeline-description">{item.description}</div>
            )}
            {item.time && (
              <time className="f-timeline-time" dateTime={item.dateTime}>
                {item.time}
              </time>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
});

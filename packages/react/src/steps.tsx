import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export interface StepItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  status?: StepStatus;
  /** Decorative icon; the step number and status are still announced in text. */
  icon?: ReactNode;
}
export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items: StepItem[];
  current?: number;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}
const labels: Record<StepStatus, string> = {
  wait: '待开始',
  process: '进行中',
  finish: '已完成',
  error: '错误',
};

/** Displays progress without implying that steps can be clicked or navigated. */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  { items, current = 0, orientation = 'horizontal', label = '步骤', className, ...props },
  ref,
) {
  const index = Number.isFinite(current)
    ? Math.max(0, Math.min(items.length - 1, Math.floor(current)))
    : 0;
  return (
    <ol
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? label}
      className={['f-steps', `f-steps--${orientation}`, className].filter(Boolean).join(' ')}
    >
      {items.map((item, i) => {
        const status = item.status ?? (i < index ? 'finish' : i === index ? 'process' : 'wait');
        return (
          <li
            key={item.id}
            className={`f-steps-item f-steps-item--${status}`}
            aria-current={i === index ? 'step' : undefined}
          >
            <span className="f-steps-marker" aria-hidden="true">
              {item.icon ?? i + 1}
            </span>
            <div className="f-steps-content">
              <span className="f-sr-only">
                第 {i + 1} 步，{labels[status]}：
              </span>
              <div className="f-steps-title">{item.title}</div>
              {item.description != null && (
                <div className="f-steps-description">{item.description}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
});

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './enterprise-utils.js';

export interface DescriptionsItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** Number of columns occupied by this item. */
  span?: number;
}
export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string;
  items: DescriptionsItem[];
  column?: number;
  orientation?: 'horizontal' | 'vertical';
  bordered?: boolean;
}

const normalize = (value: number | undefined, fallback: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(1, Math.floor(value!))) : fallback;

export function Descriptions({
  title,
  items,
  column = 3,
  orientation = 'horizontal',
  bordered = false,
  className,
  style,
  ...attrs
}: DescriptionsProps) {
  const columns = normalize(column, 3, 6);
  return (
    <div
      {...attrs}
      className={cx('f-descriptions', className)}
      style={{ ...style, '--f-descriptions-columns': columns } as CSSProperties}
    >
      {title && <h3 className="f-descriptions-title">{title}</h3>}
      <dl
        className={cx(
          'f-descriptions-grid',
          `f-descriptions-grid--${orientation}`,
          bordered && 'f-descriptions-grid--bordered',
        )}
      >
        {items.map((item) => (
          <div
            key={item.key}
            className="f-descriptions-item"
            style={{ '--f-descriptions-span': normalize(item.span, 1, columns) } as CSSProperties}
          >
            <dt className="f-descriptions-label">{item.label}</dt>
            <dd className="f-descriptions-value">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

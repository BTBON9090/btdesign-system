import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './enterprise-utils.js';

export interface StatisticProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  title?: ReactNode;
  value: number | string;
  format?: 'number' | 'percent';
  precision?: number;
  locale?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: ReactNode;
}

function displayValue(value: number | string, precision?: number, locale?: string) {
  if (typeof value === 'string') return value;
  if (!Number.isFinite(value)) return '—';
  const digits =
    typeof precision === 'number' && Number.isFinite(precision)
      ? Math.max(0, Math.min(20, Math.floor(precision)))
      : undefined;
  const options =
    digits === undefined
      ? { maximumFractionDigits: 20 }
      : { minimumFractionDigits: digits, maximumFractionDigits: digits };
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, options).format(value);
  }
}
const trendLabel = { up: '上升', down: '下降', neutral: '持平' } as const;
const trendGlyph = { up: '↑', down: '↓', neutral: '−' } as const;

/** Percent values are already percentages: 25 renders 25%, without scaling. */
export function Statistic({
  title,
  value,
  format = 'number',
  precision,
  locale,
  prefix,
  suffix,
  trend,
  trendText,
  className,
  id,
  ...attrs
}: StatisticProps) {
  const generated = useId();
  const labelId = `${id ?? `bt-statistic-${generated}`}-label`;
  return (
    <div
      {...attrs}
      id={id}
      role="group"
      aria-labelledby={title != null ? labelId : undefined}
      className={cx('f-statistic', className)}
    >
      {title != null && (
        <div id={labelId} className="f-statistic-title">
          {title}
        </div>
      )}
      <div className="f-statistic-value">
        {prefix != null && <span className="f-statistic-prefix">{prefix}</span>}
        <span>{displayValue(value, precision, locale)}</span>
        {(suffix != null || format === 'percent') && (
          <span className="f-statistic-suffix">{suffix ?? '%'}</span>
        )}
      </div>
      {(trend || trendText != null) && (
        <div className="f-statistic-trend">
          {trend && (
            <span role="img" aria-label={trendLabel[trend]}>
              {trendGlyph[trend]}
            </span>
          )}
          {trendText != null && <span>{trendText}</span>}
        </div>
      )}
    </div>
  );
}

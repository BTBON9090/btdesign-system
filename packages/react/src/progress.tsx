import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from './enterprise-utils.js';

export type ProgressType = 'line' | 'circle';
export type ProgressStatus = 'normal' | 'success' | 'warning' | 'error';
export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  type?: ProgressType;
  status?: ProgressStatus;
  showValue?: boolean;
}
const statusText = { normal: '', success: '成功', warning: '警告', error: '错误' };
/** Values and statuses come from the caller; completion is never inferred. */
export function Progress({
  value,
  max = 100,
  label,
  type = 'line',
  status = 'normal',
  showValue,
  className,
  ...props
}: ProgressProps) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(limit, value)) : 0;
  const percent = Math.round((safeValue / limit) * 100);
  const text = statusText[status];
  const showPercent = showValue ?? (type === 'circle' || !!label);
  const accessibleValue = props['aria-valuetext'] ?? (text ? `${percent}%，${text}` : undefined);
  const aria = {
    role: 'progressbar',
    'aria-label': props['aria-label'] ?? label ?? '进度',
    'aria-valuenow': safeValue,
    'aria-valuemin': 0,
    'aria-valuemax': limit,
    'aria-valuetext': accessibleValue,
  } as const;
  if (type === 'circle')
    return (
      <div
        {...props}
        className={cx(
          'f-progress-wrap',
          'f-progress-wrap--circle',
          `f-progress--${status}`,
          className,
        )}
      >
        {label && <span className="f-progress-circle-label">{label}</span>}
        <div className="f-progress-circle" {...aria}>
          <svg
            className="f-progress-circle-svg"
            viewBox="0 0 40 40"
            aria-hidden="true"
            focusable="false"
          >
            <circle className="f-progress-circle-track" cx="20" cy="20" r="17" />
            <circle
              className="f-progress-circle-fill"
              cx="20"
              cy="20"
              r="17"
              pathLength="100"
              style={
                {
                  strokeDashoffset: 100 - (safeValue / limit) * 100,
                  visibility: safeValue === 0 ? 'hidden' : undefined,
                } as CSSProperties
              }
            />
          </svg>
          {(showPercent || text) && (
            <span className="f-progress-circle-content" aria-hidden="true">
              {showPercent && <span>{percent}%</span>}
              {text && <small>{text}</small>}
            </span>
          )}
        </div>
      </div>
    );
  return (
    <div {...props} className={cx('f-progress-wrap', `f-progress--${status}`, className)}>
      {(label || showPercent || text) && (
        <div className="f-progress-label">
          <span>{label}</span>
          <span aria-hidden="true">
            {showPercent && `${percent}%`}
            {showPercent && text && ' · '}
            {text}
          </span>
        </div>
      )}
      <div className="f-progress" {...aria}>
        <div className="f-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

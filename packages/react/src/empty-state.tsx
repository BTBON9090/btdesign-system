import { createElement, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './enterprise-utils.js';

export type EmptyStateVariant =
  | 'no-content'
  | 'initial'
  | 'no-messages'
  | 'no-results'
  | 'no-permission'
  | 'offline'
  | 'not-found'
  | 'error';
export type EmptyStateSize = 'compact' | 'default' | 'page';
const titles: Record<EmptyStateVariant, string> = {
  'no-content': '暂无内容',
  initial: '从这里开始',
  'no-messages': '暂无消息',
  'no-results': '没有找到结果',
  'no-permission': '暂无访问权限',
  offline: '连接已断开',
  'not-found': '内容不存在',
  error: '暂时无法加载',
};
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Scenario is selected by the application, not inferred by the component. */
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}
export function EmptyState({
  variant = 'no-content',
  size = 'default',
  title,
  description,
  icon,
  action,
  headingLevel = 3,
  children,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      {...props}
      className={cx('f-empty-state', size !== 'default' && `f-empty-state--${size}`, className)}
      data-variant={variant}
    >
      {icon && (
        <div className="f-empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {createElement(
        `h${headingLevel}`,
        { className: 'f-empty-state-title' },
        title ?? titles[variant],
      )}
      {description && <p className="f-empty-state-description">{description}</p>}
      {children}
      {action && <div className="f-empty-state-action">{action}</div>}
    </div>
  );
}

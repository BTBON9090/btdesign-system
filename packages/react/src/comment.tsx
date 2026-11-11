import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './enterprise-utils.js';

export interface CommentProps extends Omit<HTMLAttributes<HTMLElement>, 'content'> {
  author: ReactNode;
  avatar?: ReactNode;
  time?: ReactNode;
  dateTime?: string;
  content?: ReactNode;
  actions?: ReactNode;
  alignment?: 'start' | 'end';
}

/** Actions and nested replies are supplied by the application; no network behavior is implied. */
export function Comment({
  author,
  avatar,
  time,
  dateTime,
  content,
  actions,
  alignment = 'start',
  children,
  className,
  ...attrs
}: CommentProps) {
  return (
    <article {...attrs} className={cx('f-comment', `f-comment--${alignment}`, className)}>
      {avatar != null && <div className="f-comment-avatar">{avatar}</div>}
      <div className="f-comment-body">
        <header className="f-comment-header">
          <span className="f-comment-author">{author}</span>
          {time != null && (
            <time className="f-comment-time" dateTime={dateTime}>
              {time}
            </time>
          )}
        </header>
        {content != null && <div className="f-comment-content">{content}</div>}
        {actions != null && <div className="f-comment-actions">{actions}</div>}
        {children != null && <div className="f-comment-replies">{children}</div>}
      </div>
    </article>
  );
}

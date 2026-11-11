import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';

export type TagTone = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClose'> {
  tone?: TagTone;
  closable?: boolean;
  disabled?: boolean;
  closeLabel?: string;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
}

/** The application owns the tag's presence and removes it in response to onClose. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    tone = 'default',
    closable = false,
    disabled = false,
    closeLabel = '移除标签',
    onClose,
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      className={['f-tag', `f-tag--${tone}`, disabled && 'f-tag--disabled', className]
        .filter(Boolean)
        .join(' ')}
      aria-disabled={disabled || undefined}
    >
      <span className="f-tag-content">{children}</span>
      {closable && (
        <button
          type="button"
          className="f-tag-close"
          disabled={disabled}
          aria-label={closeLabel}
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </span>
  );
});

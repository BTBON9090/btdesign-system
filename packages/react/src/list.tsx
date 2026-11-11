import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './enterprise-utils.js';

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  layout?: 'vertical' | 'grid';
  columns?: 1 | 2 | 3 | 4;
  bordered?: boolean;
  split?: boolean;
}
export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  { className, layout = 'vertical', columns = 3, bordered = false, split = true, style, ...props },
  ref,
) {
  return (
    <ul
      {...props}
      ref={ref}
      className={cx(
        'f-list',
        layout === 'grid' && 'f-list--grid',
        bordered && 'f-list--bordered',
        !split && 'f-list--no-split',
        className,
      )}
      style={{ ...style, '--f-list-columns': columns } as CSSProperties}
    />
  );
});
export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  leading?: ReactNode;
  extra?: ReactNode;
}
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { className, leading, extra, children, ...props },
  ref,
) {
  return (
    <li {...props} ref={ref} className={cx('f-list-item', className)}>
      {leading != null && <div className="f-list-item-leading">{leading}</div>}
      {children}
      {extra != null && <div className="f-list-item-extra">{extra}</div>}
    </li>
  );
});
export const ListItemContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListItemContent({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-list-item-content', className)} />;
  },
);
export const ListItemActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListItemActions({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-list-item-actions', className)} />;
  },
);

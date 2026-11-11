import { Children, Fragment, isValidElement, type HTMLAttributes, type ReactNode } from 'react';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars shown before the remaining count. */
  max?: number;
  /** Size of the remaining-count indicator; set the same size on individual avatars. */
  size?: 'sm' | 'md' | 'lg';
  /** Shape of the remaining-count indicator. */
  shape?: 'circle' | 'square';
  label?: string;
}

function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );
}

export function AvatarGroup({
  children,
  max,
  size = 'md',
  shape = 'circle',
  label = '头像组',
  className,
  ...props
}: AvatarGroupProps) {
  const avatars = flattenChildren(children);
  const limit =
    typeof max === 'number' && Number.isFinite(max) ? Math.max(0, Math.floor(max)) : avatars.length;
  const remaining = Math.max(0, avatars.length - limit);
  return (
    <div
      {...props}
      role="group"
      aria-label={props['aria-label'] ?? label}
      className={['f-avatar-group', className].filter(Boolean).join(' ')}
    >
      {avatars.slice(0, limit)}
      {remaining > 0 && (
        <span
          className={`f-avatar f-avatar--${size} ${shape === 'square' ? 'f-avatar--square ' : ''}f-avatar-group-overflow`}
          role="img"
          aria-label={`还有 ${remaining} 个头像`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

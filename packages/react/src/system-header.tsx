import { Fragment, forwardRef, isValidElement, type HTMLAttributes, type ReactNode } from 'react';

export interface SystemHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  brand?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  account?: ReactNode;
  organization?: ReactNode;
}
/** Empty fragments and whitespace do not produce layout sections. Custom components stay opaque. */
function hasContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false;
  if (typeof node === 'string') return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasContent);
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment)
    return hasContent(node.props.children);
  return true;
}

/** Semantic composition only; supplied controls retain their own behavior and labels. */
export const SystemHeader = forwardRef<HTMLElement, SystemHeaderProps>(function SystemHeader(
  { brand, search, actions, account, organization, className, ...props },
  ref,
) {
  const hasRight = [search, actions, account, organization].some(hasContent);
  return (
    <header
      {...props}
      ref={ref}
      className={['f-system-header', className].filter(Boolean).join(' ')}
    >
      {hasContent(brand) && <div className="f-system-header-brand">{brand}</div>}
      {hasRight && (
        <div className="f-system-header-end">
          {hasContent(search) && <div className="f-system-header-search">{search}</div>}
          {hasContent(actions) && <div className="f-system-header-actions">{actions}</div>}
          {hasContent(account) && <div className="f-system-header-account">{account}</div>}
          {hasContent(organization) && (
            <div className="f-system-header-organization">{organization}</div>
          )}
        </div>
      )}
    </header>
  );
});

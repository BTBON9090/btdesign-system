import {
  Fragment,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  breadcrumb?: ReactNode;
  /** Optional application-owned control beside the breadcrumb. */
  guide?: ReactNode;
  /** Optional application-owned tabs below the heading. */
  tabs?: ReactNode;
  actions?: ReactNode;
  backIcon?: ReactNode;
  backLabel?: string;
  showBack?: boolean;
  onBack?: (event: MouseEvent<HTMLButtonElement>) => void;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

function hasContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false;
  if (typeof node === 'string') return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasContent);
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment)
    return hasContent(node.props.children);
  return true;
}

/** Navigation remains application-owned; this component never guesses a destination. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  {
    title,
    description,
    breadcrumb,
    guide,
    tabs,
    actions,
    backIcon,
    backLabel = '返回',
    showBack,
    onBack,
    headingLevel = 1,
    className,
    ...props
  },
  ref,
) {
  const Heading =
    `h${Number.isInteger(headingLevel) && headingLevel >= 1 && headingLevel <= 6 ? headingLevel : 1}` as 'h1';
  const renderBack = showBack ?? Boolean(onBack);
  return (
    <header {...props} ref={ref} className={['f-page-header', className].filter(Boolean).join(' ')}>
      {hasContent(guide) ? (
        <div className="f-page-header-top">
          {breadcrumb != null && <div className="f-page-header-breadcrumb">{breadcrumb}</div>}
          <div className="f-page-header-guide">{guide}</div>
        </div>
      ) : (
        breadcrumb != null && <div className="f-page-header-breadcrumb">{breadcrumb}</div>
      )}
      <div className="f-page-header-main">
        <div className="f-page-header-heading">
          {renderBack && (
            <button
              type="button"
              className="f-page-header-back"
              aria-label={backLabel}
              disabled={!onBack}
              onClick={onBack}
            >
              <span aria-hidden="true">{backIcon ?? '←'}</span>
            </button>
          )}
          <div className="f-page-header-copy">
            <Heading className="f-page-header-title">{title}</Heading>
            {description != null && <div className="f-page-header-description">{description}</div>}
          </div>
        </div>
        {actions != null && <div className="f-page-header-actions">{actions}</div>}
      </div>
      {hasContent(tabs) && <div className="f-page-header-tabs">{tabs}</div>}
    </header>
  );
});

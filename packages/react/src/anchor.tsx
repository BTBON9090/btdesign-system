import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';

export interface AnchorItem {
  id: string;
  href: string;
  title: ReactNode;
  children?: AnchorItem[];
}
export interface AnchorProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: AnchorItem[];
  activeHref?: string;
  label?: string;
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
}
const isFragment = (href: string) => /^#[^\s#]+$/.test(href);

/** Uses native fragment links; applications with a hash router may handle onNavigate themselves. */
export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  { items, activeHref, label = '页面目录', onNavigate, className, ...props },
  ref,
) {
  function renderItems(entries: AnchorItem[]): ReactNode {
    return (
      <ol className="f-anchor-list">
        {entries.map((item) => (
          <li key={item.id} className="f-anchor-item">
            {isFragment(item.href) ? (
              <a
                className="f-anchor-link"
                href={item.href}
                aria-current={activeHref === item.href ? 'location' : undefined}
                onClick={(event) => onNavigate?.(item.href, event)}
              >
                {item.title}
              </a>
            ) : (
              <span className="f-anchor-link f-anchor-link--invalid" aria-disabled="true">
                {item.title}
              </span>
            )}
            {!!item.children?.length && renderItems(item.children)}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={props['aria-label'] ?? label}
      className={['f-anchor', className].filter(Boolean).join(' ')}
    >
      {renderItems(items)}
    </nav>
  );
});

import { useRef, useState, type ComponentType, type MouseEvent } from 'react';
import type { AnchorProps } from '../../../packages/react/src/anchor';
import { anchorPreviewItems, type AnchorPreviewOptions } from './anchor-example-code';

export function AnchorDemo({
  component: Anchor,
  options,
}: {
  component: ComponentType<AnchorProps>;
  options: AnchorPreviewOptions;
}) {
  const [activeHref, setActiveHref] = useState('#anchor-demo-overview');
  const content = useRef<HTMLDivElement>(null);
  function navigate(href: string, event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = content.current?.querySelector<HTMLElement>(href);
    if (!target || !content.current) return;
    content.current.scrollTop +=
      target.getBoundingClientRect().top - content.current.getBoundingClientRect().top;
    setActiveHref(href);
  }
  return (
    <div style={{ display: 'flex', gap: 'var(--f-space-6, 24px)', width: '100%' }}>
      <Anchor items={anchorPreviewItems(options)} activeHref={activeHref} onNavigate={navigate} />
      <div ref={content} style={{ height: 144, overflowY: 'auto', flex: 1 }}>
        <section id="anchor-demo-overview" style={{ minHeight: 144 }}>
          概览内容
        </section>
        <section id="anchor-demo-detail" style={{ minHeight: 144 }}>
          详细信息内容
        </section>
      </div>
    </div>
  );
}

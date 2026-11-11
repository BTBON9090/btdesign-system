import { useCallback, useRef } from 'react';
import { BackTop } from '@btdesign/react';
import type { BackTopPreviewOptions } from './BackTopExample';

export function BackTopDemo({ options }: { options: BackTopPreviewOptions }) {
  const area = useRef<HTMLDivElement>(null);
  const target = useCallback(() => area.current, []);
  return (
    <div className="demo-form">
      <div
        ref={area}
        tabIndex={0}
        aria-label="滚动预览区域"
        style={{ height: 140, overflow: 'auto', border: '1px solid var(--f-border)' }}
      >
        <div style={{ height: 450, padding: 16 }}>向下滚动查看返回顶部</div>
      </div>
      <BackTop
        target={target}
        visibilityHeight={80}
        position="inline"
        shape={options.shape}
        variant={options.variant}
        content={options.content}
      />
    </div>
  );
}

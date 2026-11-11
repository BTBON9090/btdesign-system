import { useState } from 'react';
import { Button, Tag } from '@btdesign/react';
import type { TagPreviewOptions } from './tag-example-code';

export function TagDemo({
  options,
  onAction,
}: {
  options: TagPreviewOptions;
  onAction?: (message: string) => void;
}) {
  const [visible, setVisible] = useState(true);
  return visible ? (
    <Tag
      tone={options.tone}
      closable={options.closable}
      disabled={options.disabled}
      closeLabel="移除设计系统标签"
      onClose={() => {
        setVisible(false);
        onAction?.('标签已移除');
      }}
    >
      设计系统
    </Tag>
  ) : (
    <Button variant="secondary" onClick={() => setVisible(true)}>
      恢复标签
    </Button>
  );
}

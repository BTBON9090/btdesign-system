import { useState, type ComponentType } from 'react';
import type { ResizeBoxProps } from '../../../packages/react/src/resize-box';
import type { ResizeBoxPreviewOptions } from './resize-box-example-code';

export function ResizeBoxDemo({
  component: ResizeBox,
  options,
}: {
  component: ComponentType<ResizeBoxProps>;
  options: ResizeBoxPreviewOptions;
}) {
  const [size, setSize] = useState(50);
  return (
    <div style={{ width: '100%' }}>
      <ResizeBox
        size={size}
        onSizeChange={setSize}
        orientation={options.orientation}
        min={20}
        max={80}
        step={5}
        disabled={options.disabled}
        style={{ height: options.orientation === 'vertical' ? 240 : 160, width: '100%' }}
        first="目录"
        second="内容区域"
      />
      <p>面板占比：{size}%</p>
    </div>
  );
}

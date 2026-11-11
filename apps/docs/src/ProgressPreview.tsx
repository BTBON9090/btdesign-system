import { Progress } from '@btdesign/react';
import type { ProgressPreviewOptions } from './ProgressExample';
export function ProgressPreview({ options }: { options: ProgressPreviewOptions }) {
  return (
    <div className="demo-form">
      <Progress
        label="任务进度"
        value={options.value}
        type={options.type}
        status={options.status}
        showValue={options.showValue}
      />
    </div>
  );
}

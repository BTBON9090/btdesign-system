import { Popover } from '@btdesign/react';
import type { PopoverPreviewOptions } from './PopoverExample';

export function PopoverDemo({ options }: { options: PopoverPreviewOptions }) {
  return (
    <div className="demo-form">
      <Popover
        trigger="通知设置"
        title={options.showTitle ? '通知设置' : undefined}
        label="通知设置"
        placement={options.placement}
        showArrow={options.showArrow}
        disabled={options.disabled}
        content={
          <label>
            <input type="checkbox" defaultChecked /> 接收项目更新
          </label>
        }
      />
    </div>
  );
}

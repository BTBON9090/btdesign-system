import type { ComponentType } from 'react';
import { Button } from '@btdesign/react';
import type { TooltipProps } from '../../../packages/react/src/tooltip';
import type { TooltipPreviewOptions } from './tooltip-example-code';

export function TooltipDemo({
  component: Tooltip,
  options,
}: {
  component: ComponentType<TooltipProps>;
  options: TooltipPreviewOptions;
}) {
  return (
    <Tooltip
      content="保存后可以继续邀请成员"
      placement={options.placement}
      disabled={options.disabled}
    >
      <Button variant="secondary">查看说明</Button>
    </Tooltip>
  );
}

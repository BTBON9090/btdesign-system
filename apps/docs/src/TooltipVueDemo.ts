import type { Component } from 'vue';
import type { TooltipPreviewOptions } from './tooltip-example-code';

export function tooltipVueDemo(
  vue: typeof import('vue'),
  tooltip: Component,
  button: Component,
  options: TooltipPreviewOptions,
) {
  return vue.h(
    tooltip,
    { content: '保存后可以继续邀请成员', placement: options.placement, disabled: options.disabled },
    {
      default: () => vue.h(button, { variant: 'secondary' }, () => '查看说明'),
    },
  );
}

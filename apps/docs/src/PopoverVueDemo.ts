import type { PopoverPreviewOptions } from './PopoverExample';

export function popoverVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: PopoverPreviewOptions,
) {
  return vue.h('div', { class: 'demo-form' }, [
    vue.h(
      ui.Popover,
      {
        triggerLabel: '通知设置',
        title: options.showTitle ? '通知设置' : undefined,
        label: '通知设置',
        placement: options.placement,
        showArrow: options.showArrow,
        disabled: options.disabled,
      },
      {
        default: () =>
          vue.h('label', [vue.h('input', { type: 'checkbox', checked: true }), ' 接收项目更新']),
      },
    ),
  ]);
}

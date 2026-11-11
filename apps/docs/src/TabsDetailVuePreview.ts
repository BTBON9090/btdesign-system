import { tabsPreviewItems } from './tabs-example-code';
import { tabsDetailIcon, type TabsDetailOptions } from './TabsDetailExample';

export function tabsDetailVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: TabsDetailOptions,
) {
  return vue.h(ui.Tabs, {
    class: 'full-width',
    label: '资源类型',
    items: tabsPreviewItems(options),
    variant: options.variant,
    orientation: options.orientation,
    size: options.size,
    renderIcon: options.showIcon ? tabsDetailIcon : undefined,
  });
}

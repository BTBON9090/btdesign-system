import { descriptionsItems, type DescriptionsPreviewOptions } from './DescriptionsExample';

export function descriptionsVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: DescriptionsPreviewOptions,
) {
  return vue.h('div', { class: 'demo-form' }, [
    vue.h(ui.Descriptions, {
      title: '项目详情',
      items: descriptionsItems,
      orientation: options.orientation,
      bordered: options.bordered,
      column: options.columns,
    }),
  ]);
}

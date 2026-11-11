import { sampleImage } from './ImageExample';
import { listPreviewItems, type ListPreviewOptions } from './ListExample';
export function listVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: ListPreviewOptions,
) {
  const { h } = vue;
  const grid = options.mode === 'grid';
  return h(
    ui.List,
    {
      class: 'enterprise-wide',
      layout: grid ? 'grid' : 'vertical',
      columns: options.columns,
      bordered: options.bordered,
      split: options.split,
    },
    () =>
      listPreviewItems.map((name) =>
        h(
          ui.ListItem,
          { key: name },
          {
            ...(!grid ? { leading: () => h('span', { 'aria-hidden': 'true' }, '◆') } : {}),
            ...(options.mode === 'advanced'
              ? {
                  extra: () => h('img', { src: sampleImage, alt: `${name}的示例图片`, width: 100 }),
                }
              : {}),
            default: () => [
              h(ui.ListItemContent, {}, () => [h('strong', name), h('p', '设计与研发共同维护')]),
              h(ui.ListItemActions, {}, () => h('details', [h('summary', '详情'), '示例项目'])),
            ],
          },
        ),
      ),
  );
}

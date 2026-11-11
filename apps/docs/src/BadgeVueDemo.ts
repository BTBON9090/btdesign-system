import type { BadgePreviewOptions } from './badge-example-code';

export function badgeVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: BadgePreviewOptions,
) {
  if (options.mode === 'status')
    return vue.h(ui.Badge, { variant: options.variant }, () => '已发布');
  const child =
    options.target === 'avatar'
      ? vue.h(ui.Avatar, { name: '林晓' })
      : options.target === 'text'
        ? vue.h('span', '消息')
        : undefined;
  const props =
    options.mode === 'dot'
      ? { variant: options.variant, dot: true, badgeLabel: '有新消息' }
      : {
          variant: options.variant,
          count: options.count,
          showZero: options.showZero,
          badgeLabel: `${options.count} 条未读消息`,
        };
  return vue.h(ui.Badge, props, child ? () => child : undefined);
}

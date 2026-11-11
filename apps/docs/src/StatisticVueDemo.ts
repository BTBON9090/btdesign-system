import type { StatisticPreviewOptions } from './StatisticExample';

export function statisticVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: StatisticPreviewOptions,
) {
  return vue.h(ui.Statistic, {
    title: '完成率（示例数据）',
    value: 64.5,
    format: options.format,
    precision: options.precision,
    trend: options.trend === 'none' ? undefined : options.trend,
    trendText: options.trend === 'none' ? undefined : '与上期相比',
  });
}

import { Statistic } from '@btdesign/react';
import type { StatisticPreviewOptions } from './StatisticExample';

export function StatisticDemo({ options }: { options: StatisticPreviewOptions }) {
  return (
    <Statistic
      title="完成率（示例数据）"
      value={64.5}
      format={options.format}
      precision={options.precision}
      trend={options.trend === 'none' ? undefined : options.trend}
      trendText={options.trend === 'none' ? undefined : '与上期相比'}
    />
  );
}

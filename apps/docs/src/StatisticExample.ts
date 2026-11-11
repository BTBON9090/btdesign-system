import type { DemoOptions, Framework } from './component-types';

export interface StatisticPreviewOptions {
  format: 'number' | 'percent';
  trend: 'none' | 'up' | 'down' | 'neutral';
  precision: 0 | 1 | 2;
}

export function statisticPreviewOptions(options?: DemoOptions): StatisticPreviewOptions {
  return {
    format: options?.statisticFormat ?? 'number',
    trend: options?.statisticTrend ?? 'none',
    precision: options?.statisticPrecision ?? 1,
  };
}

export function statisticExampleCode(framework: Framework, options: StatisticPreviewOptions) {
  const trend = options.trend === 'none' ? '' : ` trend="${options.trend}" trendText="与上期相比"`;
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { Statistic } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  <Statistic title="完成率（示例数据）" :value="64.5" format="${options.format}" :precision="${options.precision}"${trend} />\n</template>`;
  return `import { Statistic } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return <Statistic title="完成率（示例数据）" value={64.5} format="${options.format}" precision={${options.precision}}${trend} />;\n}`;
}

export type TimelinePreviewTone = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface TimelinePreviewOptions {
  orientation: 'vertical' | 'horizontal';
  tone: TimelinePreviewTone;
  showStates: boolean;
}

/** The same plain values power both framework previews and the generated code. */
export function timelinePreviewItems(options: TimelinePreviewOptions) {
  const entries = [
    {
      id: 'created',
      title: '创建项目',
      description: '明确目标与参与成员',
      time: '11 月 1 日',
      dateTime: '2026-11-01',
    },
    {
      id: 'review',
      title: '团队评审',
      description: '收集反馈并确认方案',
      time: '11 月 3 日',
      dateTime: '2026-11-03',
    },
    {
      id: 'launch',
      title: '发布上线',
      description: '向团队开放使用',
      time: '11 月 8 日',
      dateTime: '2026-11-08',
    },
  ];
  const states = ['done', 'current', 'pending'] as const;
  return entries.map((entry, index) => ({
    ...entry,
    tone: options.tone,
    ...(options.showStates ? { state: states[index] } : {}),
  }));
}

export function timelineExampleCode(
  framework: 'react' | 'vue',
  options: TimelinePreviewOptions,
): string {
  const items = JSON.stringify(timelinePreviewItems(options), null, 2);
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { Timeline, type TimelineItem } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items: TimelineItem[] = ${items};\n</script>\n\n<template>\n  <Timeline label="项目进度" orientation="${options.orientation}" :items="items" />\n</template>`;
  }
  return `import { Timeline, type TimelineItem } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items: TimelineItem[] = ${items};\n\nexport default function Example() {\n  return <Timeline label="项目进度" orientation="${options.orientation}" items={items} />;\n}`;
}

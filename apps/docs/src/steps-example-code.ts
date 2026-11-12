export interface StepsPreviewOptions {
  orientation: 'horizontal' | 'vertical';
  current: number;
  variant?: 'standard' | 'dot' | 'navigation' | 'arrow';
  size?: 'default' | 'small';
  count?: 3 | 4 | 5 | 6;
  showIcons: boolean;
  errorLast: boolean;
}

/** Plain data is shared by both previews and both generated examples. */
export function stepsPreviewItems(options: StepsPreviewOptions) {
  const entries = [
    { id: 'info', title: '填写信息', description: '设置项目名称和目标' },
    { id: 'review', title: '确认配置', description: '检查成员与权限' },
    { id: 'publish', title: '发布项目', description: '向团队开放使用' },
    { id: 'check', title: '检查状态', description: '确认项目运行正常' },
    { id: 'notify', title: '通知成员', description: '与团队同步项目' },
    { id: 'finish', title: '完成归档', description: '保存项目记录' },
  ];
  const icons = ['○', '◆', '✓', '●', '◇', '★'];
  const visibleEntries = entries.slice(0, options.count ?? 3);
  return visibleEntries.map((entry, index) => ({
    ...entry,
    ...(options.showIcons ? { icon: icons[index] } : {}),
    ...(index === visibleEntries.length - 1 && options.errorLast
      ? { status: 'error' as const }
      : {}),
  }));
}

export function stepsExampleCode(framework: 'react' | 'vue', options: StepsPreviewOptions): string {
  const items = JSON.stringify(stepsPreviewItems(options), null, 2);
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { Steps, type StepItem } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items: StepItem[] = ${items};\n</script>\n\n<template>\n  <Steps label="项目创建进度" orientation="${options.orientation}" variant="${options.variant ?? 'standard'}" size="${options.size ?? 'default'}" :current="${options.current}" :items="items" />\n</template>`;
  }
  return `import { Steps, type StepItem } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items: StepItem[] = ${items};\n\nexport default function Example() {\n  return <Steps label="项目创建进度" orientation="${options.orientation}" variant="${options.variant ?? 'standard'}" size="${options.size ?? 'default'}" current={${options.current}} items={items} />;\n}`;
}

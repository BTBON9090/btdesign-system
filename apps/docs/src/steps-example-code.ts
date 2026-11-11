export interface StepsPreviewOptions {
  orientation: 'horizontal' | 'vertical';
  current: 0 | 1 | 2;
  showIcons: boolean;
  errorLast: boolean;
}

/** Plain data is shared by both previews and both generated examples. */
export function stepsPreviewItems(options: StepsPreviewOptions) {
  const entries = [
    { id: 'info', title: '填写信息', description: '设置项目名称和目标' },
    { id: 'review', title: '确认配置', description: '检查成员与权限' },
    { id: 'publish', title: '发布项目', description: '向团队开放使用' },
  ];
  const icons = ['○', '◆', '✓'];
  return entries.map((entry, index) => ({
    ...entry,
    ...(options.showIcons ? { icon: icons[index] } : {}),
    ...(index === 2 && options.errorLast ? { status: 'error' as const } : {}),
  }));
}

export function stepsExampleCode(framework: 'react' | 'vue', options: StepsPreviewOptions): string {
  const items = JSON.stringify(stepsPreviewItems(options), null, 2);
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { Steps, type StepItem } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst items: StepItem[] = ${items};\n</script>\n\n<template>\n  <Steps label="项目创建进度" orientation="${options.orientation}" :current="${options.current}" :items="items" />\n</template>`;
  }
  return `import { Steps, type StepItem } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst items: StepItem[] = ${items};\n\nexport default function Example() {\n  return <Steps label="项目创建进度" orientation="${options.orientation}" current={${options.current}} items={items} />;\n}`;
}

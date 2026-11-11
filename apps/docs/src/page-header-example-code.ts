export interface PageHeaderPreviewOptions {
  showBack: boolean;
  showDescription: boolean;
  showActions: boolean;
  showBreadcrumb: boolean;
}

export function pageHeaderExampleCode(
  framework: 'react' | 'vue',
  options: PageHeaderPreviewOptions,
): string {
  const imports = options.showActions ? 'PageHeader, Button' : 'PageHeader';
  const description = options.showDescription ? ' description="查看并管理项目的基本信息。"' : '';
  const backHandler = options.showBack
    ? "const handleBack = () => window.alert('已触发返回示例');\n"
    : '';
  const saveHandler = options.showActions
    ? "const handleSave = () => window.alert('已触发保存示例');\n"
    : '';
  if (framework === 'vue') {
    const slots = [
      options.showBreadcrumb
        ? '<template #breadcrumb><nav aria-label="面包屑">项目 / 项目详情</nav></template>'
        : '',
      options.showActions
        ? '<template #actions><Button @click="handleSave">保存更改</Button></template>'
        : '',
    ]
      .filter(Boolean)
      .join('\n    ');
    return `<script setup lang="ts">\nimport { ${imports} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n${backHandler}${saveHandler}</script>\n\n<template>\n  <PageHeader title="项目详情"${description}${options.showBack ? ' @back="handleBack"' : ''}>${slots ? `\n    ${slots}\n  ` : ''}</PageHeader>\n</template>`;
  }
  const breadcrumb = options.showBreadcrumb
    ? ' breadcrumb={<nav aria-label="面包屑">项目 / 项目详情</nav>}'
    : '';
  const actions = options.showActions
    ? ' actions={<Button onClick={handleSave}>保存更改</Button>}'
    : '';
  const handlers = [backHandler, saveHandler]
    .filter(Boolean)
    .map((handler) => `  ${handler}`)
    .join('');
  return `import { ${imports} } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n${handlers}  return <PageHeader title="项目详情"${description}${options.showBack ? ' onBack={handleBack}' : ''}${breadcrumb}${actions} />;\n}`;
}

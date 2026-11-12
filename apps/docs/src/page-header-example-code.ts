export interface PageHeaderPreviewOptions {
  showBack: boolean;
  showDescription: boolean;
  showActions: boolean;
  showBreadcrumb: boolean;
  showGuide?: boolean;
  showTabs?: boolean;
}

export const pageHeaderTabItems = [
  { value: 'overview', label: '概览', content: '概览内容（演示）' },
  { value: 'members', label: '成员', content: '成员内容（演示）' },
];

export function pageHeaderExampleCode(
  framework: 'react' | 'vue',
  options: PageHeaderPreviewOptions,
): string {
  const imports = [
    'PageHeader',
    ...(options.showActions || options.showGuide ? ['Button'] : []),
    ...(options.showTabs ? ['Tabs'] : []),
  ].join(', ');
  const description = options.showDescription ? ' description="查看并管理项目的基本信息。"' : '';
  const backHandler = options.showBack
    ? "const handleBack = () => window.alert('已触发返回示例');\n"
    : '';
  const saveHandler = options.showActions
    ? "const handleSave = () => window.alert('已触发保存示例');\n"
    : '';
  const guideHandler = options.showGuide
    ? "const handleGuide = () => window.alert('已点击帮助指引（演示）');\n"
    : '';
  const tabItems = JSON.stringify(pageHeaderTabItems);
  if (framework === 'vue') {
    const slots = [
      options.showBreadcrumb
        ? '<template #breadcrumb><nav aria-label="面包屑">项目 / 项目详情</nav></template>'
        : '',
      options.showActions
        ? '<template #actions><Button @click="handleSave">保存更改</Button></template>'
        : '',
      options.showGuide
        ? '<template #guide><Button variant="ghost" @click="handleGuide">帮助指引</Button></template>'
        : '',
      options.showTabs
        ? '<template #tabs><Tabs label="项目内容" variant="line" :items="tabItems" default-value="overview" /></template>'
        : '',
    ]
      .filter(Boolean)
      .join('\n    ');
    return `<script setup lang="ts">\nimport { ${imports} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n${backHandler}${saveHandler}${guideHandler}${options.showTabs ? `const tabItems = ${tabItems};\n` : ''}</script>\n\n<template>\n  <PageHeader title="项目详情"${description}${options.showBack ? ' @back="handleBack"' : ''}>${slots ? `\n    ${slots}\n  ` : ''}</PageHeader>\n</template>`;
  }
  const breadcrumb = options.showBreadcrumb
    ? ' breadcrumb={<nav aria-label="面包屑">项目 / 项目详情</nav>}'
    : '';
  const actions = options.showActions
    ? ' actions={<Button onClick={handleSave}>保存更改</Button>}'
    : '';
  const guide = options.showGuide
    ? ' guide={<Button variant="ghost" onClick={handleGuide}>帮助指引</Button>}'
    : '';
  const tabs = options.showTabs
    ? ` tabs={<Tabs label="项目内容" variant="line" items={${tabItems}} defaultValue="overview" />}`
    : '';
  const handlers = [backHandler, saveHandler, guideHandler]
    .filter(Boolean)
    .map((handler) => `  ${handler}`)
    .join('');
  return `import { ${imports} } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n${handlers}  return <PageHeader title="项目详情"${description}${options.showBack ? ' onBack={handleBack}' : ''}${breadcrumb}${actions}${guide}${tabs} />;\n}`;
}

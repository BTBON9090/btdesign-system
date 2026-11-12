import { pageHeaderTabItems } from './page-header-example-code';
import type { PageHeaderPreviewOptions } from './page-header-example-code';

export function pageHeaderVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  component: import('vue').Component,
  options: PageHeaderPreviewOptions,
  onAction: (message: string) => void,
) {
  const slots = {
    ...(options.showGuide
      ? {
          guide: () =>
            vue.h(
              ui.Button,
              { variant: 'ghost', onClick: () => onAction('已点击帮助指引（演示）') },
              () => '帮助指引',
            ),
        }
      : {}),
    ...(options.showTabs
      ? {
          tabs: () =>
            vue.h(ui.Tabs, {
              label: '项目内容',
              variant: 'line',
              items: pageHeaderTabItems,
              defaultValue: 'overview',
            }),
        }
      : {}),
    ...(options.showBreadcrumb
      ? { breadcrumb: () => vue.h('nav', { 'aria-label': '面包屑' }, '项目 / 项目详情') }
      : {}),
    ...(options.showActions
      ? {
          actions: () =>
            vue.h(ui.Button, { onClick: () => onAction('已触发保存示例') }, () => '保存更改'),
        }
      : {}),
  };
  return vue.h(
    component,
    {
      title: '项目详情',
      description: options.showDescription ? '查看并管理项目的基本信息。' : undefined,
      ...(options.showBack ? { onBack: () => onAction('已触发返回示例') } : {}),
    },
    slots,
  );
}

import type { PageHeaderPreviewOptions } from './page-header-example-code';

export function pageHeaderVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  component: import('vue').Component,
  options: PageHeaderPreviewOptions,
  onAction: (message: string) => void,
) {
  const slots = {
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

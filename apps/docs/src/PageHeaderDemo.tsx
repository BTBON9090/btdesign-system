import type { ComponentType } from 'react';
import { Button, Tabs } from '@btdesign/react';
import { pageHeaderTabItems } from './page-header-example-code';
import type { PageHeaderProps } from '../../../packages/react/src/page-header';
import type { PageHeaderPreviewOptions } from './page-header-example-code';

export function PageHeaderDemo({
  component: PageHeader,
  options,
  onAction,
}: {
  component: ComponentType<PageHeaderProps>;
  options: PageHeaderPreviewOptions;
  onAction: (message: string) => void;
}) {
  return (
    <PageHeader
      title="项目详情"
      description={options.showDescription ? '查看并管理项目的基本信息。' : undefined}
      onBack={options.showBack ? () => onAction('已触发返回示例') : undefined}
      breadcrumb={
        options.showBreadcrumb ? <nav aria-label="面包屑">项目 / 项目详情</nav> : undefined
      }
      guide={
        options.showGuide ? (
          <Button variant="ghost" onClick={() => onAction('已点击帮助指引（演示）')}>
            帮助指引
          </Button>
        ) : undefined
      }
      tabs={
        options.showTabs ? (
          <Tabs
            label="项目内容"
            variant="line"
            items={pageHeaderTabItems}
            defaultValue="overview"
          />
        ) : undefined
      }
      actions={
        options.showActions ? (
          <Button onClick={() => onAction('已触发保存示例')}>保存更改</Button>
        ) : undefined
      }
    />
  );
}

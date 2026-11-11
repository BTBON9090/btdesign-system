import type { ComponentType } from 'react';
import { Button } from '@btdesign/react';
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
      actions={
        options.showActions ? (
          <Button onClick={() => onAction('已触发保存示例')}>保存更改</Button>
        ) : undefined
      }
    />
  );
}

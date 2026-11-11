import React from 'react';
import { Tabs } from '@btdesign/react';
import { tabsPreviewItems } from './tabs-example-code';
import { tabsDetailIcon, type TabsDetailOptions } from './TabsDetailExample';

export function TabsDetailPreview({ options }: { options: TabsDetailOptions }) {
  return (
    <Tabs
      className="full-width"
      label="资源类型"
      items={tabsPreviewItems(options)}
      variant={options.variant}
      orientation={options.orientation}
      size={options.size}
      renderIcon={options.showIcon ? tabsDetailIcon : undefined}
    />
  );
}

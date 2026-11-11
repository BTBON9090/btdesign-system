import { Descriptions } from '@btdesign/react';
import { descriptionsItems, type DescriptionsPreviewOptions } from './DescriptionsExample';

export function DescriptionsDemo({ options }: { options: DescriptionsPreviewOptions }) {
  return (
    <div className="demo-form">
      <Descriptions
        title="项目详情"
        items={descriptionsItems}
        orientation={options.orientation}
        bordered={options.bordered}
        column={options.columns}
      />
    </div>
  );
}

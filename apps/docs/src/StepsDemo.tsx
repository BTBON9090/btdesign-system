import type { ComponentType } from 'react';
import type { StepsProps } from '../../../packages/react/src/steps';
import { stepsPreviewItems, type StepsPreviewOptions } from './steps-example-code';

export function StepsDemo({
  component: Steps,
  options,
}: {
  component: ComponentType<StepsProps>;
  options: StepsPreviewOptions;
}) {
  return (
    <Steps
      label="项目创建进度"
      orientation={options.orientation}
      variant={options.variant}
      size={options.size}
      current={options.current}
      items={stepsPreviewItems(options)}
    />
  );
}

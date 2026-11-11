import type { ComponentType } from 'react';
import type { TimelineProps } from '../../../packages/react/src/timeline';
import { timelinePreviewItems, type TimelinePreviewOptions } from './timeline-example-code';

/** Receive the public component from the workbench so the preview uses the installed package. */
export function TimelineDemo({
  component: Timeline,
  options,
}: {
  component: ComponentType<TimelineProps>;
  options: TimelinePreviewOptions;
}) {
  return (
    <Timeline
      label="项目进度"
      orientation={options.orientation}
      items={timelinePreviewItems(options)}
    />
  );
}

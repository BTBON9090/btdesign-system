import type { Component } from 'vue';
import { timelinePreviewItems, type TimelinePreviewOptions } from './timeline-example-code';

/** Render the actual Vue package component, keeping the same items as the React preview. */
export function timelineVueDemo(
  vue: typeof import('vue'),
  component: Component,
  options: TimelinePreviewOptions,
) {
  return vue.h(component, {
    label: '项目进度',
    orientation: options.orientation,
    items: timelinePreviewItems(options),
  });
}

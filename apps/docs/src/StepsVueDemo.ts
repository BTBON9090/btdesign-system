import type { Component } from 'vue';
import { stepsPreviewItems, type StepsPreviewOptions } from './steps-example-code';

export function stepsVueDemo(
  vue: typeof import('vue'),
  component: Component,
  options: StepsPreviewOptions,
) {
  return vue.h(component, {
    label: '项目创建进度',
    orientation: options.orientation,
    current: options.current,
    items: stepsPreviewItems(options),
  });
}

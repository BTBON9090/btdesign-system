import type { ProgressPreviewOptions } from './ProgressExample';
export function progressVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: ProgressPreviewOptions,
) {
  return vue.h('div', { class: 'demo-form' }, [
    vue.h(ui.Progress, {
      label: '任务进度',
      value: options.value,
      type: options.type,
      status: options.status,
      showValue: options.showValue,
    }),
  ]);
}

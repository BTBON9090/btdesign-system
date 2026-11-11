import type { ImagePreviewOptions } from './ImageExample';
import { brokenImage, sampleImage } from './ImageExample';

export function imageVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: ImagePreviewOptions,
) {
  return vue.h('div', { class: 'demo-form' }, [
    vue.h(ui.Image, {
      src: options.broken ? brokenImage : sampleImage,
      alt: '山景示例',
      aspectRatio: options.aspectRatio,
      fit: options.fit,
      caption: '山景示例',
      preview: options.preview,
    }),
  ]);
}

import { sampleCarouselImages } from './ImageExample';
import type { CarouselPreviewOptions } from './CarouselExample';

export function carouselVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: CarouselPreviewOptions,
) {
  const items = ['第一张', '第二张', '第三张'].map((label, index) => ({
    key: String(index),
    label,
    content: vue.h('img', {
      src: sampleCarouselImages[index],
      alt: label,
      style: { display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' },
    }),
  }));
  return vue.h('div', { class: 'demo-form' }, [
    vue.h(ui.Carousel, {
      label: '场景展示',
      items,
      indicatorStyle: options.indicatorStyle,
      indicatorPlacement: options.indicatorPlacement,
      loop: options.loop,
    }),
  ]);
}

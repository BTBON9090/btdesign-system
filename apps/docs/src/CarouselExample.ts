import type { DemoOptions, Framework } from './component-types';
import { sampleCarouselImages } from './ImageExample';

export interface CarouselPreviewOptions {
  indicatorStyle: 'dots' | 'lines';
  indicatorPlacement: 'bottom' | 'start' | 'end';
  loop: boolean;
}

export function carouselPreviewOptions(options?: DemoOptions): CarouselPreviewOptions {
  return {
    indicatorStyle: options?.carouselIndicatorStyle ?? 'dots',
    indicatorPlacement: options?.carouselIndicatorPlacement ?? 'bottom',
    loop: options?.carouselLoop ?? false,
  };
}

export function carouselExampleCode(framework: Framework, options: CarouselPreviewOptions) {
  const sources = JSON.stringify(sampleCarouselImages);
  const attrs = `label="场景展示" indicatorStyle="${options.indicatorStyle}" indicatorPlacement="${options.indicatorPlacement}"${options.loop ? ' loop' : ''}`;
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { h } from 'vue';\nimport { Carousel } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n\nconst sources = ${sources};\nconst items = ['第一张', '第二张', '第三张'].map((label, index) => ({ key: String(index), label, content: h('img', { src: sources[index], alt: label, style: { display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' } }) }));\n</script>\n\n<template>\n  <Carousel :items="items" ${attrs} />\n</template>`;
  return `import { Carousel } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst sources = ${sources};\nconst items = ['第一张', '第二张', '第三张'].map((label, index) => ({ key: String(index), label, content: <img src={sources[index]} alt={label} style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} /> }));\n\nexport default function Example() {\n  return <Carousel items={items} ${attrs} />;\n}`;
}

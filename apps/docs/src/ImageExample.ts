import type { DemoOptions, Framework } from './component-types';

export interface ImagePreviewOptions {
  aspectRatio: NonNullable<DemoOptions['imageRatio']>;
  fit: 'cover' | 'contain';
  preview: boolean;
  broken: boolean;
}

export function imagePreviewOptions(options?: DemoOptions): ImagePreviewOptions {
  return {
    aspectRatio: options?.imageRatio ?? '16 / 9',
    fit: options?.imageFit ?? 'cover',
    preview: options?.imagePreview ?? false,
    broken: options?.imageBroken ?? false,
  };
}

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320"><rect width="480" height="320" fill="#e8ecdf"/><circle cx="345" cy="95" r="40" fill="#aab892"/><path d="M0 270 150 115l100 100 65-60 165 115v50H0z" fill="#80946e"/></svg>';
export const sampleImage = `data:image/svg+xml,${encodeURIComponent(svg)}`;
export const sampleCarouselImages = [
  sampleImage,
  `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320"><rect width="480" height="320" fill="#e4e9ee"/><circle cx="140" cy="92" r="39" fill="#b8c9d6"/><path d="M0 260 130 160l90 67 100-112 160 145v60H0z" fill="#758e9f"/></svg>')}`,
  `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320"><rect width="480" height="320" fill="#f1e8e1"/><circle cx="330" cy="90" r="38" fill="#dfbaa4"/><path d="M0 270 90 180l110 62 92-103 188 131v50H0z" fill="#bb907c"/></svg>')}`,
];
export const brokenImage = 'data:image/png;base64,invalid';

export function imageExampleCode(framework: Framework, options: ImagePreviewOptions) {
  const src = JSON.stringify(options.broken ? brokenImage : sampleImage);
  const props = `alt="山景示例" aspectRatio="${options.aspectRatio}" fit="${options.fit}" caption="山景示例"${options.preview ? ' preview' : ''}`;
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { Image } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n\nconst src = ${src};\n</script>\n\n<template>\n  <Image :src="src" ${props} />\n</template>`;
  return `import { Image } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nconst src = ${src};\n\nexport default function Example() {\n  return <Image src={src} ${props} />;\n}`;
}

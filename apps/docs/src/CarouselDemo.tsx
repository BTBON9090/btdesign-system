import { Carousel } from '@btdesign/react';
import { sampleCarouselImages } from './ImageExample';
import type { CarouselPreviewOptions } from './CarouselExample';

export function CarouselDemo({ options }: { options: CarouselPreviewOptions }) {
  const items = ['第一张', '第二张', '第三张'].map((label, index) => ({
    key: String(index),
    label,
    content: (
      <img
        src={sampleCarouselImages[index]}
        alt={label}
        style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
      />
    ),
  }));
  return (
    <div className="demo-form">
      <Carousel
        label="场景展示"
        items={items}
        indicatorStyle={options.indicatorStyle}
        indicatorPlacement={options.indicatorPlacement}
        loop={options.loop}
      />
    </div>
  );
}

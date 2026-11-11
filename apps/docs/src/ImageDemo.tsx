import { Image } from '@btdesign/react';
import { brokenImage, sampleImage, type ImagePreviewOptions } from './ImageExample';

export function ImageDemo({ options }: { options: ImagePreviewOptions }) {
  return (
    <div className="demo-form">
      <Image
        src={options.broken ? brokenImage : sampleImage}
        alt="山景示例"
        aspectRatio={options.aspectRatio}
        fit={options.fit}
        caption="山景示例"
        preview={options.preview}
      />
    </div>
  );
}

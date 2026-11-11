import { useState, type ComponentType } from 'react';
import {
  dropzoneResult,
  type DropzoneRejection,
  type DropzoneResult,
  type DropzoneSource,
  type UploadDropzonePreviewOptions,
} from './UploadDropzoneExample';

export type UploadDropzonePreviewProps = UploadDropzonePreviewOptions & {
  label: string;
  onFilesChange: (accepted: File[], rejected: DropzoneRejection[], source: DropzoneSource) => void;
};
export function UploadDropzonePreview({
  component: UploadDropzone,
  options,
}: {
  component: ComponentType<UploadDropzonePreviewProps>;
  options: UploadDropzonePreviewOptions;
}) {
  const [result, setResult] = useState<DropzoneResult | null>(null);
  return (
    <div className="demo-form">
      <UploadDropzone
        {...options}
        accept={options.accept ?? ''}
        label="选择或拖放文件"
        onFilesChange={(accepted, rejected, source) =>
          setResult(dropzoneResult(accepted, rejected, source))
        }
      />
      <p>文件仅在本地处理，不会上传。</p>
      {result && (
        <div aria-live="polite">
          <p>来源：{result.source === 'drop' ? '拖放' : '文件选择'}</p>
          <p>已接受：{result.accepted.join('、') || '无'}</p>
        </div>
      )}
    </div>
  );
}

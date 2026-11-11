import { useState, type ComponentType } from 'react';
import type { UploadFileListProps } from '../../../packages/react/src/upload-file-list';
import {
  uploadFileListPreviewItems,
  uploadFileListSample,
  type UploadFileListPreviewOptions,
} from './UploadFileListExample';
export function UploadFileListPreview({
  component: UploadFileList,
  options,
}: {
  component: ComponentType<UploadFileListProps>;
  options: UploadFileListPreviewOptions;
}) {
  const [ids, setIds] = useState(() => uploadFileListSample.map((item) => item.id));
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const items = uploadFileListPreviewItems(ids, options.status);
  const selected = items.find((item) => item.id === preview);
  return (
    <>
      <UploadFileList
        items={items}
        variant={options.variant}
        disabled={options.disabled}
        onRemove={(id) => {
          setIds((current) => current.filter((item) => item !== id));
          if (preview === id) setPreview('');
        }}
        onRetry={(id) =>
          setMessage('已请求重试：' + (items.find((item) => item.id === id)?.name ?? id))
        }
        onPreview={setPreview}
      />
      {message && <p role="status">{message}</p>}
      {selected && (
        <div>
          <p>{selected.name}</p>
          <img src={selected.thumbnailUrl} alt={selected.alt} width="160" />
          <button type="button" onClick={() => setPreview('')}>
            关闭预览
          </button>
        </div>
      )}
    </>
  );
}

import React, { useState, type HTMLAttributes } from 'react';
import { formatFileSize, safeHref, safeImageHref, type FileItem } from '@btdesign/engine';

export interface UploadFileItem extends FileItem {
  thumbnailUrl?: string;
  alt?: string;
}
export interface UploadFileListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'onError'> {
  items: UploadFileItem[];
  variant?: 'file' | 'picture' | 'picture-card';
  disabled?: boolean;
  emptyText?: string;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  onPreview?: (id: string) => void;
}
const statuses = {
  ready: '待上传',
  uploading: '上传中',
  done: '已完成',
  error: '上传失败',
} as const;

function Thumbnail({ item }: { item: UploadFileItem }) {
  const source = safeImageHref(item.thumbnailUrl);
  const [failedSource, setFailedSource] = useState<string>();
  if (!source) return <div className="f-upload-file-thumbnail-placeholder">暂无缩略图</div>;
  if (failedSource === source)
    return <div className="f-upload-file-thumbnail-placeholder">缩略图加载失败</div>;
  return (
    <img
      className="f-upload-file-thumbnail"
      src={source}
      alt={item.alt ?? ''}
      onError={() => setFailedSource(source)}
    />
  );
}
export function UploadFileList({
  items,
  variant = 'file',
  disabled = false,
  emptyText = '暂无文件',
  onRemove,
  onRetry,
  onPreview,
  className,
  ...props
}: UploadFileListProps) {
  return (
    <ul
      {...props}
      aria-label={props['aria-label'] ?? '文件列表'}
      className={['f-list', 'f-upload-file-list', `f-upload-file-list--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {items.length ? (
        items.map((item) => {
          const href = disabled ? undefined : safeHref(item.url);
          const progress =
            typeof item.progress === 'number' && Number.isFinite(item.progress)
              ? Math.max(0, Math.min(100, item.progress))
              : undefined;
          return (
            <li className="f-list-item f-upload-file-item" key={item.id}>
              {variant !== 'file' && <Thumbnail key={item.thumbnailUrl ?? ''} item={item} />}
              <div className="f-list-item-content">
                <div className="f-list-item-title">
                  {href ? (
                    <a href={href} download>
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </div>
                <div className="f-file-meta">
                  {item.size !== undefined && <span>{formatFileSize(item.size)} </span>}
                  <span>{statuses[item.status ?? 'ready']}</span>
                </div>
                {item.status === 'uploading' && (
                  <progress
                    className="f-file-progress"
                    max={100}
                    value={progress}
                    aria-label={`${item.name} 上传进度`}
                  />
                )}
                {item.status === 'error' && item.error && (
                  <p className="f-file-error">{item.error}</p>
                )}
              </div>
              {(onPreview || onRemove || (onRetry && item.status === 'error')) && (
                <div className="f-list-item-actions">
                  {onPreview && (
                    <button
                      type="button"
                      className="f-button f-button--ghost f-button--sm"
                      disabled={disabled}
                      aria-label={`预览 ${item.name}`}
                      onClick={() => onPreview(item.id)}
                    >
                      预览
                    </button>
                  )}
                  {onRetry && item.status === 'error' && (
                    <button
                      type="button"
                      className="f-button f-button--ghost f-button--sm"
                      disabled={disabled}
                      aria-label={`重试 ${item.name}`}
                      onClick={() => onRetry(item.id)}
                    >
                      重试
                    </button>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      className="f-button f-button--ghost f-button--sm"
                      disabled={disabled}
                      aria-label={`移除 ${item.name}`}
                      onClick={() => onRemove(item.id)}
                    >
                      移除
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })
      ) : (
        <li className="f-list-item">{emptyText}</li>
      )}
    </ul>
  );
}

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './enterprise-utils.js';

export interface ImageProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  src: string;
  alt: string;
  aspectRatio?: string;
  fit?: 'cover' | 'contain';
  loading?: 'eager' | 'lazy';
  fallback?: ReactNode;
  caption?: ReactNode;
  preview?: boolean;
  previewLabel?: string;
}

/** Displays one image. Preview is available only after the image has loaded. */
export function Image({
  src,
  alt,
  aspectRatio,
  fit = 'cover',
  loading = 'lazy',
  fallback,
  caption,
  preview = false,
  previewLabel,
  className,
  ...attrs
}: ImageProps) {
  const [result, setResult] = useState<{ src: string; status: 'loading' | 'loaded' | 'error' }>({
    src,
    status: 'loading',
  });
  const status = result.src === src ? result.status : 'loading';
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const name = previewLabel?.trim() || (alt ? `查看大图：${alt}` : '查看大图');
  useEffect(() => {
    const el = dialog.current;
    if (!open || !preview || status !== 'loaded' || !el) return;
    if (!el.open) el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, [open, preview, status, src]);
  useEffect(() => {
    if (!preview || status !== 'loaded') setOpen(false);
  }, [preview, status, src]);
  const image =
    status !== 'error' ? (
      <img
        key={src}
        src={src}
        alt={alt}
        loading={loading}
        style={{ objectFit: fit }}
        onLoad={() => setResult({ src, status: 'loaded' })}
        onError={() => setResult({ src, status: 'error' })}
      />
    ) : null;
  return (
    <figure {...attrs} className={cx('f-image', className)}>
      <div className="f-image-frame" style={{ aspectRatio }}>
        {preview ? (
          <button
            ref={trigger}
            type="button"
            className="f-image-trigger"
            aria-label={name}
            disabled={status !== 'loaded'}
            onClick={() => setOpen(true)}
          >
            {image}
          </button>
        ) : (
          image
        )}
        {status === 'loading' && (
          <span className="f-image-status" role="status">
            加载中
          </span>
        )}
        {status === 'error' && (
          <span
            className="f-image-status"
            role="img"
            aria-label={alt ? `图片加载失败：${alt}` : '图片加载失败'}
          >
            {fallback ?? '图片加载失败'}
          </span>
        )}
      </div>
      {caption != null && <figcaption className="f-image-caption">{caption}</figcaption>}
      {preview && (
        <dialog
          ref={dialog}
          className="f-image-dialog"
          aria-label={name}
          onCancel={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
          onClose={() => {
            setOpen(false);
            trigger.current?.focus();
          }}
        >
          <button
            type="button"
            className="f-image-close"
            aria-label="关闭图片预览"
            onClick={() => setOpen(false)}
          >
            关闭
          </button>
          <img src={src} alt={alt} />
        </dialog>
      )}
    </figure>
  );
}

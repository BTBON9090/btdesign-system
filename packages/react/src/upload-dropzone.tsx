import { forwardRef, useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { validateFiles, type FileRejection, type FileRejectionCode } from '@btdesign/engine';

export type UploadDropzoneSource = 'picker' | 'drop';
export interface UploadDropzoneProps {
  accept?: string;
  multiple?: boolean;
  /** Maximum per-file size in bytes. */
  maxFileSize?: number;
  /** Maximum total number, including existingCount supplied by the application. */
  maxFiles?: number;
  existingCount?: number;
  disabled?: boolean;
  /** Accessible name and visible text of the file selection button. */
  label?: string;
  children?: ReactNode;
  /** Hands files to the application; the component does not submit or upload them. */
  onFilesChange?: (
    accepted: File[],
    rejected: FileRejection<File>[],
    source: UploadDropzoneSource,
  ) => void;
}
const reasonText: Record<FileRejectionCode, string> = {
  'type-not-accepted': '不支持的文件类型',
  'type-unverifiable': '无法确认文件类型',
  'file-too-large': '文件超过大小限制',
  'too-many-files': '文件数量超出限制',
  'multiple-not-allowed': '仅支持单文件',
};
const containsFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');

/** Application-managed file selection. Dropped files are not assigned to a form input. */
export const UploadDropzone = forwardRef<HTMLButtonElement, UploadDropzoneProps>(
  function UploadDropzone(
    {
      accept,
      multiple = false,
      maxFileSize,
      maxFiles,
      existingCount,
      disabled = false,
      label = '选择文件',
      children,
      onFilesChange,
    }: UploadDropzoneProps,
    ref,
  ) {
    const input = useRef<HTMLInputElement>(null);
    const dragDepth = useRef(0);
    const [dragging, setDragging] = useState(false);
    const [rejected, setRejected] = useState<FileRejection<File>[]>([]);
    useEffect(() => {
      if (disabled) {
        dragDepth.current = 0;
        setDragging(false);
      }
    }, [disabled]);
    const receive = (files: File[], source: UploadDropzoneSource) => {
      if (disabled || !files.length) return;
      const result = validateFiles(files, {
        accept,
        multiple,
        maxFileSize,
        maxFiles,
        existingCount,
      });
      setRejected(result.rejected);
      onFilesChange?.(result.accepted, result.rejected, source);
    };
    return (
      <div
        className="f-upload-dropzone"
        data-dragging={(!disabled && dragging) || undefined}
        data-disabled={disabled || undefined}
        onDragEnter={(event) => {
          if (!containsFiles(event)) return;
          event.preventDefault();
          if (!disabled) {
            dragDepth.current += 1;
            setDragging(true);
          }
        }}
        onDragOver={(event) => {
          if (!containsFiles(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
        }}
        onDragLeave={(event) => {
          if (!containsFiles(event)) return;
          event.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(event) => {
          if (!containsFiles(event)) return;
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (!disabled) receive(Array.from(event.dataTransfer.files), 'drop');
        }}
      >
        <input
          ref={input}
          type="file"
          hidden
          tabIndex={-1}
          aria-hidden="true"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            // This input is an action trigger, not a native submitted form field.
            event.currentTarget.value = '';
            receive(files, 'picker');
          }}
        />
        <button
          ref={ref}
          type="button"
          className="f-upload-dropzone-trigger f-button f-button--secondary"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          {label}
        </button>
        {children ?? <p>点击选择文件，或将文件拖到此处</p>}
        {rejected.length > 0 && (
          <ul className="f-upload-dropzone-rejections" role="status" aria-live="polite">
            {rejected.map(({ file, index, reasons }) => (
              <li key={index}>
                {file.name}：{reasons.map((reason) => reasonText[reason]).join('；')}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

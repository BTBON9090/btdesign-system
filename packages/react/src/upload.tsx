import { forwardRef, type ChangeEvent } from 'react';
import { useFieldControl, type InputProps } from './fields.js';

export interface UploadProps extends Omit<InputProps, 'type' | 'value' | 'defaultValue'> {
  /** Selected files are passed to the application; this component does not upload them. */
  onFilesChange?: (files: File[], event: ChangeEvent<HTMLInputElement>) => void;
}

/** A native, keyboard-operable file selector with application-owned transfer and status. */
export const Upload = forwardRef<HTMLInputElement, UploadProps>(function Upload(
  { onFilesChange, onChange, className, invalid, controlSize = 'md', ...props },
  ref,
) {
  const field = useFieldControl(props, invalid);
  return (
    <input
      {...props}
      {...field}
      ref={ref}
      type="file"
      className={['f-upload', `f-control--${controlSize}`, className].filter(Boolean).join(' ')}
      onChange={(event) => {
        onChange?.(event);
        onFilesChange?.(Array.from(event.currentTarget.files ?? []), event);
      }}
    />
  );
});

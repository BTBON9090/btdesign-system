import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import type { ChoiceOption, FileItem } from '@btdesign/engine';
import { formatFileSize, safeHref } from '@btdesign/engine';
import { useFieldControl } from './fields.js';
import { cx, useControllable } from './enterprise-utils.js';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, onChange, onCheckedChange, ...props },
  ref,
) {
  return (
    <label className={cx('f-choice', className)}>
      <input
        {...props}
        ref={ref}
        type="radio"
        className="f-radio"
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented && !props.disabled)
            onCheckedChange?.(event.currentTarget.checked);
        }}
      />
      {label && <span>{label}</span>}
    </label>
  );
});
export interface CheckboxGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  options: ChoiceOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}
export function CheckboxGroup({
  options,
  value,
  defaultValue = [],
  onValueChange,
  name,
  label,
  className,
  invalid,
  ...props
}: CheckboxGroupProps) {
  const id = useId();
  const field = useFieldControl({ ...props, 'aria-label': props['aria-label'] ?? label }, invalid);
  const [selected, update] = useControllable(value, defaultValue, onValueChange);
  const { disabled: _disabled, required: _required, ...rest } = props;
  return (
    <div
      {...rest}
      id={`${field.id ?? id}-group`}
      role="group"
      aria-label={props['aria-label'] ?? label}
      aria-labelledby={field['aria-labelledby']}
      aria-describedby={field['aria-describedby']}
      aria-invalid={field['aria-invalid']}
      aria-disabled={field.disabled || undefined}
      className={cx('f-choice-group', className)}
    >
      {options.map((option, index) => (
        <label
          className="f-choice-option"
          key={option.value}
          data-disabled={field.disabled || option.disabled || undefined}
        >
          <input
            id={
              index ===
              Math.max(
                0,
                options.findIndex((item) => !item.disabled),
              )
                ? field.id
                : undefined
            }
            className="f-choice-input f-checkbox"
            type="checkbox"
            name={name}
            value={option.value}
            checked={selected.includes(option.value)}
            disabled={field.disabled || option.disabled}
            aria-labelledby={`${id}-${index}-label`}
            aria-describedby={
              option.description ? `${id}-${index}-description` : field['aria-describedby']
            }
            onChange={(event) => {
              if (field.disabled || option.disabled) return;
              update(
                event.currentTarget.checked
                  ? [...new Set([...selected, option.value])]
                  : selected.filter((item) => item !== option.value),
              );
            }}
          />
          <span>
            <span className="f-choice-label" id={`${id}-${index}-label`}>
              {option.label}
            </span>
            {option.description && (
              <span className="f-choice-description" id={`${id}-${index}-description`}>
                {option.description}
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}
export interface ToggleGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  options: ChoiceOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  label?: string;
}
export function ToggleGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  disabled,
  name,
  label,
  className,
  ...props
}: ToggleGroupProps) {
  const id = useId();
  const field = useFieldControl({ ...props, disabled, 'aria-label': label });
  const [selected, update] = useControllable(
    value,
    defaultValue ?? (multiple ? [] : ''),
    onValueChange,
  );
  const values = Array.isArray(selected) ? selected : [selected];
  return (
    <div
      {...props}
      id={`${field.id ?? id}-group`}
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={label ?? (field['aria-labelledby'] ? undefined : '选项')}
      aria-labelledby={field['aria-labelledby']}
      aria-describedby={field['aria-describedby']}
      aria-invalid={field['aria-invalid']}
      aria-disabled={field.disabled || undefined}
      className={cx('f-toggle-group', className)}
    >
      {options.map((option, index) => (
        <label
          key={option.value}
          className="f-toggle-option"
          data-selected={values.includes(option.value) || undefined}
          data-disabled={field.disabled || option.disabled || undefined}
        >
          <input
            id={
              index ===
              Math.max(
                0,
                options.findIndex((item) => !item.disabled),
              )
                ? field.id
                : undefined
            }
            className="f-toggle-input"
            type={multiple ? 'checkbox' : 'radio'}
            name={name ?? (multiple ? undefined : id)}
            value={option.value}
            checked={values.includes(option.value)}
            disabled={field.disabled || option.disabled}
            onChange={(event) => {
              if (field.disabled || option.disabled) return;
              update(
                multiple
                  ? event.currentTarget.checked
                    ? [...new Set([...values.filter(Boolean), option.value])]
                    : values.filter((item) => item !== option.value)
                  : option.value,
              );
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
export interface SegmentedProps extends Omit<
  ToggleGroupProps,
  'multiple' | 'value' | 'defaultValue' | 'onValueChange'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}
export function Segmented({ className, onValueChange, ...props }: SegmentedProps) {
  return (
    <ToggleGroup
      {...props}
      className={cx('f-segmented', className)}
      onValueChange={(value) => onValueChange?.(String(value))}
    />
  );
}
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}
export function ButtonGroup({ label = '操作', className, ...props }: ButtonGroupProps) {
  return (
    <div {...props} role="group" aria-label={label} className={cx('f-button-group', className)} />
  );
}
export const List = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(function List(
  { className, ...props },
  ref,
) {
  return <ul {...props} ref={ref} className={cx('f-list', className)} />;
});
export const ListItem = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(function ListItem(
  { className, ...props },
  ref,
) {
  return <li {...props} ref={ref} className={cx('f-list-item', className)} />;
});
export const ListItemContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListItemContent({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-list-item-content', className)} />;
  },
);
export const ListItemActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListItemActions({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-list-item-actions', className)} />;
  },
);
export interface FileListProps extends HTMLAttributes<HTMLUListElement> {
  files: FileItem[];
  disabled?: boolean;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  emptyText?: string;
}
export function FileList({
  files,
  disabled,
  onRemove,
  onRetry,
  emptyText = '暂无文件',
  className,
  ...props
}: FileListProps) {
  return (
    <List {...props} className={cx('f-file-list', className)}>
      {files.length ? (
        files.map((file) => (
          <ListItem key={file.id}>
            <ListItemContent>
              <div className="f-list-item-title">
                {safeHref(file.url) ? (
                  <a href={safeHref(file.url)} download>
                    {file.name}
                  </a>
                ) : (
                  file.name
                )}
              </div>
              <div className="f-file-meta">
                {file.size !== undefined && <span>{formatFileSize(file.size)}</span>}
                <span>
                  {
                    (
                      {
                        ready: '待上传',
                        uploading: '上传中',
                        done: '已完成',
                        error: '上传失败',
                      } as const
                    )[file.status ?? 'ready']
                  }
                </span>
              </div>
              {file.status === 'uploading' && (
                <progress
                  className="f-file-progress"
                  max={100}
                  value={
                    typeof file.progress === 'number' && Number.isFinite(file.progress)
                      ? Math.min(100, Math.max(0, file.progress))
                      : undefined
                  }
                  aria-label={`${file.name} 上传进度`}
                />
              )}
              {file.error && <p className="f-field-error">{file.error}</p>}
            </ListItemContent>
            <ListItemActions>
              {file.status === 'error' && onRetry && (
                <button
                  className="f-button f-button--ghost f-button--sm"
                  type="button"
                  disabled={disabled}
                  onClick={() => onRetry(file.id)}
                  aria-label={`重试 ${file.name}`}
                >
                  重试
                </button>
              )}
              {onRemove && (
                <button
                  className="f-button f-button--ghost f-button--sm"
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemove(file.id)}
                  aria-label={`移除 ${file.name}`}
                >
                  移除
                </button>
              )}
            </ListItemActions>
          </ListItem>
        ))
      ) : (
        <ListItem>{emptyText}</ListItem>
      )}
    </List>
  );
}

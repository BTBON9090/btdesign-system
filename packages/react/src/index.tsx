import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  version as reactVersion,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TableHTMLAttributes,
} from 'react';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: Size | 'xs' | 'xl';
  tone?: 'standard' | 'success' | 'warning' | 'danger' | 'ai';
  shape?: 'default' | 'pill';
  iconOnly?: boolean;
  loading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    tone = 'standard',
    shape = 'default',
    iconOnly = false,
    loading = false,
    className,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'f-button',
        `f-button--${variant}`,
        `f-button--${size}`,
        tone !== 'standard' && `f-button--tone-${tone}`,
        shape === 'pill' && 'f-button--pill',
        iconOnly && 'f-button--icon-only',
        className,
      )}
    >
      {loading && <span className="f-spinner" aria-hidden="true" />}
      {(!iconOnly || !loading) && children}
    </button>
  );
});

export { Field, Input, Textarea, Select, InputGroup, InputAddon } from './fields.js';
export type {
  FieldProps,
  InputProps,
  TextareaProps,
  SelectProps,
  ControlProps,
  ControlSize,
} from './fields.js';
export * from './composition.js';
export * from './enterprise-choice.js';
export * from './enterprise-form.js';
export * from './enterprise-date.js';
export * from './enterprise-tree.js';
export * from './enterprise-navigation.js';
export * from './enterprise-table.js';
export * from './avatar-group.js';
export * from './input-variants.js';
export * from './slider.js';
export * from './time-picker.js';
export * from './collapse.js';
export * from './tag.js';
export * from './descriptions.js';
export * from './timeline.js';
export * from './comment.js';
export * from './input-tag.js';
export * from './steps.js';
export * from './statistic.js';
export * from './tooltip.js';
export { OrganizationTransfer } from './organization-transfer.js';
export type { OrganizationTransferProps } from './organization-transfer.js';
export { UploadDropzone } from './upload-dropzone.js';
export type { UploadDropzoneProps, UploadDropzoneSource } from './upload-dropzone.js';
export { UploadFileList } from './upload-file-list.js';
export type { UploadFileItem, UploadFileListProps } from './upload-file-list.js';
export { AutoComplete } from './auto-complete.js';
export type { AutoCompleteProps } from './auto-complete.js';
export * from './image.js';
export * from './carousel.js';
export * from './page-header.js';
export * from './system-header.js';
export * from './rate.js';
export * from './anchor.js';
export * from './popover.js';
export * from './mention.js';
export * from './back-top.js';
export * from './upload.js';
export * from './resize-box.js';
export * from './search-select.js';
export type {
  ChoiceOption,
  TreeNode,
  ValidationRule,
  FormValues,
  FormRules,
  FormErrors,
  DateRange,
  NavItem,
  FileItem,
  TableSort,
} from '@btdesign/engine';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, onChange, onCheckedChange, indeterminate = false, ...props },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={cx('f-choice', className)}>
      <input
        {...props}
        type="checkbox"
        ref={inputRef}
        className="f-checkbox"
        aria-checked={indeterminate ? 'mixed' : props['aria-checked']}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented && !props.disabled)
            onCheckedChange?.(event.currentTarget.checked);
          event.currentTarget.indeterminate = indeterminate;
        }}
      />
      {label && <span>{label}</span>}
    </label>
  );
});

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value' | 'defaultValue'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
  value?: string;
}
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    label,
    onCheckedChange,
    className,
    onClick,
    disabled,
    id,
    name,
    value = 'on',
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const [internal, setInternal] = useState(defaultChecked);
  const active = checked ?? internal;
  const controlId = id ?? generatedId;
  return (
    <label className={cx('f-choice', className)} htmlFor={controlId}>
      <button
        {...props}
        id={controlId}
        ref={ref}
        type="button"
        role="switch"
        aria-checked={active}
        disabled={disabled}
        className="f-switch"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            if (checked === undefined) setInternal(!active);
            onCheckedChange?.(!active);
          }
        }}
      >
        <span className="f-switch-thumb" aria-hidden="true" />
      </button>
      {label && <span>{label}</span>}
      {name && (
        <input
          type="hidden"
          name={name}
          value={active ? value : ''}
          disabled={disabled || !active}
        />
      )}
    </label>
  );
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  count?: number | string;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  badgeLabel?: string;
}
export function Badge({
  variant = 'default',
  count,
  max = 99,
  showZero = false,
  dot = false,
  badgeLabel,
  children,
  className,
  ...props
}: BadgeProps) {
  if (count === undefined && !dot) {
    return (
      <span {...props} className={cx('f-badge', `f-badge--${variant}`, className)}>
        {children}
      </span>
    );
  }
  const visible =
    dot ||
    (typeof count === 'number'
      ? Number.isFinite(count) && (count > 0 || (count === 0 && showZero))
      : !!count);
  const content = typeof count === 'number' && count > max ? `${max}+` : count;
  const marker = visible ? (
    <span
      className={cx(
        'f-badge',
        `f-badge--${variant}`,
        dot ? 'f-badge--dot' : 'f-badge--count',
        children != null && 'f-badge--overlay',
      )}
      role="img"
      aria-label={badgeLabel ?? (dot ? '提示' : String(count))}
    >
      {dot ? null : content}
    </span>
  ) : null;
  return children != null ? (
    <span {...props} className={cx('f-badge-anchor', className)}>
      {children}
      {marker}
    </span>
  ) : (
    <span {...props} className={cx('f-badge-standalone', className)}>
      {marker}
    </span>
  );
}
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return <div {...props} ref={ref} className={cx('f-card', className)} />;
});
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
}
export function Alert({
  variant = 'info',
  title,
  className,
  children,
  role,
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      role={role ?? (variant === 'danger' ? 'alert' : 'status')}
      className={cx('f-alert', `f-alert--${variant}`, className)}
    >
      {title && <div className="f-alert-title">{title}</div>}
      {children && <div className="f-alert-description">{children}</div>}
    </div>
  );
}

function hasTabIconContent(node: ReactNode): boolean {
  return Children.toArray(node).some((child) => {
    if (typeof child === 'string') return Boolean(child.trim());
    if (isValidElement(child) && child.type === Fragment)
      return hasTabIconContent((child.props as { children?: ReactNode }).children);
    return true;
  });
}

export interface TabItem {
  value: string;
  label: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}
export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  variant?: 'default' | 'line' | 'text' | 'card' | 'card-gutter' | 'rounded';
  orientation?: 'horizontal' | 'vertical';
  /** Relative to the Tabs geometry set by the current theme. */
  size?: 'mini' | 'small' | 'medium' | 'big';
  /** Non-interactive decoration; the label supplies the accessible name. */
  renderIcon?: (item: TabItem, index: number) => ReactNode;
}
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label = '内容选项',
  variant = 'default',
  orientation = 'horizontal',
  size = 'medium',
  renderIcon,
  className,
  ...props
}: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState(
    defaultValue ?? items.find((item) => !item.disabled)?.value ?? '',
  );
  const selected = value ?? internal;
  const active = items.some((item) => item.value === selected && !item.disabled)
    ? selected
    : items.find((item) => !item.disabled)?.value;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <div
      {...props}
      className={cx(
        'f-tabs',
        variant !== 'default' && `f-tabs--${variant}`,
        orientation === 'vertical' && 'f-tabs--vertical',
        size !== 'medium' && `f-tabs--${size}`,
        className,
      )}
    >
      <div className="f-tabs-list" role="tablist" aria-label={label} aria-orientation={orientation}>
        {items.map((item, index) => {
          const icon = renderIcon?.(item, index);
          const hasIcon = hasTabIconContent(icon);
          const inertAttribute = Number.parseInt(reactVersion, 10) < 19 ? '' : true;
          return (
            <button
              key={item.value}
              ref={(element) => {
                refs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-controls={`${baseId}-panel-${index}`}
              aria-selected={active === item.value}
              tabIndex={active === item.value ? 0 : -1}
              disabled={item.disabled}
              className="f-tab"
              onClick={() => select(item.value)}
              onKeyDown={(event) => {
                const enabled = items
                  .map((candidate, candidateIndex) => (candidate.disabled ? -1 : candidateIndex))
                  .filter((candidate) => candidate >= 0);
                const position = enabled.indexOf(index);
                let next: number | undefined;
                if (event.key === (orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'))
                  next = enabled[(position + 1) % enabled.length];
                if (event.key === (orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'))
                  next = enabled[(position - 1 + enabled.length) % enabled.length];
                if (event.key === 'Home') next = enabled[0];
                if (event.key === 'End') next = enabled.at(-1);
                if (next !== undefined) {
                  event.preventDefault();
                  select(items[next].value);
                  refs.current[next]?.focus();
                }
              }}
            >
              {hasIcon && (
                <span
                  className="f-tab-icon"
                  aria-hidden="true"
                  {...({ inert: inertAttribute } as HTMLAttributes<HTMLSpanElement>)}
                >
                  {icon}
                </span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item, index) => (
        <div
          key={item.value}
          className="f-tab-panel"
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={active !== item.value}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export interface DialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
}
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  closeLabel = '关闭对话框',
  className,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const onChangeRef = useRef(onOpenChange);
  onChangeRef.current = onOpenChange;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(
    () => () => {
      if (ref.current?.open) ref.current.close();
    },
    [],
  );
  return (
    <dialog
      {...props}
      ref={ref}
      className={cx('f-dialog', className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onChangeRef.current(false);
      }}
      onClose={() => {
        if (open) onChangeRef.current(false);
      }}
    >
      <div className="f-dialog-header">
        <h2 className="f-dialog-title" id={`${id}-title`}>
          {title}
        </h2>
        {description && (
          <p className="f-dialog-description" id={`${id}-description`}>
            {description}
          </p>
        )}
        <button
          type="button"
          className="f-dialog-close"
          aria-label={closeLabel}
          onClick={() => onOpenChange(false)}
        >
          ×
        </button>
      </div>
      <div className="f-dialog-body">{children}</div>
      {footer && <div className="f-dialog-footer">{footer}</div>}
    </dialog>
  );
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: Size;
  shape?: 'circle' | 'square';
}
export function Avatar({
  name,
  src,
  size = 'md',
  shape = 'circle',
  className,
  ...props
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => Array.from(part)[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';
  return (
    <span
      {...props}
      role="img"
      aria-label={name}
      className={cx(
        'f-avatar',
        `f-avatar--${size}`,
        shape === 'square' && 'f-avatar--square',
        className,
      )}
    >
      {src && failedSrc !== src ? (
        <img src={src} alt="" onError={() => setFailedSrc(src)} />
      ) : (
        initials
      )}
    </span>
  );
}
export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}
export function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <hr
      {...props}
      role="separator"
      aria-orientation={orientation}
      className={cx(
        'f-separator',
        orientation === 'vertical' && 'f-separator--vertical',
        className,
      )}
    />
  );
}
export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  function Table({ className, children, ...props }, ref) {
    return (
      <div
        className="f-table-scroll"
        role="region"
        tabIndex={0}
        aria-label={props['aria-label'] ?? '数据表格'}
      >
        <table {...props} ref={ref} className={cx('f-table', className)}>
          {children}
        </table>
      </div>
    );
  },
);
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
}
export function Skeleton({ className, style, width, height, ...props }: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx('f-skeleton', className)}
      style={{ width, height, ...style }}
    />
  );
}
export { Progress } from './progress.js';
export type { ProgressProps, ProgressStatus, ProgressType } from './progress.js';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TableHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: Size;
  loading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
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
      className={cx('f-button', `f-button--${variant}`, `f-button--${size}`, className)}
    >
      {loading && <span className="f-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input {...props} ref={ref} className={cx('f-input', className)} />;
  },
);
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea {...props} ref={ref} className={cx('f-textarea', className)} />;
});
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select {...props} ref={ref} className={cx('f-select', className)}>
        {children}
      </select>
    );
  },
);

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, onChange, onCheckedChange, ...props },
  ref,
) {
  return (
    <label className={cx('f-choice', className)}>
      <input
        {...props}
        type="checkbox"
        ref={ref}
        className="f-checkbox"
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
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
}
export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return <span {...props} className={cx('f-badge', `f-badge--${variant}`, className)} />;
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
}
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label = '内容选项',
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
    <div {...props} className={cx('f-tabs', className)}>
      <div className="f-tabs-list" role="tablist" aria-label={label}>
        {items.map((item, index) => (
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
              if (event.key === 'ArrowRight') next = enabled[(position + 1) % enabled.length];
              if (event.key === 'ArrowLeft')
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
            {item.label}
          </button>
        ))}
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
}
export function Avatar({ name, src, size = 'md', className, ...props }: AvatarProps) {
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
      className={cx('f-avatar', `f-avatar--${size}`, className)}
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
export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
}
export function Progress({ value, max = 100, label, className, ...props }: ProgressProps) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(limit, value)) : 0;
  const percent = Math.round((safeValue / limit) * 100);
  return (
    <div {...props} className={cx('f-progress-wrap', className)}>
      {label && (
        <div className="f-progress-label">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        className="f-progress"
        role="progressbar"
        aria-label={label ?? props['aria-label'] ?? '进度'}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={limit}
      >
        <div className="f-progress-fill" style={{ width: `${percent}%` } as CSSProperties} />
      </div>
    </div>
  );
}

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { Input, useFieldControl, type ControlProps } from './fields.js';
import {
  commitNumberInputBlur,
  numberBounds,
  paginationState,
  safeNumber,
  stepNativeNumber,
} from './control-utils.js';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}
export function RadioGroup({
  options,
  value,
  defaultValue = '',
  onValueChange,
  name,
  label,
  orientation = 'vertical',
  className,
  invalid,
  ...props
}: RadioGroupProps) {
  const generatedId = useId();
  const field = useFieldControl({ ...props, 'aria-label': props['aria-label'] ?? label }, invalid);
  const { required: _required, disabled: _disabled, ...domProps } = props;
  const baseId = field.id ?? generatedId;
  const firstEnabled = options.findIndex((option) => !option.disabled);
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const { required, disabled, ...groupAttrs } = field;
  return (
    <div
      {...domProps}
      {...groupAttrs}
      id={`${baseId}-group`}
      role="radiogroup"
      aria-label={props['aria-label'] ?? label}
      aria-required={required || undefined}
      aria-disabled={disabled || undefined}
      className={cx('f-radio-group', `f-radio-group--${orientation}`, className)}
    >
      {options.map((option, index) => {
        const labelId = `${baseId}-option-${index}-label`;
        const descriptionId = `${baseId}-option-${index}-description`;
        const describedBy =
          [field['aria-describedby'], option.description && descriptionId]
            .filter(Boolean)
            .join(' ') || undefined;
        return (
          <label
            key={option.value}
            className="f-radio-option"
            data-disabled={disabled || option.disabled || undefined}
          >
            <input
              type="radio"
              className="f-radio"
              id={
                index === (firstEnabled === -1 ? 0 : firstEnabled)
                  ? baseId
                  : `${baseId}-option-${index}`
              }
              name={name ?? generatedId}
              value={option.value}
              checked={active === option.value}
              disabled={disabled || option.disabled}
              required={required}
              aria-invalid={field['aria-invalid']}
              aria-labelledby={labelId}
              aria-describedby={describedBy}
              onChange={(event) => {
                if (!event.currentTarget.checked) return;
                if (value === undefined) setInternal(option.value);
                onValueChange?.(option.value);
              }}
            />
            <span className="f-radio-option-content">
              <span className="f-radio-option-label" id={labelId}>
                {option.label}
              </span>
              {option.description && (
                <span className="f-radio-option-description" id={descriptionId}>
                  {option.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export interface NumberInputProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
    >,
    ControlProps {
  value?: number | '';
  defaultValue?: number | '';
  onValueChange?: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  decrementLabel?: string;
  incrementLabel?: string;
}
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    min,
    max,
    step = 1,
    className,
    controlSize = 'md',
    invalid,
    onChange,
    onBlur,
    decrementLabel = '减少数值',
    incrementLabel = '增加数值',
    ...props
  },
  forwardedRef,
) {
  const [internal, setInternal] = useState<number | ''>(safeNumber(defaultValue));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const field = useFieldControl(props, invalid);
  const bounds = numberBounds(min, max);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const current = safeNumber(value !== undefined ? value : internal);
  const change = (next: number | '') => {
    if (value === undefined) setInternal(next);
    if (next !== current) onValueChange?.(next);
  };
  const move = (direction: -1 | 1) => {
    if (field.disabled || props.readOnly) return;
    change(stepNativeNumber(inputRef.current, direction, current));
    inputRef.current?.focus();
  };
  const disabled = field.disabled || props.readOnly;
  return (
    <div
      className={cx('f-number-input', `f-control--${controlSize}`, className)}
      data-disabled={field.disabled || undefined}
    >
      <button
        type="button"
        className="f-number-input-step"
        aria-label={decrementLabel}
        disabled={disabled || (current !== '' && bounds.min !== undefined && current <= bounds.min)}
        onClick={() => move(-1)}
      >
        −
      </button>
      <Input
        {...props}
        {...field}
        type="number"
        inputMode={props.inputMode ?? 'decimal'}
        min={bounds.min}
        max={bounds.max}
        step={increment}
        controlSize={controlSize}
        invalid={invalid}
        value={current}
        ref={(element) => {
          inputRef.current = element;
          if (typeof forwardedRef === 'function') forwardedRef(element);
          else if (forwardedRef) forwardedRef.current = element;
        }}
        onChange={(event) => {
          onChange?.(event);
          if (event.defaultPrevented) return;
          change(event.target.value === '' ? '' : safeNumber(event.target.valueAsNumber));
        }}
        onBlur={(event) => {
          onBlur?.(event);
          commitNumberInputBlur(
            event,
            { ...bounds, disabled: field.disabled, readOnly: props.readOnly },
            change,
          );
        }}
      />
      <button
        type="button"
        className="f-number-input-step"
        aria-label={incrementLabel}
        disabled={disabled || (current !== '' && bounds.max !== undefined && current >= bounds.max)}
        onClick={() => move(1)}
      >
        +
      </button>
    </div>
  );
});

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: { label: string; href?: string }[];
  label?: string;
  separator?: 'slash' | 'dot' | 'arrow';
}
function safeHref(href?: string) {
  if (!href || /^(javascript|data|vbscript):/i.test(href.replace(/[\u0000-\u0020\u007f]/g, '')))
    return undefined;
  return href;
}
export function Breadcrumb({ items, label = '面包屑导航', separator = 'slash', className, ...props }: BreadcrumbProps) {
  return (
    <nav
      {...props}
      aria-label={props['aria-label'] ?? label}
      className={cx('f-breadcrumb', className)}
    >
      <ol className="f-breadcrumb-list">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="f-breadcrumb-item">
            {index > 0 && (
              <span className="f-breadcrumb-separator" aria-hidden="true">
                {separator === 'dot' ? '·' : separator === 'arrow' ? '›' : '/'}
              </span>
            )}
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : safeHref(item.href) ? (
              <a href={safeHref(item.href)}>{item.label}</a>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  label?: string;
  disabled?: boolean;
}
export function Pagination({
  page,
  total,
  pageSize = 10,
  onPageChange,
  siblingCount = 1,
  label = '分页导航',
  disabled,
  className,
  ...props
}: PaginationProps) {
  const state = paginationState(page, total, pageSize, siblingCount);
  return (
    <nav
      {...props}
      aria-label={props['aria-label'] ?? label}
      className={cx('f-pagination', className)}
    >
      <ol className="f-pagination-list">
        <li>
          <button
            type="button"
            className="f-pagination-button"
            aria-label="上一页"
            disabled={disabled || state.total === 0 || state.page <= 1}
            onClick={() => onPageChange?.(state.page - 1)}
          >
            上一页
          </button>
        </li>
        {state.pages.map((item, index) => (
          <li key={`${item}-${index}`}>
            {item === 'ellipsis' ? (
              <span className="f-pagination-ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                className="f-pagination-button"
                aria-label={`第 ${item} 页`}
                aria-current={item === state.page ? 'page' : undefined}
                disabled={disabled || state.total === 0}
                onClick={() => {
                  if (item !== state.page) onPageChange?.(item);
                }}
              >
                {item}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            type="button"
            className="f-pagination-button"
            aria-label="下一页"
            disabled={disabled || state.total === 0 || state.page >= state.pageCount}
            onClick={() => onPageChange?.(state.page + 1)}
          >
            下一页
          </button>
        </li>
      </ol>
    </nav>
  );
}

export { EmptyState } from './empty-state.js';
export type { EmptyStateProps, EmptyStateVariant, EmptyStateSize } from './empty-state.js';
export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}
export function Spinner({ label = '加载中', size = 'md', className, ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? label}
      className={cx('f-spinner-wrap', `f-spinner-wrap--${size}`, className)}
    >
      <span className="f-spinner" aria-hidden="true" />
      <span className="f-spinner-label">{label}</span>
    </span>
  );
}

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-card-header', className)} />;
  },
);
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return <h3 {...props} ref={ref} className={cx('f-card-title', className)} />;
  },
);
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return <p {...props} ref={ref} className={cx('f-card-description', className)} />;
});
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-card-content', className)} />;
  },
);
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-card-footer', className)} />;
  },
);
export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...props }, ref) {
  return <caption {...props} ref={ref} className={cx('f-table-caption', className)} />;
});
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return <thead {...props} ref={ref} className={cx('f-table-header', className)} />;
});
export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return <tbody {...props} ref={ref} className={cx('f-table-body', className)} />;
});
export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter({ className, ...props }, ref) {
  return <tfoot {...props} ref={ref} className={cx('f-table-footer', className)} />;
});
export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return <tr {...props} ref={ref} className={cx('f-table-row', className)} />;
  },
);
export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHead({ className, scope = 'col', ...props }, ref) {
    return <th {...props} scope={scope} ref={ref} className={cx('f-table-head', className)} />;
  },
);
export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, ...props }, ref) {
    return <td {...props} ref={ref} className={cx('f-table-cell', className)} />;
  },
);

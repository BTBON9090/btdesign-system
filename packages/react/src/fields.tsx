import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
export type ControlSize = 'sm' | 'md' | 'lg';
interface FieldContextValue {
  id: string;
  labelId: string;
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
  disabled?: boolean;
}
const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal';
  children: ReactNode;
}
/** Wrap one control (or one RadioGroup) so its name, instructions and error stay linked. */
export function Field({
  id,
  label,
  description,
  error,
  required,
  disabled,
  layout = 'vertical',
  children,
  className,
  ...props
}: FieldProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const hasDescription = description !== undefined && description !== null && description !== '';
  const hasError = error !== undefined && error !== null && error !== '' && error !== false;
  const labelId = `${controlId}-label`;
  const describedBy =
    [hasDescription && `${controlId}-description`, hasError && `${controlId}-error`]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <FieldContext.Provider
      value={{ id: controlId, labelId, describedBy, invalid: hasError, required, disabled }}
    >
      <div
        {...props}
        className={cx('f-field', layout === 'horizontal' && 'f-field--horizontal', className)}
        data-disabled={disabled || undefined}
        data-invalid={hasError || undefined}
      >
        <label id={labelId} htmlFor={controlId} className="f-field-label">
          {label}
          {required && (
            <span aria-hidden="true" className="f-field-required">
              {' '}
              *
            </span>
          )}
        </label>
        {children}
        {hasDescription && (
          <p id={`${controlId}-description`} className="f-field-description">
            {description}
          </p>
        )}
        {hasError && (
          <p id={`${controlId}-error`} className="f-field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

interface ControlAttributes {
  id?: string;
  required?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  'aria-invalid'?: HTMLAttributes<HTMLElement>['aria-invalid'];
}
export function useFieldControl(props: ControlAttributes, invalid?: boolean) {
  const field = useContext(FieldContext);
  const describedBy =
    [
      ...new Set(
        [props['aria-describedby'], field?.describedBy]
          .filter(Boolean)
          .flatMap((value) => value!.split(/\s+/))
          .filter(Boolean),
      ),
    ].join(' ') || undefined;
  return {
    id: props.id ?? field?.id,
    required: props.required ?? field?.required,
    disabled: props.disabled ?? field?.disabled,
    'aria-describedby': describedBy,
    'aria-labelledby':
      props['aria-labelledby'] ?? (props['aria-label'] ? undefined : field?.labelId),
    'aria-invalid': props['aria-invalid'] ?? invalid ?? (field?.invalid || undefined),
  };
}
export interface ControlProps {
  controlSize?: ControlSize;
  invalid?: boolean;
}
function isInvalid(value: HTMLAttributes<HTMLElement>['aria-invalid']) {
  return value === true || value === 'true' || value === 'grammar' || value === 'spelling';
}
export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, ControlProps {}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, controlSize = 'md', invalid, ...props },
  ref,
) {
  const field = useFieldControl(props, invalid);
  return (
    <input
      {...props}
      {...field}
      ref={ref}
      className={cx(
        'f-input',
        `f-control--${controlSize}`,
        isInvalid(field['aria-invalid']) && 'f-control--invalid',
        className,
      )}
    />
  );
});
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, ControlProps {}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, controlSize = 'md', invalid, ...props },
  ref,
) {
  const field = useFieldControl(props, invalid);
  return (
    <textarea
      {...props}
      {...field}
      ref={ref}
      className={cx(
        'f-textarea',
        `f-control--${controlSize}`,
        isInvalid(field['aria-invalid']) && 'f-control--invalid',
        className,
      )}
    />
  );
});
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, ControlProps {}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, controlSize = 'md', invalid, children, ...props },
  ref,
) {
  const field = useFieldControl(props, invalid);
  return (
    <select
      {...props}
      {...field}
      ref={ref}
      className={cx(
        'f-select',
        `f-control--${controlSize}`,
        isInvalid(field['aria-invalid']) && 'f-control--invalid',
        className,
      )}
    >
      {children}
    </select>
  );
});
export const InputGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function InputGroup({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('f-input-group', className)} />;
  },
);
export const InputAddon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function InputAddon({ className, ...props }, ref) {
    return <span {...props} ref={ref} className={cx('f-input-addon', className)} />;
  },
);

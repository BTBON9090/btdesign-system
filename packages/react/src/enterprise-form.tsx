import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  validateValues,
  validateValue,
  type ChoiceOption,
  type FormErrors,
  type FormRules,
  type FormValues,
  type ValidationRule,
} from '@btdesign/engine';
import { Field, Input, Select, Textarea } from './fields.js';
import { cx } from './enterprise-utils.js';
import { formFieldRules, formValidation } from './enterprise-form-utils.js';

interface RegisteredField {
  id: string;
  label: string;
  rules: ValidationRule[];
  disabled?: boolean;
}
interface FormContextValue {
  id: string;
  values: FormValues;
  errors: FormErrors;
  rules: FormRules;
  disabled: boolean;
  setValue(name: string, value: unknown): void;
  register(name: string, field: RegisteredField): () => void;
}
const FormContext = createContext<FormContextValue | null>(null);
export interface FormProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'onInvalid' | 'onChange'
> {
  initialValues?: FormValues;
  values?: FormValues;
  rules?: FormRules;
  disabled?: boolean;
  submitting?: boolean;
  onValuesChange?: (values: FormValues) => void;
  onSubmit?: (values: FormValues) => void;
  onInvalid?: (errors: FormErrors) => void;
}
export function Form({
  initialValues = {},
  values,
  rules = {},
  disabled = false,
  submitting = false,
  onValuesChange,
  onSubmit,
  onInvalid,
  onReset,
  children,
  className,
  id: idProp,
  ...props
}: FormProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const [local, setLocal] = useState<FormValues>(() => ({ ...initialValues }));
  const [errors, setErrors] = useState<FormErrors>({});
  const fields = useRef(new Map<string, RegisteredField>());
  const form = useRef<HTMLFormElement>(null);
  const current = values ?? local;
  const update = (next: FormValues) => {
    if (values === undefined) setLocal(next);
    onValuesChange?.(next);
  };
  const allRules = () => {
    const result: FormRules = { ...rules };
    fields.current.forEach((field, name) => {
      if (field.disabled) {
        delete result[name];
        return;
      }
      const shared = result[name];
      result[name] = [...(Array.isArray(shared) ? shared : shared ? [shared] : []), ...field.rules];
    });
    return result;
  };
  const context: FormContextValue = {
    id,
    values: current,
    errors,
    rules,
    disabled: disabled || submitting,
    setValue(name, value) {
      if (disabled || submitting || fields.current.get(name)?.disabled) return;
      const next = { ...current, [name]: value };
      update(next);
      if (errors[name])
        setErrors((previous) => {
          const result = { ...previous };
          const message = validateValue(value, allRules()[name] ?? [], next);
          if (message) result[name] = message;
          else delete result[name];
          return result;
        });
    },
    register(name, field) {
      fields.current.set(name, field);
      return () => {
        if (fields.current.get(name) === field) fields.current.delete(name);
      };
    },
  };
  return (
    <FormContext.Provider value={context}>
      <form
        {...props}
        id={id}
        ref={form}
        noValidate
        className={cx('f-form', className)}
        aria-busy={submitting || undefined}
        onReset={(event) => {
          onReset?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          if (disabled || submitting) return;
          update({ ...initialValues });
          setErrors({});
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (disabled || submitting) return;
          const controls =
            form.current?.querySelectorAll<
              HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >('input, select, textarea') ?? [];
          const next = formValidation(current, allRules(), controls, fields.current);
          setErrors(next);
          if (Object.keys(next).length) {
            onInvalid?.(next);
            const name = Object.keys(next)[0];
            const first = fields.current.get(name);
            if (first) document.getElementById(first.id)?.focus();
            else
              Array.from(controls)
                .find((control) => control.name === name)
                ?.focus();
          } else onSubmit?.({ ...current });
        }}
      >
        {Object.keys(errors).length > 0 && (
          <div className="f-form-errors" role="alert">
            <strong>请检查以下字段</strong>
            <ul>
              {Object.entries(errors).map(([name, error]) => (
                <li key={name}>
                  <a
                    href={`#${fields.current.get(name)?.id ?? id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      const field = fields.current.get(name);
                      if (field) document.getElementById(field.id)?.focus();
                    }}
                  >
                    {fields.current.get(name)?.label ?? name}：{error}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <fieldset
          className="f-form-body"
          disabled={disabled || submitting}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          {children}
        </fieldset>
      </form>
    </FormContext.Provider>
  );
}
export interface FormFieldState {
  value: unknown;
  setValue: (value: unknown) => void;
  id: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
}
export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  name: string;
  label: string;
  description?: string;
  layout?: 'vertical' | 'horizontal';
  rules?: ValidationRule | ValidationRule[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  options?: ChoiceOption[];
  children?: ReactNode | ((field: FormFieldState) => ReactNode);
}
export function FormField({
  name,
  label,
  description,
  layout = 'vertical',
  rules,
  required = false,
  disabled = false,
  placeholder,
  type = 'text',
  options = [],
  children,
  id: idProp,
  ...props
}: FormFieldProps) {
  const form = useContext(FormContext);
  if (!form) throw new Error('FormField must be rendered inside Form.');
  const id = idProp ?? `${form.id}-${encodeURIComponent(name)}`;
  const error = form.errors[name];
  const blocked = form.disabled || disabled;
  const fieldRules = formFieldRules(rules, required, type);
  useEffect(
    () => form.register(name, { id, label, rules: fieldRules, disabled: blocked }),
    [name, id, label, rules, required, blocked, type],
  );
  const field: FormFieldState = {
    id,
    value: form.values[name],
    setValue: (value) => form.setValue(name, value),
    disabled: blocked,
    required:
      required ||
      fieldRules.some((rule) => rule.required) ||
      (Array.isArray(form.rules[name])
        ? (form.rules[name] as ValidationRule[]).some((rule) => rule.required)
        : (form.rules[name] as ValidationRule | undefined)?.required === true),
    invalid: !!error,
    describedBy:
      [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') ||
      undefined,
  };
  let control: ReactNode;
  if (typeof children === 'function') control = children(field);
  else if (children !== undefined) control = children;
  else if (type === 'checkbox')
    control = (
      <input
        id={id}
        type="checkbox"
        className="f-checkbox"
        name={name}
        checked={field.value === true}
        disabled={blocked}
        required={field.required}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        onChange={(event) => field.setValue(event.currentTarget.checked)}
      />
    );
  else if (type === 'textarea')
    control = (
      <Textarea
        name={name}
        placeholder={placeholder}
        value={String(field.value ?? '')}
        onChange={(event) => field.setValue(event.currentTarget.value)}
      />
    );
  else if (type === 'select')
    control = (
      <Select
        name={name}
        value={String(field.value ?? '')}
        onChange={(event) => field.setValue(event.currentTarget.value)}
      >
        <option value="">{placeholder ?? '请选择'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  else
    control = (
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        value={
          typeof field.value === 'number' || typeof field.value === 'string' ? field.value : ''
        }
        onChange={(event) =>
          field.setValue(
            type === 'number' && event.currentTarget.value !== ''
              ? event.currentTarget.valueAsNumber
              : event.currentTarget.value,
          )
        }
      />
    );
  return (
    <Field
      {...props}
      id={id}
      label={label}
      description={description}
      layout={layout}
      error={error}
      required={field.required}
      disabled={blocked}
    >
      {control}
    </Field>
  );
}
export interface FormSectionProps extends HTMLAttributes<HTMLFieldSetElement> {
  title: string;
  description?: string;
  disabled?: boolean;
}
export function FormSection({
  title,
  description,
  className,
  children,
  ...props
}: FormSectionProps) {
  const form = useContext(FormContext);
  const content = (
    <fieldset {...props} className={cx('f-form-section', className)}>
      <legend>{title}</legend>
      {description && <p className="f-form-section-description">{description}</p>}
      {children}
    </fieldset>
  );
  return form ? (
    <FormContext.Provider value={{ ...form, disabled: form.disabled || !!props.disabled }}>
      {content}
    </FormContext.Provider>
  ) : (
    content
  );
}
export function FormActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx('f-form-actions', className)} />;
}

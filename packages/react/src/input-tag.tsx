import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { useFieldControl, type ControlProps } from './fields.js';

export interface InputTagProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
    >,
    ControlProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Exact duplicate values are rejected unless enabled. */
  allowDuplicates?: boolean;
  /** Native validation message when a required field has no committed tags. */
  requiredMessage?: string;
}

/** Editable tags: committed tags are separate repeated form values, the draft is not submitted. */
export const InputTag = forwardRef<HTMLInputElement, InputTagProps>(function InputTag(
  {
    value,
    defaultValue = [],
    onValueChange,
    allowDuplicates,
    requiredMessage = '请至少添加一项标签。',
    className,
    controlSize = 'md',
    invalid,
    name,
    required,
    disabled,
    readOnly,
    onKeyDown,
    ...props
  },
  forwardedRef,
) {
  const [uncontrolled, setUncontrolled] = useState(() => [...defaultValue]);
  const [draft, setDraft] = useState('');
  const input = useRef<HTMLInputElement | null>(null);
  const resetState = useRef({ value, defaultValue });
  resetState.current = { value, defaultValue };
  const field = useFieldControl({ ...props, required, disabled }, invalid);
  const tags = value ?? uncontrolled;
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    let active = true;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!active || event.defaultPrevented) return;
        setDraft('');
        if (resetState.current.value === undefined)
          setUncontrolled([...resetState.current.defaultValue]);
      });
    };
    form.addEventListener('reset', reset);
    return () => {
      active = false;
      form.removeEventListener('reset', reset);
    };
  }, [props.form]);
  const update = (next: string[]) => {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };
  const remove = (index: number) => {
    if (field.disabled || readOnly) return;
    update(tags.filter((_, itemIndex) => itemIndex !== index));
    input.current?.focus();
  };
  return (
    <div
      className={['f-input-tag', `f-control--${controlSize}`, className].filter(Boolean).join(' ')}
      data-invalid={field['aria-invalid'] || undefined}
      data-disabled={field.disabled || undefined}
    >
      {tags.map((tag, index) => (
        <span key={`${index}-${tag}`} className="f-tag f-tag--default f-input-tag-item">
          <span>{tag}</span>
          {!readOnly && (
            <button
              type="button"
              className="f-tag-close"
              aria-label={`删除 ${tag}`}
              disabled={field.disabled}
              onClick={() => remove(index)}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {name &&
        tags.map((tag, index) => (
          <input
            key={`value-${index}`}
            type="hidden"
            name={name}
            form={props.form}
            value={tag}
            disabled={field.disabled}
          />
        ))}
      <input
        {...props}
        {...field}
        ref={(node) => {
          input.current = node;
          node?.setCustomValidity(
            field.required && tags.length === 0 ? requiredMessage || '请至少添加一项标签。' : '',
          );
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type="text"
        className="f-input-tag-control"
        value={draft}
        readOnly={readOnly}
        required={field.required && tags.length === 0}
        aria-required={props['aria-required'] ?? (field.required || undefined)}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            event.nativeEvent.isComposing ||
            event.keyCode === 229 ||
            field.disabled ||
            readOnly
          )
            return;
          if (event.key === 'Enter' && draft.trim()) {
            event.preventDefault();
            const next = draft.trim();
            if (allowDuplicates !== true && tags.includes(next)) return;
            update([...tags, next]);
            setDraft('');
          } else if (event.key === 'Backspace' && !draft && tags.length) {
            event.preventDefault();
            remove(tags.length - 1);
          }
        }}
      />
    </div>
  );
});

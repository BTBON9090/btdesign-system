import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import type { ChoiceOption } from '@btdesign/engine';
import { useFieldControl } from './fields.js';
import { cx, useControllable } from './enterprise-utils.js';

export interface SearchSelectProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange' | 'children'
> {
  options: ChoiceOption[];
  multiple?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  label?: string;
  placeholder?: string;
  emptyText?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}
/** Local options only. The application owns asynchronous loading and remote filtering. */
export function SearchSelect({
  options,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder = '请选择',
  emptyText = '没有匹配的选项',
  name,
  disabled,
  required,
  invalid,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...attrs
}: SearchSelectProps) {
  const generated = useId();
  const field = useFieldControl(
    {
      id,
      disabled,
      required,
      'aria-label': ariaLabel ?? label,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
    },
    invalid,
  );
  const inputId = String(field.id ?? `bt-search-select-${generated}`);
  const listId = `${inputId}-listbox`;
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [selection, setSelection] = useControllable<string | string[]>(
    value,
    defaultValue ?? (multiple ? [] : ''),
    onValueChange,
  );
  const selected = [
    ...new Set(
      (Array.isArray(selection) ? selection : selection ? [selection] : []).slice(
        0,
        multiple ? undefined : 1,
      ),
    ),
  ];
  const seen = new Set<string>();
  const uniqueOptions = options.filter(
    (option) => option.value !== '' && !seen.has(option.value) && !!seen.add(option.value),
  );
  const filtered = uniqueOptions.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const enabled = filtered.filter((option) => !option.disabled);
  const activeOption = enabled.find((option) => option.value === active);
  const activeIndex = activeOption ? uniqueOptions.indexOf(activeOption) : -1;
  const optionId = (index: number) => `${listId}-option-${index}`;
  const text = (key: string) => uniqueOptions.find((option) => option.value === key)?.label ?? key;
  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(null);
  };
  const choose = (option: ChoiceOption) => {
    if (field.disabled || option.disabled) return;
    if (multiple) {
      const next = selected.includes(option.value)
        ? selected.filter((key) => key !== option.value)
        : [...selected, option.value];
      setSelection(next);
      setQuery('');
      setActive(null);
      input.current?.focus();
    } else {
      if (selected[0] !== option.value) setSelection(option.value);
      close();
      input.current?.focus();
    }
  };
  useEffect(() => {
    if (field.disabled) close();
  }, [field.disabled]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: Event) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
    };
  }, [open]);
  useEffect(() => {
    if (open && activeIndex >= 0)
      document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex, listId]);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (!enabled.length) {
        setActive(null);
        return;
      }
      const index = enabled.findIndex((option) => option.value === active);
      const next =
        index < 0
          ? event.key === 'ArrowDown'
            ? 0
            : enabled.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      setActive(enabled[next].value);
      return;
    }
    if (event.key === 'Enter' && !open) {
      event.preventDefault();
      setQuery('');
      setOpen(true);
      return;
    }
    if (event.key === 'Enter' && open && activeOption) {
      event.preventDefault();
      choose(activeOption);
    }
    if (event.key === 'Backspace' && multiple && !query && selected.length) {
      const last = [...selected]
        .reverse()
        .find((key) => !uniqueOptions.find((option) => option.value === key)?.disabled);
      if (last) {
        event.preventDefault();
        setSelection(selected.filter((key) => key !== last));
      }
    }
  };
  return (
    <div
      {...attrs}
      ref={root}
      className={cx('f-search-select', className)}
      data-disabled={field.disabled || undefined}
    >
      <div
        className="f-search-select-control"
        data-invalid={field['aria-invalid'] || undefined}
        onClick={(event) => {
          if (
            !field.disabled &&
            (event.target === event.currentTarget ||
              (event.target as HTMLElement).classList.contains('f-search-select-chevron'))
          ) {
            input.current?.focus();
            if (!open) {
              setQuery('');
              setOpen(true);
            }
          }
        }}
      >
        {multiple &&
          selected.map((key) => {
            const blocked =
              field.disabled || uniqueOptions.find((option) => option.value === key)?.disabled;
            return (
              <span className="f-search-select-tag" key={key}>
                {text(key)}
                <button
                  type="button"
                  disabled={blocked}
                  aria-label={`移除${text(key)}`}
                  onClick={() => {
                    if (!blocked) {
                      setSelection(selected.filter((item) => item !== key));
                      input.current?.focus();
                    }
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        <input
          ref={input}
          id={inputId}
          className="f-search-select-input"
          role="combobox"
          type="text"
          autoComplete="off"
          placeholder={multiple && selected.length ? undefined : placeholder}
          disabled={field.disabled}
          aria-label={ariaLabel ?? (field['aria-labelledby'] ? undefined : (label ?? '选择'))}
          aria-labelledby={field['aria-labelledby']}
          aria-describedby={field['aria-describedby']}
          aria-invalid={field['aria-invalid']}
          aria-required={field.required || undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open && !field.disabled}
          aria-controls={open && !field.disabled ? listId : undefined}
          aria-activedescendant={
            open && !field.disabled && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          value={open ? query : multiple ? '' : selected[0] ? text(selected[0]) : ''}
          onFocus={() => {
            if (!field.disabled) {
              setOpen(true);
              setQuery('');
            }
          }}
          onClick={() => {
            if (!field.disabled && !open) {
              setQuery('');
              setOpen(true);
            }
          }}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setOpen(true);
            setActive(null);
          }}
          onKeyDown={onKeyDown}
        />
        <span aria-hidden="true" className="f-search-select-chevron">
          ⌄
        </span>
      </div>
      {name &&
        selected.map((key) => (
          <input key={key} type="hidden" name={name} value={key} disabled={field.disabled} />
        ))}
      {open && !field.disabled && (
        <div className="f-search-select-popup f-overlay">
          <div
            id={listId}
            role="listbox"
            aria-label={label ?? ariaLabel ?? '选项'}
            aria-multiselectable={multiple || undefined}
          >
            {filtered.map((option) => {
              const index = uniqueOptions.indexOf(option);
              return (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={selected.includes(option.value)}
                  aria-disabled={option.disabled || undefined}
                  className="f-search-select-option"
                  data-active={active === option.value || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {selected.includes(option.value) && <span aria-hidden="true">✓</span>}
                </div>
              );
            })}
          </div>
          {!filtered.length && (
            <div className="f-search-select-empty" role="status">
              {emptyText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

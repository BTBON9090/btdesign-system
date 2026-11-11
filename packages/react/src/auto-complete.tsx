import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import {
  filterAutocompleteOptions,
  moveAutocompleteFocus,
  type ChoiceOption,
} from '@btdesign/engine';
import { Input, useFieldControl, type InputProps } from './fields.js';

export interface AutoCompleteProps extends Omit<InputProps, 'value' | 'defaultValue' | 'type'> {
  options: readonly ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSelectOption?: (option: ChoiceOption) => void;
  emptyText?: string;
}
/** Editable local suggestions. Network requests and business-specific option data remain application-owned. */
export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(function AutoComplete(
  {
    options,
    value,
    defaultValue = '',
    onValueChange,
    onSelectOption,
    emptyText = '没有匹配结果',
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    disabled,
    readOnly,
    ...props
  },
  forwardedRef,
) {
  const [local, setLocal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [composing, setComposing] = useState(false);
  const composingRef = useRef(false);
  const compositionBase = useRef('');
  const input = useRef<HTMLInputElement | null>(null);
  const resetState = useRef({ value, defaultValue });
  resetState.current = { value, defaultValue };
  const listId = useId();
  const current = value ?? local;
  const field = useFieldControl({ ...props, disabled }, props.invalid);
  const displayed = open && !field.disabled && !readOnly;
  const filtered = filterAutocompleteOptions(
    options,
    composing ? compositionBase.current : current,
  );
  const activeItem =
    displayed && active >= 0 && !filtered[active]?.disabled ? filtered[active] : undefined;
  const optionId = (index: number) => `${listId}-option-${index}`;
  const update = (next: string) => {
    if (value === undefined) setLocal(next);
    onValueChange?.(next);
  };
  const choose = (option: ChoiceOption) => {
    if (field.disabled || readOnly || option.disabled) return;
    update(option.value);
    onSelectOption?.(option);
    setOpen(false);
    setActive(-1);
  };
  useEffect(() => {
    setActive(-1);
  }, [current, options]);
  useEffect(() => {
    if (field.disabled || readOnly) {
      setOpen(false);
      setActive(-1);
    }
  }, [field.disabled, readOnly]);
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    let activeForm = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!activeForm || event.defaultPrevented) return;
        if (resetState.current.value === undefined) setLocal(resetState.current.defaultValue);
        setOpen(false);
        setActive(-1);
      });
    form.addEventListener('reset', reset);
    return () => {
      activeForm = false;
      form.removeEventListener('reset', reset);
    };
  }, [props.form]);
  useEffect(() => {
    if (activeItem && displayed)
      document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
  }, [active, activeItem, displayed, listId]);
  return (
    <div className="f-autocomplete">
      <Input
        {...props}
        ref={(node) => {
          input.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type="text"
        role="combobox"
        value={current}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={props.autoComplete ?? 'off'}
        aria-autocomplete="list"
        aria-expanded={displayed}
        aria-controls={displayed ? listId : undefined}
        aria-activedescendant={activeItem ? optionId(active) : undefined}
        onFocus={(event) => {
          onFocus?.(event);
          if (!event.defaultPrevented && !field.disabled && !readOnly) setOpen(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setOpen(false);
          setActive(-1);
        }}
        onChange={(event) => {
          onChange?.(event);
          update(event.currentTarget.value);
          setOpen(true);
          setActive(-1);
        }}
        onCompositionStart={(event) => {
          compositionBase.current = current;
          composingRef.current = true;
          setComposing(true);
          onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          composingRef.current = false;
          setComposing(false);
          onCompositionEnd?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            event.nativeEvent.isComposing ||
            event.keyCode === 229 ||
            composingRef.current ||
            field.disabled ||
            readOnly
          )
            return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActive((currentIndex) =>
              moveAutocompleteFocus(
                filtered,
                displayed ? currentIndex : -1,
                event.key === 'ArrowDown' ? 1 : -1,
              ),
            );
          } else if (event.key === 'Escape' && displayed) {
            event.preventDefault();
            setOpen(false);
            setActive(-1);
          } else if (event.key === 'Enter' && activeItem) {
            event.preventDefault();
            choose(activeItem);
          }
        }}
      />
      {displayed && (
        <div className="f-overlay f-autocomplete-popup">
          <ul role="listbox" id={listId} className="f-autocomplete-options">
            {filtered.map((option, index) => (
              <li
                key={`${option.value}-${index}`}
                id={optionId(index)}
                role="option"
                aria-disabled={option.disabled || undefined}
                aria-selected={index === active}
                className="f-autocomplete-option"
                onMouseMove={() => {
                  if (!option.disabled) setActive(index);
                }}
                onPointerDown={(event) => {
                  if (event.pointerType === 'mouse' && event.button !== 0) return;
                  event.preventDefault();
                  choose(option);
                }}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {option.description && (
                  <span className="f-autocomplete-description">{option.description}</span>
                )}
              </li>
            ))}
          </ul>
          {!filtered.length && (
            <div role="status" className="f-autocomplete-empty">
              {emptyText}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

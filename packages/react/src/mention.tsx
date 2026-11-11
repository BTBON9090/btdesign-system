import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  filterAutocompleteOptions,
  moveAutocompleteFocus,
  type ChoiceOption,
} from '@btdesign/engine';
import { Input, useFieldControl, type InputProps } from './fields.js';

export interface MentionProps extends Omit<InputProps, 'value' | 'defaultValue' | 'type'> {
  options: readonly ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSelectOption?: (option: ChoiceOption) => void;
  emptyText?: string;
}

/** Plain-text mentions with local suggestions. Selected labels are inserted as text. */
export const Mention = forwardRef<HTMLInputElement, MentionProps>(function Mention(
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
    onSelect,
    onKeyDown,
    onKeyUp,
    onMouseUp,
    onCompositionStart,
    onCompositionEnd,
    disabled,
    readOnly,
    ...props
  },
  forwardedRef,
) {
  const [local, setLocal] = useState(defaultValue);
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const [composing, setComposing] = useState(false);
  const composingRef = useRef(false);
  const input = useRef<HTMLInputElement | null>(null);
  const pendingCaret = useRef<{ value: string; position: number } | null>(null);
  const resetState = useRef({ value, defaultValue });
  resetState.current = { value, defaultValue };
  const listId = useId();
  const current = value ?? local;
  const field = useFieldControl({ ...props, disabled }, props.invalid);
  const match = current.slice(0, caret).match(/(?:^|\s)@([^\s@]*)$/u);
  const query = match?.[1] ?? '';
  const start = match ? caret - query.length - 1 : -1;
  const displayed = focused && !dismissed && !composing && !!match && !field.disabled && !readOnly;
  const filtered = filterAutocompleteOptions(options, query);
  const activeItem =
    displayed && active >= 0 && !filtered[active]?.disabled ? filtered[active] : undefined;
  const optionId = (index: number) => `${listId}-option-${index}`;
  const update = (next: string) => {
    if (value === undefined) setLocal(next);
    onValueChange?.(next);
  };
  const choose = (option: ChoiceOption) => {
    if (!displayed || option.disabled || start < 0) return;
    const suffix = current.slice(caret);
    const insertion = `@${option.label}${suffix && /^\s/u.test(suffix) ? '' : ' '}`;
    const next = current.slice(0, start) + insertion + suffix;
    const position = start + insertion.length;
    pendingCaret.current = { value: next, position };
    update(next);
    onSelectOption?.(option);
    setCaret(position);
    setDismissed(true);
    setActive(-1);
  };
  useLayoutEffect(() => {
    const pending = pendingCaret.current;
    if (pending && pending.value === current && input.current) {
      input.current.setSelectionRange(pending.position, pending.position);
      pendingCaret.current = null;
    }
  }, [current, caret]);
  useEffect(() => {
    setActive(-1);
  }, [current, caret, options]);
  useEffect(() => {
    if (field.disabled || readOnly) {
      setFocused(false);
      setActive(-1);
    }
  }, [field.disabled, readOnly]);
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    let alive = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!alive || event.defaultPrevented) return;
        if (resetState.current.value === undefined) setLocal(resetState.current.defaultValue);
        setDismissed(true);
        setActive(-1);
      });
    form.addEventListener('reset', reset);
    return () => {
      alive = false;
      form.removeEventListener('reset', reset);
    };
  }, [props.form]);
  useEffect(() => {
    if (activeItem)
      document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
  }, [active, activeItem, listId]);
  const syncCaret = (target: HTMLInputElement) => {
    setCaret(target.selectionStart ?? target.value.length);
    setDismissed(false);
  };
  return (
    <div className="f-mention">
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
        onFocus={(e) => {
          onFocus?.(e);
          if (!e.defaultPrevented && !field.disabled && !readOnly) {
            setFocused(true);
            syncCaret(e.currentTarget);
          }
        }}
        onBlur={(e) => {
          onBlur?.(e);
          setFocused(false);
          setActive(-1);
        }}
        onSelect={(e) => {
          onSelect?.(e);
        }}
        onMouseUp={(e) => {
          onMouseUp?.(e);
          if (!composingRef.current) syncCaret(e.currentTarget);
        }}
        onKeyUp={(e) => {
          onKeyUp?.(e);
          if (!composingRef.current && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key))
            syncCaret(e.currentTarget);
        }}
        onChange={(e) => {
          onChange?.(e);
          update(e.currentTarget.value);
          syncCaret(e.currentTarget);
          setActive(-1);
        }}
        onCompositionStart={(e) => {
          composingRef.current = true;
          setComposing(true);
          onCompositionStart?.(e);
        }}
        onCompositionEnd={(e) => {
          composingRef.current = false;
          setComposing(false);
          syncCaret(e.currentTarget);
          onCompositionEnd?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (
            e.defaultPrevented ||
            e.nativeEvent.isComposing ||
            e.keyCode === 229 ||
            composingRef.current ||
            field.disabled ||
            readOnly
          )
            return;
          if (displayed && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            setActive((index) =>
              moveAutocompleteFocus(filtered, index, e.key === 'ArrowDown' ? 1 : -1),
            );
          } else if (displayed && e.key === 'Escape') {
            e.preventDefault();
            setDismissed(true);
            setActive(-1);
          } else if (e.key === 'Enter' && activeItem) {
            e.preventDefault();
            choose(activeItem);
          }
        }}
      />
      {displayed && (
        <div className="f-overlay f-mention-popup">
          <ul role="listbox" id={listId} className="f-mention-options">
            {filtered.map((option, index) => (
              <li
                key={`${option.value}-${index}`}
                id={optionId(index)}
                role="option"
                aria-disabled={option.disabled || undefined}
                aria-selected={index === active}
                className="f-mention-option"
                onMouseMove={() => {
                  if (!option.disabled) setActive(index);
                }}
                onPointerDown={(e) => {
                  if (e.pointerType === 'mouse' && e.button !== 0) return;
                  e.preventDefault();
                  choose(option);
                }}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {option.description && (
                  <span className="f-mention-description">{option.description}</span>
                )}
              </li>
            ))}
          </ul>
          {!filtered.length && (
            <div role="status" className="f-mention-empty">
              {emptyText}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

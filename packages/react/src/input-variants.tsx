import { forwardRef, useRef, useState } from 'react';
import { Input, InputGroup, useFieldControl, type InputProps } from './fields.js';

/** Native password input with an accessible, non-submitting visibility control. */
export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showLabel?: string;
  hideLabel?: string;
}
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { showLabel = '显示密码', hideLabel = '隐藏密码', disabled, ...props },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const field = useFieldControl({ ...props, disabled });
    return (
      <InputGroup>
        <Input {...props} ref={ref} disabled={disabled} type={visible ? 'text' : 'password'} />
        <button
          type="button"
          className="f-number-input-step f-input-variant-action"
          disabled={field.disabled}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? hideLabel : showLabel}
        </button>
      </InputGroup>
    );
  },
);

/** Search control preserves native input props and lets the application perform the search. */
export interface SearchInputProps extends Omit<InputProps, 'type' | 'onSearch'> {
  searchLabel?: string;
  onSearch?: (value: string) => void;
}
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { searchLabel = '搜索', disabled, onSearch, onKeyDown, ...props },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const field = useFieldControl({ ...props, disabled });
  return (
    <InputGroup>
      <Input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        disabled={disabled}
        type="search"
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'Enter' && !event.defaultPrevented && !event.nativeEvent.isComposing)
            onSearch?.(event.currentTarget.value);
        }}
      />
      <button
        type="button"
        className="f-number-input-step f-input-variant-action"
        disabled={field.disabled}
        aria-label={searchLabel}
        onClick={() => onSearch?.(inputRef.current?.value ?? '')}
      >
        {searchLabel}
      </button>
    </InputGroup>
  );
});

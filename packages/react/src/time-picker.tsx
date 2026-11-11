import { forwardRef } from 'react';
import { Input, type InputProps } from './fields.js';

/** Native single-time input. Values use the browser's HH:mm / HH:mm:ss form syntax. */
export interface TimePickerProps extends Omit<InputProps, 'type'> {
  onValueChange?: (value: string) => void;
}
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { onChange, onValueChange, ...props },
  ref,
) {
  return (
    <Input
      {...props}
      ref={ref}
      type="time"
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.currentTarget.value);
      }}
    />
  );
});

import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { useFieldControl } from './fields.js';

export interface SliderMark {
  value: number;
  label?: string;
}
export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  marks?: SliderMark[];
  onValueChange?: (value: number) => void;
}

/** A single native range control: native keyboard navigation and form submission remain intact. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { marks, list, onChange, onValueChange, className, ...props },
  ref,
) {
  const markId = useId();
  const field = useFieldControl(props);
  const hasMarks = Boolean(marks?.length);
  return (
    <div className="f-slider">
      <input
        {...props}
        {...field}
        ref={ref}
        type="range"
        list={hasMarks ? markId : list}
        className={['f-slider-control', className].filter(Boolean).join(' ')}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.valueAsNumber);
        }}
      />
      {hasMarks && (
        <datalist id={markId}>
          {marks!.map((mark, index) => (
            <option key={`${mark.value}-${index}`} value={mark.value} label={mark.label} />
          ))}
        </datalist>
      )}
    </div>
  );
});

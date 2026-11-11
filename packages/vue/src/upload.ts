import { defineComponent, h, mergeProps } from 'vue';
import { controlProps, useFieldControl } from './field.js';

/** A native file selector; the application owns transfer and file status. */
export const Upload = defineComponent({
  name: 'BTDESIGNUpload',
  inheritAttrs: false,
  props: { ...controlProps },
  emits: ['filesChange'],
  setup(props, { attrs, emit, expose }) {
    const field = useFieldControl();
    let element: HTMLInputElement | null = null;
    expose({ focus: () => element?.focus() });
    return () =>
      h(
        'input',
        mergeProps(attrs, field(attrs, props.invalid), {
          ref: (node: unknown) => {
            element = node as HTMLInputElement | null;
          },
          type: 'file',
          class: ['f-upload', `f-control--${props.controlSize}`],
          onChange: (event: Event) =>
            emit('filesChange', Array.from((event.target as HTMLInputElement).files ?? []), event),
        }),
      );
  },
});

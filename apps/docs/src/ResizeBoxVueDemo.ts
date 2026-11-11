import type { PropType } from 'vue';
import type { ResizeBoxPreviewOptions } from './resize-box-example-code';

export function createResizeBoxVueDemo(
  vue: typeof import('vue'),
  component: import('vue').Component,
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    name: 'BTDESIGNResizeBoxVueDemo',
    props: { options: { type: Object as PropType<ResizeBoxPreviewOptions>, required: true } },
    setup(props) {
      const size = ref(50);
      return () =>
        h('div', { style: { width: '100%' } }, [
          h(
            component,
            {
              size: size.value,
              'onUpdate:size': (value: number) => {
                size.value = value;
              },
              orientation: props.options.orientation,
              min: 20,
              max: 80,
              step: 5,
              disabled: props.options.disabled,
              style: {
                height: props.options.orientation === 'vertical' ? '240px' : '160px',
                width: '100%',
              },
            },
            { first: () => '目录', second: () => '内容区域' },
          ),
          h('p', `面板占比：${size.value}%`),
        ]);
    },
  });
}

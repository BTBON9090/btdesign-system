import type { PropType } from 'vue';
import type { BackTopPreviewOptions } from './BackTopExample';

export function createBackTopVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    name: 'BTDESIGNBackTopPreview',
    props: { options: { type: Object as PropType<BackTopPreviewOptions>, required: true } },
    setup(props) {
      const area = ref<HTMLElement | null>(null);
      const target = () => area.value;
      return () =>
        h('div', { class: 'demo-form' }, [
          h(
            'div',
            {
              ref: area,
              tabindex: 0,
              'aria-label': '滚动预览区域',
              style: { height: '140px', overflow: 'auto', border: '1px solid var(--f-border)' },
            },
            [h('div', { style: { height: '450px', padding: '16px' } }, '向下滚动查看返回顶部')],
          ),
          h(ui.BackTop, {
            target,
            visibilityHeight: 80,
            position: 'inline',
            shape: props.options.shape,
            variant: props.options.variant,
            content: props.options.content,
          }),
        ]);
    },
  });
}

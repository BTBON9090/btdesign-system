import type { TagTone } from '@btdesign/vue';
import type { PropType } from 'vue';

export function createTagVueDemo(vue: typeof import('vue'), ui: typeof import('@btdesign/vue')) {
  const { defineComponent, h, ref } = vue;
  const { Button, Tag } = ui;
  return defineComponent({
    name: 'BTDESIGNTagVueDemo',
    props: {
      tone: { type: String as PropType<TagTone>, default: 'default' },
      closable: Boolean,
      disabled: Boolean,
      onAction: Function as PropType<(message: string) => void>,
    },
    setup(props) {
      const visible = ref(true);
      return () =>
        visible.value
          ? h(
              Tag,
              {
                tone: props.tone,
                closable: props.closable,
                disabled: props.disabled,
                closeLabel: '移除设计系统标签',
                onClose: () => {
                  visible.value = false;
                  props.onAction?.('标签已移除');
                },
              },
              () => '设计系统',
            )
          : h(
              Button,
              {
                variant: 'secondary',
                onClick: () => {
                  visible.value = true;
                },
              },
              () => '恢复标签',
            );
    },
  });
}

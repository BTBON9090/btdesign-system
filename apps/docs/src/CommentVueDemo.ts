import type { PropType } from 'vue';
import type { CommentPreviewOptions } from './CommentExample';

export function createCommentVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
) {
  const { defineComponent, h, ref } = vue;
  const { Avatar, Button, Comment } = ui;
  return defineComponent({
    name: 'BTDESIGNCommentPreview',
    props: { options: { type: Object as PropType<CommentPreviewOptions>, required: true } },
    emits: ['action'],
    setup(props, { emit }) {
      const liked = ref(false);
      return () =>
        h('div', { class: 'demo-form' }, [
          h(
            Comment,
            {
              author: '林晓',
              time: '1 小时前',
              content: '建议补充表单校验。',
              alignment: props.options.alignment,
            },
            {
              avatar: () => h(Avatar, { name: '林晓' }),
              ...(props.options.showActions
                ? {
                    actions: () => [
                      h(
                        Button,
                        {
                          variant: 'ghost',
                          size: 'sm',
                          'aria-pressed': liked.value,
                          onClick: () => {
                            liked.value = !liked.value;
                          },
                        },
                        () => (liked.value ? '已赞' : '赞'),
                      ),
                      h(
                        Button,
                        {
                          variant: 'ghost',
                          size: 'sm',
                          onClick: () => emit('action', '已选择回复（示例）'),
                        },
                        () => '回复',
                      ),
                    ],
                  }
                : {}),
              ...(props.options.nested
                ? {
                    default: () =>
                      h(Comment, { author: '王宁', time: '刚刚', content: '收到，我们一起检查。' }),
                  }
                : {}),
            },
          ),
        ]);
    },
  });
}

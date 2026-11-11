import type { Component, PropType } from 'vue';
import {
  uploadFileListPreviewItems,
  uploadFileListSample,
  type UploadFileListPreviewOptions,
} from './UploadFileListExample';
export function createUploadFileListVuePreview(
  vue: typeof import('vue'),
  UploadFileList: Component,
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    name: 'BTDESIGNUploadFileListVuePreview',
    props: { options: { type: Object as PropType<UploadFileListPreviewOptions>, required: true } },
    setup(props) {
      const ids = ref(uploadFileListSample.map((item) => item.id));
      const preview = ref('');
      const message = ref('');
      return () => {
        const items = uploadFileListPreviewItems(ids.value, props.options.status);
        const selected = items.find((item) => item.id === preview.value);
        return h('div', [
          h(UploadFileList, {
            items,
            variant: props.options.variant,
            disabled: props.options.disabled,
            onRemove: (id: string) => {
              ids.value = ids.value.filter((item) => item !== id);
              if (preview.value === id) preview.value = '';
            },
            onRetry: (id: string) => {
              message.value = '已请求重试：' + (items.find((item) => item.id === id)?.name ?? id);
            },
            onPreview: (id: string) => {
              preview.value = id;
            },
          }),
          message.value ? h('p', { role: 'status' }, message.value) : null,
          selected
            ? h('div', [
                h('p', selected.name),
                h('img', { src: selected.thumbnailUrl, alt: selected.alt, width: 160 }),
                h(
                  'button',
                  {
                    type: 'button',
                    onClick: () => {
                      preview.value = '';
                    },
                  },
                  '关闭预览',
                ),
              ])
            : null,
        ]);
      };
    },
  });
}

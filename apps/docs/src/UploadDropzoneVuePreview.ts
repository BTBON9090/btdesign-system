import type { Component, PropType } from 'vue';
import {
  dropzoneResult,
  type DropzoneRejection,
  type DropzoneResult,
  type DropzoneSource,
  type UploadDropzonePreviewOptions,
} from './UploadDropzoneExample';

export function createUploadDropzoneVuePreview(
  vue: typeof import('vue'),
  UploadDropzone: Component,
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    name: 'BTDESIGNUploadDropzoneVuePreview',
    props: { options: { type: Object as PropType<UploadDropzonePreviewOptions>, required: true } },
    setup(props) {
      const result = ref<DropzoneResult | null>(null);
      return () =>
        h('div', { class: 'demo-form' }, [
          h(UploadDropzone, {
            ...props.options,
            accept: props.options.accept ?? '',
            label: '选择或拖放文件',
            onFilesChange: (
              accepted: File[],
              rejected: DropzoneRejection[],
              source: DropzoneSource,
            ) => {
              result.value = dropzoneResult(accepted, rejected, source);
            },
          }),
          h('p', '文件仅在本地处理，不会上传。'),
          result.value
            ? h('div', { 'aria-live': 'polite' }, [
                h('p', `来源：${result.value.source === 'drop' ? '拖放' : '文件选择'}`),
                h('p', `已接受：${result.value.accepted.join('、') || '无'}`),
              ])
            : null,
        ]);
    },
  });
}

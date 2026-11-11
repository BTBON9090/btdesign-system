import { defineComponent, getCurrentInstance, h, mergeProps, ref, watch, type PropType } from 'vue';
import { formatFileSize, safeHref, safeImageHref, type FileItem } from '@btdesign/engine';

export interface UploadFileItem extends FileItem {
  thumbnailUrl?: string;
  alt?: string;
}
export type UploadFileListVariant = 'file' | 'picture' | 'picture-card';
const statusText = {
  ready: '待上传',
  uploading: '上传中',
  done: '已完成',
  error: '上传失败',
} as const;

/** File state and transfer are owned by the caller. */
export const UploadFileList = defineComponent({
  name: 'BTDESIGNUploadFileList',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<UploadFileItem[]>, required: true },
    variant: {
      type: String as PropType<UploadFileListVariant>,
      default: 'file',
    },
    disabled: Boolean,
    label: { type: String, default: '文件列表' },
    emptyText: { type: String, default: '暂无文件' },
  },
  emits: {
    remove: (_id: string) => true,
    retry: (_id: string) => true,
    preview: (_id: string) => true,
  },
  setup(props, { attrs, emit }) {
    const instance = getCurrentInstance();
    const failedImages = ref<Record<string, string>>({});
    watch(
      () => props.items.map((item) => [item.id, safeImageHref(item.thumbnailUrl)] as const),
      (items) => {
        const current = new Map(items);
        failedImages.value = Object.fromEntries(
          Object.entries(failedImages.value).filter(([id, url]) => current.get(id) === url),
        );
      },
    );
    return () => {
      const handlers = instance?.vnode.props;
      return h(
        'ul',
        mergeProps(attrs, {
          class: ['f-list', 'f-upload-file-list', `f-upload-file-list--${props.variant}`],
          'aria-label': props.label,
        }),
        props.items.length
          ? props.items.map((item) => {
              const thumbnail = safeImageHref(item.thumbnailUrl);
              const imageFailed = Boolean(thumbnail && failedImages.value[item.id] === thumbnail);
              const download = props.disabled ? undefined : safeHref(item.url);
              const image =
                props.variant === 'file'
                  ? null
                  : thumbnail && !imageFailed
                    ? h('img', {
                        class: 'f-upload-file-thumbnail',
                        src: thumbnail,
                        alt: item.alt ?? '',
                        loading: 'lazy',
                        onError: () => {
                          failedImages.value = {
                            ...failedImages.value,
                            [item.id]: thumbnail,
                          };
                        },
                      })
                    : h(
                        'div',
                        {
                          class: 'f-upload-file-thumbnail-placeholder',
                          role: 'img',
                          'aria-label': thumbnail
                            ? `${item.name} 缩略图加载失败`
                            : `${item.name} 暂无缩略图`,
                        },
                        thumbnail ? '缩略图加载失败' : '暂无缩略图',
                      );
              const actions = [
                handlers?.onPreview
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: 'f-button f-button--ghost f-button--sm',
                        disabled: props.disabled,
                        'aria-label': `预览 ${item.name}`,
                        onClick: () => {
                          if (!props.disabled) emit('preview', item.id);
                        },
                      },
                      '预览',
                    )
                  : null,
                item.status === 'error' && handlers?.onRetry
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: 'f-button f-button--ghost f-button--sm',
                        disabled: props.disabled,
                        'aria-label': `重试 ${item.name}`,
                        onClick: () => {
                          if (!props.disabled) emit('retry', item.id);
                        },
                      },
                      '重试',
                    )
                  : null,
                handlers?.onRemove
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: 'f-button f-button--ghost f-button--sm',
                        disabled: props.disabled,
                        'aria-label': `移除 ${item.name}`,
                        onClick: () => {
                          if (!props.disabled) emit('remove', item.id);
                        },
                      },
                      '移除',
                    )
                  : null,
              ];
              return h('li', { class: 'f-list-item f-upload-file-item', key: item.id }, [
                image,
                h('div', { class: 'f-list-item-content' }, [
                  h('div', { class: 'f-list-item-title' }, [
                    download
                      ? h(
                          'a',
                          {
                            href: download,
                            download: item.name,
                            class: 'f-upload-file-name',
                          },
                          item.name,
                        )
                      : item.name,
                  ]),
                  h('div', { class: 'f-file-meta' }, [
                    item.size !== undefined ? h('span', formatFileSize(item.size)) : null,
                    h('span', statusText[item.status ?? 'ready']),
                  ]),
                  item.status === 'uploading'
                    ? h('progress', {
                        class: 'f-file-progress',
                        max: 100,
                        value:
                          typeof item.progress === 'number' && Number.isFinite(item.progress)
                            ? Math.max(0, Math.min(100, item.progress))
                            : undefined,
                        'aria-label': `${item.name} 上传进度`,
                      })
                    : null,
                  item.status === 'error' && item.error
                    ? h('p', { class: 'f-field-error' }, item.error)
                    : null,
                ]),
                actions.some(Boolean) ? h('div', { class: 'f-list-item-actions' }, actions) : null,
              ]);
            })
          : [h('li', { class: 'f-list-item' }, props.emptyText)],
      );
    };
  },
});

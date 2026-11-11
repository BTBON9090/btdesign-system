import { defineComponent, h, mergeProps, ref, watch } from 'vue';
import { validateFiles } from '@btdesign/engine';
import type { FileRejection, FileRejectionCode } from '@btdesign/engine';

export type UploadDropzoneSource = 'picker' | 'drop';

const rejectionText: Record<FileRejectionCode, string> = {
  'type-not-accepted': '不支持的文件类型',
  'type-unverifiable': '无法确认文件类型',
  'file-too-large': '文件超过大小限制',
  'too-many-files': '文件数量超出限制',
  'multiple-not-allowed': '仅支持单文件',
};

/** Selects and checks files; the application owns the resulting files and transfer. */
export const UploadDropzone = defineComponent({
  name: 'BTDESIGNUploadDropzone',
  inheritAttrs: false,
  props: {
    accept: String,
    multiple: Boolean,
    maxFileSize: Number,
    maxFiles: Number,
    existingCount: Number,
    disabled: Boolean,
    label: { type: String, default: '选择文件' },
  },
  emits: {
    filesChange: (
      _accepted: File[],
      _rejected: FileRejection<File>[],
      _source: UploadDropzoneSource,
    ) => true,
  },
  setup(props, { attrs, emit, slots, expose }) {
    const input = ref<HTMLInputElement>();
    const dragging = ref(false);
    const rejected = ref<FileRejection<File>[]>([]);
    let dragDepth = 0;
    const resetDrag = () => {
      dragDepth = 0;
      dragging.value = false;
    };
    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) resetDrag();
      },
    );
    const hasFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files');
    const acceptFiles = (files: File[], source: UploadDropzoneSource) => {
      if (props.disabled || !files.length) return;
      const result = validateFiles(files, {
        accept: props.accept,
        multiple: props.multiple,
        maxFileSize: props.maxFileSize,
        maxFiles: props.maxFiles,
        existingCount: props.existingCount,
      });
      rejected.value = result.rejected;
      emit('filesChange', result.accepted, result.rejected, source);
    };
    expose({ focus: () => trigger.value?.focus() });
    const trigger = ref<HTMLButtonElement>();
    return () =>
      h(
        'div',
        mergeProps(attrs, {
          class: 'f-upload-dropzone',
          'data-dragging': (!props.disabled && dragging.value) || undefined,
          'data-disabled': props.disabled || undefined,
          onDragenter: (event: DragEvent) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            if (!props.disabled) {
              dragDepth += 1;
              dragging.value = true;
            }
          },
          onDragover: (event: DragEvent) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            if (event.dataTransfer)
              event.dataTransfer.dropEffect = props.disabled ? 'none' : 'copy';
          },
          onDragleave: (event: DragEvent) => {
            if (!hasFiles(event)) return;
            dragDepth = Math.max(0, dragDepth - 1);
            if (!dragDepth) dragging.value = false;
          },
          onDrop: (event: DragEvent) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            resetDrag();
            acceptFiles(Array.from(event.dataTransfer?.files ?? []), 'drop');
          },
        }),
        [
          h('input', {
            ref: input,
            type: 'file',
            hidden: true,
            tabindex: -1,
            'aria-hidden': 'true',
            accept: props.accept,
            multiple: props.multiple,
            disabled: props.disabled,
            onChange: (event: Event) => {
              const target = event.target as HTMLInputElement;
              const files = Array.from(target.files ?? []);
              target.value = '';
              acceptFiles(files, 'picker');
            },
          }),
          h(
            'button',
            {
              ref: trigger,
              type: 'button',
              class: 'f-upload-dropzone-trigger f-button f-button--secondary',
              disabled: props.disabled,
              onClick: () => {
                if (!props.disabled) input.value?.click();
              },
            },
            props.label,
          ),
          slots.default ? slots.default() : h('p', '点击选择文件，或将文件拖到此处'),
          rejected.value.length
            ? h(
                'ul',
                { class: 'f-upload-dropzone-rejections', role: 'status', 'aria-live': 'polite' },
                rejected.value.map((item) =>
                  h(
                    'li',
                    { key: item.index },
                    `${item.file.name}：${item.reasons.map((reason) => rejectionText[reason]).join('；')}`,
                  ),
                ),
              )
            : null,
        ],
      );
  },
});

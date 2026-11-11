import { computed, defineComponent, h, mergeProps, ref, watch, type PropType } from 'vue';

export const Image = defineComponent({
  name: 'BTDESIGNImage',
  inheritAttrs: false,
  props: {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    aspectRatio: String,
    fit: { type: String as PropType<'cover' | 'contain'>, default: 'cover' },
    loading: { type: String as PropType<'eager' | 'lazy'>, default: 'lazy' },
    caption: String,
    preview: Boolean,
    previewLabel: String,
  },
  setup(props, { attrs, slots }) {
    const result = ref<{ src: string; status: 'loading' | 'loaded' | 'error' }>({
      src: props.src,
      status: 'loading',
    });
    const status = computed(() =>
      result.value.src === props.src ? result.value.status : 'loading',
    );
    const open = ref(false);
    const dialog = ref<HTMLDialogElement>();
    const trigger = ref<HTMLButtonElement>();
    watch(
      [open, () => props.preview, status, () => props.src],
      ([isOpen, enabled, currentStatus], _, onCleanup) => {
        const el = dialog.value;
        if (!isOpen || !enabled || currentStatus !== 'loaded' || !el) {
          if (isOpen) open.value = false;
          return;
        }
        if (!el.open) el.showModal();
        onCleanup(() => {
          if (el.open) el.close();
        });
      },
      { flush: 'post' },
    );
    return () => {
      const source = props.src;
      const name =
        props.previewLabel?.trim() || (props.alt ? `查看大图：${props.alt}` : '查看大图');
      const image =
        status.value !== 'error'
          ? h('img', {
              key: source,
              src: source,
              alt: props.alt,
              loading: props.loading,
              style: { objectFit: props.fit },
              onLoad: () => {
                result.value = { src: source, status: 'loaded' };
              },
              onError: () => {
                result.value = { src: source, status: 'error' };
              },
            })
          : null;
      const caption = slots.caption?.() ?? props.caption;
      return h('figure', mergeProps(attrs, { class: 'f-image' }), [
        h('div', { class: 'f-image-frame', style: { aspectRatio: props.aspectRatio } }, [
          props.preview
            ? h(
                'button',
                {
                  ref: trigger,
                  type: 'button',
                  class: 'f-image-trigger',
                  'aria-label': name,
                  disabled: status.value !== 'loaded',
                  onClick: () => {
                    open.value = true;
                  },
                },
                [image],
              )
            : image,
          status.value === 'loading'
            ? h('span', { class: 'f-image-status', role: 'status' }, '加载中')
            : null,
          status.value === 'error'
            ? h(
                'span',
                {
                  class: 'f-image-status',
                  role: 'img',
                  'aria-label': props.alt ? `图片加载失败：${props.alt}` : '图片加载失败',
                },
                slots.fallback?.() ?? '图片加载失败',
              )
            : null,
        ]),
        caption != null ? h('figcaption', { class: 'f-image-caption' }, caption) : null,
        props.preview
          ? h(
              'dialog',
              {
                ref: dialog,
                class: 'f-image-dialog',
                'aria-label': name,
                onCancel: (event: Event) => {
                  event.preventDefault();
                  open.value = false;
                },
                onClose: () => {
                  open.value = false;
                  trigger.value?.focus();
                },
              },
              [
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-image-close',
                    'aria-label': '关闭图片预览',
                    onClick: () => {
                      open.value = false;
                    },
                  },
                  '关闭',
                ),
                h('img', { src: source, alt: props.alt }),
              ],
            )
          : null,
      ]);
    };
  },
});

import { pageForSize, type PaginationOptions } from './PaginationExample';
export function createPaginationVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    props: {
      options: { type: Object as import('vue').PropType<PaginationOptions>, required: true },
    },
    setup(props) {
      const page = ref(1);
      const pageSize = ref(10);
      const changeSize = (next: number) => {
        page.value = pageForSize(page.value, pageSize.value, next, 128);
        pageSize.value = next;
      };
      return () =>
        h('div', { class: 'demo-stack' }, [
          h(ui.Pagination, {
            page: page.value,
            pageSize: pageSize.value,
            total: 128,
            size: props.options.size,
            simple: props.options.simple,
            showTotal: props.options.showTotal,
            showQuickJumper: props.options.jumper,
            arrow: props.options.arrow,
            disabled: props.options.disabled,
            'onUpdate:page': (value: number) => {
              page.value = value;
            },
            ...(props.options.pageSizes
              ? { pageSizeOptions: [10, 20, 50], 'onUpdate:pageSize': changeSize }
              : {}),
          }),
          h(
            'p',
            { class: 'demo-muted', role: 'status' },
            `第 ${page.value} 页 · 每页 ${pageSize.value} 条 · 共 128 条示例数据`,
          ),
          props.options.pageSizes && !props.options.simple
            ? h('p', { class: 'demo-muted' }, '切换每页条数后，保留原页首条数据所在的位置。')
            : null,
        ]);
    },
  });
}

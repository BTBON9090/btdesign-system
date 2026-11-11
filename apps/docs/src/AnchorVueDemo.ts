import type { PropType } from 'vue';
import { anchorPreviewItems, type AnchorPreviewOptions } from './anchor-example-code';

export function createAnchorVueDemo(vue: typeof import('vue'), component: import('vue').Component) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    name: 'BTDESIGNAnchorVueDemo',
    props: { options: { type: Object as PropType<AnchorPreviewOptions>, required: true } },
    setup(props) {
      const activeHref = ref('#anchor-demo-overview');
      const content = ref<HTMLElement | null>(null);
      function navigate(href: string, event: MouseEvent) {
        event.preventDefault();
        const target = content.value?.querySelector<HTMLElement>(href);
        if (!target || !content.value) return;
        content.value.scrollTop +=
          target.getBoundingClientRect().top - content.value.getBoundingClientRect().top;
        activeHref.value = href;
      }
      return () =>
        h('div', { style: { display: 'flex', gap: 'var(--f-space-6, 24px)', width: '100%' } }, [
          h(component, {
            items: anchorPreviewItems(props.options),
            activeHref: activeHref.value,
            onNavigate: navigate,
          }),
          h('div', { ref: content, style: { height: '144px', overflowY: 'auto', flex: 1 } }, [
            h('section', { id: 'anchor-demo-overview', style: { minHeight: '144px' } }, '概览内容'),
            h(
              'section',
              { id: 'anchor-demo-detail', style: { minHeight: '144px' } },
              '详细信息内容',
            ),
          ]),
        ]);
    },
  });
}

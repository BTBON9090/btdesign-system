import {
  Comment,
  Fragment,
  Text,
  defineComponent,
  h,
  isVNode,
  mergeProps,
  type PropType,
} from 'vue';

function hasContent(content: unknown): boolean {
  if (Array.isArray(content)) return content.some(hasContent);
  if (content == null || typeof content === 'boolean') return false;
  if (!isVNode(content)) return String(content).trim().length > 0;
  if (content.type === Comment) return false;
  if (content.type === Text)
    return typeof content.children === 'string' && content.children.trim().length > 0;
  if (content.type === Fragment) return hasContent(content.children);
  return true;
}

/** Back navigation is emitted to the host application; no destination is assumed. */
export const PageHeader = defineComponent({
  name: 'BTDESIGNPageHeader',
  inheritAttrs: false,
  props: {
    title: { type: String, default: '' },
    description: String,
    backLabel: { type: String, default: '返回' },
    onBack: Function as PropType<(event: MouseEvent) => void>,
    showBack: { type: Boolean, default: undefined },
    headingLevel: { type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>, default: 1 },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const hasBack = typeof props.onBack === 'function';
      const renderBack = props.showBack ?? hasBack;
      const level =
        Number.isInteger(props.headingLevel) && props.headingLevel >= 1 && props.headingLevel <= 6
          ? props.headingLevel
          : 1;
      const guide = slots.guide?.();
      const tabs = slots.tabs?.();
      const breadcrumb = slots.breadcrumb
        ? h('div', { class: 'f-page-header-breadcrumb' }, slots.breadcrumb())
        : null;
      return h('header', mergeProps(attrs, { class: 'f-page-header' }), [
        hasContent(guide)
          ? h('div', { class: 'f-page-header-top' }, [
              breadcrumb,
              h('div', { class: 'f-page-header-guide' }, guide),
            ])
          : breadcrumb,
        h('div', { class: 'f-page-header-main' }, [
          h('div', { class: 'f-page-header-heading' }, [
            renderBack
              ? h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-page-header-back',
                    'aria-label': props.backLabel,
                    disabled: !hasBack,
                    onClick: (event: MouseEvent) => props.onBack?.(event),
                  },
                  h('span', { 'aria-hidden': 'true' }, slots.backIcon?.() ?? '←'),
                )
              : null,
            h('div', { class: 'f-page-header-copy' }, [
              h(`h${level}`, { class: 'f-page-header-title' }, slots.title?.() ?? props.title),
              slots.description || props.description != null
                ? h(
                    'div',
                    { class: 'f-page-header-description' },
                    slots.description?.() ?? props.description,
                  )
                : null,
            ]),
          ]),
          slots.actions ? h('div', { class: 'f-page-header-actions' }, slots.actions()) : null,
        ]),
        hasContent(tabs) ? h('div', { class: 'f-page-header-tabs' }, tabs) : null,
      ]);
    };
  },
});

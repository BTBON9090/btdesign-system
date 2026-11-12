import { Comment, Fragment, Text, defineComponent, h, isVNode, mergeProps } from 'vue';

/** Ignore whitespace and empty fragments; content components own their own behavior. */
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

/** A composable header; supplied content owns navigation, search and account actions. */
export const SystemHeader = defineComponent({
  name: 'BTDESIGNSystemHeader',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const brand = slots.brand?.();
      const end = (['search', 'actions', 'account', 'organization'] as const)
        .map((name) => {
          const content = slots[name]?.();
          return hasContent(content)
            ? h('div', { class: `f-system-header-${name}`, key: name }, content)
            : null;
        })
        .filter((section) => section !== null);
      return h('header', mergeProps(attrs, { class: 'f-system-header' }), [
        hasContent(brand) ? h('div', { class: 'f-system-header-brand' }, brand) : null,
        end.length ? h('div', { class: 'f-system-header-end' }, end) : null,
      ]);
    };
  },
});

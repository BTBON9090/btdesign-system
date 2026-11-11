import {
  navigationPreviewItems,
  navigationPreviewLabel,
  type NavigationPreviewOptions,
} from './NavigationExample';
export function createNavigationVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
) {
  const { defineComponent, h, ref, watch } = vue;
  return defineComponent({
    props: {
      kind: { type: String as import('vue').PropType<'sidebar-nav' | 'top-nav'>, required: true },
      options: { type: Object as import('vue').PropType<NavigationPreviewOptions>, required: true },
      onCollapsedChange: {
        type: Function as import('vue').PropType<(value: boolean) => void>,
        required: true,
      },
    },
    setup(props) {
      const activeKey = ref('overview');
      const expandedKeys = ref<string[]>(props.options.initialExpanded === 'all' ? ['work'] : []);
      watch(
        () => props.options.initialExpanded,
        (value) => {
          expandedKeys.value = value === 'all' ? ['work'] : [];
        },
      );
      return () => {
        const o = props.options,
          sidebar = props.kind === 'sidebar-nav';
        const component = sidebar ? ui.SidebarNav : ui.TopNav;
        const attributes = {
          label: '工作空间导航',
          items: navigationPreviewItems(sidebar && o.parentLink),
          activeKey: activeKey.value,
          onSelect: (value: string) => {
            activeKey.value = value;
          },
          expandedKeys: expandedKeys.value,
          'onUpdate:expandedKeys': (value: string[]) => {
            expandedKeys.value = value;
          },
          disabled: o.disabled,
          ...(sidebar
            ? {
                collapsed: o.collapsed,
                'onUpdate:collapsed': props.onCollapsedChange,
                showCollapseControl: o.showCollapseControl,
              }
            : {}),
        };
        return h(
          'div',
          {
            class: sidebar ? 'enterprise-nav-preview' : 'enterprise-wide',
            onClick: (event: MouseEvent) => {
              if ((event.target as HTMLElement).closest('a')) event.preventDefault();
            },
          },
          [
            h(component, attributes, o.showIcons ? { icon: () => '◆' } : {}),
            h(
              'p',
              { class: 'enterprise-demo-result' },
              `当前入口：${navigationPreviewLabel(activeKey.value)}（示例链接不跳转）`,
            ),
          ],
        );
      };
    },
  });
}

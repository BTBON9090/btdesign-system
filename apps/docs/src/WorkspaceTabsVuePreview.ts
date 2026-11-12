import {
  closeWorkspaceTab,
  initialWorkspaceTabs,
  type WorkspaceTab,
  type workspaceTabsPreviewOptions,
} from './WorkspaceTabsExample';
export function createWorkspaceTabsVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    props: {
      options: {
        type: Object as import('vue').PropType<ReturnType<typeof workspaceTabsPreviewOptions>>,
        required: true,
      },
    },
    setup(props) {
      const items = ref<WorkspaceTab[]>([...initialWorkspaceTabs]);
      const activeKey = ref<string | null>('overview');
      const closeTab = (key: string) => {
        const next = closeWorkspaceTab(items.value, activeKey.value, key);
        items.value = next.items;
        activeKey.value = next.activeKey;
      };
      return () =>
        h('div', { style: { width: '100%', maxWidth: '520px' } }, [
          h(
            ui.WorkspaceTabs,
            {
              label: '打开的页面',
              items: items.value.map((item) => ({ ...item, closable: props.options.closable })),
              activeKey: activeKey.value,
              onSelect: (key: string) => {
                activeKey.value = key;
              },
              onClose: closeTab,
            },
            props.options.more && items.value.length
              ? {
                  more: () =>
                    h(ui.DropdownMenu, {
                      label: '更多页面',
                      items: items.value,
                      onSelect: (key: string) => {
                        activeKey.value = key;
                      },
                    }),
                }
              : {},
          ),
          !items.value.length ? h('p', '没有打开的页面') : null,
          h(
            ui.Button,
            {
              variant: 'ghost',
              onClick: () => {
                items.value = [...initialWorkspaceTabs];
                activeKey.value = 'overview';
              },
            },
            () => '恢复示例',
          ),
        ]);
    },
  });
}

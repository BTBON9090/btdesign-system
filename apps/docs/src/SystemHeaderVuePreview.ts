import {
  headerAccountItems,
  headerOrganizationItems,
  type SystemHeaderPreviewOptions,
} from './SystemHeaderExample';
export function createSystemHeaderVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    props: {
      options: {
        type: Object as import('vue').PropType<SystemHeaderPreviewOptions>,
        required: true,
      },
    },
    setup(props) {
      const organization = ref('设计团队');
      const message = ref('');
      return () =>
        h('div', { class: 'enterprise-wide' }, [
          h(
            ui.SystemHeader,
            {},
            {
              brand: () => h('strong', '工作空间'),
              ...(props.options.search
                ? {
                    search: () =>
                      h(ui.Input, { 'aria-label': '搜索工作空间', placeholder: '搜索' }),
                  }
                : {}),
              ...(props.options.actions
                ? {
                    actions: () =>
                      h(
                        ui.Button,
                        {
                          variant: 'ghost',
                          onClick: () => {
                            message.value = '已点击帮助（演示）';
                          },
                        },
                        () => '帮助',
                      ),
                  }
                : {}),
              ...(props.options.account
                ? {
                    account: () => [
                      h(ui.Avatar, { name: '林晓', size: 'sm' }),
                      h(ui.DropdownMenu, {
                        label: '林晓',
                        items: headerAccountItems,
                        onSelect: (key: string) => {
                          message.value = `已选择：${headerAccountItems.find((item) => item.key === key)?.label ?? key}（演示）`;
                        },
                      }),
                    ],
                  }
                : {}),
              ...(props.options.organization
                ? {
                    organization: () =>
                      h(ui.DropdownMenu, {
                        label: organization.value,
                        items: headerOrganizationItems,
                        onSelect: (key: string) => {
                          organization.value =
                            headerOrganizationItems.find((item) => item.key === key)?.label ??
                            organization.value;
                        },
                      }),
                  }
                : {}),
            },
          ),
          message.value
            ? h('p', { class: 'enterprise-demo-result', role: 'status' }, message.value)
            : null,
        ]);
    },
  });
}

import type { Component, PropType } from 'vue';
import {
  dropdownCheckedLabels,
  dropdownMenuPreviewItems,
  type DropdownMenuPreviewOptions,
} from './DropdownMenuExample';
export function createDropdownMenuVuePreview(vue: typeof import('vue'), DropdownMenu: Component) {
  const { defineComponent, h, ref } = vue;
  return defineComponent({
    name: 'BTDESIGNDropdownMenuVuePreview',
    props: { options: { type: Object as PropType<DropdownMenuPreviewOptions>, required: true } },
    setup(props) {
      const checked = ref<string[]>(['edit']);
      const message = ref('');
      return () =>
        h('div', [
          h(DropdownMenu, {
            label: '项目操作',
            items: dropdownMenuPreviewItems(props.options),
            triggerMode: props.options.triggerMode,
            checkedKeys: checked.value,
            'onUpdate:checkedKeys': (keys: string[]) => {
              checked.value = keys;
              message.value = '';
            },
            highlightedKeys: props.options.highlight ? ['copy'] : [],
            closeOnAction: true,
            closeOnCheck: props.options.closeOnCheck,
            primaryDisabled: props.options.primaryDisabled,
            menuDisabled: props.options.menuDisabled,
            disabled: props.options.disabled,
            onSelect: (key: string) => {
              message.value = '命令：' + (dropdownCheckedLabels[key] ?? '菜单操作');
            },
            onPrimaryAction: () => {
              message.value = '已触发主操作';
            },
          }),
          props.options.checkable
            ? h(
                'p',
                `已勾选：${checked.value.map((key) => dropdownCheckedLabels[key] ?? key).join('、') || '无'}`,
              )
            : null,
          message.value ? h('p', { role: 'status' }, message.value) : null,
        ]);
    },
  });
}

import {
  treeSelectPreviewExpandedKeys,
  treeSelectPreviewNodes,
  type TreeSelectPreviewOptions,
} from './TreeSelectExample';

export function treeSelectVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: TreeSelectPreviewOptions,
) {
  return vue.h('div', { class: 'enterprise-narrow' }, [
    vue.h(
      ui.TreeSelect,
      {
        key: String(options.multiple),
        label: '选择团队',
        placeholder: '选择团队',
        nodes: treeSelectPreviewNodes,
        defaultValue: options.multiple ? ['design'] : 'design',
        defaultExpandedKeys: treeSelectPreviewExpandedKeys,
        multiple: options.multiple,
        cascade: options.cascade,
        searchable: options.searchable,
        clearable: options.clearable,
        showPath: options.showPath,
        size: options.treeSize,
        showLine: options.showLine,
        disabled: options.disabled,
      },
      options.showIcon
        ? { icon: ({ node }: { node: { leaf: boolean } }) => (node.leaf ? '•' : '▣') }
        : {},
    ),
  ]);
}

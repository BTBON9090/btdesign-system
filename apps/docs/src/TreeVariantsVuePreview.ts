import { treeVariantsNodes, type TreeVariantsOptions } from './TreeVariantsExample';
export function treeVariantsVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: TreeVariantsOptions,
) {
  return vue.h(
    ui.Tree,
    {
      key: `${options.multiple}:${options.cascade}`,
      nodes: treeVariantsNodes,
      defaultExpandedKeys: ['team'],
      size: options.size,
      showLine: options.showLine,
      multiple: options.multiple,
      cascade: options.cascade,
      disabled: options.disabled,
      searchable: true,
    },
    options.showIcon
      ? { icon: ({ node }: { node: { leaf: boolean } }) => (node.leaf ? '•' : '▣') }
      : {},
  );
}

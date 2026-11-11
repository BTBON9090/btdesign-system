import { Tree } from '@btdesign/react';
import { treeVariantsNodes, type TreeVariantsOptions } from './TreeVariantsExample';
export function TreeVariantsPreview({ options }: { options: TreeVariantsOptions }) {
  return (
    <Tree
      key={`${options.multiple}:${options.cascade}`}
      nodes={treeVariantsNodes}
      defaultExpandedKeys={['team']}
      size={options.size}
      showLine={options.showLine}
      multiple={options.multiple}
      cascade={options.cascade}
      disabled={options.disabled}
      searchable
      renderIcon={options.showIcon ? (node) => (node.leaf ? '•' : '▣') : undefined}
    />
  );
}

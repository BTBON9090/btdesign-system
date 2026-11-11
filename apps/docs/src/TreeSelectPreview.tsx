import React from 'react';
import { TreeSelect } from '@btdesign/react';
import {
  treeSelectPreviewExpandedKeys,
  treeSelectPreviewNodes,
  type TreeSelectPreviewOptions,
} from './TreeSelectExample';

export function TreeSelectPreview({ options }: { options: TreeSelectPreviewOptions }) {
  return (
    <div className="enterprise-narrow">
      <TreeSelect
        key={String(options.multiple)}
        label="选择团队"
        placeholder="选择团队"
        nodes={treeSelectPreviewNodes}
        defaultValue={options.multiple ? ['design'] : 'design'}
        defaultExpandedKeys={treeSelectPreviewExpandedKeys}
        multiple={options.multiple}
        cascade={options.cascade}
        searchable={options.searchable}
        clearable={options.clearable}
        showPath={options.showPath}
        size={options.treeSize}
        showLine={options.showLine}
        disabled={options.disabled}
        renderIcon={options.showIcon ? (node) => (node.leaf ? '•' : '▣') : undefined}
      />
    </div>
  );
}

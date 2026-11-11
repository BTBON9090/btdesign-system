import type { DemoOptions } from './component-types';

export function dropdownPreviewItems(options?: DemoOptions) {
  const actions = [
    { key: 'edit', label: '编辑项目' },
    { key: 'copy', label: '创建副本' },
  ];
  return [
    ...(options?.dropdownGroup
      ? [{ key: 'project', label: '项目操作', group: true, children: actions }]
      : actions),
    ...(options?.dropdownSeparator ? [{ key: 'separator', label: '', separator: true }] : []),
    ...(options?.dropdownSubmenu
      ? [
          {
            key: 'more',
            label: '更多操作',
            children: [
              { key: 'share', label: '分享项目' },
              { key: 'delete', label: '删除项目', danger: true },
            ],
          },
        ]
      : []),
    { key: 'archive', label: '归档项目', disabled: true },
  ];
}

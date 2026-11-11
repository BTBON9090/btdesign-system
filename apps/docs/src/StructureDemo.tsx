import { Avatar, AvatarGroup, Collapse } from '@btdesign/react';
import type { DemoOptions } from './component-types';

const members = ['林晓', 'Alex Chen', '王宁', '张悦'];
const panels = [
  { value: 'one', label: '项目说明', content: '设计与开发保持同步。' },
  { value: 'two', label: '团队成员', content: '查看并管理成员。' },
  { value: 'three', label: '更多设置', content: '此项目暂不可用。', disabled: true },
];

export function StructureDemo({
  kind,
  options,
}: {
  kind: 'avatar' | 'collapse';
  options: DemoOptions;
}) {
  if (kind === 'avatar') {
    const avatars = members.map((name) => (
      <Avatar key={name} name={name} size={options.size} shape={options.avatarShape ?? 'circle'} />
    ));
    return options.avatarMode === 'group' ? (
      <AvatarGroup
        label="项目成员"
        size={options.size}
        shape={options.avatarShape ?? 'circle'}
        max={options.avatarMax ?? 3}
      >
        {avatars}
      </AvatarGroup>
    ) : (
      avatars[0]
    );
  }
  return (
    <div className="demo-form">
      <Collapse
        key={options.collapseMode ?? 'multiple'}
        items={panels}
        defaultValue={['one']}
        accordion={options.collapseMode === 'accordion'}
        expandIconPosition={options.collapseIcon ?? 'start'}
        disabled={options.state === 'disabled'}
      />
    </div>
  );
}

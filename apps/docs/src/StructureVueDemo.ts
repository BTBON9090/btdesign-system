import type { DemoOptions } from './component-types';

const members = ['林晓', 'Alex Chen', '王宁', '张悦'];
const panels = [
  { value: 'one', label: '项目说明', content: '设计与开发保持同步。' },
  { value: 'two', label: '团队成员', content: '查看并管理成员。' },
  { value: 'three', label: '更多设置', content: '此项目暂不可用。', disabled: true },
];

export function structureVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  kind: 'avatar' | 'collapse',
  options: DemoOptions,
) {
  const { h } = vue;
  const { Avatar, AvatarGroup, Collapse } = ui;
  if (kind === 'avatar') {
    const avatars = members.map((name) =>
      h(Avatar, { key: name, name, size: options.size, shape: options.avatarShape ?? 'circle' }),
    );
    return options.avatarMode === 'group'
      ? h(
          AvatarGroup,
          {
            label: '项目成员',
            size: options.size,
            shape: options.avatarShape ?? 'circle',
            max: options.avatarMax ?? 3,
          },
          () => avatars,
        )
      : avatars[0];
  }
  return h('div', { class: 'demo-form' }, [
    h(Collapse, {
      key: options.collapseMode ?? 'multiple',
      items: panels,
      defaultValue: ['one'],
      accordion: options.collapseMode === 'accordion',
      expandIconPosition: options.collapseIcon ?? 'start',
      disabled: options.state === 'disabled',
    }),
  ]);
}

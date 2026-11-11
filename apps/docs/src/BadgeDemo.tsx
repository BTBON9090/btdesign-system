import type { ComponentType } from 'react';
import type { AvatarProps, BadgeProps } from '../../../packages/react/src/index';
import type { BadgePreviewOptions } from './badge-example-code';

export function BadgeDemo({
  component: Badge,
  avatar: Avatar,
  options,
}: {
  component: ComponentType<BadgeProps>;
  avatar: ComponentType<AvatarProps>;
  options: BadgePreviewOptions;
}) {
  if (options.mode === 'status') return <Badge variant={options.variant}>已发布</Badge>;
  const child =
    options.target === 'avatar' ? (
      <Avatar name="林晓" />
    ) : options.target === 'text' ? (
      <span>消息</span>
    ) : undefined;
  return options.mode === 'dot' ? (
    <Badge variant={options.variant} dot badgeLabel="有新消息">
      {child}
    </Badge>
  ) : (
    <Badge
      variant={options.variant}
      count={options.count}
      showZero={options.showZero}
      badgeLabel={`${options.count} 条未读消息`}
    >
      {child}
    </Badge>
  );
}

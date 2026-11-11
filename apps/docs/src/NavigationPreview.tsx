import { useEffect, useState } from 'react';
import { SidebarNav, TopNav } from '@btdesign/react';
import {
  navigationPreviewItems,
  navigationPreviewLabel,
  type NavigationPreviewOptions,
} from './NavigationExample';
export function NavigationPreview({
  kind,
  options,
  onCollapsedChange,
}: {
  kind: 'sidebar-nav' | 'top-nav';
  options: NavigationPreviewOptions;
  onCollapsedChange: (value: boolean) => void;
}) {
  const [activeKey, setActiveKey] = useState('overview');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(
    options.initialExpanded === 'all' ? ['work'] : [],
  );
  useEffect(
    () => setExpandedKeys(options.initialExpanded === 'all' ? ['work'] : []),
    [options.initialExpanded],
  );
  const shared = {
    label: '工作空间导航',
    items: navigationPreviewItems(kind === 'sidebar-nav' && options.parentLink),
    activeKey,
    onSelect: setActiveKey,
    expandedKeys,
    onExpandedChange: setExpandedKeys,
    disabled: options.disabled,
    renderIcon: options.showIcons ? () => '◆' : undefined,
  };
  return (
    <div
      className={kind === 'sidebar-nav' ? 'enterprise-nav-preview' : 'enterprise-wide'}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('a')) event.preventDefault();
      }}
    >
      {kind === 'sidebar-nav' ? (
        <SidebarNav
          {...shared}
          collapsed={options.collapsed}
          onCollapsedChange={onCollapsedChange}
          showCollapseControl={options.showCollapseControl}
        />
      ) : (
        <TopNav {...shared} />
      )}
      <p className="enterprise-demo-result">
        当前入口：{navigationPreviewLabel(activeKey)}（示例链接不跳转）
      </p>
    </div>
  );
}

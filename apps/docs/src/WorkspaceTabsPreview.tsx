import { useState } from 'react';
import { Button, DropdownMenu, WorkspaceTabs } from '@btdesign/react';
import {
  closeWorkspaceTab,
  initialWorkspaceTabs,
  type WorkspaceTab,
  type workspaceTabsPreviewOptions,
} from './WorkspaceTabsExample';
export function WorkspaceTabsPreview({
  options,
}: {
  options: ReturnType<typeof workspaceTabsPreviewOptions>;
}) {
  const [items, setItems] = useState<WorkspaceTab[]>(initialWorkspaceTabs);
  const [activeKey, setActiveKey] = useState<string | null>('overview');
  function closeTab(key: string) {
    const next = closeWorkspaceTab(items, activeKey, key);
    setItems(next.items);
    setActiveKey(next.activeKey);
  }
  function restore() {
    setItems(initialWorkspaceTabs);
    setActiveKey('overview');
  }
  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <WorkspaceTabs
        label="打开的页面"
        items={items.map((item) => ({ ...item, closable: options.closable }))}
        activeKey={activeKey}
        onSelect={setActiveKey}
        onClose={closeTab}
        more={
          options.more && items.length ? (
            <DropdownMenu label="更多页面" items={items} onSelect={setActiveKey} />
          ) : undefined
        }
      />
      {items.length === 0 && <p>没有打开的页面</p>}
      <Button variant="ghost" onClick={restore}>
        恢复示例
      </Button>
    </div>
  );
}

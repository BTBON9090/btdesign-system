import { useState } from 'react';
import { Avatar, Button, DropdownMenu, Input, SystemHeader } from '@btdesign/react';
import {
  headerAccountItems,
  headerOrganizationItems,
  type SystemHeaderPreviewOptions,
} from './SystemHeaderExample';

export function SystemHeaderPreview({ options }: { options: SystemHeaderPreviewOptions }) {
  const [organization, setOrganization] = useState('设计团队');
  const [message, setMessage] = useState('');
  return (
    <div className="enterprise-wide">
      <SystemHeader
        brand={<strong>工作空间</strong>}
        search={options.search ? <Input aria-label="搜索工作空间" placeholder="搜索" /> : undefined}
        actions={
          options.actions ? (
            <Button variant="ghost" onClick={() => setMessage('已点击帮助（演示）')}>
              帮助
            </Button>
          ) : undefined
        }
        account={
          options.account ? (
            <>
              <Avatar name="林晓" size="sm" />
              <DropdownMenu
                label="林晓"
                items={headerAccountItems}
                onSelect={(key) =>
                  setMessage(
                    `已选择：${headerAccountItems.find((item) => item.key === key)?.label ?? key}（演示）`,
                  )
                }
              />
            </>
          ) : undefined
        }
        organization={
          options.organization ? (
            <DropdownMenu
              label={organization}
              items={headerOrganizationItems}
              onSelect={(key) =>
                setOrganization(
                  headerOrganizationItems.find((item) => item.key === key)?.label ?? organization,
                )
              }
            />
          ) : undefined
        }
      />
      {message && (
        <p className="enterprise-demo-result" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

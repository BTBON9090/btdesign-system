import { useState } from 'react';
import { emptyOrganizationSelection, type OrganizationSelection } from '@btdesign/engine';
import { OrganizationTransfer } from '@btdesign/react';
import { getName, makeDirectory } from './OrganizationTransferFixtures';

const directory = makeDirectory();
export function OrganizationTransferPreview({ disabled }: { disabled: boolean }) {
  const [value, setValue] = useState<OrganizationSelection>(emptyOrganizationSelection);
  const [message, setMessage] = useState('');
  return (
    <>
      <OrganizationTransfer
        directory={directory}
        value={value}
        onValueChange={setValue}
        onConfirm={(_value, result) =>
          setMessage(
            result.requiresRuleResolution ? '已确认；部门规则需由应用解析。' : '已确认当前选择。',
          )
        }
        getDepartmentLabel={getName}
        getPersonLabel={getName}
        disabled={disabled}
      />
      <p role="status">{message}</p>
    </>
  );
}

import { useState, type ComponentType } from 'react';
import {
  dropdownCheckedLabels,
  dropdownMenuPreviewItems,
  type DropdownMenuPreviewOptions,
  type DropdownDemoItem,
} from './DropdownMenuExample';
type Props = {
  items: DropdownDemoItem[];
  label: string;
  checkedKeys: string[];
  onCheckedKeysChange: (keys: string[]) => void;
  highlightedKeys: string[];
  closeOnAction: boolean;
  closeOnCheck: boolean;
  triggerMode: 'single' | 'split';
  primaryDisabled: boolean;
  menuDisabled: boolean;
  disabled: boolean;
  onSelect: (key: string) => void;
  onPrimaryAction: () => void;
};
export function DropdownMenuPreview({
  component: DropdownMenu,
  options,
}: {
  component: ComponentType<Props>;
  options: DropdownMenuPreviewOptions;
}) {
  const [checked, setChecked] = useState<string[]>(['edit']);
  const [message, setMessage] = useState('');
  return (
    <>
      <DropdownMenu
        label="项目操作"
        items={dropdownMenuPreviewItems(options)}
        triggerMode={options.triggerMode}
        checkedKeys={checked}
        onCheckedKeysChange={(keys) => {
          setChecked(keys);
          setMessage('');
        }}
        highlightedKeys={options.highlight ? ['copy'] : []}
        closeOnAction={true}
        closeOnCheck={options.closeOnCheck}
        primaryDisabled={options.primaryDisabled}
        menuDisabled={options.menuDisabled}
        disabled={options.disabled}
        onSelect={(key) => setMessage('命令：' + (dropdownCheckedLabels[key] ?? '菜单操作'))}
        onPrimaryAction={() => setMessage('已触发主操作')}
      />
      {options.checkable && (
        <p>已勾选：{checked.map((key) => dropdownCheckedLabels[key] ?? key).join('、') || '无'}</p>
      )}
      {message && <p role="status">{message}</p>}
    </>
  );
}

import { SearchSelect } from '@btdesign/react';
import { searchSelectPreviewItems, type SearchSelectPreviewOptions } from './SearchSelectExample';
export function SearchSelectPreview({ options }: { options: SearchSelectPreviewOptions }) {
  return (
    <div className="demo-form">
      <SearchSelect
        key={String(options.multiple)}
        label="团队"
        name="team"
        options={options.empty ? [] : searchSelectPreviewItems}
        multiple={options.multiple}
        disabled={options.disabled}
      />
    </div>
  );
}

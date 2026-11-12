import { useState } from 'react';
import { Pagination } from '@btdesign/react';
import { pageForSize, type PaginationOptions } from './PaginationExample';
export function PaginationPreview({ options }: { options: PaginationOptions }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  function changeSize(next: number) {
    setPage(pageForSize(page, pageSize, next, 128));
    setPageSize(next);
  }
  return (
    <div className="demo-stack">
      <Pagination
        page={page}
        pageSize={pageSize}
        total={128}
        onPageChange={setPage}
        size={options.size}
        simple={options.simple}
        showTotal={options.showTotal}
        showQuickJumper={options.jumper}
        arrow={options.arrow}
        disabled={options.disabled}
        pageSizeOptions={options.pageSizes ? [10, 20, 50] : undefined}
        onPageSizeChange={options.pageSizes ? changeSize : undefined}
      />
      <p className="demo-muted" role="status">
        第 {page} 页 · 每页 {pageSize} 条 · 共 128 条示例数据
      </p>
      {options.pageSizes && !options.simple && (
        <p className="demo-muted">切换每页条数后，保留原页首条数据所在的位置。</p>
      )}
    </div>
  );
}

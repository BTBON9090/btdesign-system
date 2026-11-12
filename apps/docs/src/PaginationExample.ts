import type { DemoOptions, Framework } from './component-types';
export type PaginationOptions = {
  size: 'mini' | 'small' | 'medium' | 'big';
  simple: boolean;
  showTotal: boolean;
  pageSizes: boolean;
  jumper: boolean;
  arrow: 'text' | 'icon';
  disabled: boolean;
};
export function paginationPreviewOptions(options?: DemoOptions): PaginationOptions {
  return {
    size: options?.paginationSize ?? 'medium',
    simple: options?.paginationSimple ?? false,
    showTotal: options?.paginationShowTotal ?? false,
    pageSizes: options?.paginationPageSizes ?? false,
    jumper: options?.paginationJumper ?? false,
    arrow: options?.paginationArrow ?? 'text',
    disabled: options?.state === 'disabled',
  };
}
/** Keep the first item on the old page in view, constrained to the new page count. */
export function pageForSize(page: number, oldSize: number, newSize: number, total: number): number {
  return Math.max(
    1,
    Math.min(
      Math.max(1, Math.ceil(total / newSize)),
      Math.floor(((page - 1) * oldSize) / newSize) + 1,
    ),
  );
}
export function paginationExampleCode(framework: Framework, o: PaginationOptions): string {
  if (framework === 'vue')
    return `<script setup lang="ts">
import { ref } from 'vue';
import { Pagination } from '@btdesign/vue';
import '@btdesign/tokens/styles.css';
const page = ref(1);
const pageSize = ref(10);
const total = 128;
function changeSize(next: number) {
  page.value = Math.max(1, Math.min(Math.ceil(total / next), Math.floor(((page.value - 1) * pageSize.value) / next) + 1));
  pageSize.value = next;
}
</script>
<template>
  <Pagination v-model:page="page" :page-size="pageSize" :total="total" size="${o.size}" :simple="${o.simple}" :show-total="${o.showTotal}" :show-quick-jumper="${o.jumper}" arrow="${o.arrow}" :disabled="${o.disabled}"${o.pageSizes ? ' :page-size-options="[10,20,50]" @update:page-size="changeSize"' : ''} />
  <p role="status">第 {{ page }} 页 · 每页 {{ pageSize }} 条 · 共 {{ total }} 条示例数据</p>
  ${o.pageSizes && !o.simple ? '<p>切换每页条数后，保留原页首条数据所在的位置。</p>' : ''}
</template>`;
  return `import { useState } from 'react';
import { Pagination } from '@btdesign/react';
import '@btdesign/tokens/styles.css';
export default function Example() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = 128;
  function changeSize(next: number) {
    setPage(Math.max(1, Math.min(Math.ceil(total / next), Math.floor(((page - 1) * pageSize) / next) + 1)));
    setPageSize(next);
  }
  return <>
    <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} size="${o.size}" simple={${o.simple}} showTotal={${o.showTotal}} showQuickJumper={${o.jumper}} arrow="${o.arrow}" disabled={${o.disabled}}${o.pageSizes ? ' pageSizeOptions={[10,20,50]} onPageSizeChange={changeSize}' : ''} />
    <p role="status">第 {page} 页 · 每页 {pageSize} 条 · 共 {total} 条示例数据</p>
    ${o.pageSizes && !o.simple ? '<p>切换每页条数后，保留原页首条数据所在的位置。</p>' : ''}
  </>;
}`;
}

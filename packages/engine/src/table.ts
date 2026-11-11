import type { DataColumn, HeaderCell, TableOptions, TableResult, TableRow } from './types.js';

/** First duplicate column key wins. Empty/hidden groups disappear. */
function visibleColumns<C extends DataColumn>(
  columns: readonly C[],
  hiddenKeys: readonly string[] = [],
): C[] {
  const hidden = new Set(hiddenKeys),
    seen = new Set<string>();
  function visit(items: readonly C[]): C[] {
    const result: C[] = [];
    for (const column of items) {
      if (!column || !column.key || hidden.has(column.key) || seen.has(column.key)) continue;
      seen.add(column.key);
      if (column.children?.length) {
        const children = visit(column.children as C[]);
        if (children.length) result.push({ ...column, children });
      } else result.push(column);
    }
    return result;
  }
  return visit(columns);
}
export function leafColumns<C extends DataColumn>(
  columns: readonly C[],
  hiddenKeys: readonly string[] = [],
): C[] {
  const output: C[] = [];
  function visit(items: C[]) {
    for (const column of items)
      column.children?.length ? visit(column.children as C[]) : output.push(column);
  }
  visit(visibleColumns(columns, hiddenKeys));
  return output;
}
export function buildHeaderRows<C extends DataColumn>(
  columns: readonly C[],
  hiddenKeys: readonly string[] = [],
): HeaderCell<C>[][] {
  const visible = visibleColumns(columns, hiddenKeys);
  const depthOf = (items: readonly DataColumn[]): number =>
    items.length
      ? Math.max(
          ...items.map((column) => 1 + (column.children?.length ? depthOf(column.children) : 0)),
        )
      : 0;
  const count = (column: DataColumn): number =>
    column.children?.length ? column.children.reduce((sum, child) => sum + count(child), 0) : 1;
  const depth = depthOf(visible);
  const rows: HeaderCell<C>[][] = Array.from({ length: depth }, () => []);
  function visit(items: readonly C[], level: number) {
    for (const column of items) {
      const leaf = !column.children?.length;
      rows[level].push({
        column,
        key: column.key,
        title: column.title,
        colSpan: count(column),
        rowSpan: leaf ? depth - level : 1,
        depth: level,
        leaf,
      });
      if (!leaf) visit(column.children as C[], level + 1);
    }
  }
  visit(visible, 0);
  return rows;
}
export function cellValue(row: Record<string, unknown>, column: DataColumn): unknown {
  const key = column.dataIndex ?? column.key;
  return Object.hasOwn(row, key) ? row[key] : undefined;
}
interface Branch<R extends Record<string, unknown>> {
  record: R;
  key: string;
  children: Branch<R>[];
}
const text = (value: unknown): string =>
  value == null ? '' : typeof value === 'object' ? '' : String(value);

export function processTableRows<R extends Record<string, unknown>>(
  data: readonly R[],
  columns: readonly DataColumn[],
  options: TableOptions = {},
): TableResult<R> {
  const leaves = leafColumns(columns);
  const byKey = new Map(leaves.map((column) => [column.key, column]));
  const seen = new Set<string>(),
    seenObjects = new WeakSet<object>();
  const rowKey = options.rowKey ?? 'id',
    childrenKey = options.childrenKey ?? 'children';
  function canonical(items: readonly R[], path: number[] = []): Branch<R>[] {
    const output: Branch<R>[] = [];
    for (const [index, record] of items.entries()) {
      if (!record || typeof record !== 'object' || seenObjects.has(record)) continue;
      seenObjects.add(record);
      const nextPath = [...path, index];
      const rawKey = Object.hasOwn(record, rowKey) ? record[rowKey] : undefined;
      const key =
        typeof rawKey === 'string' || typeof rawKey === 'number'
          ? String(rawKey)
          : `row-${nextPath.join('-')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const rawChildren =
        Object.hasOwn(record, childrenKey) && Array.isArray(record[childrenKey])
          ? (record[childrenKey] as R[])
          : [];
      output.push({ record, key, children: canonical(rawChildren, nextPath) });
    }
    return output;
  }
  const query = options.query?.trim().toLocaleLowerCase() ?? '';
  const filters = Object.entries(options.filters ?? {}).filter(
    ([key, values]) =>
      byKey.has(key) && (Array.isArray(values) ? values.length > 0 : values !== ''),
  );
  const numberRanges = Object.entries(options.numberRanges ?? {}).filter(
    ([key, range]) =>
      byKey.has(key) && range != null && (range.min !== undefined || range.max !== undefined),
  );
  const filtering = Boolean(query || filters.length || numberRanges.length);
  function matches(record: R) {
    return (
      (!query ||
        leaves.some((column) =>
          text(cellValue(record, column)).toLocaleLowerCase().includes(query),
        )) &&
      filters.every(([key, values]) =>
        (Array.isArray(values) ? values : [values]).includes(
          text(cellValue(record, byKey.get(key)!)),
        ),
      ) &&
      numberRanges.every(([key, range]) => {
        const { min, max } = range;
        if (
          (min !== undefined && !Number.isFinite(min)) ||
          (max !== undefined && !Number.isFinite(max)) ||
          (min !== undefined && max !== undefined && min > max)
        )
          return false;
        const value = cellValue(record, byKey.get(key)!);
        return (
          typeof value === 'number' &&
          Number.isFinite(value) &&
          (min === undefined || value >= min) &&
          (max === undefined || value <= max)
        );
      })
    );
  }
  const sort = options.sort,
    sortColumn = sort ? byKey.get(sort.key) : undefined;
  function compare(a: Branch<R>, b: Branch<R>) {
    if (!sort || !sortColumn || sortColumn.sortable === false) return 0;
    const av = cellValue(a.record, sortColumn),
      bv = cellValue(b.record, sortColumn);
    const emptyA = av === undefined || av === null || av === '',
      emptyB = bv === undefined || bv === null || bv === '';
    if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
    const order =
      typeof av === 'number' && typeof bv === 'number' && Number.isFinite(av) && Number.isFinite(bv)
        ? av - bv
        : text(av).localeCompare(text(bv), undefined, { numeric: true, sensitivity: 'base' });
    return sort.direction === 'desc' ? -order : order;
  }
  function process(items: Branch<R>[]): Branch<R>[] {
    return items
      .map((branch) => ({ ...branch, children: process(branch.children) }))
      .filter((branch) => !filtering || matches(branch.record) || branch.children.length > 0)
      .sort(compare);
  }
  const roots = process(canonical(data));
  const size =
    Number.isFinite(options.pageSize) && (options.pageSize ?? 0) > 0
      ? Math.max(1, Math.floor(options.pageSize!))
      : 10;
  const pageCount = Math.max(1, Math.ceil(roots.length / size));
  const page = Math.max(
    1,
    Math.min(pageCount, Number.isFinite(options.page) ? Math.floor(options.page!) : 1),
  );
  const expanded = new Set(options.expandedKeys ?? []);
  const flatten = (
    items: Branch<R>[],
    all: boolean,
    depth = 0,
    parentKey?: string,
  ): TableRow<R>[] =>
    items.flatMap((branch) => [
      {
        record: branch.record,
        key: branch.key,
        depth,
        parentKey,
        hasChildren: branch.children.length > 0,
      },
      ...(all || filtering || expanded.has(branch.key)
        ? flatten(branch.children, all, depth + 1, branch.key)
        : []),
    ]);
  return {
    rows: flatten(
      options.pagination === false ? roots : roots.slice((page - 1) * size, page * size),
      false,
    ),
    total: roots.length,
    page: options.pagination === false ? 1 : page,
    pageSize: size,
    pageCount: options.pagination === false ? 1 : pageCount,
    allRows: flatten(roots, true),
  };
}

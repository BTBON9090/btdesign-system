import { Fragment, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import {
  buildHeaderRows,
  cellValue,
  leafColumns,
  processTableRows,
  type DataColumn,
  type TableNumberRange,
  type TableSort,
} from '@btdesign/engine';
import { Input } from './fields.js';
import { Pagination } from './composition.js';
import { checkedRef, cx, useControllable } from './enterprise-utils.js';
import { TableFilter } from './table-filter.js';

export interface DataTableColumn<
  R extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<DataColumn, 'children'> {
  children?: DataTableColumn<R>[];
  render?: (value: unknown, row: R) => ReactNode;
}
export interface CellChange {
  key: string;
  column: string;
  value: unknown;
}
export interface DataTableProps<
  R extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  columns: DataTableColumn<R>[];
  data: R[];
  rowKey?: string;
  childrenKey?: string;
  caption?: string;
  loading?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  sort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  filters?: Record<string, string | string[]>;
  onFiltersChange?: (filters: Record<string, string | string[]>) => void;
  /** Inclusive numeric bounds. Missing or empty ranges do not filter. */
  numberRanges?: Record<string, TableNumberRange>;
  onNumberRangesChange?: (ranges: Record<string, TableNumberRange>) => void;
  selectable?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  hiddenKeys?: string[];
  defaultHiddenKeys?: string[];
  onHiddenChange?: (keys: string[]) => void;
  rowDisabled?: (row: R) => boolean;
  onCellChange?: (change: CellChange) => void;
  renderExpanded?: (row: R) => ReactNode;
  /** Inline keeps the historical React layout; separate adds a utility column. */
  expandColumn?: 'inline' | 'separate';
  summary?: ReactNode;
  emptyText?: string;
  stickyHeader?: boolean;
}
export function DataTable<R extends Record<string, unknown>>({
  columns,
  data,
  rowKey = 'id',
  childrenKey = 'children',
  caption = '数据表格',
  loading = false,
  disabled = false,
  searchable = true,
  pagination = true,
  pageSize = 10,
  page,
  onPageChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  numberRanges,
  onNumberRangesChange,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,
  hiddenKeys,
  defaultHiddenKeys = [],
  onHiddenChange,
  rowDisabled,
  onCellChange,
  renderExpanded,
  expandColumn = 'inline',
  summary,
  emptyText = '暂无数据',
  stickyHeader = true,
  className,
  ...props
}: DataTableProps<R>) {
  const id = useId();
  const blocked = disabled || loading;
  const [search, setSearch] = useControllable(query, '', onQueryChange);
  const [order, setOrder] = useControllable<TableSort | null>(sort, null, onSortChange);
  const [filter, setFilter] = useControllable<Record<string, string | string[]>>(
    filters,
    {},
    onFiltersChange,
  );
  const [ranges, setRanges] = useControllable<Record<string, TableNumberRange>>(
    numberRanges,
    {},
    onNumberRangesChange,
  );
  const [currentPage, setPage] = useControllable(page, 1, onPageChange);
  const [selected, setSelected] = useControllable(
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
  );
  const [expanded, setExpanded] = useControllable(
    expandedKeys,
    defaultExpandedKeys,
    onExpandedChange,
  );
  const [hidden, setHidden] = useControllable(hiddenKeys, defaultHiddenKeys, onHiddenChange);
  const leaves = leafColumns(columns, hidden);
  const headers = buildHeaderRows(columns, hidden);
  const everyLeaf = leafColumns(columns);
  const result = processTableRows(data, leaves, {
    query: search,
    sort: order,
    filters: filter,
    numberRanges: ranges,
    expandedKeys: expanded,
    page: currentPage,
    pageSize,
    pagination,
    rowKey,
    childrenKey,
  });
  const effectiveExpanded = new Set(
    result.rows
      .filter((row, index) => row.hasChildren && (result.rows[index + 1]?.depth ?? -1) > row.depth)
      .map((row) => row.key),
  );
  const hasFilter =
    !!search.trim() ||
    Object.values(filter).some((value) => (Array.isArray(value) ? value.length > 0 : !!value)) ||
    leaves.some(
      (column) =>
        ranges[column.key] &&
        (ranges[column.key].min !== undefined || ranges[column.key].max !== undefined),
    );
  const enabledRows = result.rows.filter((row) => !rowDisabled?.(row.record));
  const selectedCount = enabledRows.filter((row) => selected.includes(row.key)).length;
  const allChecked = enabledRows.length > 0 && selectedCount === enabledRows.length;
  const selectionState = allChecked ? true : selectedCount ? 'mixed' : false;
  const hasExpansion = result.allRows.some((row) => row.hasChildren) || Boolean(renderExpanded);
  const separateExpansion = hasExpansion && expandColumn === 'separate';
  const leadingWidth = (selectable ? 44 : 0) + (separateExpansion ? 32 : 0);
  const totalColumns = leaves.length + (selectable ? 1 : 0) + (separateExpansion ? 1 : 0);
  const columnWidth = (column: DataTableColumn<R>) =>
    Number.isFinite(column.width) ? Math.max(48, Math.min(2000, column.width!)) : 140;
  const stretchKey = leaves.filter((column) => !column.fixed).at(-1)?.key;
  const minimumWidth = leaves.reduce((sum, column) => sum + columnWidth(column), leadingWidth);
  const selectionStyle: CSSProperties = leaves.some((column) => column.fixed === 'left')
    ? { position: 'sticky', left: 0, zIndex: 2, width: 44, minWidth: 44 }
    : { width: 44, minWidth: 44 };
  const toggleExpand = (key: string) => {
    if (!blocked)
      setExpanded(
        expanded.includes(key) ? expanded.filter((item) => item !== key) : [...expanded, key],
      );
  };
  const fixedStyle = (column: DataTableColumn<R>): CSSProperties => {
    const index = leaves.findIndex((item) => item.key === column.key);
    const fixed = column.fixed;
    const width = column.key === stretchKey ? undefined : columnWidth(column);
    const offset =
      fixed === 'left'
        ? leaves
            .slice(0, index)
            .filter((item) => item.fixed === 'left')
            .reduce((sum, item) => sum + columnWidth(item), 0) + leadingWidth
        : fixed === 'right'
          ? leaves
              .slice(index + 1)
              .filter((item) => item.fixed === 'right')
              .reduce((sum, item) => sum + columnWidth(item), 0)
          : undefined;
    return {
      width,
      minWidth: width,
      textAlign: column.align,
      ...(fixed ? { position: 'sticky', [fixed]: offset, zIndex: 1 } : {}),
    };
  };
  const headerFixed = (column: DataTableColumn<R>) => {
    const children = leafColumns([column]);
    const side = children[0]?.fixed;
    return side && children.every((child) => child.fixed === side) ? side : undefined;
  };
  const headerStyle = (column: DataTableColumn<R>, leaf: boolean): CSSProperties | undefined => {
    if (leaf) {
      const style = fixedStyle(column);
      return column.fixed ? { ...style, zIndex: 4 } : style;
    }
    const side = headerFixed(column);
    if (!side) return undefined;
    const children = leafColumns([column]);
    const boundary = side === 'left' ? children[0] : children[children.length - 1];
    return { position: 'sticky', [side]: fixedStyle(boundary)[side], zIndex: 4 };
  };
  const expansionStyle: CSSProperties = selectionStyle.position
    ? { position: 'sticky', left: selectable ? 44 : 0, zIndex: 2, width: 32, minWidth: 32 }
    : { width: 32, minWidth: 32 };
  return (
    <div {...props} className={cx('f-data-table', className)} aria-busy={loading || undefined}>
      <div className="f-data-table-toolbar">
        {searchable && (
          <Input
            type="search"
            aria-label={`搜索${caption}`}
            placeholder="搜索表格…"
            disabled={blocked}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
          />
        )}
        <div className="f-data-table-tools">
          {selectable && (
            <span className="f-data-table-selection" aria-live="polite">
              已选择 {selected.length} 项
            </span>
          )}
          <details className="f-data-table-columns">
            <summary>显示列</summary>
            <fieldset
              disabled={blocked}
              className="f-overlay f-data-table-column-options f-column-menu"
            >
              <legend className="f-sr-only">选择显示的列</legend>
              {everyLeaf.map((column) => (
                <label key={column.key} className="f-choice">
                  <input
                    className="f-checkbox"
                    type="checkbox"
                    checked={!hidden.includes(column.key)}
                    disabled={!hidden.includes(column.key) && leaves.length <= 1}
                    onChange={(event) => {
                      if (blocked) return;
                      setHidden(
                        event.currentTarget.checked
                          ? hidden.filter((key) => key !== column.key)
                          : [...hidden, column.key],
                      );
                    }}
                  />
                  {column.title}
                </label>
              ))}
            </fieldset>
          </details>
        </div>
      </div>
      {loading && (
        <div className="f-data-table-status" role="status">
          正在加载数据…
        </div>
      )}
      <div
        className="f-data-table-scroll f-table-scroll"
        role="region"
        aria-label={caption}
        tabIndex={0}
      >
        <table
          className="f-table f-data-table-native"
          style={{
            tableLayout: 'fixed',
            minWidth: minimumWidth,
            width: stretchKey ? '100%' : minimumWidth,
          }}
        >
          <caption id={`${id}-caption`}>{caption}</caption>
          <colgroup>
            {selectable && <col style={{ width: 44 }} />}
            {separateExpansion && <col style={{ width: 32 }} />}
            {leaves.map((column) => (
              <col
                key={column.key}
                style={{ width: column.key === stretchKey ? undefined : columnWidth(column) }}
              />
            ))}
          </colgroup>
          <thead className="f-data-table-head" data-sticky={stickyHeader || undefined}>
            {headers.map((row, index) => (
              <tr key={index}>
                {index === 0 && selectable && (
                  <th
                    scope="col"
                    rowSpan={headers.length}
                    className="f-data-table-selection-cell"
                    style={selectionStyle}
                    data-fixed={selectionStyle.position ? 'left' : undefined}
                  >
                    <input
                      type="checkbox"
                      className="f-checkbox"
                      ref={checkedRef(selectionState)}
                      checked={allChecked}
                      aria-checked={selectionState}
                      aria-label="选择当前页全部行"
                      disabled={blocked || !enabledRows.length}
                      onChange={(event) => {
                        if (blocked) return;
                        const keys = enabledRows.map((item) => item.key);
                        setSelected(
                          event.currentTarget.checked
                            ? [...new Set([...selected, ...keys])]
                            : selected.filter((key) => !keys.includes(key)),
                        );
                      }}
                    />
                  </th>
                )}
                {index === 0 && separateExpansion && (
                  <th
                    scope="col"
                    rowSpan={headers.length}
                    aria-label="展开行"
                    className="f-data-table-expansion"
                    style={expansionStyle}
                    data-fixed={expansionStyle.position ? 'left' : undefined}
                  />
                )}
                {row.map((header) => (
                  <th
                    key={header.key}
                    scope={header.leaf ? 'col' : 'colgroup'}
                    colSpan={header.colSpan}
                    rowSpan={header.rowSpan}
                    style={headerStyle(header.column, header.leaf)}
                    data-fixed={headerFixed(header.column)}
                    aria-sort={
                      header.leaf && header.column.sortable
                        ? order?.key === header.key
                          ? order.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                  >
                    {header.column.sortable && header.leaf ? (
                      <button
                        type="button"
                        className="f-data-table-sort"
                        disabled={blocked}
                        onClick={() => {
                          setOrder(
                            order?.key !== header.key
                              ? { key: header.key, direction: 'asc' }
                              : order.direction === 'asc'
                                ? { key: header.key, direction: 'desc' }
                                : null,
                          );
                          setPage(1);
                        }}
                      >
                        {header.title}
                        <span aria-hidden="true">
                          {order?.key === header.key
                            ? order.direction === 'asc'
                              ? '↑'
                              : '↓'
                            : '↕'}
                        </span>
                      </button>
                    ) : (
                      header.title
                    )}
                    {header.leaf && header.column.filterMode ? (
                      <TableFilter
                        title={header.title}
                        mode={header.column.filterMode}
                        options={header.column.filterOptions}
                        selected={filter[header.key]}
                        range={ranges[header.key]}
                        disabled={blocked}
                        onApplySelection={(value) => {
                          const next = { ...filter };
                          if (value.length) next[header.key] = value;
                          else delete next[header.key];
                          setFilter(next);
                          setPage(1);
                        }}
                        onApplyRange={(value) => {
                          const next = { ...ranges };
                          if (value) next[header.key] = value;
                          else delete next[header.key];
                          setRanges(next);
                          setPage(1);
                        }}
                      />
                    ) : header.leaf && header.column.filterOptions?.length ? (
                      <select
                        className="f-select f-data-table-filter"
                        aria-label={`筛选${header.title}`}
                        disabled={blocked}
                        value={
                          typeof filter[header.key] === 'string'
                            ? (filter[header.key] as string)
                            : ''
                        }
                        onChange={(event) => {
                          const next = { ...filter };
                          if (event.currentTarget.value)
                            next[header.key] = event.currentTarget.value;
                          else delete next[header.key];
                          setFilter(next);
                          setPage(1);
                        }}
                      >
                        <option value="">全部</option>
                        {header.column.filterOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <Fragment key={row.key}>
                <tr data-selected={selected.includes(row.key) || undefined} data-depth={row.depth}>
                  {selectable && (
                    <td
                      className="f-data-table-selection-cell"
                      style={selectionStyle}
                      data-fixed={selectionStyle.position ? 'left' : undefined}
                    >
                      <input
                        type="checkbox"
                        className="f-checkbox"
                        aria-label={`选择行 ${row.key}`}
                        checked={selected.includes(row.key)}
                        disabled={blocked || rowDisabled?.(row.record)}
                        onChange={(event) => {
                          if (blocked || rowDisabled?.(row.record)) return;
                          setSelected(
                            event.currentTarget.checked
                              ? [...new Set([...selected, row.key])]
                              : selected.filter((key) => key !== row.key),
                          );
                        }}
                      />
                    </td>
                  )}
                  {separateExpansion && (
                    <td
                      className="f-data-table-expansion"
                      style={expansionStyle}
                      data-fixed={expansionStyle.position ? 'left' : undefined}
                    >
                      {(row.hasChildren || renderExpanded) && (
                        <button
                          type="button"
                          className="f-data-table-expand"
                          disabled={blocked || (hasFilter && effectiveExpanded.has(row.key))}
                          aria-expanded={
                            expanded.includes(row.key) || effectiveExpanded.has(row.key)
                          }
                          aria-label={`${expanded.includes(row.key) || effectiveExpanded.has(row.key) ? '收起' : '展开'}行 ${row.key}`}
                          title={
                            hasFilter && effectiveExpanded.has(row.key)
                              ? '筛选时展开匹配路径'
                              : undefined
                          }
                          onClick={() => toggleExpand(row.key)}
                        >
                          {expanded.includes(row.key) || effectiveExpanded.has(row.key) ? '⌄' : '›'}
                        </button>
                      )}
                    </td>
                  )}
                  {leaves.map((column, index) => {
                    const raw = cellValue(row.record, column);
                    return (
                      <td key={column.key} style={fixedStyle(column)} data-fixed={column.fixed}>
                        <div
                          className="f-data-table-cell"
                          style={{
                            justifyContent:
                              column.align === 'right'
                                ? 'flex-end'
                                : column.align === 'center'
                                  ? 'center'
                                  : undefined,
                          }}
                        >
                          {index === 0 && (
                            <span
                              className="f-data-table-indent"
                              style={{ width: `calc(${row.depth} * var(--f-tree-indent, 20px))` }}
                            />
                          )}
                          {index === 0 &&
                            !separateExpansion &&
                            (row.hasChildren || renderExpanded) && (
                              <button
                                type="button"
                                className="f-data-table-expand"
                                disabled={blocked || (hasFilter && effectiveExpanded.has(row.key))}
                                aria-expanded={
                                  expanded.includes(row.key) || effectiveExpanded.has(row.key)
                                }
                                aria-label={`${expanded.includes(row.key) || effectiveExpanded.has(row.key) ? '收起' : '展开'}行 ${row.key}`}
                                title={
                                  hasFilter && effectiveExpanded.has(row.key)
                                    ? '筛选时展开匹配路径'
                                    : undefined
                                }
                                onClick={() => toggleExpand(row.key)}
                              >
                                {expanded.includes(row.key) || effectiveExpanded.has(row.key)
                                  ? '⌄'
                                  : '›'}
                              </button>
                            )}
                          {column.render ? (
                            column.render(raw, row.record)
                          ) : column.editable && onCellChange ? (
                            <input
                              key={`${row.key}-${column.key}-${String(raw)}`}
                              className="f-input f-data-table-editor"
                              aria-label={`编辑${column.title} 行 ${row.key}`}
                              defaultValue={String(raw ?? '')}
                              disabled={blocked || rowDisabled?.(row.record)}
                              onBlur={(event) => {
                                if (
                                  !blocked &&
                                  !rowDisabled?.(row.record) &&
                                  event.currentTarget.value !== String(raw ?? '')
                                ) {
                                  const next = event.currentTarget.value;
                                  event.currentTarget.value = String(raw ?? '');
                                  onCellChange({ key: row.key, column: column.key, value: next });
                                }
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') event.currentTarget.blur();
                                if (event.key === 'Escape') {
                                  event.currentTarget.value = String(raw ?? '');
                                  event.currentTarget.blur();
                                }
                              }}
                            />
                          ) : (
                            <span>
                              {raw === null || raw === undefined
                                ? '—'
                                : typeof raw === 'object'
                                  ? JSON.stringify(raw)
                                  : String(raw)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {renderExpanded && expanded.includes(row.key) && (
                  <tr className="f-data-table-detail">
                    <td colSpan={Math.max(1, totalColumns)}>{renderExpanded(row.record)}</td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!result.rows.length && (
              <tr>
                <td colSpan={Math.max(1, totalColumns)}>
                  <div className="f-data-table-empty" role="status">
                    {loading ? '正在加载…' : emptyText}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {summary !== undefined && (
            <tfoot>
              <tr>
                <td colSpan={Math.max(1, totalColumns)}>{summary}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <div className="f-data-table-footer">
        <span>{`共 ${result.total} 项`}</span>
        {pagination && (
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            disabled={blocked}
            onPageChange={setPage}
            label={`${caption}分页`}
          />
        )}
      </div>
    </div>
  );
}

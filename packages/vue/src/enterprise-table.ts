import { computed, defineComponent, h, mergeProps, nextTick, ref, getCurrentInstance } from 'vue';
import type { PropType, VNodeChild, CSSProperties } from 'vue';
import { buildHeaderRows, cellValue, leafColumns, processTableRows } from '@btdesign/engine';
import type { DataColumn, TableSort } from '@btdesign/engine';
import { Pagination } from './granular.js';
import { useValue, useModel } from './enterprise-shared.js';
export interface DataTableColumn extends Omit<DataColumn, 'children'> {
  children?: DataTableColumn[];
  render?: (value: unknown, row: Record<string, unknown>) => VNodeChild;
}
export interface DataTableCellChange {
  key: string;
  column: string;
  value: string;
}
export const DataTable = defineComponent({
  name: 'BTDESIGNDataTable',
  inheritAttrs: false,
  props: {
    columns: { type: Array as PropType<DataTableColumn[]>, required: true },
    data: { type: Array as PropType<Record<string, unknown>[]>, required: true },
    rowKey: { type: String, default: 'id' },
    childrenKey: { type: String, default: 'children' },
    caption: { type: String, default: '数据表格' },
    loading: Boolean,
    disabled: Boolean,
    searchable: { type: Boolean, default: true },
    stickyHeader: { type: Boolean, default: true },
    page: { type: Number, default: undefined },
    query: { type: String, default: undefined },
    sort: { type: Object as PropType<TableSort | null>, default: undefined },
    filters: { type: Object as PropType<Record<string, string | string[]>>, default: undefined },
    hiddenKeys: { type: Array as PropType<string[]>, default: undefined },
    defaultHiddenKeys: { type: Array as PropType<string[]>, default: () => [] },
    defaultSelectedKeys: { type: Array as PropType<string[]>, default: () => [] },
    defaultExpandedKeys: { type: Array as PropType<string[]>, default: () => [] },
    rowDisabled: Function as PropType<(row: Record<string, unknown>) => boolean>,
    pagination: { type: Boolean, default: true },
    pageSize: { type: Number, default: 10 },
    selectable: Boolean,
    selectedKeys: { type: Array as PropType<string[]>, default: undefined },
    expandedKeys: { type: Array as PropType<string[]>, default: undefined },
    emptyText: { type: String, default: '暂无数据' },
  },
  emits: [
    'update:selectedKeys',
    'update:expandedKeys',
    'cell-change',
    'update:page',
    'update:query',
    'update:sort',
    'update:filters',
    'update:hiddenKeys',
  ],
  setup(props, { attrs, slots, emit }) {
    const instance = getCurrentInstance();
    const blocked = () => props.disabled || props.loading;
    const selection = useValue(
      () => props.selectedKeys,
      props.defaultSelectedKeys,
      (v) => emit('update:selectedKeys', v),
    );
    const expanded = useValue(
      () => props.expandedKeys,
      props.defaultExpandedKeys,
      (v) => emit('update:expandedKeys', v),
    );
    const query = useModel(
      () => props.query,
      '',
      (v) => emit('update:query', v),
    );
    const sort = useModel<TableSort | null>(
      () => props.sort,
      null,
      (v) => emit('update:sort', v),
    );
    const filters = useModel(
      () => props.filters,
      {},
      (v) => emit('update:filters', v),
    );
    const hidden = useModel(
      () => props.hiddenKeys,
      props.defaultHiddenKeys,
      (v) => emit('update:hiddenKeys', v),
    );
    const page = useModel(
      () => props.page,
      1,
      (v) => emit('update:page', v),
    );
    const leaves = computed(() => leafColumns(props.columns, hidden.value));
    const header = computed(() => buildHeaderRows(props.columns, hidden.value));
    const view = computed(() =>
      processTableRows(props.data, leaves.value, {
        query: query.value,
        sort: sort.value,
        filters: filters.value,
        expandedKeys: expanded.value.value,
        page: page.value,
        pageSize: props.pageSize,
        pagination: props.pagination,
        rowKey: props.rowKey,
        childrenKey: props.childrenKey,
      }),
    );
    const expandColumn = computed(
      () => view.value.allRows.some((row) => row.hasChildren) || Boolean(slots.expanded),
    );
    const columnWidth = (column: DataTableColumn) =>
      Number.isFinite(column.width) ? Math.max(48, Math.min(2000, column.width!)) : 140;
    const stretchKey = computed(() => leaves.value.filter((column) => !column.fixed).at(-1)?.key);
    const leadingWidth = computed(
      () => (props.selectable ? 44 : 0) + (expandColumn.value ? 32 : 0),
    );
    const minimumWidth = computed(() =>
      leaves.value.reduce((sum, column) => sum + columnWidth(column), leadingWidth.value),
    );
    const leadingStyle = (width: number, left: number): CSSProperties => ({
      width: `${width}px`,
      minWidth: `${width}px`,
      ...(leaves.value.some((column) => column.fixed === 'left')
        ? { position: 'sticky', left: `${left}px`, zIndex: 2 }
        : {}),
    });
    const style = (column: DataTableColumn): CSSProperties => {
      const width = column.key === stretchKey.value ? undefined : `${columnWidth(column)}px`;
      const result: CSSProperties = {
        textAlign: column.align ?? 'left',
        width,
        minWidth: width,
      };
      if (column.fixed) {
        const side = column.fixed;
        const fixed = leaves.value.filter((c) => c.fixed === side);
        const position = fixed.findIndex((c) => c.key === column.key);
        const previous = side === 'left' ? fixed.slice(0, position) : fixed.slice(position + 1);
        result.position = 'sticky';
        result[side] =
          `${previous.reduce((sum, c) => sum + columnWidth(c), side === 'left' ? leadingWidth.value : 0)}px`;
        result.zIndex = 1;
      }
      return result;
    };
    const select = (key: string, checked: boolean) => {
      if (blocked()) return;
      selection.set(
        checked
          ? [...new Set([...selection.value.value, key])]
          : selection.value.value.filter((k) => k !== key),
      );
    };
    const expand = (key: string) => {
      if (blocked()) return;
      expanded.set(
        expanded.value.value.includes(key)
          ? expanded.value.value.filter((k) => k !== key)
          : [...expanded.value.value, key],
      );
    };
    const order = (key: string) => {
      if (blocked()) return;
      sort.value =
        sort.value?.key === key
          ? sort.value.direction === 'asc'
            ? { key, direction: 'desc' }
            : null
          : { key, direction: 'asc' };
      page.value = 1;
    };
    return () => {
      const result = view.value;
      const columns = leaves.value;
      const hasExpansion = expandColumn.value;
      const leadingFixed = columns.some((column) => column.fixed === 'left') ? 'left' : undefined;
      const allKeys = result.rows
        .filter((row) => !props.rowDisabled?.(row.record))
        .map((row) => row.key);
      const selectedCount = allKeys.filter((key) => selection.value.value.includes(key)).length;
      const totalColumns = columns.length + (props.selectable ? 1 : 0) + (hasExpansion ? 1 : 0);
      const rows: VNodeChild[] = [];
      for (const row of result.rows) {
        const isExpanded =
          expanded.value.value.includes(row.key) ||
          (row.hasChildren && result.rows.some((child) => child.parentKey === row.key));
        const forcedOpen =
          row.hasChildren &&
          Boolean(
            query.value.trim() ||
            Object.values(filters.value).some((v) => (Array.isArray(v) ? v.length : v)),
          );
        const cells: VNodeChild[] = [];
        if (props.selectable)
          cells.push(
            h(
              'td',
              {
                class: 'f-data-table-selection-cell',
                style: leadingStyle(44, 0),
                'data-fixed': leadingFixed,
              },
              h('input', {
                type: 'checkbox',
                class: 'f-checkbox',
                'aria-label': `选择行 ${row.key}`,
                disabled: blocked() || props.rowDisabled?.(row.record),
                checked: selection.value.value.includes(row.key),
                onChange: (e: Event) => select(row.key, (e.target as HTMLInputElement).checked),
              }),
            ),
          );
        if (hasExpansion)
          cells.push(
            h(
              'td',
              {
                class: 'f-data-table-expansion',
                style: leadingStyle(32, props.selectable ? 44 : 0),
                'data-fixed': leadingFixed,
              },
              [
                row.hasChildren || slots.expanded
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: 'f-tree-toggle',
                        disabled: blocked() || (forcedOpen && !slots.expanded),
                        title: forcedOpen ? '筛选结果保持展开' : undefined,
                        'aria-label': `${isExpanded ? '收起' : '展开'}行 ${row.key}`,
                        'aria-expanded': isExpanded,
                        onClick: () => expand(row.key),
                      },
                      isExpanded ? '⌄' : '›',
                    )
                  : null,
              ],
            ),
          );
        columns.forEach((column, index) => {
          const value = cellValue(row.record, column);
          const title = String(value ?? '');
          const content = column.render
            ? column.render(value, row.record)
            : column.editable &&
                (instance?.vnode.props?.['onCell-change'] || instance?.vnode.props?.onCellChange)
              ? h('input', {
                  class: 'f-input f-data-cell-input f-data-table-editor',
                  value: title,
                  disabled: blocked() || props.rowDisabled?.(row.record),
                  'aria-label': `编辑 ${column.title}，行 ${row.key}`,
                  onBlur: (event: Event) => {
                    if (blocked() || props.rowDisabled?.(row.record)) return;
                    const target = event.target as HTMLInputElement;
                    emit('cell-change', {
                      key: row.key,
                      column: column.key,
                      value: target.value,
                    } satisfies DataTableCellChange);
                    nextTick(() => {
                      const current = view.value.allRows.find(
                        (candidate) => candidate.key === row.key,
                      );
                      target.value = String(
                        current ? (cellValue(current.record, column) ?? '') : title,
                      );
                    });
                  },
                  onKeydown: (event: KeyboardEvent) => {
                    const target = event.target as HTMLInputElement;
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      target.blur();
                    }
                    if (event.key === 'Escape') {
                      target.value = title;
                      target.blur();
                    }
                  },
                })
              : slots.cell
                ? slots.cell({ value, row: row.record, column, key: row.key })
                : title;
          cells.push(
            h(
              'td',
              {
                key: column.key,
                style: style(column),
                'data-fixed': column.fixed,
                class: column.fixed ? 'f-data-table-fixed' : undefined,
              },
              [
                index === 0 && row.depth > 0
                  ? h(
                      'div',
                      {
                        class: 'f-data-table-tree-cell',
                        style: { paddingInlineStart: `calc(${row.depth} * var(--f-tree-indent))` },
                      },
                      [content],
                    )
                  : content,
              ],
            ),
          );
        });
        rows.push(
          h(
            'tr',
            {
              key: row.key,
              'data-row-key': row.key,
              'data-selected': selection.value.value.includes(row.key) || undefined,
              class: selection.value.value.includes(row.key) ? 'is-selected' : undefined,
            },
            cells,
          ),
        );
        if (isExpanded && slots.expanded)
          rows.push(
            h(
              'tr',
              { key: `${row.key}-details`, class: 'f-data-table-detail' },
              h('td', { colspan: totalColumns }, slots.expanded({ row: row.record, key: row.key })),
            ),
          );
      }
      return h(
        'div',
        mergeProps(attrs, { class: 'f-data-table', 'aria-busy': props.loading || undefined }),
        [
          h('div', { class: 'f-data-table-toolbar' }, [
            props.searchable
              ? h('input', {
                  type: 'search',
                  class: 'f-input',
                  'aria-label': `搜索${props.caption}`,
                  placeholder: '搜索表格…',
                  value: query.value,
                  disabled: blocked(),
                  onInput: (e: Event) => {
                    query.value = (e.target as HTMLInputElement).value;
                    page.value = 1;
                  },
                })
              : null,
            slots.toolbar?.(),
            h('details', { class: 'f-data-table-columns' }, [
              h('summary', {}, '显示列'),
              h(
                'div',
                { class: 'f-overlay f-data-table-column-options f-column-menu' },
                leafColumns(props.columns).map((column) =>
                  h('label', { class: 'f-choice', key: column.key }, [
                    h('input', {
                      type: 'checkbox',
                      class: 'f-checkbox',
                      checked: !hidden.value.includes(column.key),
                      disabled:
                        props.disabled ||
                        (!hidden.value.includes(column.key) && columns.length <= 1),
                      onChange: (e: Event) => {
                        if (blocked()) return;
                        hidden.value = (e.target as HTMLInputElement).checked
                          ? hidden.value.filter((key) => key !== column.key)
                          : [...hidden.value, column.key];
                      },
                    }),
                    column.title,
                  ]),
                ),
              ),
            ]),
            props.selectable
              ? h(
                  'span',
                  { class: 'f-data-table-selection-count', role: 'status' },
                  `已选择 ${selection.value.value.length} 项`,
                )
              : null,
          ]),
          h(
            'div',
            {
              class: 'f-data-table-scroll f-table-scroll',
              role: 'region',
              'aria-label': props.caption,
              tabindex: 0,
            },
            h(
              'table',
              {
                class: 'f-table f-data-table-native',
                style: {
                  tableLayout: 'fixed',
                  minWidth: `${minimumWidth.value}px`,
                  width: stretchKey.value ? '100%' : `${minimumWidth.value}px`,
                },
              },
              [
                h('caption', { class: 'f-table-caption' }, props.caption),
                h('colgroup', {}, [
                  props.selectable ? h('col', { style: { width: '44px' } }) : null,
                  hasExpansion ? h('col', { style: { width: '32px' } }) : null,
                  ...columns.map((column) =>
                    h('col', {
                      key: column.key,
                      style: {
                        width:
                          column.key === stretchKey.value ? undefined : `${columnWidth(column)}px`,
                      },
                    }),
                  ),
                ]),
                h(
                  'thead',
                  { class: 'f-data-table-head', 'data-sticky': props.stickyHeader || undefined },
                  header.value.map((row, index) =>
                    h('tr', { key: index }, [
                      index === 0 && props.selectable
                        ? h(
                            'th',
                            {
                              scope: 'col',
                              rowspan: header.value.length,
                              class: 'f-data-table-selection-cell',
                              style: leadingStyle(44, 0),
                              'data-fixed': leadingFixed,
                            },
                            h('input', {
                              type: 'checkbox',
                              class: 'f-checkbox',
                              'aria-label': '选择当前页',
                              disabled: blocked() || allKeys.length === 0,
                              checked: allKeys.length > 0 && selectedCount === allKeys.length,
                              indeterminate: selectedCount > 0 && selectedCount < allKeys.length,
                              'aria-checked':
                                selectedCount > 0 && selectedCount < allKeys.length
                                  ? 'mixed'
                                  : allKeys.length > 0 && selectedCount === allKeys.length,
                              onChange: (event: Event) => {
                                if (blocked()) return;
                                selection.set(
                                  (event.target as HTMLInputElement).checked
                                    ? [...new Set([...selection.value.value, ...allKeys])]
                                    : selection.value.value.filter((key) => !allKeys.includes(key)),
                                );
                              },
                            }),
                          )
                        : null,
                      index === 0 && hasExpansion
                        ? h('th', {
                            scope: 'col',
                            rowspan: header.value.length,
                            'aria-label': '展开行',
                            class: 'f-data-table-expansion',
                            style: leadingStyle(32, props.selectable ? 44 : 0),
                            'data-fixed': leadingFixed,
                          })
                        : null,
                      ...row.map((cell) =>
                        h(
                          'th',
                          {
                            key: cell.key,
                            scope: cell.leaf ? 'col' : 'colgroup',
                            colspan: cell.colSpan,
                            rowspan: cell.rowSpan,
                            style: cell.leaf ? style(cell.column) : undefined,
                            'data-fixed': cell.column.fixed,
                            'aria-sort':
                              cell.leaf && sort.value?.key === cell.key
                                ? sort.value.direction === 'asc'
                                  ? 'ascending'
                                  : 'descending'
                                : undefined,
                          },
                          [
                            cell.column.sortable && cell.leaf
                              ? h(
                                  'button',
                                  {
                                    type: 'button',
                                    class: 'f-data-table-sort',
                                    disabled: blocked(),
                                    onClick: () => order(cell.key),
                                  },
                                  [
                                    cell.title,
                                    h(
                                      'span',
                                      { 'aria-hidden': 'true' },
                                      sort.value?.key === cell.key
                                        ? sort.value.direction === 'asc'
                                          ? ' ↑'
                                          : ' ↓'
                                        : ' ↕',
                                    ),
                                  ],
                                )
                              : cell.title,
                            cell.leaf && cell.column.filterOptions
                              ? h(
                                  'select',
                                  {
                                    class: 'f-select f-data-table-filter',
                                    'aria-label': `筛选${cell.title}`,
                                    disabled: blocked(),
                                    value: filters.value[cell.key] ?? '',
                                    onChange: (event: Event) => {
                                      filters.value = {
                                        ...filters.value,
                                        [cell.key]: (event.target as HTMLSelectElement).value,
                                      };
                                      page.value = 1;
                                    },
                                  },
                                  [
                                    h('option', { value: '' }, '全部'),
                                    ...cell.column.filterOptions.map((option) =>
                                      h(
                                        'option',
                                        { value: option.value, disabled: option.disabled },
                                        option.label,
                                      ),
                                    ),
                                  ],
                                )
                              : null,
                          ],
                        ),
                      ),
                    ]),
                  ),
                ),
                h(
                  'tbody',
                  {},
                  props.loading
                    ? [
                        h(
                          'tr',
                          {},
                          h(
                            'td',
                            { colspan: totalColumns, class: 'f-data-table-empty', role: 'status' },
                            '正在加载数据…',
                          ),
                        ),
                      ]
                    : rows.length
                      ? rows
                      : [
                          h(
                            'tr',
                            {},
                            h(
                              'td',
                              { colspan: totalColumns, class: 'f-data-table-empty' },
                              props.emptyText,
                            ),
                          ),
                        ],
                ),
                slots.summary
                  ? h(
                      'tfoot',
                      {},
                      h(
                        'tr',
                        {},
                        h(
                          'td',
                          { colspan: totalColumns },
                          slots.summary({ rows: result.allRows.map((row) => row.record) }),
                        ),
                      ),
                    )
                  : null,
              ],
            ),
          ),
          h('div', { class: 'f-data-table-footer' }, [
            h(
              'span',
              {},
              `共 ${result.total} 项${result.rows.some((row) => row.depth > 0) ? '（按根级分页）' : ''}`,
            ),
            props.pagination
              ? h(Pagination, {
                  page: result.page,
                  total: result.total,
                  pageSize: result.pageSize,
                  disabled: blocked() || props.loading,
                  label: `${props.caption}分页`,
                  'onUpdate:page': (value: number) => (page.value = value),
                })
              : null,
          ]),
        ],
      );
    };
  },
});

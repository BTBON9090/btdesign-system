export interface ChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}
export interface TreeNode {
  key: string;
  label: string;
  disabled?: boolean;
  selectable?: boolean;
  children?: TreeNode[];
  description?: string;
}
export interface FlatTreeNode extends TreeNode {
  /** One based ARIA level; depth is zero based for indentation. */
  level: number;
  depth: number;
  parentKey?: string;
  /** Root-to-self keys, including this node. */
  path: string[];
  leaf: boolean;
  /** Includes disabled ancestors. */
  disabled: boolean;
}
export type FormValues = Record<string, unknown>;
export interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'url';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  validate?: (value: unknown, values: FormValues) => string | undefined;
}
export type FormRules = Record<string, ValidationRule | ValidationRule[]>;
export type FormErrors = Record<string, string>;
export interface DateParts {
  year: number;
  month: number;
  day: number;
}
export interface CalendarDay {
  value: string;
  day: number;
  /** YYYY-MM */
  month: string;
  currentMonth: boolean;
  /** Sunday = 0 */
  weekday: number;
}
export interface DateConstraints {
  min?: string;
  max?: string;
  disabledDate?: (value: string) => boolean;
}
export type DateRange = [string, string];
export interface NavItem {
  key: string;
  label: string;
  href?: string;
  disabled?: boolean;
  children?: NavItem[];
  separator?: boolean;
}
export interface FileItem {
  id: string;
  name: string;
  size?: number;
  status?: 'ready' | 'uploading' | 'done' | 'error';
  progress?: number;
  url?: string;
  error?: string;
}
export interface DataColumn {
  key: string;
  title: string;
  dataIndex?: string;
  children?: DataColumn[];
  sortable?: boolean;
  filterOptions?: ChoiceOption[];
  /** Opt in to a confirmed multi-select or numeric range; omitted keeps the native single select. */
  filterMode?: 'multiple' | 'numberRange';
  width?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  editable?: boolean;
}
export interface HeaderCell<C extends DataColumn = DataColumn> {
  column: C;
  key: string;
  title: string;
  colSpan: number;
  rowSpan: number;
  /** Zero based header row. */
  depth: number;
  leaf: boolean;
}
export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}
/** Inclusive bounds; omitted bounds are unbounded. Only finite numeric cells match. */
export interface TableNumberRange {
  min?: number;
  max?: number;
}
export interface TableOptions {
  query?: string;
  sort?: TableSort | null;
  filters?: Record<string, string | string[]>;
  numberRanges?: Record<string, TableNumberRange>;
  expandedKeys?: readonly string[];
  page?: number;
  pageSize?: number;
  pagination?: boolean;
  rowKey?: string;
  childrenKey?: string;
}
export interface TableRow<R extends Record<string, unknown> = Record<string, unknown>> {
  record: R;
  key: string;
  depth: number;
  parentKey?: string;
  hasChildren: boolean;
}
export interface TableResult<R extends Record<string, unknown> = Record<string, unknown>> {
  rows: TableRow<R>[];
  /** Filtered root count, before pagination. */
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** All filtered rows, including collapsed/off-page descendants. */
  allRows: TableRow<R>[];
}

# Frozen v0.3 adapter API

All exported from `@btdesign/engine`. Types in `src/types.ts` are available now.

```ts
validateValue(value: unknown, rules: ValidationRule | ValidationRule[], values?: FormValues): string | undefined;
validateValues(values: FormValues, rules: FormRules): FormErrors;
parseDate(value: string): DateParts | null;
formatDate(value: DateParts | Date): string;
addDays(value: string, amount: number): string;
addMonths(value: string, amount: number): string; // Clamp day to destination month.
calendarDays(month: string, weekStartsOn?: 0 | 1): CalendarDay[]; // YYYY-MM; always 42 cells, invalid -> [].
isDateDisabled(value: string, constraints?: DateConstraints): boolean;
normalizeDateRange(range: readonly string[]): DateRange;
selectDateRange(current: readonly string[], next: string): DateRange;
flattenTree(nodes: readonly TreeNode[]): FlatTreeNode[];
filterTree(nodes: readonly TreeNode[], query: string): TreeNode[];
selectableLeafKeys(nodes: readonly TreeNode[], key?: string): string[];
toggleTreeSelection(nodes: readonly TreeNode[], selected: readonly string[], key: string, multiple?: boolean, cascade?: boolean): string[];
treeCheckState(nodes: readonly TreeNode[], selected: readonly string[], key: string, cascade?: boolean): boolean | 'mixed';
leafColumns<C extends DataColumn>(columns: readonly C[], hiddenKeys?: readonly string[]): C[];
buildHeaderRows<C extends DataColumn>(columns: readonly C[], hiddenKeys?: readonly string[]): HeaderCell<C>[][];
cellValue(row: Record<string,unknown>, column: DataColumn): unknown; // dataIndex or key, literal own property only.
processTableRows<R extends Record<string,unknown>>(data: readonly R[], columns: readonly DataColumn[], options?: TableOptions): TableResult<R>;
safeHref(value?: string): string | undefined;
formatFileSize(value?: number): string;
toggleOption(selected: readonly string[], value: string, options?: readonly ChoiceOption[]): string[];
```

`flattenTree` is preorder, keeps first duplicate key and skips cycles, normalizes inherited disabled; `path` includes self and `level` starts at 1. Tree selection always returns keys. Single selection ignores cascade; cascade multi stores selectable leaf keys and derives parent mixed state. Unknown keys do not enter new selections. Existing valid disabled selected keys are preserved on other changes.

Table headers include group and leaf rows. `processTableRows` filters/sorts siblings recursively, preserves ancestors of matching descendants, expands paths for active filters/search, paginates **root rows**, then flattens expanded descendants. Returned record objects are the original input records (not cloned); `hasChildren` reflects filtered children. Stable key defaults `id`, children defaults `children`. Missing keys fall back to path index, duplicate keys use first occurrence. Sorting handles numbers as numbers, strings with locale comparison, null last. No input mutation. Hidden columns affect header/leaf functions; pass visible columns to processing if hidden fields should not be searched.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateValue,
  validateValues,
  parseDate,
  formatDate,
  addDays,
  addMonths,
  calendarDays,
  isDateDisabled,
  normalizeDateRange,
  selectDateRange,
  flattenTree,
  filterTree,
  selectableLeafKeys,
  toggleTreeSelection,
  treeCheckState,
  leafColumns,
  buildHeaderRows,
  cellValue,
  processTableRows,
  safeHref,
  formatFileSize,
  toggleOption,
} from '../dist/index.js';

test('required validation distinguishes zero from missing values and unchecked consent', () => {
  for (const value of [undefined, null, '', '  ', [], false])
    assert.equal(validateValue(value, { required: true }), '请填写此项');
  for (const value of [0, '0', true, ['one']])
    assert.equal(validateValue(value, { required: true }), undefined);
  assert.deepEqual(
    validateValues(
      { count: 0, email: '' },
      { count: { required: true, min: 0 }, email: { required: true, message: '请填写工作邮箱' } },
    ),
    { email: '请填写工作邮箱' },
  );
});

test('form rules validate actual formats, numeric bounds, unicode length and selections', () => {
  assert.equal(validateValue('a@example.com', { type: 'email' }), undefined);
  assert.ok(validateValue('a@', { type: 'email' }));
  assert.equal(validateValue('https://example.com/path', { type: 'url' }), undefined);
  assert.ok(validateValue('javascript:alert(1)', { type: 'url' }));
  assert.equal(validateValue('1.5', { min: 1, max: 2 }), undefined);
  assert.ok(validateValue(Infinity, { min: 0 }));
  assert.ok(validateValue('not-number', { max: 8 }));
  assert.equal(validateValue('😀', { minLength: 1, maxLength: 1 }), undefined);
  assert.ok(validateValue(['a'], { minLength: 2 }));
  assert.equal(validateValue('', { type: 'email' }), undefined);
});

test('custom form rules see other values and first failure wins without exposing thrown details', () => {
  const values = { password: 'safe-pass', confirm: 'different' };
  assert.equal(
    validateValue(
      values.confirm,
      [{ validate: (value, all) => (value === all.password ? undefined : '两次密码不一致') }],
      values,
    ),
    '两次密码不一致',
  );
  assert.equal(validateValue('x', [{ required: true }, { pattern: '[' }]), '校验规则无效');
  assert.equal(
    validateValue('x', {
      validate: () => {
        throw new Error('secret');
      },
    }),
    '暂时无法校验此项',
  );
  assert.equal(validateValue('x', { minLength: 3, message: '太短' }), '太短');
});

test('validation treats prototype-looking field names as ordinary own data', () => {
  const rules = JSON.parse('{"__proto__":{"required":true},"constructor":{"required":true}}');
  const errors = validateValues({}, rules);
  assert.equal(Object.getPrototypeOf(errors), Object.prototype);
  assert.equal(Object.hasOwn(errors, '__proto__'), true);
  assert.equal(Object.hasOwn(errors, 'constructor'), true);
});

test('strict dates reject rollover, malformed values and nonleap century dates', () => {
  assert.deepEqual(parseDate('2024-02-29'), { year: 2024, month: 2, day: 29 });
  assert.deepEqual(parseDate('2000-02-29'), { year: 2000, month: 2, day: 29 });
  for (const value of [
    '2023-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-1-01',
    '2026-01-00',
    '0000-01-01',
    '2026-01-01T00:00:00Z',
  ])
    assert.equal(parseDate(value), null, value);
  assert.equal(formatDate({ year: 1, month: 1, day: 1 }), '0001-01-01');
  assert.equal(formatDate(new Date(NaN)), '');
});

test('calendar arithmetic handles leap years, month clamps and DST dates as date-only values', () => {
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2024-02-29', 1), '2024-03-01');
  assert.equal(addDays('2026-03-08', 1), '2026-03-09');
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29');
  assert.equal(addMonths('2024-03-31', -1), '2024-02-29');
  assert.equal(addMonths('2026-12-31', 2), '2027-02-28');
  assert.equal(addDays('9999-12-31', 1), '');
  assert.equal(addMonths('bad', 1), '');
});

test('calendar grids contain consecutive dates in correct weekday columns', () => {
  const monday = calendarDays('2026-11', 1);
  assert.equal(monday.length, 42);
  assert.equal(monday[0].value, '2026-10-26');
  assert.equal(monday[0].weekday, 1);
  assert.equal(monday.filter((day) => day.currentMonth).length, 30);
  for (let i = 1; i < monday.length; i++)
    assert.equal(monday[i].value, addDays(monday[i - 1].value, 1));
  assert.equal(calendarDays('2026-11', 0)[0].value, '2026-11-01');
  assert.deepEqual(calendarDays('2026-13'), []);
});

test('date constraints and range selection preserve partial input and normalize order', () => {
  assert.equal(isDateDisabled('2026-11-02', { min: '2026-11-03' }), true);
  assert.equal(isDateDisabled('2026-11-03', { min: '2026-11-03', max: '2026-11-03' }), false);
  assert.equal(
    isDateDisabled('2026-11-03', {
      disabledDate: () => {
        throw new Error('private');
      },
    }),
    true,
  );
  assert.equal(isDateDisabled('bad'), true);
  assert.deepEqual(normalizeDateRange(['2026-11-09', '2026-11-01']), ['2026-11-01', '2026-11-09']);
  assert.deepEqual(normalizeDateRange(['', '2026-11-01']), ['', '2026-11-01']);
  assert.deepEqual(selectDateRange(['', ''], '2026-11-10'), ['2026-11-10', '']);
  assert.deepEqual(selectDateRange(['2026-11-10', ''], '2026-11-02'), ['2026-11-02', '2026-11-10']);
  assert.deepEqual(selectDateRange(['2026-11-02', '2026-11-10'], '2026-11-12'), ['2026-11-12', '']);
});

const tree = [
  {
    key: 'root',
    label: '公司',
    children: [
      {
        key: 'design',
        label: '设计',
        children: [
          { key: 'lin', label: '林晓' },
          { key: 'alex', label: 'Alex' },
        ],
      },
      {
        key: 'private',
        label: '归档',
        disabled: true,
        children: [{ key: 'hidden', label: '受保护成员' }],
      },
      {
        key: 'no-select',
        label: '分组',
        selectable: false,
        children: [{ key: 'qa', label: '质量团队' }],
      },
    ],
  },
];

test('tree flattening preserves paths and inherits disabled state without mutating input', () => {
  const before = JSON.stringify(tree);
  const flat = flattenTree(tree);
  const hidden = flat.find((node) => node.key === 'hidden');
  assert.deepEqual(hidden.path, ['root', 'private', 'hidden']);
  assert.equal(hidden.disabled, true);
  assert.equal(hidden.depth, 2);
  assert.equal(hidden.level, 3);
  assert.equal(hidden.parentKey, 'private');
  assert.equal(hidden.leaf, true);
  assert.equal(flat[0].leaf, false);
  assert.equal(JSON.stringify(tree), before);
});

test('tree duplicates and reference cycles terminate and preserve first keys', () => {
  const a = { key: 'a', label: 'First', children: [] };
  const b = { key: 'b', label: 'B', children: [a] };
  a.children.push(b);
  const flat = flattenTree([
    a,
    { key: 'a', label: 'Duplicate', children: [{ key: 'other', label: 'Should not appear' }] },
  ]);
  assert.deepEqual(
    flat.map((node) => node.key),
    ['a', 'b'],
  );
  assert.equal(flat[0].label, 'First');
  assert.equal(flat[1].leaf, true);
});

test('tree search retains ancestor paths, descendants of matching parents and disabled context', () => {
  assert.deepEqual(
    flattenTree(filterTree(tree, 'alex')).map((node) => node.key),
    ['root', 'design', 'alex'],
  );
  assert.deepEqual(
    flattenTree(filterTree(tree, '设计')).map((node) => node.key),
    ['root', 'design', 'lin', 'alex'],
  );
  assert.equal(flattenTree(filterTree(tree, '受保护'))[2].disabled, true);
  assert.deepEqual(filterTree(tree, 'does-not-exist'), []);
});

test('cascade selection stores eligible leaves, derives mixed state and preserves disabled selections', () => {
  assert.deepEqual(selectableLeafKeys(tree), ['lin', 'alex', 'qa']);
  assert.deepEqual(toggleTreeSelection(tree, [], 'design', true, true), ['lin', 'alex']);
  assert.equal(treeCheckState(tree, ['lin'], 'design', true), 'mixed');
  assert.equal(treeCheckState(tree, ['lin', 'alex'], 'design', true), true);
  assert.equal(treeCheckState(tree, [], 'design', true), false);
  assert.deepEqual(toggleTreeSelection(tree, ['lin', 'alex', 'hidden'], 'design', true, true), [
    'hidden',
  ]);
  assert.deepEqual(toggleTreeSelection(tree, ['lin'], 'private', true, true), ['lin']);
  assert.deepEqual(toggleTreeSelection(tree, ['lin'], 'hidden', true, true), ['lin']);
  assert.deepEqual(toggleTreeSelection(tree, [], 'no-select', true, true), []);
  assert.deepEqual(toggleTreeSelection(tree, [], 'unknown', true, true), []);
});

test('single and independent tree selections do not accidentally cascade', () => {
  assert.deepEqual(toggleTreeSelection(tree, ['lin'], 'design'), ['design']);
  assert.deepEqual(toggleTreeSelection(tree, ['lin'], 'design', true), ['lin', 'design']);
  assert.deepEqual(toggleTreeSelection(tree, ['lin', 'design'], 'design', true), ['lin']);
  assert.equal(treeCheckState(tree, ['lin'], 'design'), false);
});

const columns = [
  { key: 'name', title: '名称', fixed: 'left', width: 160 },
  {
    key: 'metrics',
    title: '指标',
    children: [
      {
        key: 'usage',
        title: '用量',
        children: [
          { key: 'budget', title: '预算', sortable: true },
          { key: 'spent', title: '支出', sortable: true },
        ],
      },
      { key: 'status', title: '状态', filterOptions: [{ value: 'active', label: '活跃' }] },
    ],
  },
];

test('multilevel headers have exact colSpan/rowSpan and retain leaf render references', () => {
  const render = () => 'custom';
  const input = [...columns, { key: 'action', title: '操作', render }];
  const rows = buildHeaderRows(input);
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows[0].map(({ key, colSpan, rowSpan }) => ({ key, colSpan, rowSpan })),
    [
      { key: 'name', colSpan: 1, rowSpan: 3 },
      { key: 'metrics', colSpan: 3, rowSpan: 1 },
      { key: 'action', colSpan: 1, rowSpan: 3 },
    ],
  );
  assert.equal(rows[1].find((cell) => cell.key === 'status').rowSpan, 2);
  assert.equal(rows[0].find((cell) => cell.key === 'action').column.render, render);
  assert.deepEqual(
    leafColumns(input).map((column) => column.key),
    ['name', 'budget', 'spent', 'status', 'action'],
  );
});

test('hidden leaves recompute group spans and remove empty groups and duplicate keys', () => {
  const rows = buildHeaderRows(columns, ['budget', 'spent']);
  assert.equal(rows.length, 2);
  assert.deepEqual(
    rows.map((row) => row.map((cell) => cell.key)),
    [['name', 'metrics'], ['status']],
  );
  assert.equal(rows[0][1].colSpan, 1);
  assert.deepEqual(
    leafColumns(columns, ['metrics']).map((column) => column.key),
    ['name'],
  );
  assert.deepEqual(
    leafColumns([
      { key: 'x', title: 'First' },
      { key: 'x', title: 'Second' },
    ]).map((column) => column.title),
    ['First'],
  );
});

const records = [
  {
    id: 'a',
    name: '研发',
    budget: 20,
    status: 'active',
    children: [
      { id: 'a1', name: 'Alpha', budget: 12, status: 'paused' },
      { id: 'a2', name: 'Beta', budget: 2, status: 'active' },
    ],
  },
  { id: 'b', name: '设计', budget: 3, status: 'active' },
  { id: 'c', name: '归档', budget: null, status: 'paused' },
];

test('table sorting is numeric/stable, nulls last and does not mutate original records', () => {
  const before = JSON.stringify(records);
  const result = processTableRows(records, columns, {
    sort: { key: 'budget', direction: 'asc' },
    expandedKeys: ['a'],
  });
  assert.deepEqual(
    result.rows.map((row) => row.key),
    ['b', 'a', 'a2', 'a1', 'c'],
  );
  assert.equal(result.rows[1].record, records[0]);
  assert.deepEqual(
    processTableRows(records, columns, { sort: { key: 'budget', direction: 'desc' } }).rows.map(
      (row) => row.key,
    ),
    ['a', 'b', 'c'],
  );
  assert.equal(JSON.stringify(records), before);
});

test('table filters preserve matching descendant paths and open them without changing expansion input', () => {
  const expandedKeys = [];
  const result = processTableRows(records, columns, {
    query: 'beta',
    filters: { status: ['active'] },
    expandedKeys,
  });
  assert.deepEqual(
    result.rows.map((row) => [row.key, row.depth, row.parentKey]),
    [
      ['a', 0, undefined],
      ['a2', 1, 'a'],
    ],
  );
  assert.equal(result.total, 1);
  assert.equal(result.rows[0].hasChildren, true);
  assert.deepEqual(expandedKeys, []);
  assert.deepEqual(processTableRows(records, columns, { query: 'no matches' }).rows, []);
});
test('numeric ranges use inclusive finite numeric bounds and preserve matching tree ancestors', () => {
  const values = [
    {
      id: 'root',
      amount: 100,
      state: 'active',
      children: [
        { id: 'zero', amount: 0, state: 'active' },
        { id: 'decimal', amount: -1.5, state: 'active' },
      ],
    },
    { id: 'numeric-string', amount: '0', state: 'active' },
    { id: 'blank', amount: null, state: 'active' },
    { id: 'outside', amount: 2, state: 'active' },
  ];
  const cols = [
    { key: 'amount', title: '金额' },
    { key: 'state', title: '状态' },
  ];
  const result = processTableRows(values, cols, {
    filters: { state: ['active'] },
    numberRanges: { amount: { min: -1.5, max: 0 } },
    pagination: false,
  });
  assert.deepEqual(
    result.rows.map((row) => row.key),
    ['root', 'zero', 'decimal'],
  );
  assert.equal(result.total, 1);
  assert.deepEqual(
    processTableRows(values, cols, {
      numberRanges: { amount: { min: 2 } },
      pagination: false,
    }).rows.map((row) => row.key),
    ['root', 'outside'],
  );
  assert.deepEqual(
    processTableRows(values, cols, { numberRanges: { amount: {} }, pagination: false }).rows.map(
      (row) => row.key,
    ),
    ['root', 'numeric-string', 'blank', 'outside'],
  );
  assert.equal(
    processTableRows(values, cols, {
      numberRanges: { amount: { min: 3, max: 2 } },
      pagination: false,
    }).total,
    0,
  );
  assert.equal(
    processTableRows(values, cols, {
      numberRanges: { amount: { min: Infinity } },
      pagination: false,
    }).total,
    0,
  );
});

test('table pagination applies to roots and includes expanded descendants of the page', () => {
  const first = processTableRows(records, columns, { page: 1, pageSize: 1, expandedKeys: ['a'] });
  assert.equal(first.total, 3);
  assert.equal(first.pageCount, 3);
  assert.equal(first.allRows.length, 5);
  assert.deepEqual(
    first.rows.map((row) => row.key),
    ['a', 'a1', 'a2'],
  );
  const last = processTableRows(records, columns, { page: 999, pageSize: 1 });
  assert.equal(last.page, 3);
  assert.deepEqual(
    last.rows.map((row) => row.key),
    ['c'],
  );
  assert.equal(
    processTableRows(records, columns, { pagination: false, pageSize: 1 }).rows.length,
    3,
  );
});

test('table duplicate keys and cyclic records terminate, missing keys have stable path fallbacks', () => {
  const row = { id: 'x', name: 'cycle', children: [] };
  row.children.push(row);
  const result = processTableRows(
    [row, { id: 'x', name: 'duplicate' }, { name: 'fallback' }],
    columns,
    { expandedKeys: ['x'] },
  );
  assert.deepEqual(
    result.rows.map((item) => item.key),
    ['x', 'row-2'],
  );
  assert.equal(result.rows[0].hasChildren, false);
  assert.equal(cellValue({ 'a.b': 3 }, { key: 'x', title: 'X', dataIndex: 'a.b' }), 3);
  assert.equal(cellValue({}, { key: '__proto__', title: 'X' }), undefined);
});

test('safe links reject executable schemes while retaining relative download/navigation URLs', () => {
  for (const value of [
    'javascript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,x',
    'vbscript:bad',
    'file:///etc/passwd',
  ])
    assert.equal(safeHref(value), undefined);
  for (const value of [
    '/projects/1',
    '#settings',
    'https://example.com/a',
    'blob:https://example.com/id',
    'mailto:team@example.com',
  ])
    assert.equal(safeHref(value), value);
});

test('file sizes and option movement preserve disabled choices and avoid duplicates', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(1536), '1.5 KB');
  assert.equal(formatFileSize(undefined), '—');
  assert.equal(formatFileSize(-1), '—');
  const options = [
    { value: 'a', label: 'A' },
    { value: 'locked', label: 'Locked', disabled: true },
  ];
  assert.deepEqual(toggleOption(['locked'], 'a', options), ['locked', 'a']);
  assert.deepEqual(toggleOption(['locked'], 'locked', options), ['locked']);
  assert.deepEqual(toggleOption(['a', 'a'], 'a', options), []);
  assert.deepEqual(toggleOption(['a'], 'missing', options), ['a']);
});

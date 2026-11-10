export const componentRegistry = {
  schemaVersion: 1,
  library: 'BTDESIGN',
  version: '0.3.0',
  packages: {
    react: '@btdesign/react',
    vue: '@btdesign/vue',
    tokens: '@btdesign/tokens',
    engine: '@btdesign/engine',
  },
  styles: ['@btdesign/tokens/styles.css', './theme.css', './app.css'],
  conventions: {
    react:
      'Use props, children, native HTML attributes and React event handlers. Form values use value/onChange or checked/onCheckedChange.',
    vue: 'Use props, attrs and slots. Input, Textarea, Select, Checkbox, Switch, Tabs and Dialog expose modelValue/update:modelValue.',
    sizing:
      'Global radius/density feed component variables; component-specific overrides take precedence.',
    html: 'Retain labels, native form validation, captions, status text, focus behavior and keyboard interaction.',
    composition:
      'Use Form/FormField for synchronous managed validation and Field for labels only. Card, List and Table parts retain native HTML semantics. Import every part explicitly. Business data, async validation, uploading and authorization belong to the application; engine provides shared pure behavior.',
  },
  semanticTokens: {
    action: ['--f-primary', '--f-on-primary', '--f-primary-hover', '--f-primary-soft'],
    surface: ['--f-bg', '--f-surface', '--f-subtle', '--f-border'],
    text: ['--f-text', '--f-muted'],
    status: ['--f-success', '--f-warning', '--f-danger', '--f-info'],
    typography: ['--f-font'],
    layout: ['--f-space', '--f-radius', '--f-control-height'],
    components: [
      '--f-button-radius',
      '--f-button-height',
      '--f-input-radius',
      '--f-input-height',
      '--f-card-radius',
      '--f-card-padding',
      '--f-field-gap',
      '--f-field-label-size',
      '--f-table-cell-padding',
      '--f-table-row-height',
      '--f-form-gap',
      '--f-form-section-gap',
      '--f-choice-size',
      '--f-choice-gap',
      '--f-calendar-cell-size',
      '--f-calendar-gap',
      '--f-tree-row-height',
      '--f-tree-indent',
      '--f-nav-item-height',
      '--f-nav-padding',
      '--f-list-row-padding',
      '--f-list-gap',
      '--f-overlay-radius',
      '--f-overlay-padding',
    ],
  },
  composition: {
    Card: ['CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter'],
    Table: [
      'TableCaption',
      'TableHeader',
      'TableBody',
      'TableFooter',
      'TableRow',
      'TableHead',
      'TableCell',
    ],
    InputGroup: ['InputAddon'],
    Form: ['FormField', 'FormSection', 'FormActions'],
    List: ['ListItem', 'ListItemContent', 'ListItemActions'],
  },
  components: [
    {
      name: 'Button',
      purpose: 'Primary and secondary actions',
      props: {
        variant: ['primary', 'secondary', 'ghost', 'danger'],
        size: ['sm', 'md', 'lg'],
        loading: 'boolean',
        disabled: 'boolean',
        type: ['button', 'submit', 'reset'],
      },
      notes:
        'Default type is button. Loading disables activation. Add an accessible name to icon-only actions.',
    },
    {
      name: 'Input',
      purpose: 'Single-line input',
      props: {
        type: 'HTML input type',
        name: 'string',
        required: 'boolean',
        disabled: 'boolean',
        controlSize: ['sm', 'md', 'lg'],
        invalid: 'boolean',
      },
      react: { value: 'string | number', onChange: 'ChangeEventHandler' },
      vue: { modelValue: 'string | number', 'update:modelValue': 'string' },
      notes:
        'Native attrs pass through. Use visible labels; type=email and required retain native validation.',
    },
    {
      name: 'Textarea',
      purpose: 'Multiline input',
      props: {
        rows: 'number',
        maxLength: 'number',
        controlSize: ['sm', 'md', 'lg'],
        invalid: 'boolean',
      },
      react: { value: 'string', onChange: 'ChangeEventHandler' },
      vue: { modelValue: 'string', 'update:modelValue': 'string' },
    },
    {
      name: 'Select',
      purpose: 'Native single or multiple selection',
      props: {
        multiple: 'boolean',
        disabled: 'boolean',
        controlSize: ['sm', 'md', 'lg'],
        invalid: 'boolean',
      },
      react: {
        value: 'string | number | readonly string[]',
        onChange: 'ChangeEventHandler',
        children: 'option / optgroup',
      },
      vue: {
        modelValue: 'string | number | (string | number)[]',
        'update:modelValue': 'string | string[]',
        slots: 'option / optgroup',
      },
      notes: 'This is a native select, not a searchable combobox.',
    },
    {
      name: 'Checkbox',
      purpose: 'Independent selection',
      props: { label: 'string', disabled: 'boolean' },
      react: {
        checked: 'boolean',
        defaultChecked: 'boolean',
        onCheckedChange: '(checked:boolean)=>void',
      },
      vue: { modelValue: 'boolean', 'update:modelValue': 'boolean', indeterminate: 'boolean' },
    },
    {
      name: 'Switch',
      purpose: 'Binary setting',
      props: { label: 'string', disabled: 'boolean', name: 'string' },
      react: {
        checked: 'boolean',
        defaultChecked: 'boolean',
        onCheckedChange: '(checked:boolean)=>void',
      },
      vue: { modelValue: 'boolean', 'update:modelValue': 'boolean' },
    },
    {
      name: 'Badge',
      purpose: 'Textual status',
      props: { variant: ['default', 'success', 'warning', 'danger', 'info'] },
      notes: 'Status must include meaningful visible text, not color alone.',
    },
    {
      name: 'Card',
      purpose: 'Related content group',
      react: { children: 'ReactNode' },
      vue: { slots: 'default' },
      notes: 'Use component spacing/radius variables; do not hard-code brand colors.',
    },
    {
      name: 'Alert',
      purpose: 'Contextual feedback',
      props: { variant: ['info', 'success', 'warning', 'danger'], title: 'string' },
      notes:
        'Danger defaults to alert role, other variants to status. Announce real outcomes only.',
    },
    {
      name: 'Tabs',
      purpose: 'Switch related panels',
      props: {
        items: '{value,label,content?,disabled?}[]',
        defaultValue: 'string',
        label: 'string',
      },
      react: { value: 'string', onValueChange: '(value:string)=>void' },
      vue: {
        modelValue: 'string',
        'update:modelValue': 'string',
        slots: 'named slots matching each item value',
      },
      notes: 'Supports arrows, Home and End; disabled tabs are skipped.',
    },
    {
      name: 'Dialog',
      purpose: 'Focused modal task',
      props: { title: 'required string', description: 'string', closeLabel: 'string' },
      react: {
        open: 'required boolean',
        onOpenChange: 'required (open:boolean)=>void',
        footer: 'ReactNode',
      },
      vue: { modelValue: 'boolean', 'update:modelValue': 'boolean', slots: 'default, footer' },
      notes: 'Native modal dialog manages focus and Escape. Wire all controlled-state callbacks.',
    },
    {
      name: 'Avatar',
      purpose: 'User identity',
      props: { name: 'string', src: 'string', size: ['sm', 'md', 'lg'] },
      notes: 'React requires name. Vue also supports alt/fallback. Include a readable identity.',
    },
    {
      name: 'Separator',
      purpose: 'Content grouping boundary',
      props: { orientation: ['horizontal', 'vertical'] },
    },
    {
      name: 'Table',
      purpose: 'Semantic data comparison',
      react: { children: 'caption, thead, tbody' },
      vue: { slots: 'default (caption, thead, tbody children)' },
      notes:
        'Native table wrapper with local horizontal scroll. Compose TableHeader/Body/Row/Head/Cell. Use DataTable for built-in sorting, filters, root pagination and selection; neither component fetches data or provides virtualization.',
    },
    {
      name: 'Skeleton',
      purpose: 'Loading placeholder',
      props: { width: 'number | string', height: 'number | string' },
      notes: 'Decorative and aria-hidden; announce loading with a surrounding status region.',
    },
    {
      name: 'Progress',
      purpose: 'Known task completion',
      props: { value: 'number', max: 'number, default 100', label: 'string' },
      notes:
        'React requires value; Vue defaults to zero. Values are clamped. Do not fabricate progress.',
    },
    {
      name: 'Field',
      purpose: 'Label, help and validation for one control',
      props: {
        id: 'string',
        label: 'required text/content',
        description: 'text/content',
        error: 'text/content',
        required: 'boolean',
        disabled: 'boolean',
      },
      notes:
        'Provides accessible label, description and error context to Input/Textarea/Select/NumberInput/RadioGroup. Explicit control attributes take precedence. Keep one logical control in each Field. Error text comes from real validation; never use placeholder as label.',
    },
    {
      name: 'InputGroup',
      purpose: 'Compose an input with prefix and suffix content',
      react: { children: 'InputAddon + Input + InputAddon' },
      vue: { slots: 'default: InputAddon + Input + InputAddon' },
      notes:
        'InputAddon is a span; it is not an interactive button and is not automatically an accessible description. Use Field for labels and associate meaningful units with aria-describedby.',
    },
    {
      name: 'RadioGroup',
      purpose: 'Choose exactly one visible option',
      props: {
        options: '{value:string,label:string,description?:string,disabled?:boolean}[]',
        name: 'string',
        label: 'string',
        defaultValue: 'string',
        orientation: ['horizontal', 'vertical'],
      },
      react: { value: 'string', onValueChange: '(value:string)=>void' },
      vue: { modelValue: 'string', 'update:modelValue': 'string' },
      notes:
        'Native radios share a name for keyboard navigation and form submission. Inherits Field association and disabled/required state. Do not substitute a checkbox for mutually exclusive choices.',
    },
    {
      name: 'NumberInput',
      purpose: 'Editable numeric value with increment and decrement actions',
      props: {
        min: 'number',
        max: 'number',
        step: 'positive number, default 1',
        defaultValue: 'number | empty string',
        controlSize: ['sm', 'md', 'lg'],
        disabled: 'boolean',
        invalid: 'boolean',
        name: 'string',
      },
      react: { value: 'number | empty string', onValueChange: '(value:number|empty string)=>void' },
      vue: { modelValue: 'number | empty string', 'update:modelValue': 'number | empty string' },
      notes:
        'Keeps empty input distinct from zero. Stepping and blur clamp to bounds. Retains native number input semantics and Field labeling. Application validation still handles domain-specific rules.',
    },
    {
      name: 'Breadcrumb',
      purpose: 'Describe location in an information hierarchy',
      props: { items: '{label:string,href?:string}[]', label: 'string' },
      notes:
        'Navigation landmark; final item is the current page. Supply actual destinations, not placeholder hrefs.',
    },
    {
      name: 'Pagination',
      purpose: 'Navigate pages of existing data',
      props: {
        page: 'required number',
        total: 'total item count',
        pageSize: 'positive number, default 10',
        siblingCount: 'number, default 1',
        disabled: 'boolean',
        label: 'string',
      },
      react: { onPageChange: '(page:number)=>void' },
      vue: { 'update:page': 'number' },
      notes:
        'Controlled page state. Clamps invalid values and uses bounded page ranges with ellipses. The caller slices or fetches records; this component does not load data.',
    },
    {
      name: 'EmptyState',
      purpose: 'Explain absence of data and offer a next step',
      props: { title: 'required text/content', description: 'text/content' },
      react: { icon: 'ReactNode', action: 'ReactNode', children: 'ReactNode' },
      vue: { slots: 'icon, action, default' },
      notes:
        'Distinguish first use, no search results, missing permission and errors in application copy. Offer a relevant action with a real handler.',
    },
    {
      name: 'Spinner',
      purpose: 'Announce indeterminate activity',
      props: { label: 'string, default 加载中', size: ['sm', 'md', 'lg'] },
      notes:
        'Status with a visible label; no invented percentage. Use one announcement per operation and respect reduced motion.',
    },
    {
      name: 'Form',
      purpose: 'Managed synchronous validation and submission',
      props: {
        initialValues: 'FormValues',
        rules: 'FormRules from @btdesign/engine',
        disabled: 'boolean',
        submitting: 'boolean',
      },
      react: {
        values: 'FormValues',
        onValuesChange: '(values)=>void',
        onSubmit: '(values)=>void',
        onInvalid: '(errors)=>void',
      },
      vue: {
        modelValue: 'FormValues',
        'update:modelValue': 'FormValues',
        submit: 'FormValues',
        invalid: 'FormErrors',
      },
      notes:
        'Compose FormField, FormSection and FormActions. Field names are flat keys. Validate before submit, show error summary and focus first invalid field; reset restores initial values. Custom FormField children/slot binds any control through value/setValue/id/disabled/required/invalid/describedBy. Async validation and submitting state remain application responsibilities.',
    },
    {
      name: 'Calendar',
      purpose: 'Inline date grid and month/year navigation',
      props: {
        month: 'YYYY-MM',
        min: 'YYYY-MM-DD',
        max: 'YYYY-MM-DD',
        disabledDate: '(ISODate)=>boolean',
        weekStartsOn: '0 | 1',
        disabled: 'boolean',
      },
      react: {
        value: 'YYYY-MM-DD | empty string',
        onValueChange: '(date)=>void',
        onMonthChange: '(month)=>void',
      },
      vue: {
        modelValue: 'YYYY-MM-DD | empty string',
        'update:modelValue': 'ISODate',
        'update:month': 'YYYY-MM',
      },
      notes:
        'Shared date-only engine avoids timezone shifts and rejects impossible dates. Arrow/Home/End/PageUp/PageDown keys move date focus; disabled dates cannot be chosen. Not a scheduler or time picker.',
    },
    {
      name: 'DatePicker',
      purpose: 'Editable date input with calendar popup',
      props: {
        label: 'string',
        name: 'string',
        required: 'boolean',
        disabled: 'boolean',
        min: 'ISODate',
        max: 'ISODate',
        disabledDate: '(ISODate)=>boolean',
      },
      react: {
        value: 'ISODate | empty string',
        defaultValue: 'ISODate | empty string',
        onValueChange: '(value)=>void',
      },
      vue: {
        modelValue: 'ISODate | empty string',
        defaultValue: 'ISODate | empty string',
        'update:modelValue': 'ISODate | empty string',
      },
      notes:
        'Use YYYY-MM-DD date-only strings, not Date/dayjs/moment objects. Named non-modal popup closes on Escape or outside interaction; provides clear and focus restoration. No time/timezone, week or quarter selection.',
    },
    {
      name: 'DateRangePicker',
      purpose: 'Start and end date range',
      props: {
        label: 'string',
        name: 'string',
        min: 'ISODate',
        max: 'ISODate',
        disabledDate: '(ISODate)=>boolean',
        disabled: 'boolean',
      },
      react: {
        value: '[ISODate | empty string, ISODate | empty string]',
        onValueChange: '(range)=>void',
      },
      vue: {
        modelValue: '[ISODate | empty string, ISODate | empty string]',
        'update:modelValue': 'date pair',
      },
      notes:
        'Composes two date pickers and normalizes endpoint order. Endpoint constraints do not validate business rules for every date inside the range. Names serialize as name[start] and name[end].',
    },
    {
      name: 'Radio',
      purpose: 'A native single-choice option',
      props: {
        label: 'text/content',
        value: 'string',
        name: 'shared group name',
        disabled: 'boolean',
      },
      react: {
        checked: 'boolean',
        defaultChecked: 'boolean',
        onCheckedChange: '(checked:boolean)=>void',
      },
      vue: {
        modelValue: 'string',
        'update:modelValue': 'string',
      },
      notes:
        'Standalone radio; use RadioGroup for an options-driven group and ToggleGroup for button appearance. Native groups must share name.',
    },
    {
      name: 'CheckboxGroup',
      purpose: 'Select several independent options',
      props: {
        options: 'ChoiceOption[]',
        name: 'string',
        label: 'string',
        disabled: 'boolean',
      },
      react: {
        value: 'string[]',
        defaultValue: 'string[]',
        onValueChange: '(keys)=>void',
      },
      vue: {
        modelValue: 'string[]',
        defaultValue: 'string[]',
        'update:modelValue': 'string[]',
      },
      notes:
        'Native checkboxes preserve form names and option disabled state. Remote options and selection limits require application logic.',
    },
    {
      name: 'ToggleGroup',
      purpose: 'Single or multiple selection with button appearance',
      props: {
        options: 'ChoiceOption[]',
        multiple: 'boolean, default false',
        name: 'string',
        label: 'string',
        disabled: 'boolean',
      },
      react: {
        value: 'string | string[]',
        onValueChange: '(value)=>void',
      },
      vue: {
        modelValue: 'string | string[]',
        'update:modelValue': 'string | string[]',
      },
      notes:
        'Single mode uses native radios, multiple mode checkboxes. Do not use multi-selection to represent mutually exclusive choices.',
    },
    {
      name: 'Segmented',
      purpose: 'Compact single-choice mode selection',
      props: {
        options: 'ChoiceOption[]',
        name: 'string',
        label: 'string',
        disabled: 'boolean',
      },
      react: {
        value: 'string',
        onValueChange: '(value)=>void',
      },
      vue: {
        modelValue: 'string',
        'update:modelValue': 'string',
      },
      notes: 'Single-choice control, not tabs with owned panels or a route navigator.',
    },
    {
      name: 'ButtonGroup',
      purpose: 'Related actions in one visual group',
      props: {
        label: 'string',
      },
      react: {
        children: 'Button elements',
      },
      vue: {
        slots: 'default',
      },
      notes:
        'Grouping container only. Each child retains its action, disabled state and label; use ToggleGroup for selectable state.',
    },
    {
      name: 'List',
      purpose: 'Semantic list with independently composable content and actions',
      react: {
        children: 'ListItem containing ListItemContent and ListItemActions',
      },
      vue: {
        slots: 'default',
      },
      notes:
        'Native ul/li semantics; all parts inherit Lab list spacing and shared color/type. Application handles loading, paging and virtualization.',
    },
    {
      name: 'FileList',
      purpose: 'Display file metadata, upload status and explicit actions',
      props: {
        files: 'FileItem[]',
        disabled: 'boolean',
        emptyText: 'string',
      },
      react: {
        onRemove: '(id)=>void',
        onRetry: '(id)=>void',
      },
      vue: {
        remove: 'id',
        retry: 'id',
      },
      notes:
        'Controlled display only: does not read disk, upload, authenticate or delete files itself. Provide actual progress/status, safe download URL and application handlers.',
    },
    {
      name: 'Tree',
      purpose: 'Single, independent multi or cascading hierarchical selection',
      props: {
        nodes: 'TreeNode[]',
        multiple: 'boolean',
        cascade: 'boolean, default false',
        expandedKeys: 'string[]',
        defaultExpandedKeys: 'string[]',
        searchable: 'boolean',
        disabled: 'boolean',
        label: 'string',
        name: 'string',
      },
      react: {
        value: 'string | string[]',
        onValueChange: '(value)=>void',
        onExpandedChange: '(keys)=>void',
      },
      vue: {
        modelValue: 'string | string[]',
        'update:modelValue': 'string | string[]',
        'update:expandedKeys': 'string[]',
      },
      notes:
        'Unique keys across the whole tree. Native tree keyboard navigation separates focus, expansion and selection. Cascade multi stores eligible leaf keys and derives mixed parent states; disabled ancestors disable descendants. No lazy network loading, drag-drop or virtualization.',
    },
    {
      name: 'TreeSelect',
      purpose: 'Tree selection inside a searchable popup',
      props: {
        nodes: 'TreeNode[]',
        multiple: 'boolean',
        cascade: 'boolean',
        label: 'string',
        name: 'string',
        placeholder: 'string',
        disabled: 'boolean',
      },
      react: {
        value: 'string | string[]',
        onValueChange: '(value)=>void',
      },
      vue: {
        modelValue: 'string | string[]',
        'update:modelValue': 'string | string[]',
      },
      notes:
        'Shares Tree selection rules. Selected labels can be removed and cleared; popup closes and restores focus. Search is local, not remote loading.',
    },
    {
      name: 'Cascader',
      purpose: 'Select hierarchical options through successive columns',
      props: {
        nodes: 'TreeNode[]',
        multiple: 'boolean',
        changeOnSelect: 'boolean, default false',
        label: 'string',
        name: 'string',
        disabled: 'boolean',
      },
      react: {
        value: 'node key | node key[]',
        onValueChange: '(value)=>void',
      },
      vue: {
        modelValue: 'node key | node key[]',
        'update:modelValue': 'node key | node key[]',
      },
      notes:
        'Values are unique node keys, not arrays of path segments. Default selects leaves; changeOnSelect allows intermediate nodes. Multiple selection retains leaf keys. Paths are displayed for context. No async child loading.',
    },
    {
      name: 'OrgPicker',
      purpose: 'Organization hierarchy selection with visible paths',
      props: {
        nodes: 'TreeNode[]',
        multiple: 'boolean',
        cascade: 'boolean, default false',
        label: 'string',
        name: 'string',
        disabled: 'boolean',
      },
      react: {
        value: 'string | string[]',
        onValueChange: '(value)=>void',
      },
      vue: {
        modelValue: 'string | string[]',
        'update:modelValue': 'string | string[]',
      },
      notes:
        'Composes TreeSelect with root-to-node path labels. Organization data and who can see/select members are application responsibilities, not authorization enforced by UI.',
    },
    {
      name: 'Transfer',
      purpose: 'Move chosen options between available and selected lists',
      props: {
        options: 'ChoiceOption[]',
        titles: '[availableTitle, selectedTitle]',
        label: 'string',
        name: 'string',
        disabled: 'boolean',
      },
      react: {
        value: 'target keys string[]',
        onValueChange: '(keys)=>void',
      },
      vue: {
        modelValue: 'target keys string[]',
        'update:modelValue': 'string[]',
      },
      notes:
        'Search each pane, select visible enabled choices, transfer in either direction. Existing disabled selected keys are preserved. Local flat options only; no server synchronization or virtual rows.',
    },
    {
      name: 'SidebarNav',
      purpose: 'Side navigation with collapsible sections',
      props: {
        items: 'NavItem[]',
        activeKey: 'string',
        label: 'string',
        disabled: 'boolean',
      },
      react: {
        onSelect: '(key)=>void',
      },
      vue: {
        select: 'key',
      },
      notes:
        'Actual href items are links; action items are buttons. Active destination uses aria-current. Application owns routing, permissions and activeKey.',
    },
    {
      name: 'TopNav',
      purpose: 'Top-level navigation and grouped destinations',
      props: {
        items: 'NavItem[]',
        activeKey: 'string',
        label: 'string',
        disabled: 'boolean',
      },
      react: {
        onSelect: '(key)=>void',
      },
      vue: {
        select: 'key',
      },
      notes:
        'Same item contract as SidebarNav; native navigation semantics, not an application menubar. Application owns routing and responsive page layout.',
    },
    {
      name: 'DropdownMenu',
      purpose: 'One-level action menu from a labeled trigger',
      props: {
        items: 'NavItem[] with optional separator',
        label: 'string',
        disabled: 'boolean',
      },
      react: {
        onSelect: '(key)=>void',
      },
      vue: {
        select: 'key',
      },
      notes:
        'Supports directional/Home/End focus, skips disabled items, Escape/Tab/outside dismiss. Children/nested submenu APIs are not implemented; flatten or retain existing menu behavior.',
    },
    {
      name: 'DataTable',
      purpose: 'Client-side advanced table with grouped columns and hierarchical rows',
      props: {
        columns: 'DataColumn[]; framework render(value,row) allowed',
        data: 'Record<string,unknown>[]',
        rowKey: 'string, default id',
        childrenKey: 'string, default children',
        caption: 'string',
        loading: 'boolean',
        disabled: 'boolean',
        searchable: 'boolean',
        pagination: 'boolean, default true',
        pageSize: 'number, default 10',
        page: 'number; controlled root page',
        query: 'string; controlled global filter',
        sort: '{key:string,direction:"asc"|"desc"} | null',
        filters: 'Record<string,string|string[]>',
        selectable: 'boolean',
        selectedKeys: 'string[]',
        defaultSelectedKeys: 'string[]',
        expandedKeys: 'string[]',
        defaultExpandedKeys: 'string[]',
        hiddenKeys: 'string[]',
        defaultHiddenKeys: 'string[]',
        rowDisabled: '(row)=>boolean',
        stickyHeader: 'boolean, default true',
        emptyText: 'string',
      },
      react: {
        onSelectionChange: '(keys)=>void',
        onExpandedChange: '(keys)=>void',
        onPageChange: '(page)=>void',
        onQueryChange: '(query)=>void',
        onSortChange: '(sort)=>void',
        onFiltersChange: '(filters)=>void',
        onHiddenChange: '(keys)=>void',
        onCellChange: '({key,column,value})=>void',
        renderExpanded: '(row)=>ReactNode',
      },
      vue: {
        'update:selectedKeys': 'string[]',
        'update:expandedKeys': 'string[]',
        'update:page': 'number',
        'update:query': 'string',
        'update:sort': '{key,direction} | null',
        'update:filters': 'Record<string,string|string[]>',
        'update:hiddenKeys': 'string[]',
        'cell-change': '{key,column,value}',
        slots: 'expanded({row})',
      },
      notes:
        'Native table with multi-level headers, tree rows, row details, stable sorting, column/global filters, root-row pagination, visible-page selection, column visibility, sticky header/fixed columns and basic controlled cell editing. Columns and ids must be stable/unique. Values use literal dataIndex keys. Application accepts edits and persists data. No virtual rendering, drag resize/reorder, Excel grid, formulas, arbitrary cell merging, export or automatic remote loading; retain unsupported capabilities during migration.',
    },
  ],
} as const;

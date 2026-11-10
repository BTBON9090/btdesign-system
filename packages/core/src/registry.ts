export const componentRegistry = {
  schemaVersion: 1,
  library: 'BTDESIGN',
  version: '0.2.0',
  packages: { react: '@btdesign/react', vue: '@btdesign/vue', tokens: '@btdesign/tokens' },
  styles: ['@btdesign/tokens/styles.css', './theme.css', './app.css'],
  conventions: {
    react:
      'Use props, children, native HTML attributes and React event handlers. Form values use value/onChange or checked/onCheckedChange.',
    vue: 'Use props, attrs and slots. Input, Textarea, Select, Checkbox, Switch, Tabs and Dialog expose modelValue/update:modelValue.',
    sizing:
      'Global radius/density feed component variables; component-specific overrides take precedence.',
    html: 'Retain labels, native form validation, captions, status text, focus behavior and keyboard interaction.',
    composition:
      'Compose Field with one labeled control. Card and Table parts retain native HTML semantics. Import every named part explicitly; keep data loading and validation in application code.',
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
        'Native table wrapper with local horizontal scroll. Compose TableHeader/Body/Row/Head/Cell. Pagination supplies page controls only; sorting, fetching, virtualization and selection remain application concerns.',
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
  ],
} as const;

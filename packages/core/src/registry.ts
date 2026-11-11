export const componentRegistry = {
  schemaVersion: 1,
  library: 'BTDESIGN',
  version: '0.10.0',
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
    status: ['--f-success', '--f-warning', '--f-danger', '--f-info', '--f-on-status'],
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
      '--f-field-label-width',
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
      '--f-resize-handle-size',
      '--f-progress-line-height',
      '--f-progress-circle-size',
      '--f-progress-circle-stroke',
      '--f-progress-mini-size',
      '--f-progress-mini-stroke',
      '--f-file-thumbnail-size',
      '--f-file-picture-card-size',
      '--f-file-picture-radius',
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
        size: ['xs', 'sm', 'md', 'lg', 'xl'],
        tone: ['standard', 'success', 'warning', 'danger', 'ai'],
        shape: ['default', 'pill'],
        iconOnly: 'boolean',
        loading: 'boolean',
        disabled: 'boolean',
        type: ['button', 'submit', 'reset'],
      },
      notes:
        'Default type is button. Loading disables activation. Add an accessible name to icon-only actions.',
    },
    {
      name: 'PasswordInput',
      purpose: 'Password entry with an accessible visibility toggle',
      props: { showLabel: 'string', hideLabel: 'string', controlSize: ['sm', 'md', 'lg'] },
      notes: 'Inherits Field and input tokens. Do not put credentials in examples or logs.',
    },
    {
      name: 'InputTag',
      purpose: 'Enter and remove a list of text tags',
      props: {
        allowDuplicates: 'boolean',
        requiredMessage: 'string',
        disabled: 'boolean',
        readOnly: 'boolean',
      },
      react: {
        value: 'string[]',
        defaultValue: 'string[]',
        onValueChange: '(values:string[])=>void',
      },
      vue: { modelValue: 'string[]', defaultValue: 'string[]', 'update:modelValue': 'string[]' },
      notes:
        'Enter commits a tag. Empty-draft Backspace removes the last tag. Committed tags submit as repeated named form fields; duplicates are disallowed by default.',
    },
    {
      name: 'Upload',
      purpose: 'Select local files through a native file input',
      props: {
        accept: 'string',
        multiple: 'boolean',
        disabled: 'boolean',
        required: 'boolean',
        controlSize: ['sm', 'md', 'lg'],
      },
      react: { onFilesChange: '(files:File[],event:ChangeEvent)=>void' },
      vue: { filesChange: '(files:File[])=>void' },
      notes:
        'This is a file-selection control. Upload transport, progress, retries and persistence belong to the application.',
    },
    {
      name: 'UploadFileList',
      purpose: 'Display caller-managed file, image-list and picture-card states',
      props: {
        items: 'UploadFileItem[] (caller-managed state, optional thumbnailUrl and alt)',
        variant: ['file', 'picture', 'picture-card'],
        disabled: 'boolean',
        emptyText: 'string',
      },
      react: { onRemove: '(id)=>void', onRetry: '(id)=>void', onPreview: '(id)=>void' },
      vue: { remove: '(id)', retry: '(id)', preview: '(id)' },
      notes:
        'State, transfer, retries and file removal belong to the application. Thumbnail and download addresses are separate; component validates URL schemes but does not trust or verify remote content.',
    },
    {
      name: 'UploadDropzone',
      purpose: 'Choose or drop files for application-managed processing',
      props: {
        accept: 'HTML accept list',
        multiple: 'boolean',
        maxFileSize: 'number (bytes)',
        maxFiles: 'number (includes existingCount)',
        existingCount: 'number (supplied by application)',
        label: 'string',
        disabled: 'boolean',
      },
      react: { onFilesChange: '(accepted, rejected, source)=>void', children: 'ReactNode' },
      vue: { filesChange: '(accepted, rejected, source)', 'default slot': 'custom guidance' },
      notes:
        'Client metadata checks are not security validation. The application owns files, transfer, authorization and server-side checks. Dropped files are not inserted into a native form input.',
    },
    {
      name: 'SearchSelect',
      purpose: 'Select one or more local options with search and removable tags',
      props: {
        options: 'ChoiceOption[] with unique nonempty value',
        multiple: 'boolean',
        label: 'string',
        name: 'string',
        disabled: 'boolean',
        required: 'boolean (ARIA only)',
      },
      react: {
        value: 'string | string[]',
        defaultValue: 'string | string[]',
        onValueChange: '(value)=>void',
      },
      vue: {
        modelValue: 'string | string[]',
        defaultValue: 'string | string[]',
        'update:modelValue': 'string | string[]',
      },
      notes:
        'Local options only. Required is announced but hidden form values do not enforce native required validation; validate in the application or FormField. No remote loading or virtualization.',
    },
    {
      name: 'OrganizationTransfer',
      purpose: 'Select persistent department rules or snapshots of currently eligible members',
      props: {
        directory: 'OrganizationDirectory (provided by the application)',
        getDepartmentLabel: '(identity:OrganizationIdentity)=>string',
        getPersonLabel: '(identity:OrganizationIdentity)=>string',
        disabled: 'boolean',
      },
      react: {
        value: 'OrganizationSelection',
        onValueChange: '(selection)=>void',
        onConfirm: '(selection,result)=>void',
      },
      vue: {
        modelValue: 'OrganizationSelection',
        'update:modelValue': 'OrganizationSelection',
        confirm: '(selection,result)',
      },
      notes:
        'Department rules must be resolved and authorized by the application; snapshots include current known eligible descendants. Incomplete data and unknown permissions are not assumed to be valid. No remote directory connection.',
    },
    {
      name: 'AutoComplete',
      purpose: 'Editable input with local filtered suggestions',
      props: { options: 'ChoiceOption[]', emptyText: 'string', disabled: 'boolean' },
      react: {
        value: 'string',
        defaultValue: 'string',
        onValueChange: '(value:string)=>void',
        onSelectOption: '(option:ChoiceOption)=>void',
        renderOptionSuffix: '(option:ChoiceOption)=>ReactNode',
      },
      vue: {
        modelValue: 'string',
        defaultValue: 'string',
        'update:modelValue': 'string',
        select: 'ChoiceOption',
        'option-suffix': 'decorative slot receiving option',
      },
      notes:
        'The application provides options and remote requests. Descriptions are text; suffixes are decorative and do not navigate. Disabled options cannot be selected.',
    },
    {
      name: 'Mention',
      purpose: 'Insert a plain-text mention from local suggestions',
      props: { options: 'ChoiceOption[]', emptyText: 'string', disabled: 'boolean' },
      react: {
        value: 'string',
        defaultValue: 'string',
        onValueChange: '(value:string)=>void',
        onSelectOption: '(option:ChoiceOption)=>void',
      },
      vue: {
        modelValue: 'string',
        defaultValue: 'string',
        'update:modelValue': 'string',
        select: 'ChoiceOption',
      },
      notes:
        'Inserts plain text, not structured user entities. The application provides suggestion data and any remote requests.',
    },
    {
      name: 'Steps',
      purpose: 'Display progress through an ordered sequence',
      props: {
        items: '{id,title,description?,status?,icon?}[]',
        current: 'number',
        orientation: ['horizontal', 'vertical'],
      },
      notes: 'Displays step status; does not provide click-to-navigate behavior.',
    },
    {
      name: 'Descriptions',
      purpose: 'Display structured label and value pairs',
      props: {
        items: '{key,label,value,span?}[]',
        title: 'string',
        column: 'number (1–6)',
        orientation: ['horizontal', 'vertical'],
        bordered: 'boolean',
      },
      notes:
        'Uses semantic description lists. Vue also provides title and per-item label/value slots.',
    },
    {
      name: 'Image',
      purpose: 'Display an image with loading, fallback and optional preview',
      props: {
        src: 'string',
        alt: 'string',
        aspectRatio: 'string',
        fit: ['cover', 'contain'],
        preview: 'boolean',
      },
      notes: 'Preview uses a modal dialog. Zoom, rotation and image galleries are not implemented.',
    },
    {
      name: 'PageHeader',
      purpose: 'Display page context and application-supplied actions',
      props: {
        title: 'content',
        description: 'content',
        showBack: 'boolean',
        backLabel: 'string',
        headingLevel: '1–6',
      },
      notes:
        'The application supplies breadcrumb, actions and the back callback; navigation is not implicit.',
    },
    {
      name: 'Anchor',
      purpose: 'Navigate to sections with native fragment links',
      props: { items: '{id,href,title,children?}[]', activeHref: 'string', label: 'string' },
      notes:
        'The application supplies the current section; hash routers may intercept navigation. Automatic scroll tracking is not implemented.',
    },
    {
      name: 'ResizeBox',
      purpose: 'Resize two panels using a draggable and keyboard-operable separator',
      props: {
        orientation: ['horizontal', 'vertical'],
        size: 'number (percentage)',
        defaultSize: 'number (percentage)',
        min: 'number (percentage)',
        max: 'number (percentage)',
        step: 'number (percentage)',
        disabled: 'boolean',
        handleLabel: 'string',
      },
      react: { first: 'ReactNode', second: 'ReactNode', onSizeChange: '(size:number)=>void' },
      vue: { first: 'slot', second: 'slot', 'update:size': 'number' },
      notes:
        'Two panels only; horizontal or vertical layout. Vertical layout needs an explicit container height.',
    },
    {
      name: 'BackTop',
      purpose: 'Return a scroll container to a configured position',
      props: {
        target: '() => Window | HTMLElement',
        visibilityHeight: 'number',
        top: 'number',
        behavior: ['smooth', 'auto'],
        shape: ['square', 'circle'],
      },
      notes: 'Listens to the supplied scroll target and respects reduced-motion preferences.',
    },
    {
      name: 'Rate',
      purpose: 'Select a rating with keyboard-accessible radio controls',
      props: {
        count: 'number',
        shape: ['star', 'heart'],
        allowHalf: 'boolean',
        allowClear: 'boolean',
        disabled: 'boolean',
      },
      notes:
        'Supports star and heart appearances; rating state and form submission remain explicit.',
    },
    {
      name: 'Carousel',
      purpose: 'User-controlled sequence of slides',
      props: {
        items: '{key,content,label?}[]',
        loop: 'boolean',
        indicatorStyle: ['dots', 'lines'],
        indicatorPlacement: ['bottom', 'start', 'end'],
      },
      react: { index: 'number', defaultIndex: 'number', onIndexChange: '(index:number)=>void' },
      vue: { modelValue: 'number', defaultIndex: 'number', 'update:modelValue': 'number' },
      notes: 'Slides change through user controls; automatic playback is not implemented.',
    },
    {
      name: 'Tooltip',
      purpose: 'Provide non-interactive help for a focusable trigger',
      props: {
        content: 'text or content',
        placement: ['top', 'bottom', 'left', 'right'],
        disabled: 'boolean',
      },
      react: { open: 'boolean', defaultOpen: 'boolean', onOpenChange: '(open:boolean)=>void' },
      vue: { open: 'boolean', defaultOpen: 'boolean', 'update:open': 'boolean' },
      notes:
        'The trigger must forward aria-describedby. This version does not automatically avoid viewport edges.',
    },
    {
      name: 'Popover',
      purpose: 'Show an interactive nonmodal panel from a button',
      props: {
        trigger: 'non-interactive button content',
        content: 'content',
        placement: 'top/bottom/left/right with optional start/end',
        showArrow: 'boolean',
        disabled: 'boolean',
      },
      notes:
        'Escape and outside interaction close the panel; the trigger is a button and must not contain another button. Automatic viewport collision handling is not implemented.',
    },
    {
      name: 'Statistic',
      purpose: 'Display a supplied value with optional trend',
      props: {
        value: 'number | string',
        format: ['number', 'percent'],
        precision: 'number',
        trend: ['up', 'down', 'neutral'],
      },
      notes:
        'Values are supplied by the application; percentages are already scaled. Countdown is not implemented.',
    },
    {
      name: 'Comment',
      purpose: 'Display a comment with optional nested replies and application-provided actions',
      props: {
        author: 'string or content',
        time: 'string',
        dateTime: 'string',
        alignment: ['start', 'end'],
      },
      notes: 'The application owns posting, replies and actions; use actual buttons for actions.',
    },
    {
      name: 'Timeline',
      purpose: 'Display an ordered sequence of events',
      props: {
        items: '{id,title,description?,time?,dateTime?,tone?,state?}[]',
        orientation: ['vertical', 'horizontal'],
      },
      notes:
        'Presents an ordered event sequence. Status must remain understandable without color alone.',
    },
    {
      name: 'Tag',
      purpose: 'Compact status or removable label',
      props: {
        variant: ['default', 'success', 'warning', 'danger', 'info'],
        closable: 'boolean',
        disabled: 'boolean',
      },
      notes:
        'Close requests are emitted to the application, which owns whether the tag is removed.',
    },
    {
      name: 'SearchInput',
      purpose: 'Search input with an explicit search action',
      react: { onSearch: '(value:string)=>void' },
      vue: { modelValue: 'string', search: '(value:string)=>void' },
      notes:
        'The application provides the search behavior; Enter and the action button emit the current value.',
    },
    {
      name: 'Slider',
      purpose: 'Native single-value range input',
      props: {
        min: 'number',
        max: 'number',
        step: 'number',
        marks: '{value:number,label?:string}[]',
        disabled: 'boolean',
      },
      notes: 'Uses native keyboard and form behavior. Range selection is not implemented.',
    },
    {
      name: 'TimePicker',
      purpose: 'Native single-time input',
      props: { min: 'string', max: 'string', step: 'number', disabled: 'boolean' },
      notes:
        'Uses native time input; time ranges, time zones and a custom popup are not implemented.',
    },
    {
      name: 'AvatarGroup',
      purpose: 'Group of avatars with an optional overflow count',
      props: { max: 'number', size: ['sm', 'md', 'lg'], label: 'string' },
      notes: 'Set size on the child avatars as well; max limits visible children.',
    },
    {
      name: 'Collapse',
      purpose: 'Expand related sections',
      props: {
        items: '{value,label,content?,disabled?,extra?}[]',
        accordion: 'boolean',
        disabled: 'boolean',
        expandIconPosition: ['start', 'end', 'none'],
      },
      react: {
        value: 'string[]',
        defaultValue: 'string[]',
        onValueChange: '(values:string[])=>void',
      },
      vue: { modelValue: 'string[]', defaultValue: 'string[]', 'update:modelValue': 'string[]' },
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
      props: {
        label: 'string',
        disabled: 'boolean',
        indeterminate: 'boolean (controlled by application)',
      },
      react: {
        checked: 'boolean',
        defaultChecked: 'boolean',
        onCheckedChange: '(checked:boolean)=>void',
      },
      vue: { modelValue: 'boolean', 'update:modelValue': 'boolean' },
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
      props: {
        variant: ['default', 'success', 'warning', 'danger', 'info'],
        count: 'number | string',
        max: 'number',
        showZero: 'boolean',
        dot: 'boolean',
        badgeLabel: 'string',
      },
      notes:
        'Supports standalone status and count/dot around content. Status must not rely on color alone.',
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
        variant: ['default', 'line', 'text', 'card', 'card-gutter', 'rounded'],
        orientation: ['horizontal', 'vertical'],
      },
      react: { value: 'string', onValueChange: '(value:string)=>void' },
      vue: {
        modelValue: 'string',
        'update:modelValue': 'string',
        slots: 'named slots matching each item value',
      },
      notes: 'Supports direction-appropriate arrows, Home and End; disabled tabs are skipped.',
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
      props: {
        name: 'string',
        src: 'string',
        size: ['sm', 'md', 'lg'],
        shape: ['circle', 'square'],
      },
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
      props: {
        value: 'number',
        max: 'number, default 100',
        label: 'string',
        type: 'line | circle | mini',
        status: 'normal | success | warning | error',
        showValue: 'boolean',
      },
      notes:
        'React requires value; Vue defaults to zero. Values are clamped; status and progress come from the application, not inferred.',
    },
    {
      name: 'Field',
      purpose: 'Label, help and validation for one control',
      props: {
        id: 'string',
        label: 'required text/content',
        layout: 'vertical | horizontal',
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
        stepperLayout: 'sides | stacked',
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
      props: {
        items: '{label:string,href?:string}[]',
        label: 'string',
        separator: 'slash | dot | arrow',
      },
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
      props: {
        title: 'text/content',
        description: 'text/content',
        variant: [
          'no-content',
          'initial',
          'no-messages',
          'no-results',
          'no-permission',
          'offline',
          'not-found',
          'error',
        ],
        size: ['compact', 'default', 'page'],
        headingLevel: '2–6',
      },
      react: { icon: 'ReactNode', action: 'ReactNode', children: 'ReactNode' },
      vue: { slots: 'icon, action, default' },
      notes:
        'The application chooses the scenario and provides any real action; the component does not detect network or permission state.',
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
        'Compose FormField, FormSection and FormActions. FormField layout supports vertical or horizontal. Field names are flat keys. Validate before submit, show error summary and focus first invalid field; reset restores initial values. Custom FormField children/slot binds any control through value/setValue/id/disabled/required/invalid/describedBy. Async validation and submitting state remain application responsibilities.',
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
        showCalendar: 'boolean',
        presets: '{label, value: date pair | () => date pair, disabled?}[]',
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
        'Composes two date pickers with an optional adjacent-month calendar and caller-supplied presets; normalizes endpoint order. Endpoint constraints do not validate every date inside the range. Names serialize as name[0] and name[1].',
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
        orientation: 'horizontal | vertical',
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
      props: {
        layout: 'vertical | grid',
        columns: '1 | 2 | 3 | 4',
        bordered: 'boolean',
        split: 'boolean',
        leading: 'item leading content',
        extra: 'item trailing content',
      },
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
        size: ['mini', 'small', 'medium', 'big'],
        showLine: 'boolean',
        disabled: 'boolean',
        label: 'string',
        name: 'string',
      },
      react: {
        value: 'string | string[]',
        onValueChange: '(value)=>void',
        onExpandedChange: '(keys)=>void',
        renderIcon: '(node:FlatTreeNode)=>ReactNode (decorative)',
      },
      vue: {
        modelValue: 'string | string[]',
        'update:modelValue': 'string | string[]',
        'update:expandedKeys': 'string[]',
        'icon slot': '{ node: FlatTreeNode } (decorative)',
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
        searchable: 'boolean (React defaults true, Vue defaults false)',
        clearable: 'boolean, default true (individual multi-select tags remain removable)',
        showPath: 'boolean',
        expandedKeys: 'string[]',
        defaultExpandedKeys: 'string[] (React defaults collapsed, Vue expands root nodes)',
        size: ['mini', 'small', 'medium', 'big'],
        showLine: 'boolean',
      },
      react: {
        value: 'string | string[]',
        onValueChange: '(value)=>void',
        onExpandedChange: '(keys)=>void',
        renderIcon: '(node:FlatTreeNode)=>ReactNode (decorative)',
      },
      vue: {
        modelValue: 'string | string[]',
        'update:modelValue': 'string | string[]',
        'update:expandedKeys': 'string[]',
        'icon slot': '{ node: FlatTreeNode } (decorative)',
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
        searchable: 'boolean, default true',
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
        'Values are unique node keys, not arrays of path segments. Default selects leaves; changeOnSelect allows intermediate nodes independently, including in multiple selection. Paths are displayed for context. No async child loading.',
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
        'Each pane shows total items. Search, select all and move apply to visible enabled choices; hidden selections remain selected. Existing disabled selected keys are preserved. Local flat options only; no server synchronization or virtual rows.',
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
      purpose: 'Action menu with optional groups and nested submenus',
      props: {
        items: 'DropdownMenuItem[] with optional separator, group, danger and children',
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
        'Supports grouped items, separators, nested menus, directional/Home/End focus and Escape/Tab/outside dismiss. Submenus do not automatically flip at viewport edges.',
    },
    {
      name: 'DataTable',
      purpose: 'Client-side advanced table with grouped columns and hierarchical rows',
      props: {
        columns: 'DataColumn[]; framework render(value,row) allowed',
        expandColumn: 'inline | separate (React defaults inline; Vue defaults separate)',
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
        numberRanges: 'Record<string,{min?:number,max?:number}>',
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
        onNumberRangesChange: '(ranges)=>void',
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
        'update:numberRanges': 'Record<string,{min?:number,max?:number}>',
        'update:hiddenKeys': 'string[]',
        'cell-change': '{key,column,value}',
        slots: 'expanded({row})',
      },
      notes:
        'Native table with multi-level headers, tree rows, row details, stable sorting, single/multiple option and inclusive numeric range filters, root-row pagination, visible-page selection, column visibility, sticky header/fixed columns and basic controlled cell editing. Columns and ids must be stable/unique. Values use literal dataIndex keys. Application accepts edits and persists data. No virtual rendering, drag resize/reorder, Excel grid, formulas, arbitrary cell merging, export or automatic remote loading; retain unsupported capabilities during migration.',
    },
  ],
} as const;

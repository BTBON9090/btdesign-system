import type { AnatomyPart, DemoOptions, Framework } from './component-types';
import { dropdownPreviewItems } from './dropdown-preview';
import { dateRangePresets } from './date-range-fixtures';
import {
  enterpriseColumns,
  enterpriseFiles,
  enterpriseNav,
  enterpriseOptions,
  enterpriseRows,
  enterpriseTree,
} from './enterprise-fixtures';

export const enterpriseCatalog = [
  {
    id: 'form',
    name: 'Form',
    cn: '表单',
    category: '文本与字段',
    description: '用一致的字段绑定、校验与错误反馈完成一项业务提交。',
    props: [
      ['initialValues / values', 'Record<string, unknown>', '{}'],
      ['rules', 'Record<string, ValidationRule[]>', '{}'],
      ['FormField / FormSection / FormActions', '字段、分组、操作部件', '—'],
      ['onSubmit / submit', '校验成功后的值', '—'],
    ],
  },
  {
    id: 'calendar',
    name: 'Calendar',
    cn: '日历',
    category: '日期',
    description: '可独立组合的日期网格，支持月份切换、日期约束与键盘选择。',
    props: [
      ['value / modelValue', 'YYYY-MM-DD', '空'],
      ['month', 'YYYY-MM', '当前月'],
      ['min / max / disabledDate', '日期范围与禁用规则', '—'],
      ['weekStartsOn', '0 | 1', '1'],
    ],
  },
  {
    id: 'date-picker',
    name: 'DatePicker',
    cn: '日期选择器',
    category: '日期',
    description: '把可编辑日期与日历组合，在输入效率与可视选择之间自由切换。',
    props: [
      ['value / modelValue', 'YYYY-MM-DD', '空'],
      ['label / name', 'string', '—'],
      ['min / max / disabledDate', '日期约束', '—'],
      ['disabled / required', 'boolean', 'false'],
      ['readOnly / readonly', 'boolean', 'false'],
      ['clearable', 'boolean', 'true'],
    ],
  },
  {
    id: 'date-range-picker',
    name: 'DateRangePicker',
    cn: '日期范围',
    category: '日期',
    description: '选择起止日期；日期约束检查两个端点，范围内的日期由应用按需校验。',
    props: [
      ['value / modelValue', '[start, end]', '["", ""]'],
      ['min / max / disabledDate', '日期约束', '—'],
      ['label / disabled', 'string / boolean', '—'],
      ['readOnly / readonly', 'boolean', 'false'],
      ['showCalendar', 'boolean（显示双月日历）', 'false'],
      ['presets', '{ label, value: [start, end] | () => [start, end], disabled? }[]', '[]'],
    ],
  },
  {
    id: 'radio',
    name: 'Radio',
    cn: '单选按钮',
    category: '选择与切换',
    description: '保留原生单选语义，把选择项组合进自己的业务布局。',
    props: [
      ['label / value / name', 'string', '—'],
      ['checked / modelValue', 'boolean / string', '—'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'checkbox-group',
    name: 'CheckboxGroup',
    cn: '多选组',
    category: '选择与切换',
    description: '集中管理多项独立选择，保持每个选项的名称与状态清晰可见。',
    props: [
      ['options', 'ChoiceOption[]', '必填'],
      ['value / modelValue', 'string[]', '[]'],
      ['orientation', 'horizontal | vertical', 'vertical'],
      ['label / name / disabled', '原生表单与禁用语义', '—'],
    ],
  },
  {
    id: 'toggle-group',
    name: 'ToggleGroup',
    cn: '选择按钮组',
    category: '选择与切换',
    description: '用按钮外观表达单选或多选，选择状态与普通操作按钮保持区别。',
    props: [
      ['options', 'ChoiceOption[]', '必填'],
      ['multiple', 'boolean', 'false'],
      ['value / modelValue', 'string | string[]', '—'],
      ['label / disabled', 'string / boolean', '—'],
    ],
  },
  {
    id: 'segmented',
    name: 'Segmented',
    cn: '分段切换器',
    category: '选择与切换',
    description: '在紧密关联的视图之间切换，保持选中状态与键盘行为一致。',
    props: [
      ['options', 'ChoiceOption[]', '必填'],
      ['value / modelValue', 'string', '—'],
      ['label / disabled', 'string / boolean', '—'],
    ],
  },
  {
    id: 'button-group',
    name: 'ButtonGroup',
    cn: '按钮组',
    category: '操作',
    description: '把相关动作组织为一组，继承同一套按钮尺寸与形状规则。',
    props: [
      ['label', 'string', '—'],
      ['children / default slot', 'Button 等操作', '—'],
    ],
  },
  {
    id: 'list',
    name: 'List',
    cn: '列表',
    category: '表格与列表',
    description: '以语义化列表承载内容、辅助说明与逐项操作。',
    props: [
      ['layout / columns', 'vertical | grid / 1–4', 'vertical / 3'],
      ['bordered / split', 'boolean', 'false / true'],
      ['leading / extra', 'ReactNode / Vue slots', '—'],
      ['ListItemContent / ListItemActions', '内容与操作部件', '—'],
    ],
  },
  {
    id: 'file-list',
    name: 'FileList',
    cn: '文件列表',
    category: '表格与列表',
    description: '呈现文件、大小、进度与失败原因，明确每项可执行的动作。',
    props: [
      ['files', 'FileItem[]', '必填'],
      ['onRemove / remove', '(id) => void', '—'],
      ['onRetry / retry', '(id) => void', '—'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'tree',
    name: 'Tree',
    cn: '树形控件',
    category: '层级与组织',
    description: '展开层级、搜索路径并进行单选或多选，让父子关系与半选状态可理解。',
    props: [
      ['nodes', 'TreeNode[]', '必填'],
      ['multiple / cascade', 'boolean', 'false'],
      ['value / modelValue', 'string | string[]', '—'],
      ['expandedKeys / searchable', 'string[] / boolean', '—'],
    ],
  },
  {
    id: 'tree-select',
    name: 'TreeSelect',
    cn: '树选择器',
    category: '层级与组织',
    description: '把树形选择放进字段，在紧凑空间中保留层级、搜索与已选项。',
    props: [
      ['nodes', 'TreeNode[]', '必填'],
      ['multiple / cascade', 'boolean', 'false'],
      ['value / modelValue', 'string | string[]', '—'],
      ['label / name / placeholder', '字段信息', '—'],
    ],
  },
  {
    id: 'cascader',
    name: 'Cascader',
    cn: '级联选择器',
    category: '层级与组织',
    description: '逐级理解选项路径，支持单选与多选，并可搜索叶节点。',
    props: [
      ['nodes', 'TreeNode[]', '必填'],
      ['multiple / changeOnSelect', 'boolean', 'false'],
      ['value / modelValue', '节点 key 或 key[]', '—'],
      ['label / name', 'string', '—'],
    ],
  },
  {
    id: 'org-picker',
    name: 'OrgPicker',
    cn: '组织架构选择器',
    category: '层级与组织',
    description: '在企业组织层级中定位部门与成员，并保留所选项目的完整路径。',
    props: [
      ['nodes', 'TreeNode[]', '必填'],
      ['multiple / cascade', 'boolean', 'false'],
      ['value / modelValue', 'string | string[]', '—'],
      ['label / name', 'string', '—'],
    ],
  },
  {
    id: 'transfer',
    name: 'Transfer',
    cn: '穿梭器',
    category: '选择与切换',
    description: '通过双栏搜索、勾选和移动，明确区分待选项与已选集合。',
    props: [
      ['options', 'ChoiceOption[]', '必填'],
      ['value / modelValue', '目标集合 string[]', '[]'],
      ['titles', '[待选, 已选]', '—'],
      ['label / disabled', 'string / boolean', '—'],
    ],
  },
  {
    id: 'sidebar-nav',
    name: 'SidebarNav',
    cn: '侧边导航',
    category: '导航',
    description: '为系统模块建立稳定入口，支持分组展开、当前页和禁用状态。',
    props: [
      ['items', 'NavItem[]', '必填'],
      ['activeKey', 'string', '—'],
      ['onSelect / select', '(key) => void', '—'],
      ['label', 'string', '—'],
    ],
  },
  {
    id: 'top-nav',
    name: 'TopNav',
    cn: '顶部导航',
    category: '导航',
    description: '组织系统主入口与分组，在不同宽度下保持清楚的可达路径。',
    props: [
      ['items', 'NavItem[]', '必填'],
      ['activeKey', 'string', '—'],
      ['onSelect / select', '(key) => void', '—'],
      ['label', 'string', '—'],
    ],
  },
  {
    id: 'dropdown-menu',
    name: 'DropdownMenu',
    cn: '下拉菜单',
    category: '导航',
    description: '将操作组织成菜单，支持分组、分隔与嵌套，以及键盘导航。',
    props: [
      ['items', 'DropdownMenuItem[]', '必填'],
      ['item: children / group / separator', 'DropdownMenuItem[] / boolean / boolean', '—'],
      ['item: href / danger / disabled', 'string / boolean / boolean', '—'],
      ['label', 'string', '—'],
      ['onSelect / select', '(key) => void', '—'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'data-table',
    name: 'DataTable',
    cn: '高级表格',
    category: '表格与列表',
    description: '把多级表头、树形行、筛选排序和选择编辑组合为可维护的业务表格。',
    props: [
      ['columns / data', 'DataColumn[] / Record[]', '必填'],
      ['rowKey / childrenKey', 'string', 'id / children'],
      ['selectable / searchable / pagination', 'boolean', '按用法配置'],
      ['selectedKeys / expandedKeys', 'string[]', '—'],
      ['onCellChange / cell-change', '{key,column,value}', '—'],
    ],
  },
] as const;
export type EnterpriseId = (typeof enterpriseCatalog)[number]['id'];
export const isEnterpriseId = (id: string): id is EnterpriseId =>
  enterpriseCatalog.some((item) => item.id === id);
const anatomy = (
  name: string,
  structure: string,
  purpose: string,
  ...tokens: string[]
): AnatomyPart => ({ name, structure, purpose, tokens });
export const enterpriseAnatomy: Record<EnterpriseId, AnatomyPart[]> = {
  form: [
    anatomy('表单与校验', 'Form → form', '提交前校验，失败时定位需要修正的字段。', '--f-form-gap'),
    anatomy(
      '字段绑定',
      'FormField → Field + control',
      '值、标签、校验与错误采用同一份字段契约。',
      '--f-field-gap',
      '--f-input-height',
    ),
    anatomy(
      '分组与操作',
      'FormSection / FormActions',
      '用标题说明每组目的，提交和重置动作留在表单上下文。',
      '--f-form-section-gap',
    ),
  ],
  calendar: [
    anatomy(
      '日期网格',
      'Calendar → table / grid',
      '日期使用本地日历字符串，键盘与视觉选择指向同一天。',
      '--f-calendar-cell-size',
      '--f-calendar-gap',
    ),
    anatomy(
      '月份导航',
      'month + min/max',
      '切换月份时保留可选择日期与焦点位置。',
      '--f-button-height',
      '--f-focus',
    ),
  ],
  'date-picker': [
    anatomy(
      '可编辑字段',
      'DatePicker → input',
      '直接键入与日历选择共同更新同一个日期值。',
      '--f-input-height',
      '--f-input-radius',
    ),
    anatomy(
      '日历浮层',
      'dialog + Calendar',
      '打开、关闭与返回焦点形成完整任务。',
      '--f-overlay-radius',
      '--f-overlay-padding',
      '--f-calendar-cell-size',
    ),
  ],
  'date-range-picker': [
    anatomy(
      '起止字段',
      'DateRangePicker → DatePicker × 2',
      '把开始和结束明确命名，避免范围顺序含糊。',
      '--f-field-gap',
      '--f-input-height',
    ),
    anatomy(
      '范围规则',
      '[start, end]',
      '两端共享日期约束和清空语义。',
      '--f-calendar-cell-size',
      '--f-overlay-radius',
    ),
  ],
  radio: [
    anatomy(
      '原生选择',
      'Radio → input[type=radio]',
      '相同 name 构成互斥选择，保留浏览器键盘行为。',
      '--f-choice-size',
      '--f-choice-gap',
    ),
  ],
  'checkbox-group': [
    anatomy(
      '独立选择',
      'CheckboxGroup → checkbox[]',
      '选中集合使用稳定值，不依赖显示文案。',
      '--f-choice-size',
      '--f-choice-gap',
    ),
    anatomy(
      '组名与说明',
      'fieldset / group label',
      '每项的说明与组的目的分别表达。',
      '--f-muted',
      '--f-field-gap',
    ),
  ],
  'toggle-group': [
    anatomy(
      '选择按钮',
      'ToggleGroup → radio / checkbox',
      '用原生选择语义实现单选或多选按钮外观。',
      '--f-button-height',
      '--f-button-radius',
    ),
    anatomy(
      '选中状态',
      'value / modelValue',
      '选中、禁用与焦点分别可见。',
      '--f-primary-soft',
      '--f-focus',
    ),
  ],
  segmented: [
    anatomy(
      '互斥视图',
      'Segmented → ToggleGroup',
      '适用于有限数量的相关视图，不承载提交动作。',
      '--f-button-height',
      '--f-button-radius',
    ),
  ],
  'button-group': [
    anatomy(
      '动作分组',
      'ButtonGroup → role=group',
      '组名交代操作对象，内部按钮保持自身语义。',
      '--f-choice-gap',
      '--f-button-radius',
    ),
  ],
  list: [
    anatomy('列表容器', 'List → ul', '用真实列表关系组织同类条目。', '--f-list-gap'),
    anatomy(
      '逐项内容',
      'ListItem / ListItemContent',
      '标题与说明共享清晰的阅读顺序。',
      '--f-list-row-padding',
      '--f-text',
    ),
    anatomy(
      '逐项操作',
      'ListItemActions',
      '操作名称说明目标，避免把整行伪装成按钮。',
      '--f-choice-gap',
    ),
  ],
  'file-list': [
    anatomy(
      '文件条目',
      'FileList → ListItem',
      '文件名、大小、状态与错误都来自应用数据。',
      '--f-list-row-padding',
    ),
    anatomy(
      '进度与恢复',
      'progress / remove / retry',
      '进度不由组件虚构；重试与移除由应用处理。',
      '--f-primary',
      '--f-danger',
    ),
  ],
  tree: [
    anatomy(
      '层级结构',
      'Tree → tree / treeitem',
      '展开与选择独立，方向键沿可见层级移动。',
      '--f-tree-row-height',
      '--f-tree-indent',
    ),
    anatomy(
      '单选与多选',
      'value + multiple + cascade',
      '父节点半选由可用后代计算，禁用分支保持不可操作。',
      '--f-choice-size',
      '--f-primary-soft',
    ),
    anatomy(
      '搜索路径',
      'filterTree',
      '保留命中节点的祖先，避免搜索丢失上下文。',
      '--f-input-height',
    ),
  ],
  'tree-select': [
    anatomy(
      '字段与标签',
      'TreeSelect → trigger + selected tags',
      '已选项可查看、逐个移除或整体清空。',
      '--f-input-height',
      '--f-input-radius',
    ),
    anatomy(
      '层级浮层',
      'Tree + dialog',
      '与独立树共用选择和键盘规则。',
      '--f-tree-row-height',
      '--f-overlay-padding',
    ),
  ],
  cascader: [
    anatomy(
      '逐级路径',
      'Cascader → columns',
      '选择分支后展开下一层，始终交代所属关系。',
      '--f-tree-row-height',
      '--f-overlay-padding',
    ),
    anatomy(
      '单选与多选',
      'node key / key[]',
      '多选保存叶节点；路径展示与内部键值分离。',
      '--f-choice-size',
      '--f-primary-soft',
    ),
  ],
  'org-picker': [
    anatomy(
      '组织路径',
      'OrgPicker → TreeSelect',
      '部门与成员使用同一个可追踪的层级模型。',
      '--f-tree-indent',
      '--f-tree-row-height',
    ),
    anatomy(
      '字段与选择',
      'TreeSelect shared contract',
      '与树选择器共用禁用、搜索、标签移除和清空。',
      '--f-input-height',
      '--f-overlay-radius',
    ),
  ],
  transfer: [
    anatomy(
      '两个集合',
      'Transfer → source / target',
      '区分待选与已选集合，搜索不会悄悄改变选择。',
      '--f-list-row-padding',
      '--f-choice-size',
    ),
    anatomy(
      '移动操作',
      'checked + move',
      '只移动已勾选的可用项，禁用项保持原位。',
      '--f-button-height',
      '--f-choice-gap',
    ),
  ],
  'sidebar-nav': [
    anatomy(
      '稳定入口',
      'SidebarNav → nav / list',
      '当前页与展开分组分别表达。',
      '--f-nav-item-height',
      '--f-nav-padding',
    ),
    anatomy(
      '分组层级',
      'NavItem.children',
      '分组使用可展开按钮，真实目的地使用链接。',
      '--f-tree-indent',
      '--f-primary-soft',
    ),
  ],
  'top-nav': [
    anatomy(
      '主导航',
      'TopNav → nav',
      '主入口与分组保持可发现，窄屏允许换行。',
      '--f-nav-item-height',
      '--f-nav-padding',
    ),
    anatomy(
      '当前页',
      'activeKey → aria-current',
      '选中样式由品牌语义色统一决定。',
      '--f-primary-soft',
      '--f-primary',
    ),
  ],
  'dropdown-menu': [
    anatomy(
      '触发与菜单',
      'DropdownMenu → button + menu',
      '方向键移动与打开子菜单，Escape 逐层返回，Tab 正常离开。',
      '--f-button-height',
      '--f-overlay-radius',
    ),
    anatomy(
      '操作项',
      'menuitem / separator',
      '分组与分隔组织操作；禁用项不可执行，危险操作使用语义色。',
      '--f-nav-item-height',
      '--f-overlay-padding',
    ),
  ],
  'data-table': [
    anatomy(
      '多级表头',
      'columns.children → th colSpan / rowSpan',
      '叶列负责值与操作，分组列表达字段关系。',
      '--f-table-cell-padding',
    ),
    anatomy(
      '树形数据行',
      'data.children + expandedKeys',
      '根级分页，展开保留父子上下文。',
      '--f-table-row-height',
      '--f-tree-indent',
    ),
    anatomy(
      '查询与选择',
      'filters / sort / selectedKeys',
      '全选只作用于当前页，选择与查询状态分开维护。',
      '--f-input-height',
      '--f-choice-size',
    ),
    anatomy(
      '单元格与详情',
      'render / renderExpanded / onCellChange',
      '自定义内容沿用主题，保存业务数据仍由应用处理。',
      '--f-surface',
      '--f-input-radius',
    ),
  ],
};

const json = (value: unknown) => JSON.stringify(value, null, 2);
const updateRowsCode = `function updateRows(rows: Record<string, unknown>[], key: string, column: string, value: unknown): Record<string, unknown>[] {
  return rows.map(row => ({ ...row, ...(row.id === key ? { [column]: value } : {}), ...(Array.isArray(row.children) ? { children: updateRows(row.children, key, column, value) } : {}) }));
}`;
export function enterpriseComponentCode(
  id: EnterpriseId,
  framework: Framework,
  o?: DemoOptions,
): string {
  const groupButtons = Array.from(
    { length: Math.max(2, Math.min(8, o?.buttonGroupCount ?? 3)) },
    (_, i) => i + 1,
  );
  if (o?.buttonGroupReverse) groupButtons.reverse();
  const disabled = o?.state === 'disabled';
  const multiple = o?.multiple ?? false;
  const cascade = o?.cascade ?? false;
  const dateOptions = o as
    (DemoOptions & { dateRangeCalendar?: boolean; dateRangePresets?: boolean }) | undefined;
  const options = json(enterpriseOptions),
    nodes = json(enterpriseTree);
  const name = enterpriseCatalog.find((item) => item.id === id)!.name;
  const reactDisabled = disabled ? ' disabled' : '';
  const vueDisabled = disabled ? ' disabled' : '';
  const reactDateReadOnly = o?.dateReadOnly ? ' readOnly' : '';
  const vueDateReadOnly = o?.dateReadOnly ? ' readonly' : '';
  const reactDateClearable = o?.dateClearable === false ? ' clearable={false}' : '';
  const vueDateClearable = o?.dateClearable === false ? ' :clearable="false"' : '';
  let imports: string = name,
    setup = '',
    body = '';
  if (framework === 'react') {
    switch (id) {
      case 'form':
        imports = 'Form, FormField, FormSection, FormActions, Button';
        body = `<Form initialValues={{ email: '', team: 'design' }} onSubmit={values => console.log(values)}${reactDisabled}>\n      <FormSection title="成员资料">\n        <FormField name="email" label="工作邮箱" type="email" required rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]} />\n        <FormField name="team" label="所属团队" type="select" options={${options}} />\n      </FormSection>\n      <FormActions><Button type="submit">保存成员</Button><Button type="reset" variant="secondary">重置</Button></FormActions>\n    </Form>`;
        break;
      case 'calendar':
      case 'date-picker':
        setup = `const [value, setValue] = useState('2026-11-10');`;
        body = `<${name} label="交付日期" value={value} onValueChange={setValue} min="2026-01-01" max="2027-12-31"${reactDisabled}${id === 'date-picker' ? reactDateReadOnly + reactDateClearable : ''} />`;
        break;
      case 'date-range-picker':
        setup = `const [value, setValue] = useState<[string,string]>(['2026-11-10','2026-11-18']);`;
        if (dateOptions?.dateRangeCalendar && dateOptions.dateRangePresets)
          setup += `\n  const presets: { label: string; value: [string, string] }[] = ${json(dateRangePresets)};`;
        body = `<DateRangePicker label="项目周期" value={value} onValueChange={setValue}${reactDisabled}${reactDateReadOnly}${dateOptions?.dateRangeCalendar ? ' showCalendar' : ''}${dateOptions?.dateRangeCalendar && dateOptions.dateRangePresets ? ' presets={presets}' : ''} />`;
        break;
      case 'radio':
        body = `<Radio name="access" value="team" label="团队可见" defaultChecked${reactDisabled}/>`;
        break;
      case 'checkbox-group':
      case 'transfer':
        setup = `const [value, setValue] = useState<string[]>(['design']);`;
        body = `<${name} label="协作团队" options={${options}} value={value} onValueChange={setValue}${id === 'checkbox-group' ? ` orientation="${o?.orientation ?? 'vertical'}"` : ''}${reactDisabled}/>`;
        break;
      case 'toggle-group':
      case 'segmented':
        setup = `const [value, setValue] = useState<${id === 'segmented' ? 'string' : 'string | string[]'}>(${multiple && id === 'toggle-group' ? "['design']" : "'design'"});`;
        body = `<${name} label="查看范围" options={${options}} value={value} onValueChange={setValue}${id === 'toggle-group' && multiple ? ' multiple' : ''}${reactDisabled}/>`;
        break;
      case 'button-group':
        imports = 'ButtonGroup, Button';
        body = `<ButtonGroup label="项目操作">${groupButtons.map((n) => `<Button variant="${n === 1 ? 'primary' : 'secondary'}"${reactDisabled}>操作 ${n}</Button>`).join('')}</ButtonGroup>`;
        break;
      case 'list':
        imports = 'List, ListItem, ListItemContent, ListItemActions, Button';
        body = `<List><ListItem><ListItemContent><strong>品牌体系升级</strong><p>林晓 · 进行中</p></ListItemContent><ListItemActions><Button variant="ghost">查看项目</Button></ListItemActions></ListItem></List>`;
        break;
      case 'file-list':
        setup = `const [files, setFiles] = useState<FileItem[]>(${json(enterpriseFiles)});`;
        body = `<FileList files={files} onRemove={id => setFiles(current => current.filter(file => file.id !== id))} onRetry={id => console.log('重试文件', id)}${reactDisabled}/>`;
        break;
      case 'tree':
      case 'tree-select':
      case 'cascader':
      case 'org-picker':
        setup = `const [value, setValue] = useState<string | string[]>(${multiple ? "['design']" : "'design'"});`;
        body = `<${name} label="选择组织" nodes={${nodes}} value={value} onValueChange={setValue}${multiple ? ' multiple' : ''}${cascade && id !== 'cascader' ? ' cascade' : ''}${id === 'tree' ? " searchable defaultExpandedKeys={['company','experience']}" : ''}${reactDisabled}/>`;
        break;
      case 'sidebar-nav':
      case 'top-nav':
        setup = `const [activeKey, setActiveKey] = useState('overview');`;
        body = `<${name} label="工作空间导航" items={${json(enterpriseNav)}} activeKey={activeKey} onSelect={setActiveKey}${reactDisabled}/>`;
        break;
      case 'dropdown-menu':
        body = `<DropdownMenu label="项目操作" items={${json(dropdownPreviewItems(o))}} onSelect={key => console.log(key)}${reactDisabled}/>`;
        break;
      case 'data-table':
        setup = `const columns: DataColumn[] = ${json(enterpriseColumns)};\n  const [data, setData] = useState<Record<string,unknown>[]>(${json(enterpriseRows)});\n  ${updateRowsCode}`;
        body = `<DataTable caption="项目交付清单" columns={columns} data={data} searchable selectable pageSize={3} onCellChange={({key,column,value}) => setData(rows => updateRows(rows, key, column, value))}${o?.state === 'loading' ? ' loading' : ''}${reactDisabled}/>`;
        break;
    }
    const engineTypes = id === 'file-list' ? 'FileItem' : id === 'data-table' ? 'DataColumn' : '';
    return `${setup.includes('useState') ? "import { useState } from 'react';\n" : ''}import { ${imports} } from '@btdesign/react';\n${engineTypes ? `import type { ${engineTypes} } from '@btdesign/engine';\n` : ''}import '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  ${setup}\n  return (\n    ${body}\n  );\n}`;
  }
  switch (id) {
    case 'form':
      imports = 'Form, FormField, FormSection, FormActions, Button';
      body = `<Form :initialValues="{email:'',team:'design'}" @submit="values => console.log(values)"${vueDisabled}>\n    <FormSection title="成员资料"><FormField name="email" label="工作邮箱" type="email" required :rules="[{type:'email',message:'请输入有效的邮箱地址'}]"/><FormField name="team" label="所属团队" type="select" :options="options"/></FormSection>\n    <FormActions><Button type="submit">保存成员</Button><Button type="reset" variant="secondary">重置</Button></FormActions>\n  </Form>`;
      setup = `const options = ${options};`;
      break;
    case 'calendar':
    case 'date-picker':
      setup = "const value = ref('2026-11-10');";
      body = `<${name} label="交付日期" v-model="value" min="2026-01-01" max="2027-12-31"${vueDisabled}${id === 'date-picker' ? vueDateReadOnly + vueDateClearable : ''}/>`;
      break;
    case 'date-range-picker':
      setup = "const value = ref<[string,string]>(['2026-11-10','2026-11-18']);";
      if (dateOptions?.dateRangeCalendar && dateOptions.dateRangePresets)
        setup += `\nconst presets: { label: string; value: [string, string] }[] = ${json(dateRangePresets)};`;
      body = `<DateRangePicker label="项目周期" v-model="value"${vueDisabled}${vueDateReadOnly}${dateOptions?.dateRangeCalendar ? ' show-calendar' : ''}${dateOptions?.dateRangeCalendar && dateOptions.dateRangePresets ? ' :presets="presets"' : ''}/>`;
      break;
    case 'radio':
      setup = "const value = ref('team');";
      body = `<Radio name="access" value="team" label="团队可见" v-model="value"${vueDisabled}/>`;
      break;
    case 'checkbox-group':
    case 'transfer':
      setup = `const value = ref(['design']);\nconst options = ${options};`;
      body = `<${name} label="协作团队" :options="options" v-model="value"${id === 'checkbox-group' ? ` orientation="${o?.orientation ?? 'vertical'}"` : ''}${vueDisabled}/>`;
      break;
    case 'toggle-group':
    case 'segmented':
      setup = `const value = ref<${id === 'segmented' ? 'string' : 'string | string[]'}>(${multiple && id === 'toggle-group' ? "['design']" : "'design'"});\nconst options = ${options};`;
      body = `<${name} label="查看范围" :options="options" v-model="value"${id === 'toggle-group' && multiple ? ' multiple' : ''}${vueDisabled}/>`;
      break;
    case 'button-group':
      imports = 'ButtonGroup, Button';
      body = `<ButtonGroup label="项目操作">${groupButtons.map((n) => `<Button variant="${n === 1 ? 'primary' : 'secondary'}"${vueDisabled}>操作 ${n}</Button>`).join('')}</ButtonGroup>`;
      break;
    case 'list':
      imports = 'List, ListItem, ListItemContent, ListItemActions, Button';
      body = `<List><ListItem><ListItemContent><strong>品牌体系升级</strong><p>林晓 · 进行中</p></ListItemContent><ListItemActions><Button variant="ghost">查看项目</Button></ListItemActions></ListItem></List>`;
      break;
    case 'file-list':
      setup = `const files = ref<FileItem[]>(${json(enterpriseFiles)});`;
      body = `<FileList :files="files" @remove="id => files = files.filter(file => file.id !== id)" @retry="id => console.log('重试文件',id)"${vueDisabled}/>`;
      break;
    case 'tree':
    case 'tree-select':
    case 'cascader':
    case 'org-picker':
      setup = `const value = ref<string | string[]>(${multiple ? "['design']" : "'design'"});\nconst nodes = ${nodes};`;
      body = `<${name} label="选择组织" :nodes="nodes" v-model="value"${multiple ? ' multiple' : ''}${cascade && id !== 'cascader' ? ' cascade' : ''}${id === 'tree' ? ` searchable :defaultExpandedKeys="['company','experience']"` : ''}${vueDisabled}/>`;
      break;
    case 'sidebar-nav':
    case 'top-nav':
      setup = `const activeKey = ref('overview');\nconst items = ${json(enterpriseNav)};`;
      body = `<${name} label="工作空间导航" :items="items" :activeKey="activeKey" @select="key => activeKey = key"${vueDisabled}/>`;
      break;
    case 'dropdown-menu':
      setup = `const items = ${json(dropdownPreviewItems(o))};`;
      body = `<DropdownMenu label="项目操作" :items="items" @select="key => console.log(key)"${vueDisabled}/>`;
      break;
    case 'data-table':
      setup = `const columns: DataColumn[] = ${json(enterpriseColumns)};\nconst data = ref<Record<string,unknown>[]>(${json(enterpriseRows)});\n${updateRowsCode}\nfunction edit({key,column,value}: {key:string,column:string,value:unknown}) { data.value = updateRows(data.value, key, column, value); }`;
      body = `<DataTable caption="项目交付清单" :columns="columns" :data="data" searchable selectable :pageSize="3" @cell-change="edit"${o?.state === 'loading' ? ' loading' : ''}${vueDisabled}/>`;
      break;
  }
  const engineTypes = id === 'file-list' ? 'FileItem' : id === 'data-table' ? 'DataColumn' : '';
  return `<script setup lang="ts">\n${setup.includes('ref') ? "import { ref } from 'vue';\n" : ''}import { ${imports} } from '@btdesign/vue';\n${engineTypes ? `import type { ${engineTypes} } from '@btdesign/engine';\n` : ''}import '@btdesign/tokens/styles.css';\n${setup}\n</script>\n\n<template>\n  ${body}\n</template>`;
}

# BTDESIGN v0.3 企业组件实现契约

本轮扩展保留 v0.2 API。主题归 tokens，纯行为归新增 `@btdesign/engine`，React / Vue 负责状态与原生 DOM；业务数据、上传、权限与服务端请求由应用负责。所有类名以 `f-` 开头，颜色、字号、间距、圆角、行高使用共享 token，不内置另一套品牌。

## 公开组件

新增组件族（20）：Form、Calendar、DatePicker、DateRangePicker、Radio、CheckboxGroup、ToggleGroup、Segmented、ButtonGroup、List、FileList、Tree、TreeSelect、Cascader、OrgPicker、Transfer、SidebarNav、TopNav、DropdownMenu、DataTable。

新增部件（6）：FormField、FormSection、FormActions、ListItem、ListItemContent、ListItemActions。既有 Field、Card / Table 部件继续有效。44 个组件族、63 个公开组件（最终以实际导出检查为准）。

## 共同数据与行为

- `ChoiceOption`: `{value:string,label:string,disabled?:boolean,description?:string}`。
- `TreeNode`: `{key:string,label:string,disabled?:boolean,selectable?:boolean,children?:TreeNode[],description?:string}`。key 全树唯一。禁用祖先的后代也禁用；展开与选择独立。级联多选保存可选叶节点 key，父节点状态由后代推导；独立多选保存节点 key。
- `ValidationRule`: `{required?,type?:'email'|'url',min?,max?,minLength?,maxLength?,pattern?:string,message?,validate?:(value,values)=>string|undefined}`。同步校验，空值与 0 区分；正则无效不崩溃。表单值 `Record<string,unknown>`。
- 日期值使用本地日历 ISO `YYYY-MM-DD` 字符串；空值 `''`，范围 `[string,string]`。校验真实日期，不把无效日期自动滚入下月。不把日期当 UTC 时间戳。
- `DataColumn`: `{key,title,dataIndex?,children?,sortable?,filterOptions?:ChoiceOption[],width?:number,align?:'left'|'center'|'right',fixed?:'left'|'right',editable?:boolean}`。框架适配器可扩展 `render(value,row)`。数据行 `Record<string,unknown>`，默认 `rowKey='id'`、`childrenKey='children'`。
- `NavItem`: `{key,label,href?,disabled?,children?}`；只有真实 href 才渲染链接，其他项目使用按钮。`DropdownMenu` 使用相同项目基础结构，首版只允许一级操作菜单，分组以 separator 标志分隔。
- `FileItem`: `{id,name,size?,status?:'ready'|'uploading'|'done'|'error',progress?,url?,error?}`。FileList 是受控展示及移除/重试回调，不伪造上传服务。

## 框架适配器 API

选择类组件统一：React `value / defaultValue / onValueChange`，Vue `modelValue / defaultValue / update:modelValue`。单选值 string，multiple 为 true 时为 string[]。禁用组件不发出变更；name 提供原生表单值。没有提供受控值时才内部维护状态。

- Radio：原生单选输入，label/value/name/checked（Vue modelValue）/disabled。
- CheckboxGroup：options、string[] 值、label、name、disabled；原生 checkbox。
- ToggleGroup：options、multiple、值、label、disabled；单选用原生 radio，多选用 checkbox，按钮外观。Segmented 是同一单选契约。
- ButtonGroup：有 label 的组合容器，内容自由组合，不凭空增加选择状态。
- Form：initialValues、受控 values（Vue modelValue）、rules、disabled、submitting；值变化回调 onValuesChange（Vue update:modelValue）；成功校验后 onSubmit（Vue submit），失败 onInvalid（Vue invalid）。提交前校验、错误摘要、聚焦首个无效字段、原生 reset 恢复初始值；应用负责异步提交状态。
- FormField：name、label、description、rules、required、disabled、placeholder、type（text/email/password/number/textarea/select/checkbox/date）、options；自动渲染常用控件。React 自定义 children 函数 / Vue 默认 slot 获得 `{value,setValue,id,disabled,required,invalid,describedBy}`，支持任意 BTDESIGN 控件；绑定已有 Field，保持标签与错误关联。FormSection 是 fieldset/legend，FormActions 是操作容器。
- Calendar：value、month（ISO YYYY-MM）、min/max、disabledDate、disabled、weekStartsOn(0或1)、onMonthChange（Vue update:month）、onValueChange。月导航、年份/月份选择、日期网格、方向键/Home/End/PageUp/PageDown/Enter/Space。
- DatePicker：ISO 日期字符串，name/label/min/max/disabledDate/disabled/required/placeholder；输入可编辑、打开日历、清空、Esc/外部点击关闭、焦点返回。浮层为非模态命名 dialog，不虚假声明 modal。
- DateRangePicker：范围值、label、name、min/max/disabledDate/disabled；开始和结束日期可分别编辑，范围自动规范次序，不能选中禁用日期。
- Tree：nodes、值、multiple、cascade（默认false）、expandedKeys/defaultExpandedKeys/onExpandedChange（Vue update:expandedKeys）、searchable、label、disabled。树语义、roving tabindex、上下/Home/End/左右展开与父子移动、Space/Enter 选择，搜索保留祖先路径，半选状态。
- TreeSelect：Tree 的选择契约加 placeholder/name，可搜索浮层、已选标签删除、清空、关闭焦点恢复。OrgPicker 复用它并显示组织路径，默认 cascade=false，不引入第二套选人规则。
- Cascader：nodes、单/多值（节点 key；默认只选择叶子）、changeOnSelect、disabled、label/name/placeholder；逐级展开列、清晰路径、搜索、清空，multiple 时保存叶节点 key。
- Transfer：options、目标集合 string[] 值、disabled、label、titles=[待选,已选]；双栏搜索、勾选、全选可用可见项、移入/移回、计数；禁用项保留且不可移动。
- SidebarNav / TopNav：items、activeKey、label、onSelect(key)（Vue select）、disabled；侧栏支持折叠分组，顶部支持直接链接与分组。当前页 aria-current。
- DropdownMenu：items、label、disabled、onSelect(key)（Vue select）；触发按钮、菜单键盘导航、跳过禁用、Esc/Tab/外点关闭、恢复焦点。
- List / 部件：原生 ul/li，标题/说明/操作按结构组合；FileList 复用它，onRemove/onRetry（Vue remove/retry），安全下载链接。
- DataTable：columns、data、rowKey、childrenKey、caption、loading、disabled、searchable、pagination（默认true）、pageSize（默认10）、selectable、selectedKeys/onSelectionChange（Vue update:selectedKeys）、expandedKeys/onExpandedChange（Vue update:expandedKeys）、onCellChange({key,column,value})（Vue cell-change）、emptyText。支持多级表头、树形数据行、独立行详情 renderExpanded / expanded slot、排序、列过滤、全局搜索、根级分页、当前页全选/半选、列显隐、sticky表头/固定列、基础单元格编辑。使用原生table；不声称电子表格键盘网格、虚拟化、远程数据自动加载或任意大型数据性能。

## 共享主题几何

新增可序列化 components 覆盖：form `{gap:8..32,sectionGap:12..48}`、choice `{size:14..24,gap:4..20}`、calendar `{cellSize:28..48,gap:0..8}`、tree `{rowHeight:28..56,indent:12..32}`、navigation `{itemHeight:30..56,padding:8..24}`、list `{rowPadding:8..24,gap:0..16}`、overlay `{radius:0..20,padding:8..24}`。

CSS 变量分别 `--f-form-gap/section-gap`、`--f-choice-size/gap`、`--f-calendar-cell-size/gap`、`--f-tree-row-height/indent`、`--f-nav-item-height/padding`、`--f-list-row-padding/gap`、`--f-overlay-radius/padding`。高级表格复用既有 `--f-table-cell-padding/row-height`；所有输入/按钮继承既有控件规则。统一受 components 锁、导入、导出、重置控制。

## 质量边界

两端至少覆盖 SSR 语义/属性、受控变更、禁用、真实日期、树半选、表单校验、嵌套表头/树行与筛选分页。浏览器复查完整任务、键盘、深浅色、Lab 几何变更与移动布局。迁移审计仅提供候选，不自动声称与第三方表单/高级表格行为等价。

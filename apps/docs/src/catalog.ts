import { treeVariantsExampleCode, treeVariantsOptions } from './TreeVariantsExample';
import { treeSelectExampleCode, treeSelectPreviewOptions } from './TreeSelectExample';
import { organizationTransferExampleCode } from './OrganizationTransferExample';
import { searchSelectExampleCode, searchSelectPreviewOptions } from './SearchSelectExample';
import { numberInputExampleCode, numberInputPreviewOptions } from './number-input-example-code';
import { progressExampleCode, progressPreviewOptions } from './ProgressExample';
import { listExampleCode, listPreviewOptions } from './ListExample';
import { breadcrumbExampleCode } from './breadcrumb-example-code';
import {
  enterpriseCatalog,
  enterpriseAnatomy,
  enterpriseComponentCode,
  isEnterpriseId,
} from './enterprise-catalog';
import type { ComponentId, Framework, DemoOptions, AnatomyPart } from './component-types';
import { inputTagExample } from './input-tag-preview';
import { autoCompleteExample } from './auto-complete-preview';
import { mentionExample } from './mention-preview';
import { uploadExample } from './upload-preview';
import { uploadDropzoneExampleCode, uploadDropzonePreviewOptions } from './UploadDropzoneExample';
import { rateExample } from './rate-preview';
import { tagExampleCode, type TagPreviewOptions } from './tag-example-code';
import { timelineExampleCode, type TimelinePreviewOptions } from './timeline-example-code';
import { stepsExampleCode, type StepsPreviewOptions } from './steps-example-code';
import { tooltipExampleCode, type TooltipPreviewOptions } from './tooltip-example-code';
import { pageHeaderExampleCode, type PageHeaderPreviewOptions } from './page-header-example-code';
import { anchorExampleCode, type AnchorPreviewOptions } from './anchor-example-code';
import { badgeExampleCode, type BadgePreviewOptions } from './badge-example-code';
import { tabsExampleCode, type TabsPreviewOptions } from './tabs-example-code';
import { descriptionsCode, descriptionsPreviewOptions } from './DescriptionsExample';
import { commentExampleCode, commentPreviewOptions } from './CommentExample';
import { statisticExampleCode, statisticPreviewOptions } from './StatisticExample';
import { imageExampleCode, imagePreviewOptions } from './ImageExample';
import { carouselExampleCode, carouselPreviewOptions } from './CarouselExample';
import { popoverExampleCode, popoverPreviewOptions } from './PopoverExample';
import { backTopExampleCode, backTopPreviewOptions } from './BackTopExample';
import { resizeBoxExampleCode, resizeBoxPreviewOptions } from './resize-box-example-code';
import { emptyExampleCode, emptyPreviewOptions } from './EmptyStateExample';
export type { ComponentId, Framework, DemoOptions, AnatomyPart } from './component-types';

export const componentCategories = [
  '操作',
  '文本与字段',
  '选择与切换',
  '日期',
  '层级与组织',
  '表格与列表',
  '导航',
  '反馈',
  '布局与容器',
] as const;
export const catalog = [
  {
    id: 'button',
    name: 'Button',
    cn: '按钮',
    category: '操作',
    description: '清晰表达操作意图，在每个决策点给予恰当的视觉权重。',
    props: [
      ['variant', 'primary | secondary | ghost | danger', 'primary'],
      ['tone', 'standard | success | warning | danger | ai', 'standard'],
      ['shape', 'default | pill', 'default'],
      ['iconOnly', 'boolean', 'false'],
      ['size', 'xs | sm | md | lg | xl', 'md'],
      ['loading', 'boolean', 'false'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'input',
    name: 'Input',
    cn: '输入框',
    category: '文本与字段',
    description: '用于输入单行文本，搭配明确的标签、提示和校验信息。',
    props: [
      ['type', 'HTML input type', 'text'],
      ['disabled', 'boolean', 'false'],
      ['invalid', 'boolean', 'false'],
      ['controlSize', 'sm | md | lg', 'md'],
      ['value / modelValue', 'string | number', '—'],
    ],
  },
  {
    id: 'textarea',
    name: 'Textarea',
    cn: '文本域',
    category: '文本与字段',
    description: '为详细说明、反馈和多行文本留出合适的表达空间。',
    props: [
      ['rows', 'number', '2（原生）'],
      ['controlSize / invalid', 'sm | md | lg / boolean', 'md / false'],
      ['maxLength', 'number', '—'],
      ['value / modelValue', 'string', '—'],
    ],
  },
  {
    id: 'auto-complete',
    name: 'AutoComplete',
    cn: '自动补全',
    category: '文本与字段',
    description: '从本地候选项中筛选并选择建议，也可以保留自由输入。',
    props: [
      ['options', 'ChoiceOption[]（value / label / disabled / description）', '必填'],
      ['value / modelValue', 'string', '—'],
      ['defaultValue', 'string', "''"],
      ['onValueChange / update:modelValue', 'callback', '—'],
      ['onSelectOption / select', 'callback', '—'],
      ['renderOptionSuffix / option-suffix slot', '候选项附加装饰', '—'],
      ['emptyText', 'string', '没有匹配结果'],
      ['controlSize / invalid', 'sm | md | lg / boolean', 'md / false'],
      ['disabled / readOnly', 'boolean', 'false'],
    ],
  },
  {
    id: 'mention',
    name: 'Mention',
    cn: '提及',
    category: '文本与字段',
    description: '输入 @ 从本地候选中选择，选中后将名称插入普通文本。',
    props: [
      ['options', 'ChoiceOption[]（value / label / disabled / description）', '必填'],
      ['value / modelValue', 'string', '—'],
      ['defaultValue', 'string', "''"],
      ['onValueChange / update:modelValue', 'callback', '—'],
      ['onSelectOption / select', 'callback', '—'],
      ['emptyText', 'string', '没有匹配结果'],
      ['controlSize / invalid', 'sm | md | lg / boolean', 'md / false'],
      ['disabled / readOnly', 'boolean', 'false'],
    ],
  },
  {
    id: 'upload',
    name: 'Upload',
    cn: '文件选择',
    category: '文本与字段',
    description: '通过原生文件选择器将文件交给应用处理；传输、进度和文件列表由应用管理。',
    props: [
      ['accept', 'string', '—'],
      ['multiple / disabled / required', 'boolean', 'false'],
      ['name / form', 'string', '—'],
      ['onFilesChange / files-change', '(files: File[], event: Event) => void', '—'],
      ['controlSize', 'sm | md | lg', 'md'],
    ],
  },
  {
    id: 'upload-dropzone',
    name: 'UploadDropzone',
    cn: '文件拖放',
    category: '文本与字段',
    description: '选择或拖放本地文件，按类型、大小和数量筛选；文件传输由应用负责。',
    props: [
      ['accept', 'string', '—'],
      ['multiple / disabled', 'boolean', 'false'],
      ['maxFileSize', 'number（字节）', '—'],
      ['maxFiles / existingCount', 'number', '— / 0'],
      ['label', 'string', '选择或拖放文件'],
      ['onFilesChange / filesChange', '(accepted, rejected, source) => void', '—'],
    ],
  },
  {
    id: 'input-tag',
    name: 'InputTag',
    cn: '标签输入框',
    category: '文本与字段',
    description: '输入并管理多个标签；按 Enter 添加，空输入时按退格删除最后一项。',
    props: [
      ['value / modelValue', 'string[]', '—'],
      ['defaultValue', 'string[]', '[]'],
      ['onValueChange / update:modelValue', 'callback', '—'],
      ['allowDuplicates', 'boolean', 'false'],
      ['requiredMessage', 'string', '请至少添加一项标签。'],
      ['controlSize / invalid', 'sm | md | lg / boolean', 'md / false'],
      ['disabled / readOnly', 'boolean', 'false'],
    ],
  },
  {
    id: 'slider',
    name: 'Slider',
    cn: '滑动输入条',
    category: '文本与字段',
    description: '通过单个滑块在数值范围内选择，支持键盘操作和原生刻度。',
    props: [
      ['value / modelValue', 'number', '50（原生）'],
      ['min / max / step', 'number', '0 / 100 / 1'],
      ['marks', '{ value: number; label?: string }[]', '—'],
      ['disabled', 'boolean', 'false'],
      ['onValueChange / update:modelValue', 'callback', '—'],
    ],
  },
  {
    id: 'rate',
    name: 'Rate',
    cn: '评分',
    category: '选择与切换',
    description: '使用星形或心形选择一个评分，支持键盘操作和可选半分。',
    props: [
      ['value / modelValue', 'number', '—'],
      ['defaultValue', 'number', '0'],
      ['count', 'number', '5'],
      ['shape', 'star | heart', 'star'],
      ['allowHalf / allowClear', 'boolean', 'false'],
      ['name / label', 'string', '— / 评分'],
      ['disabled / required', 'boolean', 'false'],
      ['onValueChange / update:modelValue', 'callback', '—'],
    ],
  },
  {
    id: 'time-picker',
    name: 'TimePicker',
    cn: '时间选择器',
    category: '日期',
    description: '使用原生时间输入选择单个时间，支持表单校验和键盘输入。',
    props: [
      ['value / modelValue', 'string（HH:mm / HH:mm:ss）', '—'],
      ['min / max', 'string（本地时间）', '—'],
      ['step', 'number（秒）', '60（原生）'],
      ['controlSize / invalid', 'sm | md | lg / boolean', 'md / false'],
      ['disabled', 'boolean', 'false'],
      ['onValueChange / update:modelValue', 'callback', '—'],
    ],
  },
  {
    id: 'select',
    name: 'Select',
    cn: '选择器',
    category: '选择与切换',
    description: '从一组已知选项中选择，保留浏览器原生的键盘和移动端体验。',
    props: [
      ['disabled', 'boolean', 'false'],
      ['value / modelValue', 'string | number | array', '—'],
      ['multiple', 'boolean', 'false'],
      ['controlSize / invalid', 'sm | md | lg / boolean', 'md / false'],
      ['children / default slot', 'option elements', '—'],
    ],
  },
  {
    id: 'search-select',
    name: 'SearchSelect',
    cn: '搜索选择器',
    category: '选择与切换',
    description: '从本地候选中搜索并单选或多选，支持移除已选标签。',
    props: [
      ['options', 'ChoiceOption[]（value 必须非空且唯一）', '必填'],
      ['multiple', 'boolean', 'false'],
      ['value / modelValue', 'string | string[]', '—'],
      ['onValueChange / update:modelValue', 'callback', '—'],
      ['label / name / disabled', 'string / string / boolean', '—'],
      ['required', 'boolean（无原生必填校验）', 'false'],
    ],
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    cn: '复选框',
    category: '选择与切换',
    description: '表达独立的选中状态，适用于多项选择和条款确认。',
    props: [
      ['label', 'string', '—'],
      ['checked / modelValue', 'boolean', 'false'],
      ['indeterminate', 'boolean（由应用控制半选）', 'false'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'switch',
    name: 'Switch',
    cn: '开关',
    category: '选择与切换',
    description: '即时切换二元设置，标签描述开启后的功能。',
    props: [
      ['label', 'string', '—'],
      ['checked / modelValue', 'boolean', 'false'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'badge',
    name: 'Badge',
    cn: '徽标',
    category: '反馈',
    description: '使用文字、计数或圆点传达状态，也可标记头像或其他内容。',
    props: [
      ['variant', 'default | success | warning | danger | info', 'default'],
      ['count / max / showZero', 'number | string / number / boolean', '— / 99 / false'],
      ['dot / badgeLabel', 'boolean / string', 'false / —'],
      ['children / default slot', 'ReactNode / Vue slot', '—'],
    ],
  },
  {
    id: 'tag',
    name: 'Tag',
    cn: '标签',
    category: '反馈',
    description: '标识分类或状态；可选关闭操作由使用方决定是否移除。',
    props: [
      ['tone', 'default | success | warning | danger | info', 'default'],
      ['closable / disabled', 'boolean', 'false'],
      ['closeLabel', 'string', '移除标签'],
      ['onClose / close', '(event: MouseEvent) => void', '—'],
    ],
  },
  {
    id: 'timeline',
    name: 'Timeline',
    cn: '时间轴',
    category: '表格与列表',
    description: '按顺序呈现事件，支持横向、纵向与可读状态。',
    props: [
      ['items', 'TimelineItem[]', '必填'],
      ['orientation', 'vertical | horizontal', 'vertical'],
      ['label', 'string', '时间轴'],
      ['item: id / title / description / time / dateTime', 'string / ReactNode / VNodeChild', '—'],
      [
        'item: tone / state',
        'default | success | warning | danger | info / done | current | pending',
        'default / —',
      ],
    ],
  },
  {
    id: 'steps',
    name: 'Steps',
    cn: '步骤条',
    category: '导航',
    description: '按顺序展示任务进度与各步骤状态，支持水平和垂直布局。',
    props: [
      ['items', 'StepItem[]', '必填'],
      ['current', 'number（从 0 开始）', '0'],
      ['orientation', 'horizontal | vertical', 'horizontal'],
      ['label', 'string', '步骤'],
      ['item: id / title / description / icon', 'string / ReactNode / VNodeChild', '—'],
      ['item: status', 'wait | process | finish | error', '由 current 推导'],
    ],
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    cn: '文字气泡',
    category: '反馈',
    description: '悬停或聚焦时提供简短说明；Escape 可关闭。触发元素须能接收焦点并转发描述属性。',
    props: [
      ['children / default slot', '单个可聚焦元素', '必填'],
      ['content / content slot', 'ReactNode / string | number / Vue slot', '—'],
      ['placement', 'top | bottom | left | right', 'top'],
      ['open / defaultOpen / disabled', 'boolean', 'false'],
      ['onOpenChange / update:open', '(open: boolean) => void', '—'],
    ],
  },
  {
    id: 'page-header',
    name: 'PageHeader',
    cn: '页头',
    category: '导航',
    description: '组织页面标题、说明、面包屑和操作；返回行为由应用接管。',
    props: [
      ['title / title slot', 'ReactNode / string / Vue slot', '必填（或插槽）'],
      ['description / description slot', 'ReactNode / string / Vue slot', '—'],
      ['breadcrumb / actions', 'ReactNode / Vue slots', '—'],
      ['onBack / @back', '(event: MouseEvent) => void', '—'],
      ['showBack / backLabel / headingLevel', 'boolean / string / 1–6', '自动 / 返回 / 1'],
    ],
  },
  {
    id: 'anchor',
    name: 'Anchor',
    cn: '锚点',
    category: '导航',
    description: '用页面目录定位章节，支持嵌套；当前位置由应用维护。',
    props: [
      ['items', 'AnchorItem[]', '必填'],
      ['activeHref / label', 'string', '— / 页面目录'],
      ['onNavigate / @navigate', '(href, event) => void', '—'],
      ['item: id / href / title / children', 'string / fragment / 内容 / AnchorItem[]', '—'],
    ],
  },
  {
    id: 'card',
    name: 'Card',
    cn: '卡片',
    category: '布局与容器',
    description: '组织同一对象的相关信息，让内容与操作保持紧密关联。',
    props: [
      ['children / default slot', 'CardHeader / CardContent / CardFooter', '—'],
      ['CardTitle / CardDescription', '标题与说明子部件', '—'],
      ['className / class', 'string', '—'],
    ],
  },
  {
    id: 'collapse',
    name: 'Collapse',
    cn: '折叠面板',
    category: '布局与容器',
    description: '逐项展开相关内容，支持手风琴、多项展开与独立的附加操作。',
    props: [
      ['items', '{ value, label, content?, disabled?, extra? }[]', '必填'],
      ['value / modelValue', 'string[]', '—'],
      ['defaultValue', 'string[]', '[]'],
      ['onValueChange / update:modelValue', '(value: string[]) => void', '—'],
      ['accordion / disabled', 'boolean', 'false'],
      ['expandIconPosition', 'start | end | none', 'start'],
    ],
  },
  {
    id: 'descriptions',
    name: 'Descriptions',
    cn: '描述列表',
    category: '表格与列表',
    description: '用标签和值组织对象详情，支持横向、纵向及带边框布局。',
    props: [
      ['items', '{ key, label, value, span? }[]', '必填'],
      ['title', 'string', '—'],
      ['column', 'number（1–6）', '3'],
      ['orientation', 'horizontal | vertical', 'horizontal'],
      ['bordered', 'boolean', 'false'],
      ['Vue slots', 'title / label-{key} / value-{key}', '—'],
    ],
  },
  {
    id: 'comment',
    name: 'Comment',
    cn: '评论',
    category: '表格与列表',
    description: '组织作者、时间、评论内容和操作，支持嵌套展示回复。',
    props: [
      ['author', 'ReactNode / string（Vue）', '必填'],
      ['avatar / content / actions', 'ReactNode / Vue slots', '—'],
      ['time / dateTime', '时间文字 / ISO 时间', '—'],
      ['alignment', 'start | end', 'start'],
      ['children / default slot', '嵌套回复', '—'],
    ],
  },
  {
    id: 'statistic',
    name: 'Statistic',
    cn: '数值显示',
    category: '表格与列表',
    description: '展示已有的指标数值、百分比和趋势说明。',
    props: [
      ['value', 'number | string', '必填'],
      ['title', 'ReactNode / string（Vue）', '—'],
      ['format', 'number | percent（值 25 表示 25%）', 'number'],
      ['precision / locale', 'number / string', '—'],
      ['prefix / suffix', 'ReactNode / string（Vue）或 slot', '—'],
      ['trend / trendText', 'up | down | neutral / 内容', '—'],
    ],
  },
  {
    id: 'image',
    name: 'Image',
    cn: '图片',
    category: '布局与容器',
    description: '展示带替代文字的图片，支持比例、加载回退和可选的大图预览。',
    props: [
      ['src / alt', 'string / string', '必填'],
      ['aspectRatio', 'CSS aspect-ratio（如 16 / 9）', '—'],
      ['fit / loading', 'cover | contain / eager | lazy', 'cover / lazy'],
      ['caption / fallback', 'ReactNode / Vue slots', '—'],
      ['preview / previewLabel', 'boolean / string', 'false / 查看大图'],
    ],
  },
  {
    id: 'carousel',
    name: 'Carousel',
    cn: '轮播',
    category: '布局与容器',
    description: '由用户切换一组内容，支持指示器、键盘和可选首尾循环。',
    props: [
      ['items', '{ key, label?, content }[]', '必填'],
      ['index / modelValue', 'number', '—'],
      ['defaultIndex', 'number', '0'],
      ['onIndexChange / update:modelValue', '(index: number) => void', '—'],
      ['label / loop', 'string / boolean', '图片轮播 / false'],
      [
        'indicatorStyle / indicatorPlacement',
        'dots | lines / bottom | start | end',
        'dots / bottom',
      ],
    ],
  },
  {
    id: 'back-top',
    name: 'BackTop',
    cn: '返回顶部',
    category: '导航',
    description: '滚动到一定距离后出现，帮助用户返回页面或滚动容器顶部。',
    props: [
      ['target', '() => Window | HTMLElement | null', 'window'],
      ['visibilityHeight / top', 'number / number', '400 / 0'],
      ['behavior', 'smooth | auto（遵循系统减少动态设置）', 'smooth'],
      [
        'shape / variant / content',
        'square | circle / neutral | primary / arrow | up | top',
        'square / neutral / arrow',
      ],
      ['position', 'fixed | inline', 'fixed'],
      ['children / default slot', '自定义按钮内容', '—'],
    ],
  },
  {
    id: 'resize-box',
    name: 'ResizeBox',
    cn: '伸缩框',
    category: '布局与容器',
    description: '用可拖动、可键盘调整的分隔条改变两个面板的占比。',
    props: [
      ['orientation', 'horizontal | vertical', 'horizontal'],
      ['size / defaultSize', 'number（百分比）', '— / 50'],
      ['min / max / step', 'number（百分比）', '10 / 90 / 1'],
      ['onSizeChange / update:size', '(size: number) => void', '—'],
      ['disabled / handleLabel', 'boolean / string', 'false / 调整面板大小'],
      ['first / second', 'ReactNode / Vue slots', '—'],
    ],
  },
  {
    id: 'popover',
    name: 'Popover',
    cn: '气泡卡片',
    category: '反馈',
    description: '在触发元素旁展示可交互的补充内容。',
    props: [
      ['trigger / #trigger', 'ReactNode / slot（按钮内部内容，不可嵌套按钮）', '必填'],
      ['title / content / label', '内容 / 内容 / string', '详情'],
      ['placement / showArrow', '12 种位置 / boolean', 'bottom / true'],
      ['open / modelValue / defaultOpen', 'boolean', 'false'],
      ['onOpenChange / update:modelValue', '(open: boolean) => void', '—'],
      ['disabled', 'boolean', 'false'],
      ['定位说明', '显式位置；暂不自动避让视口边缘', '—'],
    ],
  },
  {
    id: 'alert',
    name: 'Alert',
    cn: '提示',
    category: '反馈',
    description: '在相关位置传达状态与必要信息，为用户提供清晰的后续行动。',
    props: [
      ['variant', 'info | success | warning | danger', 'info'],
      ['title', 'string', '—'],
    ],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    cn: '标签页',
    category: '导航',
    description: '在同一上下文切换内容，支持方向键、Home 和 End 导航。',
    props: [
      ['items', '{value, label, content?, disabled?}[]', '必填'],
      ['value / modelValue', 'string', '首个可用选项'],
      ['defaultValue', 'string', '首个可用选项'],
      ['variant', 'default | line | text | card | card-gutter | rounded', 'default'],
      ['orientation', 'horizontal | vertical', 'horizontal'],
      ['onValueChange / update:modelValue', 'callback', '—'],
    ],
  },
  {
    id: 'dialog',
    name: 'Dialog',
    cn: '对话框',
    category: '反馈',
    description: '承载需要聚焦处理的任务，支持 Escape 关闭和焦点恢复。',
    props: [
      ['open / modelValue', 'boolean', 'React 必填 / Vue false'],
      ['title', 'ReactNode / string', '必填'],
      ['description', 'ReactNode / string', '—'],
      ['onOpenChange / update:modelValue', 'callback', 'React 必填'],
      ['closeLabel', 'string', '关闭对话框'],
    ],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    cn: '头像',
    category: '布局与容器',
    description: '以图片或姓名缩写识别用户，在图片不可用时提供文字回退。',
    props: [
      ['src', 'string', '—'],
      ['name', 'string', 'React 必填'],
      ['alt / fallback（Vue）', 'string', '—'],
      ['size', 'sm | md | lg', 'md'],
      ['shape', 'circle | square', 'circle'],
      [
        'AvatarGroup max / size / shape / label',
        'number / sm | md | lg / circle | square / string',
        '不限 / md / circle / 头像组',
      ],
    ],
  },
  {
    id: 'separator',
    name: 'Separator',
    cn: '分隔线',
    category: '布局与容器',
    description: '在相邻内容组之间建立适度的视觉边界。',
    props: [['orientation', 'horizontal | vertical', 'horizontal']],
  },
  {
    id: 'table',
    name: 'Table',
    cn: '表格',
    category: '表格与列表',
    description: '用原生表格呈现可对照的信息，窄屏下支持局部横向滚动。',
    props: [
      ['children / default slot', 'TableCaption / TableHeader / TableBody / TableFooter', '—'],
      ['TableRow / TableHead / TableCell', '原生 tr / th / td 属性', '—'],
      ['className / class', 'string', '—'],
    ],
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    cn: '骨架屏',
    category: '反馈',
    description: '在内容加载时保留结构，尊重用户减少动态效果的设置。',
    props: [
      ['width', 'number | string', '—'],
      ['height', 'number | string', '—'],
    ],
  },
  {
    id: 'progress',
    name: 'Progress',
    cn: '进度条',
    category: '反馈',
    description: '呈现任务的已完成比例，并提供可被辅助技术读取的数值。',
    props: [
      ['value', 'number', 'React 必填 / Vue 0'],
      ['max', 'number', '100'],
      ['label', 'string', '—'],
      ['type', 'line | circle | mini', 'line'],
      ['status', 'normal | success | warning | error', 'normal（由应用传入）'],
      ['showValue', 'boolean', '按形状与标签'],
    ],
  },
  {
    id: 'field',
    name: 'Field',
    cn: '表单字段',
    category: '文本与字段',
    description: '把标签、说明、输入和错误组合为一个完整字段，自动建立可访问关联。',
    props: [
      ['label', 'ReactNode / string', '必填'],
      ['description / error', 'ReactNode / string', '—'],
      ['layout', 'vertical | horizontal', 'vertical'],
      ['required / disabled', 'boolean', 'false'],
      ['id', 'string', '自动生成'],
    ],
  },
  {
    id: 'input-group',
    name: 'InputGroup',
    cn: '输入组合',
    category: '文本与字段',
    description: '组合输入框、前后缀与附加操作，清晰交代输入单位和格式。',
    props: [
      ['children / default slot', 'InputAddon + Input + action', '—'],
      ['className / class', 'string', '—'],
    ],
  },
  {
    id: 'radio-group',
    name: 'RadioGroup',
    cn: '单选组',
    category: '选择与切换',
    description: '并列展示互斥选项，使用原生单选行为完成键盘选择与表单提交。',
    props: [
      ['options', '{value, label, description?, disabled?}[]', '必填'],
      ['value / modelValue', 'string', '—'],
      ['onValueChange / update:modelValue', 'callback', '—'],
      ['orientation', 'horizontal | vertical', 'vertical'],
      ['name', 'string', '自动生成'],
    ],
  },
  {
    id: 'number-input',
    name: 'NumberInput',
    cn: '数字输入',
    category: '文本与字段',
    description: '同时支持精确输入和步进调整，保留边界、精度与空值的语义。',
    props: [
      ['value / modelValue', "number | ''", '—'],
      ['onValueChange / update:modelValue', 'callback', '—'],
      ['min / max', 'number', '—'],
      ['step', 'number', '1'],
      ['stepperLayout', 'sides | stacked', 'sides'],
      ['controlSize', 'sm | md | lg', 'md'],
      ['invalid / disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    cn: '面包屑',
    category: '导航',
    description: '表达页面在信息层级中的位置，为上级页面提供直接入口。',
    props: [
      ['items', '{label, href?}[]', '必填'],
      ['label', 'string', '面包屑导航'],
      ['separator', 'slash | dot | arrow', 'slash'],
    ],
  },
  {
    id: 'pagination',
    name: 'Pagination',
    cn: '分页',
    category: '导航',
    description: '在明确的总量中切换页面，保留首尾入口并压缩过长的页码。',
    props: [
      ['page', 'number', '必填'],
      ['total', 'number（数据条数）', '必填'],
      ['pageSize', 'number', '10'],
      ['onPageChange / update:page', 'callback', '—'],
      ['siblingCount', 'number', '1'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'empty-state',
    name: 'EmptyState',
    cn: '空状态',
    category: '反馈',
    description: '说明暂时没有内容的原因，并提供一个合适的下一步。',
    props: [
      [
        'variant',
        'no-content | initial | no-messages | no-results | no-permission | offline | not-found | error',
        'no-content',
      ],
      ['size / headingLevel', 'compact | default | page / 2 | 3 | 4 | 5 | 6', 'default / 3'],
      ['title / description', 'ReactNode / string 或 Vue slot', '按场景的标题 / —'],
      ['icon / action', 'ReactNode / named slot', '—'],
      ['children / default slot', 'content', '—'],
      ['场景来源', '由业务传入；不检测网络或触发重试', '—'],
    ],
  },
  {
    id: 'spinner',
    name: 'Spinner',
    cn: '加载指示',
    category: '反馈',
    description: '在无法确定进度时表达正在处理，使用状态文本说明等待的内容。',
    props: [
      ['label', 'string', '加载中'],
      ['size', 'sm | md | lg', 'md'],
    ],
  },
  {
    id: 'organization-transfer',
    name: 'OrganizationTransfer',
    cn: '组织穿梭器',
    category: '层级与组织',
    description: '选择持续生效的部门规则，或保存包含下级部门的当前成员快照。',
    props: [
      ['directory', 'OrganizationDirectory（应用提供）', '必填'],
      ['value / modelValue', 'OrganizationSelection', '必填'],
      ['onValueChange / update:modelValue', 'callback', '必填'],
      ['onConfirm / confirm', '(selection, result) => void', '必填'],
      ['getDepartmentLabel / getPersonLabel', '(identity) => string', '标识 ID'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  ...enterpriseCatalog,
] as const;
const reactExamples: Partial<Record<ComponentId, string>> = {
  button: `import { Button } from '@btdesign/react';\n\n<Button variant="primary">创建项目</Button>\n<Button variant="secondary">取消</Button>\n<Button loading>正在保存</Button>`,
  input: `import { Input } from '@btdesign/react';\n\n<label htmlFor="email">邮箱</label>\n<Input id="email" type="email" placeholder="you@company.com" />`,
  textarea: `import { Textarea } from '@btdesign/react';\n\n<label htmlFor="description">项目描述</label>\n<Textarea id="description" rows={4} placeholder="介绍一下你的项目…" />`,
  select: `import { Select } from '@btdesign/react';\n\n<Select aria-label="团队角色" defaultValue="designer">\n  <option value="designer">设计师</option>\n  <option value="developer">开发者</option>\n</Select>`,
  checkbox: `import { Checkbox } from '@btdesign/react';\n\n<Checkbox label="接收产品更新" defaultChecked />`,
  switch: `import { Switch } from '@btdesign/react';\n\n<Switch label="邮件通知" defaultChecked />`,
  badge: `import { Badge } from '@btdesign/react';\n\n<Badge variant="success">已发布</Badge>\n<Badge variant="warning">审核中</Badge>`,
  card: "import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@btdesign/react';\n\n<Card>\n  <CardHeader>\n    <CardTitle>团队工作空间</CardTitle>\n    <CardDescription>让设计与开发保持同步。</CardDescription>\n  </CardHeader>\n  <CardContent>共同维护品牌规则与组件。</CardContent>\n  <CardFooter><Button>进入工作空间</Button></CardFooter>\n</Card>",
  alert: `import { Alert } from '@btdesign/react';\n\n<Alert variant="success" title="保存成功">\n  当前配置已保存，可继续编辑或导出。\n</Alert>`,
  tabs: `import { Tabs } from '@btdesign/react';\n\n<Tabs defaultValue="design" items={[\n  { value: 'design', label: '设计', content: '设计规范与资源' },\n  { value: 'develop', label: '开发', content: '组件 API 与示例' }\n]} />`,
  dialog: `import { useState } from 'react';\nimport { Button, Dialog } from '@btdesign/react';\n\nexport function Example() {\n  const [open, setOpen] = useState(false);\n  return <>\n    <Button onClick={() => setOpen(true)}>新建项目</Button>\n    <Dialog open={open} onOpenChange={setOpen} title="新建项目">\n      <p>为团队开启一个新的工作空间。</p>\n      <Button onClick={() => setOpen(false)}>完成</Button>\n    </Dialog>\n  </>;\n}`,
  avatar: `import { Avatar } from '@btdesign/react';\n\n<Avatar name="林晓" />\n<Avatar name="Alex Chen" size="lg" />`,
  collapse: `import { Collapse } from '@btdesign/react';\n\n<Collapse items={[{ value: 'one', label: '项目说明', content: '设计与开发保持同步。' }, { value: 'two', label: '团队成员', content: '查看并管理成员。' }]} defaultValue={['one']} />`,
  separator: `import { Separator } from '@btdesign/react';\n\n<p>项目设置</p>\n<Separator />\n<p>团队成员</p>`,
  table:
    'import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from \'@btdesign/react\';\n\n<Table>\n  <TableCaption>团队成员</TableCaption>\n  <TableHeader><TableRow><TableHead scope="col">姓名</TableHead><TableHead scope="col">角色</TableHead></TableRow></TableHeader>\n  <TableBody><TableRow><TableCell>林晓</TableCell><TableCell>设计师</TableCell></TableRow></TableBody>\n</Table>',
  skeleton: `import { Skeleton } from '@btdesign/react';\n\n<div aria-label="正在加载内容" role="status">\n  <Skeleton width="100%" height={20} />\n  <Skeleton width="60%" height={20} />\n</div>`,
  progress: `import { Progress } from '@btdesign/react';\n\n<Progress value={64} max={100} label="文件上传" />`,
  field:
    'import { Field, Input } from \'@btdesign/react\';\n\n<Field label="工作邮箱" description="用于接收团队邀请" required>\n  <Input type="email" placeholder="you@company.com" />\n</Field>',
  'input-group':
    'import { Field, InputGroup, InputAddon, Input } from \'@btdesign/react\';\n\n<Field label="工作空间地址">\n  <InputGroup>\n    <InputAddon>https://</InputAddon>\n    <Input placeholder="my-team" />\n    <InputAddon>.example.com</InputAddon>\n  </InputGroup>\n</Field>',
  'radio-group':
    "import { RadioGroup } from '@btdesign/react';\n\n<RadioGroup name=\"access\" label=\"访问权限\" defaultValue=\"team\" options={[\n  { value: 'team', label: '团队可见', description: '仅组织成员可以访问' },\n  { value: 'private', label: '仅自己', description: '邀请后再开放访问' }\n]} />",
  'number-input':
    "import { useState } from 'react';\nimport { Field, NumberInput } from '@btdesign/react';\n\nexport function Example() {\n  const [quantity, setQuantity] = useState<number | ''>(4);\n  return <Field label=\"成员席位\" description=\"可以设置 1 至 20 个席位\">\n    <NumberInput value={quantity} onValueChange={setQuantity} min={1} max={20} step={1} />\n  </Field>;\n}",
  breadcrumb:
    "import { Breadcrumb } from '@btdesign/react';\n\n<Breadcrumb items={[\n  { label: '组件总览', href: '#/components' },\n  { label: '导航' },\n  { label: '面包屑' }\n]} />",
  pagination:
    "import { useState } from 'react';\nimport { Pagination } from '@btdesign/react';\n\nexport function Example() {\n  const [page, setPage] = useState(1);\n  return <Pagination page={page} total={128} pageSize={10} onPageChange={setPage} />;\n}",
  'empty-state':
    'import { EmptyState, Button } from \'@btdesign/react\';\n\n<EmptyState title="还没有项目" description="创建第一个项目，开始与团队协作。"\n  action={<Button onClick={() => window.location.hash = \'/lab\'}>创建项目</Button>} />',
  spinner:
    'import { Spinner } from \'@btdesign/react\';\n\n<Spinner label="正在加载项目" size="md" />',
};
function reactCode(id: ComponentId) {
  const example = reactExamples[id]!;
  const boundary = example.indexOf('\n\n');
  const imports = `${example.slice(0, boundary)}\nimport '@btdesign/tokens/styles.css';`;
  const body = example.slice(boundary + 2);
  if (body.startsWith('export function'))
    return `${imports}\n\n${body.replace('export function', 'export default function')}`;
  const content = body
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');
  return `${imports}\n\nexport default function Example() {\n  return (\n    <>\n${content}\n    </>\n  );\n}`;
}

export function componentCode(id: ComponentId, framework: Framework, options?: DemoOptions) {
  if (id === 'organization-transfer') return organizationTransferExampleCode(framework, options);
  if (id === 'tree') return treeVariantsExampleCode(framework, treeVariantsOptions(options));
  if (id === 'tree-select')
    return treeSelectExampleCode(framework, treeSelectPreviewOptions(options));
  if (id === 'search-select')
    return searchSelectExampleCode(framework, searchSelectPreviewOptions(options));
  if (id === 'number-input')
    return numberInputExampleCode(framework, numberInputPreviewOptions(options));
  if (id === 'progress') return progressExampleCode(framework, progressPreviewOptions(options));
  if (id === 'list') return listExampleCode(framework, listPreviewOptions(options));
  if (id === 'breadcrumb')
    return breadcrumbExampleCode(framework, options?.breadcrumbSeparator ?? 'slash');
  if (id === 'tabs') return tabsExampleCode(framework, tabsPreviewOptions(options));
  if (id === 'badge') return badgeExampleCode(framework, badgePreviewOptions(options));
  if (id === 'rate') return rateExample(framework, options ?? defaultDemoOptions);
  if (id === 'auto-complete') return autoCompleteExample(framework, options ?? defaultDemoOptions);
  if (id === 'mention') return mentionExample(framework, options ?? defaultDemoOptions);
  if (id === 'upload') return uploadExample(framework, options ?? defaultDemoOptions);
  if (id === 'upload-dropzone')
    return uploadDropzoneExampleCode(framework, uploadDropzonePreviewOptions(options));
  if (id === 'input-tag') return inputTagExample(framework, options ?? defaultDemoOptions);
  if (isEnterpriseId(id)) return enterpriseComponentCode(id, framework, options);
  if (id === 'tag') return tagExampleCode(framework, tagPreviewOptions(options));
  if (id === 'timeline') return timelineExampleCode(framework, timelinePreviewOptions(options));
  if (id === 'steps') return stepsExampleCode(framework, stepsPreviewOptions(options));
  if (id === 'tooltip') return tooltipExampleCode(framework, tooltipPreviewOptions(options));
  if (id === 'page-header')
    return pageHeaderExampleCode(framework, pageHeaderPreviewOptions(options));
  if (id === 'anchor') return anchorExampleCode(framework, anchorPreviewOptions(options));
  if (id === 'descriptions')
    return descriptionsCode(framework, descriptionsPreviewOptions(options));
  if (id === 'comment') return commentExampleCode(framework, commentPreviewOptions(options));
  if (id === 'statistic') return statisticExampleCode(framework, statisticPreviewOptions(options));
  if (id === 'image') return imageExampleCode(framework, imagePreviewOptions(options));
  if (id === 'carousel') return carouselExampleCode(framework, carouselPreviewOptions(options));
  if (id === 'popover') return popoverExampleCode(framework, popoverPreviewOptions(options));
  if (id === 'back-top') return backTopExampleCode(framework, backTopPreviewOptions(options));
  if (id === 'resize-box') return resizeBoxExampleCode(framework, resizeBoxPreviewOptions(options));
  if (id === 'empty-state') return emptyExampleCode(framework, emptyPreviewOptions(options));
  if ((id === 'slider' || id === 'time-picker') && !options)
    return configuredComponentCode(id, framework, defaultDemoOptions)!;
  if (options) {
    const configured = configuredComponentCode(id, framework, options);
    if (configured) return configured;
  }
  if (framework === 'react') return reactCode(id);
  const templates: Partial<Record<ComponentId, string>> = {
    button:
      '<Button variant="primary">创建项目</Button>\n<Button variant="secondary">取消</Button>\n<Button loading>正在保存</Button>',
    input:
      '<label for="email">邮箱</label>\n<Input id="email" v-model="value" type="email" placeholder="you@company.com" />',
    textarea:
      '<label for="description">项目描述</label>\n<Textarea id="description" v-model="value" :rows="4" />',
    select:
      '<Select v-model="value" aria-label="团队角色">\n  <option value="designer">设计师</option>\n  <option value="developer">开发者</option>\n</Select>',
    checkbox: '<Checkbox v-model="checked" label="接收产品更新" />',
    switch: '<Switch v-model="checked" label="邮件通知" />',
    badge: '<Badge variant="success">已发布</Badge>\n<Badge variant="warning">审核中</Badge>',
    card: '<Card><CardHeader><CardTitle>团队工作空间</CardTitle><CardDescription>让设计与开发保持同步。</CardDescription></CardHeader><CardContent>共同维护品牌规则与组件。</CardContent><CardFooter><Button>进入工作空间</Button></CardFooter></Card>',
    alert: '<Alert variant="success" title="保存成功">当前配置已保存，可继续编辑或导出。</Alert>',
    tabs: "<Tabs v-model=\"value\" :items=\"[{ value: 'design', label: '设计' }, { value: 'develop', label: '开发' }]\">\n  <template #design>设计规范与资源</template>\n  <template #develop>组件 API 与示例</template>\n</Tabs>",
    dialog:
      '<Button @click="open = true">新建项目</Button>\n<Dialog v-model="open" title="新建项目">\n  <p>为团队开启一个新的工作空间。</p>\n  <Button @click="open = false">完成</Button>\n</Dialog>',
    avatar: '<Avatar name="林晓" />\n<Avatar name="Alex Chen" size="lg" />',
    collapse: `<Collapse :items="[{ value: 'one', label: '项目说明', content: '设计与开发保持同步。' }, { value: 'two', label: '团队成员', content: '查看并管理成员。' }]" :default-value="['one']" />`,
    separator: '<p>项目设置</p><Separator /><p>团队成员</p>',
    table:
      '<Table>\n  <TableCaption>团队成员</TableCaption>\n  <TableHeader><TableRow><TableHead scope="col">姓名</TableHead><TableHead scope="col">角色</TableHead></TableRow></TableHeader>\n  <TableBody><TableRow><TableCell>林晓</TableCell><TableCell>设计师</TableCell></TableRow></TableBody>\n</Table>',
    skeleton:
      '<div role="status" aria-label="正在加载内容">\n  <Skeleton width="100%" :height="20" />\n  <Skeleton width="60%" :height="20" />\n</div>',
    progress: '<Progress :value="64" :max="100" label="文件上传" />',
    field:
      '<Field label="工作邮箱" description="用于接收团队邀请" required>\n  <Input v-model="value" type="email" placeholder="you@company.com" />\n</Field>',
    'input-group':
      '<Field label="工作空间地址">\n  <InputGroup><InputAddon>https://</InputAddon><Input v-model="value" placeholder="my-team" /><InputAddon>.example.com</InputAddon></InputGroup>\n</Field>',
    'radio-group':
      "<RadioGroup v-model=\"value\" name=\"access\" label=\"访问权限\" :options=\"[{ value: 'team', label: '团队可见', description: '仅组织成员可以访问' }, { value: 'private', label: '仅自己' }]\" />",
    'number-input':
      '<Field label="成员席位" description="可以设置 1 至 20 个席位">\n  <NumberInput v-model="quantity" :min="1" :max="20" :step="1" />\n</Field>',
    breadcrumb:
      "<Breadcrumb :items=\"[{ label: '组件总览', href: '#/components' }, { label: '导航' }, { label: '面包屑' }]\" />",
    pagination: '<Pagination v-model:page="page" :total="128" :page-size="10" />',
    'empty-state':
      '<EmptyState title="还没有项目" description="创建第一个项目，开始与团队协作。">\n  <template #action><Button @click="createProject">创建项目</Button></template>\n</EmptyState>',
    spinner: '<Spinner label="正在加载项目" size="md" />',
  };
  const state = [
    'input',
    'textarea',
    'select',
    'tabs',
    'field',
    'input-group',
    'radio-group',
  ].includes(id)
    ? `\nconst value = ref('${id === 'select' ? 'designer' : id === 'radio-group' ? 'team' : ''}');`
    : ['checkbox', 'switch'].includes(id)
      ? '\nconst checked = ref(true);'
      : id === 'dialog'
        ? '\nconst open = ref(false);'
        : id === 'pagination'
          ? '\nconst page = ref(1);'
          : '';
  const extraImports: Partial<Record<ComponentId, string>> = {
    dialog: ', Button',
    field: ', Input',
    'input-group': ', InputAddon, Input, Field',
    'number-input': ', Field',
    'empty-state': ', Button',
    card: ', CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button',
    table: ', TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell',
  };
  return `<script setup lang="ts">\n${state ? "import { ref } from 'vue';\n" : ''}import { ${catalog.find((c) => c.id === id)!.name}${extraImports[id] ?? ''} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';${state}\n</script>\n\n<template>\n${templates[id]}\n</template>`;
}

export const defaultDemoOptions: DemoOptions = {
  size: 'md',
  state: 'default',
  variant: 'primary',
  orientation: 'horizontal',
  progress: 64,
};
export function tagPreviewOptions(options?: DemoOptions): TagPreviewOptions {
  const tones = ['default', 'success', 'warning', 'danger', 'info'] as const;
  const tone = tones.find((value) => value === options?.variant) ?? 'default';
  return { tone, closable: options?.tagClosable ?? false, disabled: options?.state === 'disabled' };
}
export function timelinePreviewOptions(options?: DemoOptions): TimelinePreviewOptions {
  const tones = ['default', 'success', 'warning', 'danger', 'info'] as const;
  return {
    tone: tones.find((value) => value === options?.variant) ?? 'default',
    orientation: options?.orientation ?? 'vertical',
    showStates: options?.timelineStates ?? true,
  };
}
export function stepsPreviewOptions(options?: DemoOptions): StepsPreviewOptions {
  return {
    orientation: options?.orientation ?? 'horizontal',
    current: options?.stepsCurrent ?? 1,
    showIcons: options?.stepsIcons ?? false,
    errorLast: options?.stepsError ?? false,
  };
}
export function tooltipPreviewOptions(options?: DemoOptions): TooltipPreviewOptions {
  return { placement: options?.tooltipPlacement ?? 'top', disabled: options?.state === 'disabled' };
}
export function pageHeaderPreviewOptions(options?: DemoOptions): PageHeaderPreviewOptions {
  return {
    showBack: options?.pageHeaderBack ?? true,
    showDescription: options?.pageHeaderDescription ?? true,
    showActions: options?.pageHeaderActions ?? true,
    showBreadcrumb: options?.pageHeaderBreadcrumb ?? false,
  };
}
export function anchorPreviewOptions(options?: DemoOptions): AnchorPreviewOptions {
  return { nested: options?.anchorNested ?? false };
}
export function tabsPreviewOptions(options?: DemoOptions): TabsPreviewOptions {
  return {
    variant: options?.tabsVariant ?? 'default',
    orientation: options?.orientation ?? 'horizontal',
    disabledItem: options?.tabsDisabledItem ?? false,
  };
}
export function badgePreviewOptions(options?: DemoOptions): BadgePreviewOptions {
  const tones = ['default', 'success', 'warning', 'danger', 'info'] as const;
  return {
    mode: options?.badgeMode ?? 'status',
    variant: tones.find((value) => value === options?.variant) ?? 'default',
    target: options?.badgeTarget ?? 'avatar',
    count: options?.badgeCount ?? 8,
    showZero: options?.badgeShowZero ?? false,
  };
}
const part = (
  name: string,
  structure: string,
  purpose: string,
  ...tokens: string[]
): AnatomyPart => ({ name, structure, purpose, tokens });
/** The same names connect design decisions, public composition parts and theme controls. */
export const componentAnatomy: Record<ComponentId, AnatomyPart[]> = {
  ...enterpriseAnatomy,
  'organization-transfer': [
    part(
      '搜索区域',
      'select + input',
      '搜索应用提供的本地目录。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '组织与成员',
      'department / member selection',
      '区分持续规则和当前成员快照，标明权限与数据完整性。',
      '--f-list-row-padding',
      '--f-choice-size',
      '--f-choice-gap',
    ),
    part(
      '已选与确认',
      'selected rules + confirmation',
      '应用负责解析部门规则并校验最终权限。',
      '--f-overlay-padding',
      '--f-button-height',
      '--f-button-radius',
    ),
  ],
  button: [
    part(
      '操作容器',
      'Button → button',
      '用变体区分操作优先级；尺寸从整体密度继承。',
      '--f-button-height',
      '--f-button-radius',
    ),
    part(
      '动作标签',
      'children / default slot',
      '使用动词描述结果。图标按钮也需要可读取的名称。',
      '--f-on-primary',
      '--f-font',
    ),
    part(
      '等待状态',
      'loading → aria-busy + disabled',
      '提交期间阻止重复操作，保留清楚的动作文本。',
      '--f-primary',
    ),
  ],
  slider: [
    part(
      '数值轨道',
      'Slider → input[type=range]',
      '使用原生键盘与数值约束，配合明确标签。',
      '--f-primary',
      '--f-focus',
    ),
    part('刻度', 'marks → datalist', '可提供参考刻度；实际显示方式由浏览器决定。', '--f-muted'),
  ],
  rate: [
    part(
      '评分选项',
      'Rate → radiogroup / radio',
      '通过键盘或指针选择评分，可配置半分和清除。',
      '--f-choice-size',
      '--f-choice-gap',
      '--f-primary',
    ),
    part(
      '字段关系',
      'Field → label / description / error',
      '说明评分对象，并在必要时标记必填。',
      '--f-field-gap',
    ),
  ],
  'input-tag': [
    part(
      '输入区域',
      'InputTag → input + tags',
      '提供明确的标签说明，按 Enter 提交输入内容。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '标签与移除',
      'tag → text + remove button',
      '支持键盘和按钮删除；输入法组合期间不提交。',
      '--f-subtle',
      '--f-focus',
    ),
    part(
      '字段关系',
      'Field → label / description / error',
      '必填时至少需要一个已添加的标签。',
      '--f-field-gap',
    ),
  ],
  upload: [
    part(
      '文件选择',
      'Upload → input[type=file]',
      '支持键盘和原生文件选择；具体文件类型仅为选择器提示。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '字段关系',
      'Field → label / description / error',
      '为文件选择提供清晰的名称和说明。',
      '--f-field-gap',
    ),
  ],
  'upload-dropzone': [
    part(
      '拖放区域',
      'UploadDropzone → drop target',
      '拖放或使用按钮选择文件。',
      '--f-overlay-radius',
      '--f-overlay-padding',
      '--f-choice-gap',
    ),
    part(
      '选择操作',
      'button → input[type=file]',
      '通过键盘和文件选择器操作。',
      '--f-button-height',
      '--f-button-radius',
    ),
    part(
      '拒绝原因',
      'validation → status',
      '解释不符合限制的文件；应用负责传输和服务端校验。',
      '--f-danger',
    ),
  ],
  mention: [
    part(
      '输入区域',
      'Mention → input[role=combobox]',
      '输入 @ 后选择候选，名称以普通文本插入光标位置。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '候选列表',
      'listbox → option',
      '方向键浏览并跳过禁用项，Enter 选择，Escape 关闭。',
      '--f-nav-item-height',
      '--f-overlay-radius',
      '--f-overlay-padding',
    ),
    part(
      '字段关系',
      'Field → label / description / error',
      '为输入区域提供明确标签与说明。',
      '--f-field-gap',
    ),
  ],
  'auto-complete': [
    part(
      '输入区域',
      'AutoComplete → input[role=combobox]',
      '输入文字筛选建议，保留自由输入与原生表单能力。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '候选列表',
      'listbox → option',
      '方向键浏览并跳过禁用项，Enter 选择，Escape 关闭。',
      '--f-nav-item-height',
      '--f-overlay-radius',
      '--f-overlay-padding',
    ),
    part(
      '字段关系',
      'Field → label / description / error',
      '为输入区域提供明确标签与说明。',
      '--f-field-gap',
    ),
  ],
  'time-picker': [
    part(
      '时间输入',
      'TimePicker → input[type=time]',
      '使用本地时间字符串，支持键盘、表单约束和原生选择器。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '字段关系',
      'Field → label / description / error',
      '通过标签和说明交代时间含义。',
      '--f-field-gap',
    ),
  ],
  input: [
    part(
      '编辑区域',
      'Input → input',
      '保留原生输入、自动填充与键盘能力。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '校验边界',
      'invalid → aria-invalid',
      '错误需要说明如何修正，不能只有红色边框。',
      '--f-danger',
      '--f-border',
    ),
    part(
      '字段关系',
      'Field → label + description + error',
      '把占位符之外的标签和帮助文本关联到输入。',
      '--f-field-gap',
    ),
  ],
  textarea: [
    part(
      '编辑区域',
      'Textarea → textarea',
      '按预期内容量设置行数，允许用户调整高度。',
      '--f-input-radius',
    ),
    part(
      '字段关系',
      'Field + Textarea',
      '长文本同样需要标签、长度约束和错误说明。',
      '--f-field-gap',
      '--f-danger',
    ),
  ],
  'search-select': [
    part(
      '输入与标签',
      'SearchSelect → combobox',
      '搜索本地候选，保留清晰的名称与状态。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '候选项',
      'listbox / option',
      '键盘选择与禁用状态保持一致。',
      '--f-nav-item-height',
      '--f-choice-gap',
    ),
    part('选择浮层', 'popup', '展示候选和空状态。', '--f-overlay-radius', '--f-overlay-padding'),
  ],
  select: [
    part(
      '选择控件',
      'Select → select',
      '保留原生键盘、移动端选择与表单语义。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '选项',
      'option / optgroup',
      '使用互不重叠的名称，必要时分组。',
      '--f-text',
      '--f-surface',
    ),
  ],
  checkbox: [
    part(
      '选择标记',
      'Checkbox → input[type=checkbox]',
      '表达可同时选择的独立选项。',
      '--f-primary',
      '--f-border',
    ),
    part('选项标签', 'label', '标签也能触发选择，不依赖小面积标记。', '--f-text'),
  ],
  switch: [
    part(
      '开关轨道',
      'Switch → button[role=switch]',
      '描述开启后的功能，不用于多选或提交确认。',
      '--f-primary',
      '--f-border',
    ),
    part('状态标记', 'aria-checked + thumb', '视觉位置和可访问状态保持同步。', '--f-on-primary'),
  ],
  badge: [
    part(
      '状态文字',
      'Badge → span',
      '用文字表达状态含义，颜色仅辅助识别。',
      '--f-success',
      '--f-warning',
      '--f-danger',
    ),
    part(
      '状态底色',
      'variant',
      '降低视觉权重，避免与主要操作竞争。',
      '--f-subtle',
      '--f-primary-soft',
    ),
    part(
      '计数与圆点',
      'count / dot',
      '数字超出上限时保留完整的辅助文本，圆点应提供说明。',
      '--f-space',
      '--f-danger',
    ),
    part('包裹内容', 'Badge → child', '可标记头像、图标或文本，不改变子元素行为。', '--f-space'),
  ],
  tag: [
    part('标签内容', 'Tag → span', '以简短文字表达分类或状态。', '--f-text', '--f-subtle'),
    part(
      '关闭操作',
      'button[type=button]',
      '由使用方决定是否移除标签，关闭按钮提供可访问名称。',
      '--f-focus',
    ),
  ],
  timeline: [
    part(
      '时间节点',
      'ol → li + marker',
      '按时间顺序呈现事件，标记不作为唯一状态信息。',
      '--f-primary',
      '--f-border',
    ),
    part(
      '事件内容',
      'title / description / time',
      '为事件提供可读标题、可选说明和机器可读日期。',
      '--f-text',
      '--f-muted',
    ),
  ],
  steps: [
    part(
      '步骤标记',
      'ol → li + marker',
      '按顺序表达当前、完成、等待或错误状态，不依赖颜色传达状态。',
      '--f-primary',
      '--f-button-height',
    ),
    part(
      '步骤内容',
      'title / description',
      '为每一步提供明确标题和可选说明。',
      '--f-text',
      '--f-muted',
    ),
  ],
  tooltip: [
    part(
      '触发元素',
      'Focusable child → aria-describedby',
      '触发器保留自身语义并关联说明；禁用的原生按钮无法键盘聚焦。',
      '--f-focus',
    ),
    part(
      '文字气泡',
      'span[role=tooltip]',
      '说明应简短且非交互，指针或焦点离开及 Escape 可关闭。',
      '--f-overlay-radius',
      '--f-overlay-padding',
      '--f-surface',
      '--f-text',
    ),
  ],
  'page-header': [
    part(
      '返回操作',
      'button[type=button]',
      '返回事件由应用处理，没有回调时不会提供可用的返回按钮。',
      '--f-button-height',
      '--f-button-radius',
      '--f-focus',
    ),
    part(
      '标题与说明',
      'heading / description',
      '按页面层级选择标题级别，说明用于补充当前任务。',
      '--f-text',
      '--f-muted',
    ),
    part(
      '面包屑与操作',
      'breadcrumb / actions',
      '通过组合内容和插槽提供路径及页面动作。',
      '--f-space',
    ),
  ],
  anchor: [
    part(
      '锚点链接',
      'nav / ol / a',
      '原生链接支持键盘操作，当前项由应用指定。',
      '--f-nav-item-height',
      '--f-primary',
      '--f-focus',
    ),
    part('子级目录', 'ol', '嵌套条目使用统一的层级缩进。', '--f-tree-indent', '--f-space'),
  ],
  card: [
    part(
      '容器',
      'Card → div',
      '承载同一对象的内容，统一控制边界与内边距。',
      '--f-card-radius',
      '--f-card-padding',
    ),
    part(
      '标题区',
      'CardHeader + CardTitle + CardDescription',
      '标题说明对象，描述提供必要背景。',
      '--f-text',
      '--f-muted',
    ),
    part('内容区', 'CardContent', '容纳真正的内容，避免只为凑齐卡片填充文字。', '--f-space'),
    part('操作区', 'CardFooter', '把相关操作放在内容附近，允许窄屏换行。', '--f-space'),
  ],
  alert: [
    part(
      '反馈容器',
      'Alert → status / alert',
      '普通反馈不打断任务，紧急错误使用 alert 语义。',
      '--f-info',
      '--f-danger',
    ),
    part(
      '标题与说明',
      'title + children / default slot',
      '说明发生了什么，以及可以做什么。',
      '--f-text',
    ),
  ],
  tabs: [
    part(
      '选项列表',
      'tablist + tab',
      '在同一上下文切换内容，支持方向键与 Home / End。',
      '--f-primary',
      '--f-border',
    ),
    part('内容面板', 'tabpanel', '让激活项与面板通过 ID 关联。', '--f-surface', '--f-text'),
  ],
  dialog: [
    part(
      '模态容器',
      'Dialog → dialog.showModal()',
      '用于需要聚焦的任务，支持 Escape 和焦点恢复。',
      '--f-surface',
      '--f-radius',
    ),
    part('标题与说明', 'title + description', '清楚描述将要完成的任务。', '--f-text', '--f-muted'),
    part('操作区', 'footer / #footer', '提交、取消的顺序与其他页面保持一致。', '--f-space'),
  ],
  avatar: [
    part(
      '身份图形',
      'Avatar → image / initials',
      '图片失败时仍提供可识别的姓名或缩写。',
      '--f-primary-soft',
      '--f-primary',
    ),
    part('尺寸', 'size', '与同行文本和信息密度匹配。', '--f-space'),
    part(
      '头像组',
      'AvatarGroup',
      '聚合成员并在超过上限时显示剩余数量。',
      '--f-space',
      '--f-surface',
    ),
  ],
  collapse: [
    part(
      '标题与触发器',
      'button[aria-expanded]',
      '标识每一组内容，并提供展开和收起操作。',
      '--f-text',
      '--f-input-height',
    ),
    part(
      '内容面板',
      'region[aria-labelledby]',
      '与触发器关联，收起时隐藏。',
      '--f-surface',
      '--f-space',
    ),
    part(
      '附加操作',
      'extra / #extra-{value}',
      '提供独立操作，避免点击时意外切换面板。',
      '--f-text',
    ),
  ],
  descriptions: [
    part('字段标签', 'dt', '清楚说明当前字段的含义。', '--f-muted'),
    part('字段内容', 'dd', '展示文本或组合内容，窄屏下自动换行。', '--f-text', '--f-space'),
  ],
  comment: [
    part('作者与时间', 'author + time', '明确评论来源与时间。', '--f-text', '--f-muted'),
    part('评论内容', 'content / #content', '容纳可组合的文字和内容。', '--f-text', '--f-space'),
    part(
      '操作与回复',
      'actions / #actions + children / default slot',
      '由业务接入真实的点赞、回复等操作。',
      '--f-space',
    ),
  ],
  statistic: [
    part('指标名称', 'title', '说明数值代表的内容。', '--f-muted'),
    part('数值与单位', 'value + prefix + suffix', '保留准确的数值、单位与精度。', '--f-text'),
    part('趋势说明', 'trend + trendText', '趋势方向以文字语义表达，不仅依赖颜色。', '--f-muted'),
  ],
  image: [
    part('图片', 'img + alt', '提供准确的替代文字与适合内容的比例。', '--f-surface', '--f-radius'),
    part('图注', 'figcaption / #caption', '为图片补充必要说明。', '--f-muted', '--f-space'),
    part(
      '查看大图',
      'button + dialog',
      '可选打开大图，支持 Escape 与关闭后焦点恢复。',
      '--f-surface',
      '--f-border',
    ),
  ],
  'back-top': [
    part(
      '返回按钮',
      'button',
      '超过设定的滚动距离后出现，激活时返回指定容器位置。',
      '--f-button-height',
      '--f-button-radius',
      '--f-primary',
    ),
  ],
  'resize-box': [
    part('面板', 'first / second', '两个面板共享空间，内容由应用提供。', '--f-text'),
    part(
      '分隔条',
      'separator',
      '拖动或使用方向键调整占比，Home / End 到达边界。',
      '--f-resize-handle-size',
      '--f-border',
      '--f-primary',
      '--f-focus',
    ),
  ],
  popover: [
    part(
      '触发按钮',
      'button',
      '用简洁文字说明打开的内容，按钮内不要再放按钮。',
      '--f-border',
      '--f-radius',
    ),
    part(
      '浮层',
      'dialog',
      '承载可交互内容，支持 Escape 关闭与焦点恢复；位置暂不自动避让。',
      '--f-surface',
      '--f-overlay-radius',
      '--f-overlay-padding',
    ),
    part(
      '标题与内容',
      'title + content / slots',
      '提供浮层名称和必要操作。',
      '--f-text',
      '--f-space',
    ),
  ],
  carousel: [
    part(
      '幻灯片',
      'group[aria-roledescription]',
      '每一项内容有可理解的顺序或名称。',
      '--f-surface',
      '--f-radius',
    ),
    part('切换操作', 'button', '由用户主动切换，支持方向键和边界状态。', '--f-text', '--f-border'),
    part(
      '指示器',
      'button[aria-current]',
      '标记当前位置，也可以直接跳转。',
      '--f-primary',
      '--f-space',
    ),
  ],
  separator: [
    part(
      '分组边界',
      'Separator → role=separator',
      '用少量边界区分内容，避免每一行都加线。',
      '--f-border',
    ),
  ],
  table: [
    part('表格说明', 'TableCaption → caption', '说明这一组数据的用途。', '--f-muted'),
    part(
      '列标题',
      'TableHeader + TableRow + TableHead',
      '列名稳定且可对照，表头保留 scope 语义。',
      '--f-subtle',
      '--f-table-cell-padding',
    ),
    part(
      '数据行',
      'TableBody + TableRow + TableCell',
      '行高与内边距统一，长表格在局部滚动。',
      '--f-table-row-height',
      '--f-table-cell-padding',
    ),
    part(
      '汇总区域',
      'TableFooter → tfoot',
      '将汇总与数据区区分，避免把统计伪装为数据行。',
      '--f-border',
    ),
  ],
  skeleton: [
    part(
      '结构占位',
      'Skeleton → aria-hidden',
      '保留即将出现的内容结构，不生成虚假数据。',
      '--f-subtle',
      '--f-radius',
    ),
    part(
      '加载说明',
      'surrounding role=status',
      '由外层说明加载内容，避免每条占位重复播报。',
      '--f-muted',
    ),
  ],
  progress: [
    part('进度轨道', 'Progress → role=progressbar', '只在比例可确定时呈现数值。', '--f-subtle'),
    part('已完成区域', 'value / max', '将实际任务数值映射到长度与可访问属性。', '--f-primary'),
    part(
      '圆环轨道',
      'type=circle',
      '圆环尺寸与粗细遵循组件规则。',
      '--f-progress-circle-size',
      '--f-progress-circle-stroke',
    ),
  ],
  field: [
    part(
      '标签',
      'Field label → label[for]',
      '标签始终可见；占位符不能替代它。',
      '--f-field-label-size',
      '--f-text',
    ),
    part(
      '说明',
      'description → aria-describedby',
      '在输入之前解释格式和用途。',
      '--f-field-gap',
      '--f-muted',
    ),
    part(
      '校验信息',
      'error → aria-invalid + aria-describedby',
      '说明修正方式，自动与当前控件关联。',
      '--f-danger',
    ),
    part(
      '输入控件',
      'Input / Textarea / Select / NumberInput / RadioGroup',
      '一个 Field 包含一个可标记控件或单选组，自动继承 required 和 disabled。',
      '--f-input-height',
    ),
  ],
  'input-group': [
    part(
      '组合容器',
      'InputGroup',
      '让输入、单位与操作共同组成一个可理解的字段。',
      '--f-input-radius',
      '--f-border',
    ),
    part(
      '前后缀',
      'InputAddon',
      '放置稳定的协议、币种或单位；帮助说明仍由 Field 关联。',
      '--f-subtle',
      '--f-muted',
    ),
    part('输入核心', 'Input', '保留输入的焦点、键盘和表单行为。', '--f-input-height'),
  ],
  'radio-group': [
    part(
      '选项组',
      'RadioGroup → radiogroup',
      '在互斥选项不多时并列展示，避免把单选当多选。',
      '--f-field-gap',
    ),
    part(
      '单个选项',
      'input[type=radio] + label',
      '同名原生 radio 支持方向键切换和表单值。',
      '--f-primary',
      '--f-border',
    ),
    part(
      '补充说明',
      'options[].description',
      '说明差异，让用户不用试选就能做出判断。',
      '--f-muted',
    ),
  ],
  'number-input': [
    part(
      '数字字段',
      'NumberInput → input[type=number]',
      '允许清空与手动输入；边界在步进和失焦时归一化。',
      '--f-input-height',
      '--f-input-radius',
    ),
    part(
      '步进操作',
      'decrement / increment buttons',
      '按 step 增减，在边界禁用对应方向。',
      '--f-primary',
      '--f-border',
    ),
  ],
  breadcrumb: [
    part('层级路径', 'Breadcrumb → nav + ol', '表达页面位置，不用它替代主要导航。', '--f-muted'),
    part('上级入口', 'items[].href → a', '只有真正可以导航的层级才提供链接。', '--f-primary'),
    part('当前位置', 'aria-current=page', '最后一级是当前页面，保留清楚的名称。', '--f-text'),
  ],
  pagination: [
    part(
      '前后页',
      'Previous / Next buttons',
      '边界禁用；切换后更新真实数据及当前位置。',
      '--f-border',
      '--f-button-radius',
    ),
    part(
      '页码',
      'page + total + pageSize',
      'total 是数据条数，页数由 pageSize 推导。',
      '--f-primary',
      '--f-primary-soft',
    ),
    part('省略段', 'siblingCount', '保留首尾和当前附近页面，避免大量按钮挤满一行。', '--f-muted'),
  ],
  'empty-state': [
    part(
      '状态说明',
      'EmptyState title + description',
      '区分没有数据、无搜索结果与没有权限。',
      '--f-text',
      '--f-muted',
    ),
    part('下一步', 'action / #action', '提供一个与空状态原因对应的动作。', '--f-primary'),
    part('辅助图形', 'icon / #icon', '可选图形辅助识别，不承担唯一信息。', '--f-muted'),
  ],
  spinner: [
    part('活动指示', 'Spinner → status', '比例未知时使用；不把等待伪装为进度。', '--f-primary'),
    part('状态名称', 'label', '说明正在加载什么，让辅助技术也能理解等待。', '--f-text'),
  ],
};

function configuredComponentCode(
  id: ComponentId,
  framework: Framework,
  o: DemoOptions,
): string | null {
  const vue = framework === 'vue';
  const disabled = o.state === 'disabled' ? ' disabled' : '';
  const invalid = o.state === 'invalid';
  const control = ` controlSize="${o.size}"${disabled}${invalid ? ' invalid' : ''}`;
  const error = invalid ? ' error="请检查输入内容后重试。"' : '';
  const model = (state: string, setter: string, initial: string) =>
    vue
      ? { attr: `v-model="${state}"`, state: `const ${state} = ref(${initial});` }
      : {
          attr: `value={${state}} onValueChange={${setter}}`,
          state: `const [${state}, ${setter}] = useState(${initial});`,
        };
  let imports = '';
  let body = '';
  let state = '';
  switch (id) {
    case 'button':
      imports = 'Button';
      {
        const content = o.buttonContent ?? 'text';
        const icon = '<span aria-hidden="true">+</span>';
        const children = `${content === 'leading' || content === 'icon' ? icon : ''}${content === 'icon' ? '' : '保存更改'}${content === 'trailing' ? icon : ''}`;
        const iconProps =
          content === 'icon' ? `${vue ? ' icon-only' : ' iconOnly'} aria-label="保存更改"` : '';
        body = `<Button variant="${o.variant}" size="${o.buttonSize ?? 'md'}" tone="${o.buttonTone ?? 'standard'}" shape="${o.buttonShape ?? 'default'}"${iconProps}${disabled}${o.state === 'loading' ? ' loading' : ''}>${children}</Button>`;
      }
      break;
    case 'input': {
      const kind = o.inputKind ?? 'text';
      const addon = o.inputAddon ?? 'none';
      if (kind === 'password') {
        imports = 'Field, PasswordInput';
        body = `<Field label="密码"${error}>\n  <PasswordInput${control} placeholder="请输入密码" />\n</Field>`;
      } else if (kind === 'search') {
        imports = 'Field, SearchInput';
        body = `<Field label="搜索成员"${error}>\n  <SearchInput${control} placeholder="输入成员名称" ${vue ? '@search="search"' : 'onSearch={(value) => console.log(value)}'} />\n</Field>`;
        if (vue) state = 'function search(value: string) { console.log(value); }';
      } else if (addon !== 'none') {
        imports = 'Field, InputGroup, InputAddon, Input';
        const before =
          addon === 'start' || addon === 'both' ? '\n    <InputAddon>https://</InputAddon>' : '';
        const after =
          addon === 'end' || addon === 'both' ? '\n    <InputAddon>.example.com</InputAddon>' : '';
        body = `<Field label="工作空间地址"${error}>\n  <InputGroup>${before}\n    <Input${control} placeholder="my-team" />${after}\n  </InputGroup>\n</Field>`;
      } else {
        imports = 'Field, Input';
        body = `<Field label="工作邮箱"${error}>\n  <Input${control} type="email" placeholder="you@company.com" />\n</Field>`;
      }
      break;
    }
    case 'slider': {
      imports = 'Field, Slider';
      const marks = o.sliderMarks
        ? vue
          ? " :marks=\"[{value: 0, label: '0'}, {value: 50, label: '50'}, {value: 100, label: '100'}]\""
          : " marks={[{value: 0, label: '0'}, {value: 50, label: '50'}, {value: 100, label: '100'}]}"
        : '';
      if (vue) state = 'const volume = ref(40);';
      body = `<Field label="音量">\n  <Slider ${vue ? 'v-model="volume" :min="0" :max="100" :step="10"' : 'defaultValue={40} min={0} max={100} step={10}'}${disabled}${marks} />\n</Field>`;
      break;
    }
    case 'time-picker':
      imports = 'Field, TimePicker';
      if (vue) state = "const time = ref('09:30');";
      body = `<Field label="开始时间"${error}>\n  <TimePicker${control} name="start" min="09:00" max="18:00" ${vue ? 'v-model="time" :step="300"' : 'defaultValue="09:30" step={300}'} />\n</Field>`;
      break;
    case 'textarea':
      imports = 'Field, Textarea';
      body = `<Field label="项目描述"${error}>\n  <Textarea${control} ${vue ? ':rows="4"' : 'rows={4}'} placeholder="介绍一下你的项目…" />\n</Field>`;
      break;
    case 'select':
      imports = 'Field, Select';
      body = `<Field label="团队角色"${error}>\n  <Select${control}${vue ? ' v-model="value"' : ' defaultValue="designer"'}>\n    <option value="designer">设计师</option>\n    <option value="developer">开发工程师</option>\n  </Select>\n</Field>`;
      if (vue) state = "const value = ref('designer');";
      break;
    case 'checkbox':
    case 'switch': {
      const name = id === 'checkbox' ? 'Checkbox' : 'Switch';
      imports = name;
      body = `<${name} label="${id === 'checkbox' ? '接收产品更新' : '邮件通知'}"${disabled}${id === 'checkbox' && o.checkboxIndeterminate ? ' indeterminate' : ''} ${vue ? 'v-model="checked"' : 'defaultChecked'} />`;
      if (vue) state = 'const checked = ref(true);';
      break;
    }
    case 'badge':
      imports = 'Badge';
      body = `<Badge variant="${o.variant}">项目状态</Badge>`;
      break;
    case 'alert':
      imports = 'Alert';
      body = `<Alert variant="${o.variant}" title="团队配置">这里显示与当前任务相关的信息。</Alert>`;
      break;
    case 'avatar': {
      const shape = o.avatarShape ?? 'circle';
      const avatar = (name: string) =>
        `<Avatar name="${name}" size="${o.size}" shape="${shape}" />`;
      if (o.avatarMode === 'group') {
        imports = 'Avatar, AvatarGroup';
        const max = o.avatarMax ?? 3;
        body = `<AvatarGroup label="项目成员" size="${o.size}" shape="${shape}" ${vue ? `:max="${max}"` : `max={${max}}`}>\n${['林晓', 'Alex Chen', '王宁', '张悦'].map((name) => `  ${avatar(name)}`).join('\n')}\n</AvatarGroup>`;
      } else {
        imports = 'Avatar';
        body = avatar('林晓');
      }
      break;
    }
    case 'collapse': {
      imports = 'Collapse';
      const items =
        "[{ value: 'one', label: '项目说明', content: '设计与开发保持同步。' }, { value: 'two', label: '团队成员', content: '查看并管理成员。' }, { value: 'three', label: '更多设置', content: '此项目暂不可用。', disabled: true }]";
      body = `<Collapse ${vue ? `:items="${items}" :default-value="['one']"` : `items={${items}} defaultValue={['one']}`} expandIconPosition="${o.collapseIcon ?? 'start'}"${o.collapseMode === 'accordion' ? ' accordion' : ''}${disabled} />`;
      break;
    }
    case 'separator':
      imports = 'Separator';
      body = `<div style=${vue ? '"display:flex;flex-wrap:wrap;align-items:center;gap:12px;min-height:64px"' : "{{display:'flex',flexWrap:'wrap',alignItems:'center',gap:12,minHeight:64}}"}>\n  <span>项目设置</span>\n  <Separator orientation="${o.orientation}" />\n  <span>团队成员</span>\n</div>`;
      break;
    case 'progress':
      imports = 'Progress';
      body = `<Progress ${vue ? `:value="${o.progress}"` : `value={${o.progress}}`} label="文件上传示例" />`;
      break;
    case 'field':
      imports = 'Field, Input';
      body = `<Field label="工作邮箱" description="用于接收团队邀请" layout="${o.fieldLayout ?? 'vertical'}"${error} required${disabled}>\n  <Input controlSize="${o.size}" type="email" placeholder="you@company.com" />\n</Field>`;
      break;
    case 'input-group':
      imports = 'Field, InputGroup, InputAddon, Input';
      body = `<Field label="工作空间地址"${error}>\n  <InputGroup>\n    <InputAddon>https://</InputAddon>\n    <Input${control} placeholder="my-team" />\n    <InputAddon>.example.com</InputAddon>\n  </InputGroup>\n</Field>`;
      break;
    case 'number-input': {
      imports = 'Field, NumberInput';
      state = vue
        ? "const quantity = ref<number | ''>(4);"
        : "const [quantity, setQuantity] = useState<number | ''>(4);";
      body = `<Field label="成员席位" description="可以设置 1 至 20 个席位"${error}>\n  <NumberInput${control} ${vue ? 'v-model="quantity" :min="1" :max="20" :step="1"' : 'value={quantity} onValueChange={setQuantity} min={1} max={20} step={1}'} />\n</Field>`;
      break;
    }
    case 'radio-group': {
      imports = 'RadioGroup';
      const m = model('access', 'setAccess', "'team'");
      state = m.state;
      const values =
        "[{value:'team',label:'团队可见',description:'仅组织成员可以访问'},{value:'private',label:'仅自己',description:'邀请后再开放访问'},{value:'public',label:'公开访问',disabled:true}]";
      body = `<RadioGroup name="access" label="访问权限" orientation="${o.orientation}"${disabled}\n  ${m.attr}\n  ${vue ? `:options="${values}"` : `options={${values}}`} />`;
      break;
    }
    case 'pagination':
      imports = 'Pagination';
      state = vue ? 'const page = ref(1);' : 'const [page, setPage] = useState(1);';
      body = `<Pagination ${vue ? 'v-model:page="page" :total="128" :page-size="10"' : 'page={page} total={128} pageSize={10} onPageChange={setPage}'}${disabled} />`;
      break;
    case 'spinner':
      imports = 'Spinner';
      body = `<Spinner label="正在加载项目" size="${o.size}" />`;
      break;
    default:
      return null;
  }
  if (vue)
    return `<script setup lang="ts">\n${state ? "import { ref } from 'vue';\n" : ''}import { ${imports} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n${state}\n</script>\n\n<template>\n${body}\n</template>`;
  return `${state ? "import { useState } from 'react';\n" : ''}import { ${imports} } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n${state ? `  ${state}\n` : ''}  return (\n${body
    .split('\n')
    .map((line) => '    ' + line)
    .join('\n')}\n  );\n}`;
}

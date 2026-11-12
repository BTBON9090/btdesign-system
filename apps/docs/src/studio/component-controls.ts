import { componentGeometry, type ComponentOverrides, type ThemeConfig } from '@btdesign/tokens';
import { catalog, type ComponentId } from '../catalog';

/** The canvas, picker and inspector share this target. A missing part selects the first part. */
export type EditorSelection = { component: ComponentId | 'page'; part?: string };
type ComponentGroup = keyof ComponentOverrides;
export type ControlDefinition = {
  group: ComponentGroup;
  property: string;
  label: string;
  token: string;
  min: number;
  max: number;
};
const rule = (
  group: ComponentGroup,
  property: string,
  label: string,
  token: string,
  min: number,
  max: number,
): ControlDefinition => ({ group, property, label, token, min, max });
const geometry = <G extends keyof typeof componentGeometry>(
  group: G,
  property: keyof (typeof componentGeometry)[G],
  label: string,
): ControlDefinition => {
  const spec = componentGeometry[group][property] as { token: string; min: number; max: number };
  return rule(group, String(property), label, spec.token, spec.min, spec.max);
};
export const controlDefinitions = {
  buttonRadius: rule('button', 'radius', '圆角', '--f-button-radius', 0, 20),
  buttonHeight: rule('button', 'height', '基准高度', '--f-button-height', 28, 56),
  inputRadius: rule('input', 'radius', '圆角', '--f-input-radius', 0, 20),
  inputHeight: rule('input', 'height', '基准高度', '--f-input-height', 28, 56),
  cardRadius: rule('card', 'radius', '圆角', '--f-card-radius', 0, 20),
  cardPadding: rule('card', 'padding', '内容内边距', '--f-card-padding', 8, 40),
  fieldGap: rule('field', 'gap', '标签与内容间距', '--f-field-gap', 4, 20),
  fieldLabelSize: rule('field', 'labelSize', '标签字号', '--f-field-label-size', 11, 16),
  fieldLabelWidth: rule('field', 'labelWidth', '标签宽度', '--f-field-label-width', 64, 240),
  tablePadding: rule('table', 'cellPadding', '单元格内边距', '--f-table-cell-padding', 6, 24),
  tableRowHeight: rule('table', 'rowHeight', '最小行高', '--f-table-row-height', 28, 72),
  formGap: geometry('form', 'gap', '字段间距'),
  formSectionGap: geometry('form', 'sectionGap', '分组间距'),
  choiceSize: geometry('choice', 'size', '标记尺寸'),
  choiceGap: geometry('choice', 'gap', '选项间距'),
  calendarCellSize: geometry('calendar', 'cellSize', '日期尺寸'),
  calendarGap: geometry('calendar', 'gap', '日期间距'),
  tabsMinHeight: geometry('tabs', 'minHeight', '标签最小高度'),
  tabsPadding: geometry('tabs', 'paddingInline', '左右留白'),
  tabsFontSize: geometry('tabs', 'fontSize', '文字字号'),
  tabsGap: geometry('tabs', 'gap', '标签间距'),
  tabsIconGap: geometry('tabs', 'iconGap', '图标间距'),
  treeRowHeight: geometry('tree', 'rowHeight', '节点行高'),
  treeIndent: geometry('tree', 'indent', '层级缩进'),
  navigationHeight: geometry('navigation', 'itemHeight', '导航项高度'),
  navigationPadding: geometry('navigation', 'padding', '左右留白'),
  systemHeaderHeight: geometry('systemHeader', 'minHeight', '顶栏最小高度'),
  systemHeaderPadding: geometry('systemHeader', 'paddingInline', '左右留白'),
  systemHeaderGap: geometry('systemHeader', 'gap', '区域间距'),
  paginationSize: geometry('pagination', 'size', '分页基准尺寸'),
  paginationGap: geometry('pagination', 'gap', '分页间距'),
  paginationFontSize: geometry('pagination', 'fontSize', '文字字号'),
  listPadding: geometry('list', 'rowPadding', '条目内边距'),
  listGap: geometry('list', 'gap', '条目间距'),
  breadcrumbItemGap: geometry('breadcrumb', 'itemGap', '层级间距'),
  breadcrumbSeparatorGap: geometry('breadcrumb', 'separatorGap', '分隔符间距'),
  breadcrumbFontSize: geometry('breadcrumb', 'fontSize', '文字字号'),
  fileThumbnailSize: geometry('fileList', 'thumbnailSize', '缩略图尺寸'),
  filePictureCardSize: geometry('fileList', 'pictureCardSize', '卡片最小宽度'),
  filePictureRadius: geometry('fileList', 'pictureRadius', '图片圆角'),
  overlayRadius: geometry('overlay', 'radius', '浮层圆角'),
  overlayPadding: geometry('overlay', 'padding', '浮层内边距'),
  resizeHandleSize: geometry('resize', 'handleSize', '分隔条宽度'),
  progressLineHeight: geometry('progress', 'lineHeight', '线条粗细'),
  progressCircleSize: geometry('progress', 'circleSize', '圆环尺寸'),
  progressCircleStroke: geometry('progress', 'circleStroke', '圆环粗细'),
  progressMiniSize: geometry('progress', 'miniSize', '小圆环尺寸'),
  progressMiniStroke: geometry('progress', 'miniStroke', '小圆环粗细'),
} as const;
export type ControlId = keyof typeof controlDefinitions;
export type ControlPart = { id: string; label: string; controls: ControlId[]; anatomy?: number[] };
export type ComponentControlDefinition = {
  id: ComponentId;
  label: string;
  name: string;
  parts: ControlPart[];
};
const part = (
  id: string,
  label: string,
  controls: ControlId[] = [],
  anatomy?: number[],
): ControlPart => ({ id, label, controls, anatomy });
const input = () => part('input', '输入区域', ['inputHeight', 'inputRadius'], [0]);
const field = () => part('field', '标签与说明', ['fieldLabelSize', 'fieldGap', 'fieldLabelWidth']);
const calendar = () => part('calendar', '日期网格', ['calendarCellSize', 'calendarGap']);
const overlay = () => part('overlay', '选择浮层', ['overlayRadius', 'overlayPadding']);
const choice = () => part('selection', '勾选标记', ['choiceSize']);
const tree = () => part('nodes', '树节点', ['treeRowHeight', 'treeIndent']);
const button = () => part('button', '按钮外观', ['buttonHeight', 'buttonRadius']);
const navigation = () => part('items', '导航项', ['navigationHeight', 'navigationPadding']);
const list = () => part('items', '列表条目', ['listPadding', 'listGap']);
/** Controls are attached to real CSS consumers, not guessed from a component's category. */
const partsByComponent: Record<ComponentId, ControlPart[]> = {
  'organization-transfer': [
    input(),
    part('items', '组织与成员', ['listPadding', 'choiceSize', 'choiceGap'], [1]),
    part(
      'container',
      '容器与操作',
      ['overlayPadding', 'overlayRadius', 'buttonHeight', 'buttonRadius'],
      [2],
    ),
  ],
  button: [button(), part('label', '文字与状态', [], [1, 2])],
  'button-group': [button(), part('spacing', '按钮间距', ['choiceGap'])],
  input: [input(), field(), part('validation', '校验状态', [], [1])],
  'auto-complete': [
    input(),
    part('options', '候选项', ['navigationHeight'], [1]),
    overlay(),
    field(),
  ],
  upload: [input(), field()],
  'upload-dropzone': [
    part('dropzone', '拖放区域', ['overlayRadius', 'overlayPadding', 'choiceGap'], [0]),
    button(),
    part('validation', '拒绝原因', [], [2]),
  ],
  'upload-file-list': [
    part('items', '文件条目', ['listPadding', 'listGap', 'choiceGap'], [0]),
    part('thumbnail', '图片列表缩略图', ['fileThumbnailSize', 'filePictureRadius'], [1]),
    part('picture-card', '照片墙卡片', ['filePictureCardSize', 'filePictureRadius'], [2]),
    part('actions', '文件操作', ['buttonHeight', 'buttonRadius'], [3]),
  ],
  mention: [input(), part('options', '候选项', ['navigationHeight'], [1]), overlay(), field()],
  'input-tag': [input(), part('tags', '标签与移除', [], [1]), field()],
  slider: [part('track', '滑块与轨道', [], [0, 1]), field()],
  rate: [part('icons', '评分选项', ['choiceSize', 'choiceGap'], [0]), field()],
  'time-picker': [input(), field()],
  textarea: [part('input', '输入区域', ['inputRadius'], [0]), field()],
  select: [input(), part('options', '选项文字', [], [1])],
  'search-select': [
    input(),
    part('options', '候选项', ['navigationHeight', 'choiceGap'], [1]),
    overlay(),
  ],
  checkbox: [part('selection', '勾选与标签', ['choiceSize', 'choiceGap'], [0, 1])],
  switch: [part('track', '开关与状态', [], [0, 1])],
  badge: [
    part('status', '状态与文字', [], [0, 1]),
    part('indicator', '计数与圆点', [], [2]),
    part('target', '包裹内容', [], [3]),
  ],
  tag: [part('content', '标签与状态', [], [0]), part('close', '关闭操作', [], [1])],
  timeline: [part('marker', '时间节点', [], [0]), part('content', '事件内容', [], [1])],
  steps: [part('marker', '步骤标记', ['buttonHeight'], [0]), part('content', '步骤内容', [], [1])],
  tooltip: [
    part('trigger', '触发元素', [], [0]),
    part('content', '文字气泡', ['overlayRadius', 'overlayPadding'], [1]),
  ],
  'page-header': [
    part('back', '返回操作', ['buttonHeight', 'buttonRadius'], [0]),
    part('title', '标题与说明', [], [1]),
    part('actions', '面包屑与操作', [], [2]),
    part('guide', '帮助指引', ['buttonHeight', 'buttonRadius']),
    part('tabs', '底部标签栏', ['tabsMinHeight', 'tabsPadding', 'tabsGap', 'tabsFontSize']),
  ],
  anchor: [part('links', '锚点链接', [], [0]), part('nested', '子级目录', ['treeIndent'], [1])],
  card: [
    part('container', '卡片容器', ['cardRadius', 'cardPadding'], [0]),
    part('content', '标题与内容', [], [1, 2, 3]),
  ],
  collapse: [
    part('heading', '面板标题', ['inputHeight'], [0]),
    part('panel', '面板内容', [], [1]),
    part('actions', '附加操作', [], [2]),
  ],
  descriptions: [part('labels', '字段标签', [], [0]), part('values', '字段内容', [], [1])],
  comment: [
    part('identity', '作者与时间', [], [0]),
    part('content', '评论内容', [], [1]),
    part('actions', '操作与回复', [], [2]),
  ],
  statistic: [
    part('title', '指标名称', [], [0]),
    part('value', '数值与单位', [], [1]),
    part('trend', '趋势说明', [], [2]),
  ],
  image: [
    part('image', '图片与比例', [], [0]),
    part('caption', '图注', [], [1]),
    part('preview', '查看大图', [], [2]),
  ],
  'back-top': [part('button', '返回按钮', ['buttonHeight', 'buttonRadius'], [0])],
  'resize-box': [
    part('panes', '面板内容', [], [0]),
    part('handle', '分隔条', ['resizeHandleSize'], [1]),
  ],
  popover: [
    part('trigger', '触发按钮', ['buttonHeight', 'buttonRadius'], [0]),
    part('overlay', '浮层', ['overlayRadius', 'overlayPadding'], [1]),
    part('content', '标题与内容', [], [2]),
  ],
  carousel: [
    part('slides', '幻灯片', [], [0]),
    part('controls', '切换操作', [], [1]),
    part('indicators', '指示器', [], [2]),
  ],
  alert: [part('content', '提示与状态', [], [0, 1])],
  tabs: [
    part('items', '标签', ['tabsMinHeight', 'tabsPadding', 'tabsFontSize'], [0]),
    part('spacing', '标签间距', ['tabsGap'], [0]),
    part('icon', '装饰图标', ['tabsIconGap'], [1]),
    part('panel', '内容面板', [], [2]),
  ],
  dialog: [part('container', '对话框', [], [0]), part('content', '标题与操作', [], [1, 2])],
  avatar: [part('identity', '头像', [], [0, 1]), part('group', '头像组', [], [2])],
  separator: [part('line', '分隔线', [], [0])],
  table: [
    part('cells', '单元格', ['tablePadding'], [1]),
    part('rows', '数据行', ['tableRowHeight'], [2]),
    part('caption', '说明与汇总', [], [0, 3]),
  ],
  skeleton: [part('placeholder', '占位区域', [], [0, 1])],
  progress: [
    part('line', '线形轨道', ['progressLineHeight'], [0, 1]),
    part('circle', '圆环轨道', ['progressCircleSize', 'progressCircleStroke'], [2]),
    part('mini', '小圆环轨道', ['progressMiniSize', 'progressMiniStroke'], [2]),
  ],
  field: [
    part('label', '标签', ['fieldLabelSize', 'fieldLabelWidth'], [0]),
    part('spacing', '标签与内容间距', ['fieldGap'], [1]),
    part('validation', '校验信息', [], [2]),
  ],
  'input-group': [input(), part('addon', '前后缀', [], [1])],
  'radio-group': [
    part('selection', '单选标记', ['choiceSize'], [1]),
    part('spacing', '选项间距', ['choiceGap', 'fieldGap'], [0]),
  ],
  'number-input': [input(), part('stepper', '步进操作', ['inputHeight'], [1])],
  breadcrumb: [
    part('path', '路径与文字', ['breadcrumbItemGap', 'breadcrumbFontSize'], [0, 1, 2]),
    part('separator', '分隔符', ['breadcrumbSeparatorGap'], [3]),
  ],
  pagination: [
    part(
      'pages',
      '页码与箭头',
      ['paginationSize', 'paginationGap', 'paginationFontSize', 'buttonRadius'],
      [0, 1],
    ),
    part('size', '每页条数', ['inputHeight', 'inputRadius']),
    part('jumper', '跳转输入', ['inputHeight', 'inputRadius']),
    part('total', '总条数', ['paginationFontSize']),
  ],
  'empty-state': [part('content', '说明与操作', [], [0, 1, 2])],
  spinner: [part('indicator', '加载指示', [], [0, 1])],
  form: [
    part('layout', '字段与分组', ['formGap', 'formSectionGap'], [0, 2]),
    field(),
    input(),
    part('actions', '操作区', ['buttonHeight', 'buttonRadius', 'choiceGap']),
    part('errors', '错误摘要', ['inputRadius', 'overlayPadding']),
  ],
  calendar: [
    calendar(),
    part(
      'navigation',
      '月份导航',
      ['buttonHeight', 'buttonRadius', 'inputHeight', 'inputRadius'],
      [1],
    ),
  ],
  'date-picker': [input(), calendar(), overlay(), field()],
  'date-range-picker': [
    input(),
    calendar(),
    overlay(),
    part('spacing', '起止间距', ['choiceGap']),
    field(),
  ],
  radio: [part('selection', '单选与标签', ['choiceSize', 'choiceGap'], [0])],
  'checkbox-group': [
    part('selection', '勾选标记', ['choiceSize'], [0]),
    part('spacing', '选项间距', ['choiceGap'], [0, 1]),
  ],
  'toggle-group': [button(), part('spacing', '选项间距', ['choiceGap'])],
  segmented: [button()],
  list: [list(), part('actions', '条目操作', ['choiceGap'], [2])],
  'file-list': [
    list(),
    part('actions', '文件操作', ['buttonHeight', 'buttonRadius', 'choiceGap'], [1]),
  ],
  tree: [
    tree(),
    part('guides', '层级连接线', ['treeIndent'], [0]),
    choice(),
    part('search', '搜索框', ['inputHeight', 'inputRadius']),
  ],
  'tree-select': [input(), tree(), choice(), overlay()],
  cascader: [
    input(),
    part('nodes', '级联选项', ['treeRowHeight', 'choiceGap'], [0]),
    choice(),
    overlay(),
  ],
  'org-picker': [input(), tree(), choice(), overlay()],
  transfer: [
    part('panels', '左右面板', ['cardRadius', 'overlayPadding']),
    part('selection', '选项与间距', ['choiceSize', 'choiceGap', 'listPadding']),
    input(),
    button(),
  ],
  'sidebar-nav': [
    navigation(),
    part('hierarchy', '导航层级', ['treeIndent'], [1]),
    part('collapse', '收起按钮', ['buttonHeight', 'buttonRadius'], [2]),
    part('popup', '收起浮层', ['overlayRadius', 'overlayPadding'], [3]),
  ],
  'top-nav': [navigation()],
  'system-header': [
    part('header', '顶栏布局', ['systemHeaderHeight', 'systemHeaderPadding', 'systemHeaderGap']),
    part('search', '搜索区域', ['inputHeight', 'inputRadius']),
    part('actions', '快捷操作', ['buttonHeight', 'buttonRadius']),
    part('menu', '菜单浮层', ['overlayRadius', 'overlayPadding']),
  ],
  'workspace-tabs': [
    part('tabs', '页签布局', ['tabsMinHeight', 'tabsPadding', 'tabsGap', 'tabsFontSize']),
    part('close', '关闭按钮', ['buttonHeight', 'buttonRadius']),
    part('scroll', '滚动按钮', ['buttonHeight', 'buttonRadius']),
    part('more', '更多菜单', ['buttonHeight', 'buttonRadius', 'overlayRadius', 'overlayPadding']),
  ],
  'dropdown-menu': [
    button(),
    navigation(),
    overlay(),
    part('checkmark', '勾选标记', ['choiceSize', 'choiceGap'], [2]),
  ],
  'data-table': [
    part('table', '表格密度', ['tablePadding', 'tableRowHeight'], [0, 1]),
    part('query', '查询与编辑', ['inputHeight', 'inputRadius'], [2, 3]),
    part('selection', '行选择', ['choiceSize'], [2]),
    part('menu', '列设置浮层', ['overlayRadius', 'overlayPadding', 'choiceGap'], [2]),
    part('container', '外框与详情', ['cardRadius', 'listPadding'], [3]),
    part('hierarchy', '行层级', ['treeIndent'], [1]),
  ],
};
export const componentControls = Object.fromEntries(
  catalog.map((item) => [
    item.id,
    {
      id: item.id,
      label: item.cn,
      name: item.name,
      parts: partsByComponent[item.id],
    },
  ]),
) as Record<ComponentId, ComponentControlDefinition>;
export function getSelectedPart(selection: EditorSelection): ControlPart | null {
  if (selection.component === 'page') return null;
  const definition = componentControls[selection.component];
  return definition.parts.find((item) => item.id === selection.part) ?? definition.parts[0];
}
export function selectionLabel(selection: EditorSelection): string {
  return selection.component === 'page' ? '整体样式' : componentControls[selection.component].label;
}
export function partHasOverrides(theme: ThemeConfig, selection: EditorSelection): boolean {
  return (getSelectedPart(selection)?.controls ?? []).some((id) => {
    const control = controlDefinitions[id];
    return (
      (theme.components?.[control.group] as Record<string, number> | undefined)?.[
        control.property
      ] !== undefined
    );
  });
}
/** Reset only fields shown for this part; sibling rules and other component groups are retained. */
export function resetPartPatch(selection: EditorSelection) {
  const components: Record<string, Record<string, null>> = {};
  for (const id of getSelectedPart(selection)?.controls ?? []) {
    const { group, property } = controlDefinitions[id];
    (components[group] ??= {})[property] = null;
  }
  return { components };
}
export function sharedControlLabels(selection: EditorSelection): string[] {
  const ids = new Set(getSelectedPart(selection)?.controls ?? []);
  if (!ids.size) return [];
  return catalog
    .filter(
      (item) =>
        item.id !== selection.component &&
        componentControls[item.id].parts.some((part) => part.controls.some((id) => ids.has(id))),
    )
    .map((item) => item.cn);
}

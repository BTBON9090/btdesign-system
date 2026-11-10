/** Shared explanations used by the Studio inspector and the exported AI context. */
export interface SelectionKnowledge {
  title: string;
  designIntent: string;
  implementation: string;
  tokenKeys: string[];
  guidelines: string[];
  component: string;
  docPath: string;
}
export const selectionKnowledge: Record<
  'page' | 'button' | 'input' | 'card' | 'table',
  SelectionKnowledge
> = {
  page: {
    title: '页面结构',
    designIntent: '用标题说明任务，把主要动作放在任务附近。分组与留白帮助用户理解信息之间的关系。',
    implementation:
      'main 包含页面标题、section 内容分组与原生 form。React 与 Vue 共享语义变量，data-theme 切换浅色和深色。',
    tokenKeys: ['--f-bg', '--f-surface', '--f-text', '--f-muted', '--f-font', '--f-space'],
    guidelines: [
      '每页保留一个明确的 h1；标题层级连续。',
      '颜色与密度来自同一份系统配置，避免逐页手写色值。',
      '窄屏重新排列内容，表格在局部滚动。',
    ],
    component: 'main / section / form',
    docPath: '/guides/design',
  },
  button: {
    title: '动作与优先级',
    designIntent:
      '让用户看见下一步。主按钮突出当前任务，次要动作降低视觉权重，危险动作使用明确措辞。',
    implementation:
      'Button 渲染原生 button。提交表单显式设置 type="submit"，普通动作保持默认 type="button"；loading 防止重复触发。',
    tokenKeys: ['--f-primary', '--f-on-primary', '--f-button-radius', '--f-button-height'],
    guidelines: [
      '一个任务区域优先突出一个主要动作。',
      '动词说明实际结果，例如“保存设置”。',
      '请求中显示 loading，等待服务端确认后才显示成功。',
    ],
    component: 'Button',
    docPath: '/components/button',
  },
  input: {
    title: '输入与反馈',
    designIntent:
      '在输入前说明需要什么，在出错时说明如何修正。标签、提示与错误信息各自承担清晰职责。',
    implementation:
      'Field 关联标签、说明、错误与控件；InputGroup 用 InputAddon 组合前后缀。Input 保留原生 type、required 与 autocomplete。React 用 value/onChange，Vue 用 v-model。',
    tokenKeys: [
      '--f-surface',
      '--f-border',
      '--f-text',
      '--f-input-radius',
      '--f-input-height',
      '--f-field-gap',
      '--f-field-label-size',
    ],
    guidelines: [
      '占位文字不能代替标签。',
      '将错误与字段关联，保留用户已输入的内容。',
      '原生表单校验帮助键盘、辅助技术和浏览器自动填充协同工作。',
    ],
    component: 'Field / InputGroup / Input',
    docPath: '/components/input',
  },
  card: {
    title: '内容分组',
    designIntent:
      '把一个项目的状态、名称和下一步放在一起，帮助用户逐个比较。卡片的层次服务于内容关系。',
    implementation:
      'Card 提供容器样式，CardHeader/Title/Description 表达信息层级，CardContent 承载正文，CardFooter 组织动作。交互放在真实按钮或链接上，避免整块 div 模拟按钮。',
    tokenKeys: ['--f-surface', '--f-border', '--f-card-radius', '--f-card-padding'],
    guidelines: [
      '先确定内容分组，再选择容器形式。',
      '状态同时使用文字，避免只靠颜色传递信息。',
      '空列表解释当前状态并给出下一步。',
    ],
    component: 'Card / CardHeader / CardContent / CardFooter',
    docPath: '/components/card',
  },
  table: {
    title: '信息比较',
    designIntent:
      '让同类信息在固定列中对齐，帮助用户比较成员、角色和状态；身份信息放在最先阅读的位置。',
    implementation:
      'TableHeader/Body/Row/Head/Cell 渲染原生表格语义，TableCaption 说明数据。Pagination 管理分页动作；排序、取数与权限仍由业务层提供。',
    tokenKeys: [
      '--f-surface',
      '--f-border',
      '--f-text',
      '--f-muted',
      '--f-table-cell-padding',
      '--f-table-row-height',
    ],
    guidelines: [
      '列标题表达清楚，状态保留可读文字。',
      '窄屏允许表格区域横向滚动，避免整页溢出。',
      '为加载、错误和空数据设计真实状态。',
    ],
    component: 'Table / TableHeader / TableBody / TableCell',
    docPath: '/components/table',
  },
};

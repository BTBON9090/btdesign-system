import type { ChoiceOption, DataColumn, FileItem, NavItem, TreeNode } from '@btdesign/engine';
export const enterpriseOptions: ChoiceOption[] = [
  { value: 'design', label: '设计', description: '品牌与体验' },
  { value: 'develop', label: '研发', description: '产品工程' },
  { value: 'product', label: '产品', description: '需求与交付' },
  { value: 'archive', label: '归档团队', disabled: true },
];
export const enterpriseTree: TreeNode[] = [
  {
    key: 'company',
    label: 'BTDESIGN 工作室',
    children: [
      {
        key: 'experience',
        label: '体验设计部',
        children: [
          { key: 'design', label: '产品设计组' },
          { key: 'brand', label: '品牌设计组' },
        ],
      },
      {
        key: 'engineering',
        label: '产品研发部',
        children: [
          { key: 'frontend', label: '前端工程组' },
          { key: 'platform', label: '平台工程组' },
        ],
      },
      {
        key: 'archive',
        label: '已归档部门',
        disabled: true,
        children: [{ key: 'old', label: '历史项目组' }],
      },
    ],
  },
];
export const enterpriseNav: NavItem[] = [
  { key: 'overview', label: '工作概览' },
  {
    key: 'work',
    label: '协作空间',
    children: [
      { key: 'projects', label: '项目管理' },
      { key: 'members', label: '团队成员' },
    ],
  },
  { key: 'rules', label: '设计规则' },
  { key: 'billing', label: '账单管理', disabled: true },
];
export const enterpriseFiles: FileItem[] = [
  { id: 'brand', name: '品牌规范 v3.pdf', size: 2488320, status: 'done' },
  { id: 'assets', name: '组件设计资源.zip', size: 16148000, status: 'uploading', progress: 64 },
  { id: 'notes', name: '项目交付说明.md', size: 4832, status: 'error', error: '上传中断，请重试' },
];
export const enterpriseColumns: DataColumn[] = [
  {
    key: 'project',
    title: '项目',
    children: [
      { key: 'name', title: '名称', sortable: true, width: 210, fixed: 'left', editable: true },
      { key: 'owner', title: '负责人', sortable: true, width: 120 },
    ],
  },
  {
    key: 'delivery',
    title: '交付',
    children: [
      {
        key: 'status',
        title: '状态',
        filterOptions: [
          { value: '进行中', label: '进行中' },
          { value: '已完成', label: '已完成' },
          { value: '待启动', label: '待启动' },
        ],
        width: 120,
      },
      { key: 'budget', title: '预算', sortable: true, align: 'right', width: 120 },
    ],
  },
];
export const enterpriseRows: Record<string, unknown>[] = [
  {
    id: 'brand',
    name: '品牌体系升级',
    owner: '林晓',
    status: '进行中',
    budget: 42000,
    children: [
      { id: 'brand-audit', name: '现状审计', owner: 'Alex', status: '已完成', budget: 8000 },
      { id: 'brand-tokens', name: '设计变量', owner: '林晓', status: '进行中', budget: 16000 },
    ],
  },
  {
    id: 'portal',
    name: '客户服务门户',
    owner: '陈舒',
    status: '进行中',
    budget: 68000,
    children: [
      { id: 'portal-form', name: '申请与审核', owner: '王宁', status: '进行中', budget: 18000 },
    ],
  },
  { id: 'workflow', name: '内部协作平台', owner: 'Alex', status: '待启动', budget: 36000 },
  { id: 'mobile', name: '移动端工作台', owner: '王宁', status: '已完成', budget: 28000 },
  { id: 'assets', name: '品牌资产中心', owner: '林晓', status: '待启动', budget: 24000 },
  { id: 'reports', name: '运营报告工具', owner: '陈舒', status: '进行中', budget: 32000 },
];

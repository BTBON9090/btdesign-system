export type Framework = 'react' | 'vue';
export const catalog = [
  {
    id: 'button',
    name: 'Button',
    cn: '按钮',
    category: '通用',
    description: '清晰表达操作意图，在每个决策点给予恰当的视觉权重。',
    props: [
      ['variant', 'primary | secondary | ghost | danger', 'primary'],
      ['size', 'sm | md | lg', 'md'],
      ['loading', 'boolean', 'false'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'input',
    name: 'Input',
    cn: '输入框',
    category: '数据输入',
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
    category: '数据输入',
    description: '为详细说明、反馈和多行文本留出合适的表达空间。',
    props: [
      ['rows', 'number', '2（原生）'],
      ['controlSize / invalid', 'sm | md | lg / boolean', 'md / false'],
      ['maxLength', 'number', '—'],
      ['value / modelValue', 'string', '—'],
    ],
  },
  {
    id: 'select',
    name: 'Select',
    cn: '选择器',
    category: '数据输入',
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
    id: 'checkbox',
    name: 'Checkbox',
    cn: '复选框',
    category: '数据输入',
    description: '表达独立的选中状态，适用于多项选择和条款确认。',
    props: [
      ['label', 'string', '—'],
      ['checked / modelValue', 'boolean', 'false'],
      ['disabled', 'boolean', 'false'],
    ],
  },
  {
    id: 'switch',
    name: 'Switch',
    cn: '开关',
    category: '数据输入',
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
    category: '数据展示',
    description: '以简洁的文字与颜色标识状态，确保含义不只依赖颜色。',
    props: [['variant', 'default | success | warning | danger | info', 'default']],
  },
  {
    id: 'card',
    name: 'Card',
    cn: '卡片',
    category: '数据展示',
    description: '组织同一对象的相关信息，让内容与操作保持紧密关联。',
    props: [
      ['children / default slot', 'CardHeader / CardContent / CardFooter', '—'],
      ['CardTitle / CardDescription', '标题与说明子部件', '—'],
      ['className / class', 'string', '—'],
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
    category: '数据展示',
    description: '以图片或姓名缩写识别用户，在图片不可用时提供文字回退。',
    props: [
      ['src', 'string', '—'],
      ['name', 'string', 'React 必填'],
      ['alt / fallback（Vue）', 'string', '—'],
      ['size', 'sm | md | lg', 'md'],
    ],
  },
  {
    id: 'separator',
    name: 'Separator',
    cn: '分隔线',
    category: '布局',
    description: '在相邻内容组之间建立适度的视觉边界。',
    props: [['orientation', 'horizontal | vertical', 'horizontal']],
  },
  {
    id: 'table',
    name: 'Table',
    cn: '表格',
    category: '数据展示',
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
    ],
  },
  {
    id: 'field',
    name: 'Field',
    cn: '表单字段',
    category: '数据输入',
    description: '把标签、说明、输入和错误组合为一个完整字段，自动建立可访问关联。',
    props: [
      ['label', 'ReactNode / string', '必填'],
      ['description / error', 'ReactNode / string', '—'],
      ['required / disabled', 'boolean', 'false'],
      ['id', 'string', '自动生成'],
    ],
  },
  {
    id: 'input-group',
    name: 'InputGroup',
    cn: '输入组合',
    category: '数据输入',
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
    category: '数据输入',
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
    category: '数据输入',
    description: '同时支持精确输入和步进调整，保留边界、精度与空值的语义。',
    props: [
      ['value / modelValue', "number | ''", '—'],
      ['onValueChange / update:modelValue', 'callback', '—'],
      ['min / max', 'number', '—'],
      ['step', 'number', '1'],
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
      ['title', 'ReactNode / string', '必填'],
      ['description', 'ReactNode / string', '—'],
      ['icon / action', 'ReactNode / named slot', '—'],
      ['children / default slot', 'content', '—'],
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
] as const;
export type ComponentId = (typeof catalog)[number]['id'];
const reactExamples: Record<ComponentId, string> = {
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
  const example = reactExamples[id];
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
  if (options) {
    const configured = configuredComponentCode(id, framework, options);
    if (configured) return configured;
  }
  if (framework === 'react') return reactCode(id);
  const templates: Record<ComponentId, string> = {
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
    ? `\nconst value = ref('${id === 'select' ? 'designer' : id === 'tabs' ? 'design' : id === 'radio-group' ? 'team' : ''}');`
    : ['checkbox', 'switch'].includes(id)
      ? '\nconst checked = ref(true);'
      : id === 'dialog'
        ? '\nconst open = ref(false);'
        : id === 'number-input'
          ? "\nconst quantity = ref<number | ''>(4);"
          : id === 'pagination'
            ? '\nconst page = ref(1);'
            : id === 'empty-state'
              ? "\nfunction createProject() { window.location.hash = '/lab'; }"
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

export interface DemoOptions {
  size: 'sm' | 'md' | 'lg';
  state: 'default' | 'disabled' | 'invalid' | 'loading';
  variant: string;
  orientation: 'horizontal' | 'vertical';
  progress: number;
}
export const defaultDemoOptions: DemoOptions = {
  size: 'md',
  state: 'default',
  variant: 'primary',
  orientation: 'horizontal',
  progress: 64,
};
export type AnatomyPart = { name: string; structure: string; purpose: string; tokens: string[] };
const part = (
  name: string,
  structure: string,
  purpose: string,
  ...tokens: string[]
): AnatomyPart => ({ name, structure, purpose, tokens });
/** The same names connect design decisions, public composition parts and theme controls. */
export const componentAnatomy: Record<ComponentId, AnatomyPart[]> = {
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
      body = `<Button variant="${o.variant}" size="${o.size}"${disabled}${o.state === 'loading' ? ' loading' : ''}>保存更改</Button>`;
      break;
    case 'input':
      imports = 'Field, Input';
      body = `<Field label="工作邮箱"${error}>\n  <Input${control} type="email" placeholder="you@company.com" />\n</Field>`;
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
      body = `<${name} label="${id === 'checkbox' ? '接收产品更新' : '邮件通知'}"${disabled} ${vue ? 'v-model="checked"' : 'defaultChecked'} />`;
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
    case 'avatar':
      imports = 'Avatar';
      body = `<Avatar name="林晓" size="${o.size}" />`;
      break;
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
      body = `<Field label="工作邮箱" description="用于接收团队邀请"${error} required${disabled}>\n  <Input controlSize="${o.size}" type="email" placeholder="you@company.com" />\n</Field>`;
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

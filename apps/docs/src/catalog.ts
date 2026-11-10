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
      ['aria-invalid', 'boolean', '—'],
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
      ['children / default slot', 'content', '—'],
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
      ['children / default slot', 'thead, tbody, caption', '—'],
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
  card: `import { Card, Button } from '@btdesign/react';\n\n<Card>\n  <h3>团队工作空间</h3>\n  <p>让设计与开发保持同步。</p>\n  <Button>进入工作空间</Button>\n</Card>`,
  alert: `import { Alert } from '@btdesign/react';\n\n<Alert variant="success" title="保存成功">\n  当前配置已保存，可继续编辑或导出。\n</Alert>`,
  tabs: `import { Tabs } from '@btdesign/react';\n\n<Tabs defaultValue="design" items={[\n  { value: 'design', label: '设计', content: '设计规范与资源' },\n  { value: 'develop', label: '开发', content: '组件 API 与示例' }\n]} />`,
  dialog: `import { useState } from 'react';\nimport { Button, Dialog } from '@btdesign/react';\n\nexport function Example() {\n  const [open, setOpen] = useState(false);\n  return <>\n    <Button onClick={() => setOpen(true)}>新建项目</Button>\n    <Dialog open={open} onOpenChange={setOpen} title="新建项目">\n      <p>为团队开启一个新的工作空间。</p>\n      <Button onClick={() => setOpen(false)}>完成</Button>\n    </Dialog>\n  </>;\n}`,
  avatar: `import { Avatar } from '@btdesign/react';\n\n<Avatar name="林晓" />\n<Avatar name="Alex Chen" size="lg" />`,
  separator: `import { Separator } from '@btdesign/react';\n\n<p>项目设置</p>\n<Separator />\n<p>团队成员</p>`,
  table: `import { Table } from '@btdesign/react';\n\n<Table>\n  <caption>团队成员</caption>\n  <thead><tr><th>姓名</th><th>角色</th></tr></thead>\n  <tbody><tr><td>林晓</td><td>设计师</td></tr></tbody>\n</Table>`,
  skeleton: `import { Skeleton } from '@btdesign/react';\n\n<div aria-label="正在加载内容" role="status">\n  <Skeleton width="100%" height={20} />\n  <Skeleton width="60%" height={20} />\n</div>`,
  progress: `import { Progress } from '@btdesign/react';\n\n<Progress value={64} max={100} label="文件上传" />`,
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

export function componentCode(id: ComponentId, framework: Framework) {
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
    card: '<Card><h3>团队工作空间</h3><p>让设计与开发保持同步。</p></Card>',
    alert: '<Alert variant="success" title="保存成功">当前配置已保存，可继续编辑或导出。</Alert>',
    tabs: "<Tabs v-model=\"value\" :items=\"[{ value: 'design', label: '设计' }, { value: 'develop', label: '开发' }]\">\n  <template #design>设计规范与资源</template>\n  <template #develop>组件 API 与示例</template>\n</Tabs>",
    dialog:
      '<Button @click="open = true">新建项目</Button>\n<Dialog v-model="open" title="新建项目">\n  <p>为团队开启一个新的工作空间。</p>\n  <Button @click="open = false">完成</Button>\n</Dialog>',
    avatar: '<Avatar name="林晓" />\n<Avatar name="Alex Chen" size="lg" />',
    separator: '<p>项目设置</p><Separator /><p>团队成员</p>',
    table:
      '<Table>\n  <caption>团队成员</caption>\n  <thead><tr><th>姓名</th><th>角色</th></tr></thead>\n  <tbody><tr><td>林晓</td><td>设计师</td></tr></tbody>\n</Table>',
    skeleton:
      '<div role="status" aria-label="正在加载内容">\n  <Skeleton width="100%" :height="20" />\n  <Skeleton width="60%" :height="20" />\n</div>',
    progress: '<Progress :value="64" :max="100" label="文件上传" />',
  };
  const state = ['input', 'textarea', 'select', 'tabs'].includes(id)
    ? `\nconst value = ref('${id === 'select' ? 'designer' : id === 'tabs' ? 'design' : ''}');`
    : ['checkbox', 'switch'].includes(id)
      ? '\nconst checked = ref(true);'
      : id === 'dialog'
        ? '\nconst open = ref(false);'
        : '';
  return `<script setup lang="ts">\n${state ? "import { ref } from 'vue';\n" : ''}import { ${catalog.find((c) => c.id === id)!.name}${id === 'dialog' ? ', Button' : ''} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';${state}\n</script>\n\n<template>\n${templates[id]}\n</template>`;
}

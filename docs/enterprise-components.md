# 企业组件：组合、规则与迁移

BTDESIGN v0.13 提供 71 个组件族、93 个公开组件。React 与 Vue 使用同一份主题和 `@btdesign/engine` 行为层；表单校验、日期计算、树选择与表格处理不再各自复制一套规则。

## 安装与主题

从网站下载三个对应的安装包：engine、tokens、React 或 Vue。engine 是行为依赖，tokens 是共享样式和 Lab 主题依赖。

```sh
# React
npm install ./btdesign-engine-0.13.0.tgz ./btdesign-tokens-0.13.0.tgz ./btdesign-react-0.13.0.tgz

# Vue
npm install ./btdesign-engine-0.13.0.tgz ./btdesign-tokens-0.13.0.tgz ./btdesign-vue-0.13.0.tgz
```

先导入 `@btdesign/tokens/styles.css`，再导入 Lab 导出的 `theme.css`。所有细分部件沿用品牌色、语义色、字体、尺寸和密度；表单、选择项、日历、树、导航、列表、浮层新增的几何规则同样可以保存、导入、导出与锁定。

| 规则           | 对应组件                                     | Lab 配置                          |
| -------------- | -------------------------------------------- | --------------------------------- |
| 字段与表单布局 | Form、FormField、FormSection                 | 字段间距/字号、表单间距、分组间距 |
| 选择项         | Radio、CheckboxGroup、ToggleGroup、Segmented | 选择控件尺寸、选项间距            |
| 日期           | Calendar、DatePicker、DateRangePicker        | 日期单元尺寸、网格间距            |
| 层级           | Tree、TreeSelect、Cascader、OrgPicker        | 行高、层级缩进                    |
| 导航           | SidebarNav、TopNav、DropdownMenu             | 导航项高度、内边距                |
| 列表           | List、FileList、Transfer                     | 行内边距、列表间距                |
| 浮层           | 日期、树选择、级联、下拉菜单                 | 浮层圆角、内边距                  |
| 表格           | Table、DataTable 及表格子部件                | 单元格内边距、最小行高            |

直接在业务页面写内联颜色或覆盖同名 CSS 变量仍然能改变效果。需要统一治理时，应把定制规则保存在 Lab 主题中，并将主题 JSON、CSS、组件版本一同纳入 Git；界面里的品牌锁不替代服务端权限。

## 表单：从字段到完整任务

`Field` 负责一个控件的标签、说明与错误关联。`Form` 负责值、同步校验、错误摘要、提交与重置；`FormField` 将两者连接起来，`FormSection` 和 `FormActions` 提供可复用结构。

```tsx
import { useState } from 'react';
import { Form, FormField, FormSection, FormActions, Button } from '@btdesign/react';
import type { FormValues } from '@btdesign/engine';
import '@btdesign/tokens/styles.css';
import './theme.css';

export function MemberForm() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  return (
    <>
      <Form
        initialValues={{ email: '', seats: 1 }}
        rules={{ email: [{ required: true }, { type: 'email' }], seats: [{ min: 1, max: 100 }] }}
        onSubmit={setSubmitted}
      >
        <FormSection title="成员资料" description="团队管理员可查看这些信息。">
          <FormField name="email" label="工作邮箱" type="email" required />
          <FormField name="seats" label="席位数" type="number" />
        </FormSection>
        <FormActions>
          <Button type="reset" variant="secondary">
            重置
          </Button>
          <Button type="submit">检查并提交</Button>
        </FormActions>
      </Form>
      {submitted && <output>示例已通过校验：{String(submitted.email)}</output>}
    </>
  );
}
```

Vue 使用相同字段与规则：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Form, FormField, FormSection, FormActions, Button } from '@btdesign/vue';
import type { FormRules, FormValues } from '@btdesign/engine';
import '@btdesign/tokens/styles.css';
import './theme.css';

const submitted = ref<FormValues | null>(null);
const rules: FormRules = { email: [{ required: true }, { type: 'email' }] };
</script>

<template>
  <Form :initialValues="{ email: '' }" :rules="rules" @submit="submitted = $event">
    <FormSection title="成员资料">
      <FormField name="email" label="工作邮箱" type="email" required />
    </FormSection>
    <FormActions
      ><Button type="reset" variant="secondary">重置</Button
      ><Button type="submit">检查并提交</Button></FormActions
    >
  </Form>
  <output v-if="submitted">示例已通过校验：{{ submitted.email }}</output>
</template>
```

字段名是平面 key；内置类型包括 text、email、password、number、textarea、select、checkbox、date。自定义控件使用 React `FormField` 的 children 函数，或 Vue 默认作用域插槽，获得 `value / setValue / id / disabled / required / invalid / describedBy`。将 `setValue` 连接到组件的值变更回调，即可接入日期、组织或多选控件。

同步规则支持必填、邮箱/网址、数字范围、长度、正则和自定义函数。跨字段规则通过函数的第二个参数读取整份值。应用负责异步校验、提交请求和 `submitting` 状态，避免把界面通过校验误认为已保存到服务器。

## 日期与层级值约定

日期使用 `YYYY-MM-DD` 字符串，空值为 `''`。`Calendar` 是独立日历；`DatePicker` 提供输入与浮层；`DateRangePicker` 的值是 `[开始, 结束]`。`min / max / disabledDate` 限制可选端点，完整范围会自动排序。区间内连续可用性，例如酒店每一晚是否有房，需要业务层补充校验。

```ts
import type { TreeNode } from '@btdesign/engine';

const organization: TreeNode[] = [
  {
    key: 'company',
    label: 'BT 工作室',
    children: [
      {
        key: 'design',
        label: '设计团队',
        children: [
          { key: 'lin', label: '林晓' },
          { key: 'alex', label: 'Alex' },
        ],
      },
      { key: 'archive', label: '已归档部门', disabled: true },
    ],
  },
];
```

| 任务            | 组件       | 值与选择规则                                |
| --------------- | ---------- | ------------------------------------------- |
| 常驻树导航/选择 | Tree       | 单选 key；独立多选 key[]                    |
| 下拉树选择      | TreeSelect | 同 Tree；支持搜索、清空和已选标签           |
| 逐级选择        | Cascader   | 节点 key 或 key[]，不是路径数组；默认选叶子 |
| 组织/人员选择   | OrgPicker  | TreeSelect 的组织路径呈现；业务提供组织数据 |
| 双栏选项分配    | Transfer   | 右侧目标集合 key[]；禁用项不移动            |

树 key 必须全局唯一。`multiple + cascade` 保存可选叶节点 key，父节点的全选/半选状态由后代推导；禁用祖先会同时禁用后代。搜索保留祖先路径，选择计算仍基于整棵树。组织权限、实时成员同步、懒加载与虚拟化不包含在这套本地选择模型内。

## 高级表格：多级表头与树形行

`Table` 继续作为原生表格外壳，适合完全自定义的结构。`DataTable` 接受列与数据，组合排序、筛选、分页和选择等交互。

```ts
import type { DataColumn } from '@btdesign/engine';

const columns: DataColumn[] = [
  { key: 'name', title: '项目', width: 220, fixed: 'left' },
  {
    key: 'finance',
    title: '预算情况',
    children: [
      { key: 'budget', title: '预算', sortable: true },
      { key: 'spent', title: '已使用', sortable: true },
    ],
  },
  {
    key: 'status',
    title: '状态',
    filterOptions: [
      { value: 'active', label: '进行中' },
      { value: 'done', label: '已完成' },
    ],
  },
];
const data = [
  {
    id: 'brand',
    name: '品牌升级',
    budget: 50000,
    spent: 16000,
    status: 'active',
    children: [{ id: 'identity', name: '视觉识别', budget: 20000, spent: 8000, status: 'active' }],
  },
];
```

React：`<DataTable columns={columns} data={data} caption="项目预算" searchable selectable />`。
Vue：`<DataTable :columns="columns" :data="data" caption="项目预算" searchable selectable />`。

- 多级表头由 `columns.children` 形成，自动计算跨列与跨行；行层级由数据的 `children` 形成，两者相互独立。
- 本地筛选/排序先处理树结构，再按**根行**分页，展开的子行跟随所属根行显示。搜索后保留匹配后代的祖先路径。
- `selectedKeys` 与 `expandedKeys` 可以受控；选择当前页只作用于当前可见且未被 `rowDisabled(row)` 禁用的数据行。稳定的 `rowKey`（默认 id）用于跨页和编辑识别。
- `page`、`query`、`sort`、`filters`、`hiddenKeys` 同样可受控。React 使用对应 `onPageChange` / `onQueryChange` / `onSortChange` / `onFiltersChange` / `onHiddenChange`；Vue 使用同名 `v-model:page` 等绑定。控制这些状态不会自动发起远程请求。
- `render(value, row)` 自定义框架单元格。列的 `editable` 配合编辑回调开启基础编辑并发出 `{key, column, value}`；应用更新 `data` 并持久化，组件不会擅自写业务数据。树形数据应递归更新目标子行。
- 行详情使用 React `renderExpanded(row)` 或 Vue `expanded` 插槽；它与树形子行可以组合使用。
- 列显隐、固定列与 `stickyHeader`（默认开启）沿用同一份表格几何规则。尺寸仍会根据内容增高；固定列应提供合理宽度。

当前 DataTable 是客户端原生表格，不是完整电子表格引擎。虚拟滚动、拖动列宽/顺序、任意单元格合并、公式、Excel 键盘选择、文件导出与远程自动查询需要独立实现或保留原有能力。

## 导航、菜单、列表和文件

`SidebarNav / TopNav` 共用 `NavItem[]` 和 `activeKey`：有实际 href 的项是链接，其他项是按钮，路由仍由应用负责。`DropdownMenu` 是一级操作菜单；嵌套菜单和复杂上下文定位不要直接套用该契约。

`List → ListItem → ListItemContent / ListItemActions` 分离内容与操作。`FileList` 进一步展示文件名、体积、状态、真实进度和移除/重试回调。它不提供上传服务；已有 Upload 的传输、校验、鉴权和删除流程应继续保留。

## 迁移顺序

1. 导入企业主题，确定密度、字段、列表、层级和表格规则；先使新旧组件共存。
2. 运行只读迁移审计，逐项核对候选及实际使用属性。
3. 先替换基础控件和布局部件，再迁移表单状态、层级值与高级表格。
4. 保留组件未覆盖的业务能力；用实际表单提交、日期边界、禁用选项、树半选、多级表头、筛选和跨页选择验收。

审计中所有新增企业组件都只是 `partial` 候选。日期对象、级联路径数组、第三方 Form 实例与 ProTable 查询模型均需要显式转换，名称相同不代表可直接替换。

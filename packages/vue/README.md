# @btdesign/vue

BTDESIGN 的 Vue 3 组件实现。需要 Vue 3.4 或更新版本，使用与 React 包一致的语义变量和 CSS。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Switch } from '@btdesign/vue';
import '@btdesign/tokens/styles.css';

const name = ref('Acme');
const notifications = ref(true);
</script>

<template>
  <label for="company">企业名称</label>
  <Input id="company" v-model="name" />
  <Switch v-model="notifications" label="接收通知" />
  <Button @click="console.log(name)">保存</Button>
</template>
```

## 组件

| 组件                      | 主要属性 / 约定                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Button                    | `variant: primary / secondary / ghost / danger`，`size: sm / md / lg`，`loading`，`disabled`；默认 `type="button"`  |
| Input / Textarea / Select | `v-model`、`invalid`、`controlSize: sm / md / lg`，原生属性和事件透传；Select 的默认插槽放置 `option`               |
| Checkbox                  | 布尔 `v-model`，`label`，`indeterminate`，`disabled`                                                                |
| Switch                    | 布尔 `v-model`，`label`，`disabled`，`name`；提供 `name` 时开启状态参与表单提交                                     |
| Badge                     | `variant: default / info / success / warning / danger`                                                              |
| Card                      | 默认插槽、HTML 属性                                                                                                 |
| Alert                     | `title`，`variant: info / success / warning / danger`；默认为 `role="status"`                                       |
| Tabs                      | `items: {value, label, content?, disabled?}[]`，`v-model` 或 `defaultValue`，可选 `id`，`label`；同名插槽提供各面板 |
| Dialog                    | 布尔 `v-model`，必填 `title`，可选 `description`、`closeLabel`；默认插槽为内容，`footer` 插槽为底部操作             |
| Avatar                    | `name`，`src`，`alt`，`fallback`，`size`；图片失败时显示 fallback 或姓名首字母                                      |
| Separator                 | 语义化 `hr`，`orientation: horizontal / vertical`                                                                   |
| Table                     | 原生 `caption` / `thead` / `tbody` 插槽；容器允许键盘横向滚动                                                       |
| Skeleton                  | `width`、`height` 支持数字（px）或 CSS 长度，始终对辅助技术隐藏                                                     |
| Progress                  | `value`、`max`、`label`；数值限制在有效范围内                                                                       |
| Field                     | `label`、`description`、`error`、`required`、`disabled`；自动关联后代输入控件的标签、说明与错误                     |
| InputGroup / InputAddon   | 前后缀组合容器及文本附加部件；保持内部控件的原生属性和表单行为                                                      |
| RadioGroup                | `options: {value,label,description?,disabled?}[]`、字符串 `v-model`、`name`、`orientation`；原生单选组              |
| NumberInput               | 数字或空字符串 `v-model`、`min`、`max`、`step`、`controlSize`、`invalid`；输入时保留值，失焦或步进时约束范围        |
| Breadcrumb                | `items: {label,href?}[]`、`label`；最后一项标记当前页，不作为链接                                                   |
| Pagination                | `v-model:page`、`total`（记录数）、`pageSize`、`siblingCount`、`disabled`；仅负责页码，不负责请求数据               |
| EmptyState                | `title`、`description`；`icon`、`action` 与默认插槽，提供明确下一步                                                 |
| Spinner                   | `label`、`size: sm / md / lg`；以 `status` 宣告正在进行的操作                                                       |

## 按部件组合

Card 提供 `CardHeader`、`CardTitle`、`CardDescription`、`CardContent`、`CardFooter`。Table 提供 `TableCaption`、`TableHeader`、`TableBody`、`TableFooter`、`TableRow`、`TableHead`、`TableCell`；这些部件保留原生表格语义，`TableHead` 默认 `scope="col"`，可按行标题需求设置 `scope="row"`。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Field, InputGroup, InputAddon, Input, NumberInput, Pagination } from '@btdesign/vue';
import '@btdesign/tokens/styles.css';

const domain = ref('');
const seats = ref<number | ''>(5);
const page = ref(1);
</script>

<template>
  <Field id="company-domain" label="企业域名" description="用于团队访问" required>
    <InputGroup>
      <InputAddon>https://</InputAddon>
      <Input v-model="domain" name="domain" placeholder="team.example.com" />
    </InputGroup>
  </Field>
  <Field id="team-seats" label="成员数量" description="至少保留一个管理员">
    <NumberInput v-model="seats" name="seats" :min="1" :max="100" />
  </Field>
  <Pagination v-model:page="page" :total="120" :page-size="10" />
</template>
```

Field 自动关联 Input、Textarea、Select、NumberInput 或 RadioGroup，每个 Field 放置一个控件或一组单选项；Checkbox 与 Switch 使用自身的 `label`。标签、说明、错误通过共享上下文关联；传入 `error` 会设置 `aria-invalid`，自定义 `aria-describedby` 会与 Field 的说明合并。需要指定控件 ID 时优先将 `id` 放在 Field 上；如果给内部控件另设 `id`，应与 Field 一致，以保持点击标签聚焦。显式的控件原生属性优先于继承配置。一个页面挂载多个独立 Vue 应用时，请提供页面内唯一的 Field `id`。

NumberInput 支持 `defaultValue` 或 `v-model`，清空时返回 `''`，不会发出 `NaN`。无效或非正 `step` 回退为 1，反向的 `min/max` 区间按 `max = min` 处理；步进后焦点回到输入框。`decrementLabel`、`incrementLabel` 可自定义按钮名称，组件引用暴露 `focus()`。Pagination 的 `total` 是记录总数，`pageSize` 默认 10，页码从 1 开始，调用方接收 `update:page` 后负责替换对应数据。

Tabs 支持左右方向键、Home、End 和自动激活。服务端渲染场景可传入页面内唯一的 `id`，以便首屏即具备完整 ARIA 关联；未传入时会在挂载后生成。Dialog 使用浏览器原生 `showModal()`，由浏览器维护模态焦点约束，关闭时恢复触发点焦点；用户关闭会发出 `update:modelValue`。现代浏览器支持原生 dialog；旧版浏览器需由应用安装 polyfill。

可选全局注册：

```ts
import { BTDESIGNPlugin } from '@btdesign/vue';
app.use(BTDESIGNPlugin); // FButton、FField、FTableCell 等 63 个组件与部件
```

主题配置通过 `@btdesign/tokens` 的 `createTheme(config, mode)` 设置在组件共同祖先的 CSS 变量上，或导出 CSS 文件。Vue 包不自动覆盖页面主题。

## 企业组件（v0.3）

新增 20 个组件族与 6 个细分部件，总计 44 个组件族、63 个公开组件。日期、校验、树选择和表格数据处理由框架无关的 `@btdesign/engine` 驱动，React / Vue 共享同一规则。

| 组件                                                          | API 与职责                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form / FormField / FormSection / FormActions                  | `initialValues` 或对象 `v-model`、`rules`、`disabled`、`submitting`；`@submit` 仅在校验通过后发出值，`@invalid` 发出错误。原生 reset 恢复初始值。FormField 按 `name` 绑定常用控件，默认插槽可接入任意组件。FormSection 保留 fieldset / legend 语义。                                                           |
| Calendar / DatePicker / DateRangePicker                       | ISO `YYYY-MM-DD` 字符串、范围 `[start,end]`、`min/max/disabledDate`。Calendar 支持 `v-model:month`、方向键、Home / End / PageUp / PageDown。DatePicker 输入在失焦或 Enter 时验证，弹层可 Esc 关闭；范围控件分别标记开始与结束。                                                                                |
| Radio / CheckboxGroup / ToggleGroup / Segmented / ButtonGroup | 原生 radio / checkbox 与按钮外观组合。CheckboxGroup 使用 string[]；ToggleGroup 的 `multiple` 决定 string 或 string[]；Segmented 固定单选；ButtonGroup 仅组合操作按钮。                                                                                                                                         |
| Tree / TreeSelect / OrgPicker                                 | `nodes`、单/多选 `v-model`、`multiple/cascade`。Tree 支持 `v-model:expandedKeys`、搜索、半选、层级键盘导航。级联多选保存可选叶节点，禁用祖先的后代不可选。OrgPicker 显示组织路径。                                                                                                                             |
| Cascader                                                      | 逐级列、路径搜索、单/多选、`changeOnSelect`。值是节点 key，而非路径数组；默认只选叶节点。                                                                                                                                                                                                                      |
| Transfer                                                      | `options` 与目标集合 string[] `v-model`；两栏搜索、当前结果全选、移入/移回，禁用项不会被移动。                                                                                                                                                                                                                 |
| List / ListItem / ListItemContent / ListItemActions           | 原生 ul / li 与内容、操作分区组合。                                                                                                                                                                                                                                                                            |
| FileList                                                      | 受控 `files`；`@remove(id)`、`@retry(id)`，只在提供监听器时展示对应操作。上传状态与进度来自调用方，不包含上传服务。                                                                                                                                                                                            |
| SidebarNav / TopNav / DropdownMenu                            | `items`、`activeKey`、`@select(key)`。导航支持分组；DropdownMenu 是一级操作菜单，支持方向键、Home / End、Esc 和焦点返回。                                                                                                                                                                                      |
| DataTable                                                     | `columns/data/rowKey/childrenKey`、多级表头、树行、筛选、排序、搜索、根级分页、列显隐、固定列、粘性表头与选择。`v-model:selectedKeys/expandedKeys/page/query/sort/filters/hiddenKeys` 支持受控状态；`defaultSelectedKeys/defaultExpandedKeys/defaultHiddenKeys` 用于非受控初值。`rowDisabled` 禁用特定数据行。 |

FormField 默认插槽获得 `{ value, setValue, id, disabled, required, invalid, describedBy }`。自定义控件应将 id、disabled、required 和描述关联传给真正的输入元素。Form 同时验证规则和已注册控件的原生 validity，避免日期输入草稿无效却提交旧值；异步请求与 `submitting` 状态由业务应用维护。

```vue
<Form :initial-values="{ name: '', team: '' }" @submit="save">
  <FormSection title="成员信息">
    <FormField name="name" label="姓名" required />
    <FormField name="team" label="所属团队" v-slot="field">
      <TreeSelect :id="field.id" :nodes="teams"
        :model-value="String(field.value ?? '')"
        :disabled="field.disabled" @update:model-value="field.setValue" />
    </FormField>
  </FormSection>
  <FormActions><Button type="reset">重置</Button><Button type="submit">保存</Button></FormActions>
</Form>
```

DataTable 的 `columns[].render(value,row)` 优先于单元格默认内容；`cell` 插槽可定制通用单元格，`expanded` 插槽接收 `{row,key}`，`summary` 插槽接收过滤后的 `{rows}`，`toolbar` 提供额外操作。只有提供 `@cell-change` 监听器且列设置 `editable` 时才显示编辑框，事件为 `{key,column,value}`；调用方更新 `data` 后才提交显示。没有自动请求数据、文件上传、虚拟滚动或电子表格键盘网格，复杂企业迁移仍需核对业务行为。

所有组件与部件继承共享 Lab token。表单间距、选择器尺寸、日历单元格、树行高和缩进、导航高度、列表留白、浮层圆角与表格几何均来自同一份主题，局部组件样式不创建第二套品牌规则。

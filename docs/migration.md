# 迁移到 BTDESIGN

现有 React 或 Vue 系统可以把已确认的品牌风格带入 Studio，再结合源码审计安排逐步迁移。BTDESIGN v0.14 已在两端提供表单、日期、树、层级选择和高级表格等企业组件，共 72 个组件族、94 个公开组件。目标是让设计规则、组件约定与业务代码能持续维护；迁移流程提供风格映射和只读清单，仍需 API 与业务适配，不执行全项目自动替换，也不以框架相同推断业务兼容。

Studio 的「迁入」入口分成「带入现有风格」和「迁移现有代码」。解析在当前浏览器完成，审计 CLI 在本地读取源码；这个流程不会上传整个业务项目给模型。普通 AI 提案仅接收你提交的需求和当前设计上下文。

## 先把已有设计带进工作空间

在「带入现有风格」中粘贴配置，选择「检查映射」，核对原字段、BTDESIGN 目标和转换值后应用。未识别字段、范围调整与字体回退会明确列出；仅已识别字段进入补丁，当前项目中其他设置和锁定规则继续保留。

| 来源                  | 当前接受的字段                                                                               | 范围                                                          |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Ant Design token JSON | `colorPrimary`、`borderRadius`、`fontFamily`，可位于 `token` 对象中                          | 字体仅映射到 system / Inter / mono 预设，不导入字体文件       |
| BTDESIGN 主题 JSON    | 品牌种子、`semantic.light/dark`、button/input/card 覆盖                                      | 按已知 schemaVersion 和字段校验，导入的 policy 不替换当前策略 |
| CSS 变量              | `--primary` / `--f-primary`、`--radius` / `--f-radius`，背景、正文、卡片、边界等已知语义变量 | 接收变量声明或单个 `:root`；颜色映射到浅色语义层              |

```json
{
  "token": {
    "colorPrimary": "#2563EB",
    "borderRadius": 6,
    "fontFamily": "Inter, sans-serif"
  }
}
```

风格解析接受 `#RGB` 或 `#RRGGBB`，会规范化为六位 HEX；CSS 圆角使用 px（或零）。目前不转换 HSL、OKLCH、CSS 函数、嵌套选择器或多模式样式表。含 `.dark` 等选择器的整份 shadcn CSS 不能直接当作完整主题导入；应先提取已确认的颜色值，深色规则用 BTDESIGN JSON 的 `semantic.dark` 配置。

导入后在实际场景的深浅色与窄屏中检查，并通过「设计 / 前端结构」面板理解字段用途。保存一个有说明的版本，再开始组件适配。导入主题只改变 BTDESIGN 预览，不会改写旧应用的 CSS、DOM、路由或行为。

## 再生成代码清单

在本仓库安装依赖后运行：

```sh
npm run migrate:audit -- /absolute/path/to/existing-app --framework react --out /absolute/path/to/new-report-directory
# Vue 项目使用 --framework vue
```

也可以直接运行：

```sh
node scripts/migrate-audit.mjs /absolute/path/to/existing-app --framework vue
```

不指定 `--out` 时向标准输出写 JSON；指定时创建 `migration-report.json` 和 `migration-report.md`，拒绝覆盖已有报告。扫描不会执行目标项目代码、安装其依赖或修改其源文件。

审计基于 TypeScript AST，识别 `antd`、`ant-design-vue`、Arco React/Vue、`element-plus`，以及 `@/components/ui/`、`~/components/ui/` 和常见相对路径中的 shadcn 本地组件。覆盖静态导入、常见 require、显式动态导入和 re-export，并列出组件候选和人工处理点。

| 状态             | 含义                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `candidate`      | 存在同类基础组件；仍需修改 props、事件或结构并验证                                       |
| `partial`        | 存在部分能力，但 API 或业务行为不同；包括新增企业组件、原生 Table / Select 和复合 Dialog |
| `unsupported`    | 当前没有对应实现；保留原库或先开发扩展                                                   |
| `unresolved`     | 整库或动态用法无法确定实际组件                                                           |
| `infrastructure` | 旧库样式等依赖，需要按共存情况决定何时移除                                               |

将 `migration-report.json` 导入 Studio 的「迁移现有代码」，可以按上述五类筛选真实发现、查看来源位置、候选组件和处理建议；报告当前上限 2 MiB，较大的项目可分业务目录审计。报告只是数据，不会触发代码执行或自动迁移。

`confidence` 表示名称映射是否明确，不表示功能兼容率。报告不计算“迁移完成百分比”，也不承诺工期。Vue 全局注册、自动导入、自定义路径别名、包装组件及运行时拼接可能漏报；请结合业务路由清单和实际测试复核。

## 能力对应

以下为候选映射，不是可直接替换的 API 对照。

| BTDESIGN 组件                            | Ant / Arco 常见来源                       | shadcn 常见来源               | 主要适配点                                                                   |
| ---------------------------------------- | ----------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| Button                                   | Button                                    | Button                        | 视觉 `type` → `variant`；原生 submit 语义；size                              |
| Input                                    | Input                                     | Input                         | 原生输入事件、前后缀、清除按钮、密码/搜索模式                                |
| Textarea                                 | Input.TextArea / Textarea                 | Textarea                      | 拆为独立组件；自动高度需另行实现                                             |
| Select                                   | Select                                    | Select 复合组件               | 现为原生 select；没有搜索、远程选项或虚拟列表                                |
| Checkbox                                 | Checkbox                                  | Checkbox                      | checked / v-model；分组和校验上下文                                          |
| Switch                                   | Switch                                    | Switch                        | 状态事件和表单 name                                                          |
| Badge                                    | Tag / Badge                               | Badge                         | 状态文本可映射；计数、角标定位不包含                                         |
| Card                                     | Card                                      | Card 系列                     | 标题、正文、footer 通过 children / slots 组合                                |
| Alert                                    | Alert                                     | Alert 系列                    | title、variant、角色；不包含全局 toast                                       |
| Tabs                                     | Tabs                                      | Tabs 系列                     | items 与 value/v-model；复合触发器需重组                                     |
| Dialog                                   | Modal                                     | Dialog / AlertDialog 系列     | open 状态、关闭事件、footer；无静态 confirm API                              |
| Avatar                                   | Avatar                                    | Avatar 系列                   | name/src/size；头像组需组合                                                  |
| Separator                                | Divider                                   | Separator                     | orientation；不包含分隔标题                                                  |
| Table                                    | Table                                     | Table                         | 原生表格结构；需要数据行为时评估 DataTable                                   |
| DataTable                                | Table / ProTable                          | DataTable                     | columns / data、树形行、选择和分页事件；请求、虚拟化、导出等需保留           |
| Form / FormField                         | Form / Form.Item                          | Form / FormField              | 平面字段 key、同步规则、值与提交事件；原 Form 实例、动态数组和异步校验需适配 |
| Calendar / DatePicker / DateRangePicker  | Calendar / DatePicker / RangePicker       | Calendar / DatePicker         | 日期对象转为 `YYYY-MM-DD`；范围为两个字符串，不含时间与时区                  |
| Tree / TreeSelect / Cascader / OrgPicker | Tree / TreeSelect / Cascader              | 组合式层级选择                | 唯一 key、父子选择策略、禁用规则；级联路径数组需显式转换                     |
| CheckboxGroup / ToggleGroup / Segmented  | Checkbox.Group / Radio.Button / Segmented | ToggleGroup                   | 单选 string、多选 string[]；事件和原有复合结构需重组                         |
| Transfer                                 | Transfer                                  | 自定义双栏选择                | 本地选项与目标 key[]；远程选项、排序和分页需另行适配                         |
| SidebarNav / TopNav / DropdownMenu       | Menu / Dropdown                           | NavigationMenu / DropdownMenu | items / activeKey 与路由；下拉仅一级操作菜单，嵌套菜单需保留                 |
| List / FileList                          | List / Upload 列表                        | 自定义列表                    | 列表内容与操作组合；FileList 不接管上传、鉴权和删除                          |
| Pagination                               | Pagination                                | Pagination                    | 页码、总数、页容量与变更事件；不自动请求数据                                 |
| Skeleton                                 | Skeleton                                  | Skeleton                      | width/height 和组合结构                                                      |
| Progress                                 | Progress                                  | Progress                      | value/max；不包含圆形和分段样式                                              |

Form、日期、树、级联、导航与高级表格已有实现，完整能力和边界见[企业组件指南](enterprise-components.md)。新增企业组件在审计中仍标记为 `partial`，同名不代表可直接替换。Upload 传输服务、Popover、Tooltip、Drawer、富文本编辑器、图表和虚拟数据表格仍需保留原实现或另行扩展；FileList 的文件展示不能替代完整上传流程。

## 推荐迁移顺序

1. **建立基线**：记录业务路径、当前截图、键盘行为、表单提交数据和关键性能指标；将已确认风格带入 Studio，保存项目版本。
2. **接入主题与基础组件**：先迁移一条风险较低的路由；保留原库和现有业务逻辑。
3. **建立应用适配层**：将旧组件 API 转换为 BTDESIGN API，逐步消除转换层；不要在全项目做未经检查的批量 import 替换。
4. **处理复杂组件**：对审计中的 partial / unsupported 项决定保留、组合还是新增组件，明确功能验收。
5. **验证与扩大范围**：覆盖深浅色、键盘、窄屏、失败/加载/空状态和表单数据，再扩大到其他路由。
6. **同步设计交付**：更新项目规范、主题与组件约定，保存命名版本，并让后续人工或 AI 修改使用同一份上下文。
7. **清理旧依赖**：确认所有路由、懒加载模块和共享组件都已退出旧库后，再删除旧 CSS 和依赖。

## 示例：React Button 适配

旧库的 `type="primary"` 是外观，而 BTDESIGN 的 `type` 是 HTML 表单类型。显式转换两个维度：

```tsx
// 原有 Ant Design 用法
<Button type="primary" htmlType="submit" loading={saving}>保存</Button>

// BTDESIGN
<Button variant="primary" type="submit" loading={saving}>保存</Button>
```

`Select` 和表格不适合仅修改属性名称。BTDESIGN `Table` 接收原生 `thead` / `tbody`；迁移 Ant Table 的数据行为时应评估 `DataTable`，将 `dataSource` 转为 `data`，逐项转换列定义、`rowKey`、选择与分页事件。DataTable 已有本地排序、筛选、多级表头与树形行，但远程查询、持久化编辑和未覆盖能力仍由业务保留。完成这些行为的验收后再移除原组件。第三方能力以其 [Table 官方文档](https://ant.design/components/table/) 为准。

## 示例：Vue 受控输入

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Input, Switch } from '@btdesign/vue';
const company = ref('Acme');
const enabled = ref(true);
</script>

<template>
  <label for="company">企业名称</label>
  <Input id="company" v-model="company" />
  <Switch v-model="enabled" label="启用通知" />
</template>
```

BTDESIGN Vue 使用 `modelValue` / `update:modelValue`。旧项目如果使用 `v-model:value`、`checked` 或特定库的事件，需要显式适配；Vue 的组件 v-model 机制参见 [官方说明](https://vuejs.org/guide/components/v-model)。当前 Input 不实现 `.number` / `.trim` / `.lazy` 修饰符转换，应在应用状态层明确处理。

## 把迁移约定交给开发和 AI

Studio 的「开发交付」可复制设计上下文，或导出 `AGENTS.md`、`.btdesign/system.json`、`.btdesign/components.json`、主题与同源场景代码。它们分别回答为什么这样设计、当前规则是什么、真实组件支持哪些 API，以及如何组合已有页面。

在业务项目中保留这些文件，并另外记录当前仍使用的旧组件、适配层与待完成能力。让编程助手先读契约，再按业务路径改动。锁定规则只约束遵守它们的编辑流程，不能自动拦截外部工具直接覆盖 CSS；代码审查与业务验证仍需确认规则被执行。

当前组件契约覆盖 72 个组件族（94 个公开组件），导出还包含维护好的场景模板。Form、DatePicker、Tree 和 DataTable 等组件已有实现，但审计不会自动生成整个业务系统的替代代码，也不会自动转换旧 API、权限、请求或数据模型。项目版本在当前浏览器保存；团队交接应把导出文件和对应业务变更一同放入自己的版本管理，而不是把本地历史视为协作服务器。

## 完成判据

迁移完成应以业务功能和运行证据为准：路由可达，提交数据和权限行为正确；交互、错误恢复和主题通过检查；旧库剩余依赖有明确清单；可回滚到上一版本。只读扫描没有发现导入，不足以证明这些条件成立。

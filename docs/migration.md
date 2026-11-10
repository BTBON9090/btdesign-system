# 迁移到 Forma UI

现有 React 或 Vue 系统可以逐步引入 Forma UI。当前版本提供基础组件和只读迁移审计；它不是 Ant Design、Arco、shadcn 或 Element Plus 的兼容替身，不能仅替换 import 就保证完整迁移。

## 先生成清单

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

| 状态             | 含义                                                    |
| ---------------- | ------------------------------------------------------- |
| `candidate`      | 存在同类基础组件；仍需修改 props、事件或结构并验证      |
| `partial`        | 只有部分能力或基础外壳，例如 Table、Select、复合 Dialog |
| `unsupported`    | 当前没有对应实现；保留原库或先开发扩展                  |
| `unresolved`     | 整库或动态用法无法确定实际组件                          |
| `infrastructure` | 旧库样式等依赖，需要按共存情况决定何时移除              |

`confidence` 表示名称映射是否明确，不表示功能兼容率。报告不计算“迁移完成百分比”，也不承诺工期。Vue 全局注册、自动导入、自定义路径别名、包装组件及运行时拼接可能漏报；请结合业务路由清单和实际测试复核。

## 能力对应

以下为候选映射，不是可直接替换的 API 对照。

| Forma 组件 | Ant / Arco 常见来源       | shadcn 常见来源           | 主要适配点                                      |
| ---------- | ------------------------- | ------------------------- | ----------------------------------------------- |
| Button     | Button                    | Button                    | 视觉 `type` → `variant`；原生 submit 语义；size |
| Input      | Input                     | Input                     | 原生输入事件、前后缀、清除按钮、密码/搜索模式   |
| Textarea   | Input.TextArea / Textarea | Textarea                  | 拆为独立组件；自动高度需另行实现                |
| Select     | Select                    | Select 复合组件           | 现为原生 select；没有搜索、远程选项或虚拟列表   |
| Checkbox   | Checkbox                  | Checkbox                  | checked / v-model；分组和校验上下文             |
| Switch     | Switch                    | Switch                    | 状态事件和表单 name                             |
| Badge      | Tag / Badge               | Badge                     | 状态文本可映射；计数、角标定位不包含            |
| Card       | Card                      | Card 系列                 | 标题、正文、footer 通过 children / slots 组合   |
| Alert      | Alert                     | Alert 系列                | title、variant、角色；不包含全局 toast          |
| Tabs       | Tabs                      | Tabs 系列                 | items 与 value/v-model；复合触发器需重组        |
| Dialog     | Modal                     | Dialog / AlertDialog 系列 | open 状态、关闭事件、footer；无静态 confirm API |
| Avatar     | Avatar                    | Avatar 系列               | name/src/size；头像组需组合                     |
| Separator  | Divider                   | Separator                 | orientation；不包含分隔标题                     |
| Table      | Table                     | Table / DataTable         | 原生表格结构；高级数据行为需保留或重建          |
| Skeleton   | Skeleton                  | Skeleton                  | width/height 和组合结构                         |
| Progress   | Progress                  | Progress                  | value/max；不包含圆形和分段样式                 |

Form、DatePicker、Calendar、Tree、Cascader、Upload、Pagination、Menu、Dropdown、Popover、Tooltip、Drawer、富文本编辑器、图表和虚拟数据表格目前均没有独立实现。某个第三方复合组件仅含基础 DOM 不代表它的业务行为已经具备替代品。

## 推荐迁移顺序

1. **建立基线**：记录业务路径、当前截图、键盘行为、表单提交数据和关键性能指标。
2. **接入主题与基础组件**：先迁移一条风险较低的路由；保留原库和现有业务逻辑。
3. **建立应用适配层**：将旧组件 API 转换为 Forma API，逐步消除转换层；不要在全项目做未经检查的批量 import 替换。
4. **处理复杂组件**：对审计中的 partial / unsupported 项决定保留、组合还是新增组件，明确功能验收。
5. **验证与扩大范围**：覆盖深浅色、键盘、窄屏、失败/加载/空状态和表单数据，再扩大到其他路由。
6. **清理旧依赖**：确认所有路由、懒加载模块和共享组件都已退出旧库后，再删除旧 CSS 和依赖。

## 示例：React Button 适配

旧库的 `type="primary"` 是外观，而 Forma 的 `type` 是 HTML 表单类型。显式转换两个维度：

```tsx
// 原有 Ant Design 用法
<Button type="primary" htmlType="submit" loading={saving}>保存</Button>

// Forma UI
<Button variant="primary" type="submit" loading={saving}>保存</Button>
```

`Select` 和 `Table` 不适合仅修改属性名称。Ant Table 的 `columns` / `dataSource` 属于完整数据组件 API，而 Forma Table 接收原生 `thead` / `tbody`。保留原数据表格直至对应排序、筛选、选择和分页行为都完成适配。第三方能力以其 [Table 官方文档](https://ant.design/components/table/) 为准。

## 示例：Vue 受控输入

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Input, Switch } from '@forma-ui/vue';
const company = ref('Acme');
const enabled = ref(true);
</script>

<template>
  <label for="company">企业名称</label>
  <Input id="company" v-model="company" />
  <Switch v-model="enabled" label="启用通知" />
</template>
```

Forma Vue 使用 `modelValue` / `update:modelValue`。旧项目如果使用 `v-model:value`、`checked` 或特定库的事件，需要显式适配；Vue 的组件 v-model 机制参见 [官方说明](https://vuejs.org/guide/components/v-model)。当前 Input 不实现 `.number` / `.trim` / `.lazy` 修饰符转换，应在应用状态层明确处理。

## 完成判据

迁移完成应以业务功能和运行证据为准：路由可达，提交数据和权限行为正确；交互、错误恢复和主题通过检查；旧库剩余依赖有明确清单；可回滚到上一版本。只读扫描没有发现导入，不足以证明这些条件成立。

# Forma UI 架构

Forma UI 将品牌规则、组件行为和文档工具分开维护。React 与 Vue 使用同一份序列化主题配置和 CSS 变量，各自保留框架原生的状态与事件方式。当前提供 16 个基础组件，是可运行的组件库起点；它不包含完整的企业业务组件套件。

## 包与依赖方向

```text
packages/tokens     ThemeConfig → CSS 变量 + 共享组件样式
      ↑                    ↑
packages/react      packages/vue
      ↑                    ↑
      └────── apps/docs ────┘
               ↓
          apps/api（AI 配置建议）
```

- `@forma-ui/tokens` 不依赖 React 或 Vue；配置为纯 JSON，主题计算可在服务端或浏览器执行。
- `@forma-ui/react` 和 `@forma-ui/vue` 只负责各自的组件 DOM、状态和交互，不彼此依赖，也不依赖文档站或 AI 服务。
- 文档站使用 React；Vue 示例单独挂载真实 Vue 组件。网站框架不决定组件库的消费框架。
- AI 服务返回经过校验的主题配置建议。应用主题不需要 AI 服务，现有主题可离线计算与导出。

## 三层主题合同

1. **品牌基础**：主色、全局圆角、密度、字体族。
2. **语义层**：light / dark 下的背景、表面、正文、次要正文和边框。
3. **组件层**：按钮与输入框的圆角/高度、卡片的圆角/内边距。

`normalizeTheme` 只接受已定义字段，校验颜色并约束数值范围；`createTheme` 将结果转换为 `--f-*` CSS 自定义属性。两端组件使用相同语义变量，因此同一配置可驱动 React 和 Vue。具体字段、边界和锁定行为见 [主题合同](./theme-contract.md)。

自定义范围有明确边界：当前 Lab 不支持任意布局 DSL、任意 JS、完整字体文件管理、任意动效时间线或每个组件所有内部节点的设计参数。`className` / `class`、`style`、React children 和 Vue slots 可用于应用层组合；这类覆盖可能超出 Lab 的控制，应纳入企业项目自己的回归检查。

## Design Lab 与企业约束

Lab 作为主要设计入口，负责预设、实时编辑、深浅模式预览、主题保存和导出。应用保存的是配置数据，避免为每家企业复制一套 React/Vue 实现。

`applyThemePatch(base, patch, policy)` 在应用人工或 AI 变更前保留被锁定的设计决策。`ThemePolicy.locked` 可以锁定主色、全局圆角、密度、字体、语义层或组件层。锁定是**本地设计工作流约束**，不是权限控制：代码调用方可以绕过函数，CSS 也可以覆盖结果。企业若需要强制执行，需在自己的配置服务中重新校验 policy、鉴权并记录版本；当前项目不提供组织账号、审批系统或远程主题注册表。

AI 仅提出配置值，组件行为仍来自经过维护的库代码。当前 AI 生成支持哪些字段、生产环境认证和模型配置，以 [AI 接口文档](./ai-api.md) 为准；AI 输出不得直接当作程序执行。

## 在现有项目中逐步接入

可以在现有 React/Vue 路由中加入 Forma 组件，保留原有路由、状态管理、请求层和业务逻辑。框架匹配只解决运行环境问题；组件 API、表单校验、数据表格行为与第三方库并不自动兼容。

共存期建议只在迁移区域设置主题变量，避免立刻修改应用根节点：

```tsx
import { createTheme } from '@forma-ui/tokens';
import type { CSSProperties } from 'react';

<section data-theme="light" style={createTheme(theme, 'light') as CSSProperties}>
  <NewForm />
</section>;
```

```vue
<section :data-theme="mode" :style="createTheme(theme, mode)">
  <NewForm />
</section>
```

共享样式使用 `f-` 类名。默认样式和 `themeToCSS` 的输出仍包含 `:root` / `[data-theme]` 选择器，不属于 Shadow DOM 隔离；与其他全局 reset、同名 data 属性或高优先级 CSS 共存时需要检查层叠。企业项目可使用局部 inline 变量，或在构建流程中生成有明确容器选择器的主题 CSS。不要将全站样式无差别重命名。

## 扩展与版本

业务组件应在单独的企业扩展包中组合基础组件，例如权限选择、审批表单、资源列表。现有复杂 Table/Select 可以暂时保留原库，并通过应用适配层统一主题与数据接口。

仓库当前构建 ESM 和 TypeScript 声明，可生成本地 `.tgz` 包；是否已发布到 npm 或 Git，以真实发布状态为准。建议锁定同版本的 tokens / framework 包，在升级主题字段或交互行为时同时更新迁移说明。

后续可扩展方向包括表单引擎、数据表格、日期组件、无样式行为层、远程主题版本与权限服务。这些属于后续工作，不是当前组件库的已实现能力。

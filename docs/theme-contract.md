# BTDESIGN 主题契约

本文件描述 v0.7 Studio 项目中的主题格式、覆盖规则和集成边界。项目规范的权威来源是 `packages/core/src/index.ts`，主题计算与样式来自 `packages/tokens/src/index.ts` 和 `packages/tokens/styles.css`。66 个组件族、88 个公开组件的 React / Vue 实现消费同一套 `--f-*` CSS 变量；它们不分别维护一份颜色或尺寸表。`@btdesign/engine` 共享行为与数据契约，不定义视觉主题。

## 一份主题，三个层级

```text
ThemeConfig 种子配置
  primary / radius / density / font
       ↓ createTheme(config, mode)
语义角色
  背景 / 表面 / 正文 / 次要文字 / 边框 / 反馈状态
       ↓ CSS 自定义属性
组件角色
  Button / Input / Card 等组件的颜色、几何与状态
       ↓
React 与 Vue 3 的真实 DOM 组件
```

种子描述品牌的基础倾向，语义层描述一个值在界面中的用途，组件层负责某个控件的局部需要。业务代码应优先复用组件和语义变量，不在每个页面重新定义品牌颜色。

`ThemeConfig` 不包含当前模式；同一份配置同时描述浅色和深色，调用 `createTheme(config, 'light' | 'dark')` 决定本次渲染。`themeToCSS(config)` 一次导出两个模式。

## 项目与主题的序列化格式

Studio 持久化和交付的是 `ProjectSpec`。场景、文案、目标框架、主题与策略一起保存，让接手的设计师、工程师或 AI 获得同一个起点。`.btdesign/system.json` 与恢复用的 `btdesign-project.json` 都使用这个格式：

```json
{
  "schemaVersion": 1,
  "id": "acme-workspace",
  "name": "Acme 团队工作空间",
  "brief": "面向产品与设计团队，保持清晰、安静的协作体验。",
  "scene": "workspace",
  "framework": "react",
  "content": {
    "title": "让团队保持同步",
    "description": "管理成员与工作空间偏好。",
    "actionLabel": "邀请成员"
  },
  "theme": {
    "name": "Acme Enterprise",
    "primary": "#2458B8",
    "radius": 6,
    "density": "comfortable",
    "font": "system",
    "semantic": {
      "light": { "background": "#F7F8FA", "surface": "#FFFFFF" },
      "dark": { "background": "#10151D", "surface": "#19212D" }
    },
    "components": {
      "button": { "radius": 6, "height": 40 },
      "input": { "radius": 4, "height": 40 },
      "card": { "radius": 10, "padding": 24 },
      "field": { "gap": 8, "labelSize": 13 },
      "table": { "cellPadding": 12, "rowHeight": 44 },
      "form": { "gap": 20, "sectionGap": 32 },
      "choice": { "size": 18, "gap": 12 },
      "calendar": { "cellSize": 36, "gap": 4 },
      "tree": { "rowHeight": 38, "indent": 20 },
      "navigation": { "itemHeight": 40, "padding": 12 },
      "list": { "rowPadding": 16, "gap": 4 },
      "overlay": { "radius": 6, "padding": 12 }
    }
  },
  "policy": { "locked": ["primary", "font"] },
  "updatedAt": "2026-11-10T00:00:00.000Z"
}
```

`normalizeProject(unknown)` 要求 `schemaVersion: 1`、三个已知场景之一（`workspace` / `projects` / `login`）和目标框架 `react` / `vue`。项目名上限 80、需求上限 2000、标题上限 120、描述上限 300、主操作文案上限 40 个 UTF-16 code units；文本按数据处理。项目 ID 限定字母、数字、下划线与连字符，策略仅保留已知锁字段。

`normalizeTheme()` 只接收其中的 `theme`，不读取项目版本、场景或策略。既有主题文件仍可使用 `{schemaVersion: 1, theme, policy}` envelope；它不是完整项目文件。项目格式和主题种子均为 BTDESIGN 自身契约，当前未声明为 DTCG tokens 格式。

项目 JSON 支持继续编辑，CSS 用于直接渲染，组件注册表与 AGENTS.md 记录实现约定。保存交付版本时应保留它们之间的对应关系；仅复制 CSS 会丢失可继续编辑的意图、内容和策略。

## 允许的输入

| 层级 | 字段                               | 范围与行为                                                                                         |
| ---- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| 种子 | `name`                             | 非空字符串，去除首尾空格，最多 80 个 UTF-16 code units；只作为主题名称，不进入生成的 CSS           |
| 种子 | `primary`                          | 六位 sRGB 十六进制颜色，例如 `#2458B8`；不接受短写、CSS 函数或任意 CSS 字符串                      |
| 种子 | `radius`                           | 数字，四舍五入并限制为 0–20 px                                                                     |
| 种子 | `density`                          | `comfortable` 或 `compact`；默认控件高度分别为 38 px 与 32 px                                      |
| 种子 | `font`                             | `system`、`inter` 或 `mono`；映射至预先定义的字体栈                                                |
| 语义 | `semantic.light` / `semantic.dark` | 可独立配置 `background`、`surface`、`text`、`muted`、`border`，每个值都必须是六位十六进制颜色      |
| 组件 | `components.button`                | `radius` 0–20 px，`height` 28–56 px                                                                |
| 组件 | `components.input`                 | `radius` 0–20 px，`height` 28–56 px；Input 和 Select 共享高度，Textarea 保持适合多行内容的最小高度 |
| 组件 | `components.card`                  | `radius` 0–20 px，`padding` 8–40 px                                                                |
| 组件 | `components.field`                 | `gap` 4–20 px，`labelSize` 11–16 px；标签、控件与辅助信息共享字段间距                              |
| 组件 | `components.table`                 | `cellPadding` 6–24 px，`rowHeight` 28–72 px；行高为最小高度，内容换行可继续撑开                    |
| 组件 | `components.form`                  | `gap` 8–32 px，`sectionGap` 12–48 px；表单字段与分组间距                                           |
| 组件 | `components.choice`                | `size` 14–24 px，`gap` 4–20 px；单选、多选与组合选项                                               |
| 组件 | `components.calendar`              | `cellSize` 28–48 px，`gap` 0–8 px；日期选择器与日历                                                |
| 组件 | `components.tree`                  | `rowHeight` 28–56 px，`indent` 12–32 px；树节点、层级选择与表格树行缩进                            |
| 组件 | `components.navigation`            | `itemHeight` 30–56 px，`padding` 8–24 px；侧边、顶部导航与菜单                                     |
| 组件 | `components.list`                  | `rowPadding` 8–24 px，`gap` 0–16 px；列表与文件列表                                                |
| 组件 | `components.overlay`               | `radius` 0–20 px，`padding` 8–24 px；日期、层级选择和菜单浮层                                      |

`normalizeTheme(unknown)` 只保留已知字段。无效种子值使用默认配置；无效可选覆盖值被丢弃，空的 `semantic` 或 `components` 区段不进入输出。组件尺寸必须为有限数字；字符串 `"40px"` 不属于 JSON 配置契约。

新增七类的范围、舒适/紧凑默认值及变量名统一定义在导出的 `componentGeometry`。Lab 直接读取这份描述生成滑块，归一化与主题导出使用相同定义。旧主题可以不提供这些可选字段，升级后按密度与全局圆角继承。

`font: 'inter'` 选择 `"Inter Variable", Inter` 字体栈，不下载字体。文档站已打包 `@fontsource-variable/inter`；组件库使用方需要自行提供字体资源，未提供时使用系统回退。CSS 变量导出和主题校验不执行远程字体或任意样式。

## 变量映射与覆盖优先级

| 配置                                       | 输出变量                                         | 无局部覆盖时的来源                                             |
| ------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------- |
| `primary`                                  | `--f-primary`                                    | 品牌种子                                                       |
| 自动前景计算                               | `--f-on-primary`                                 | 在黑色和白色中选择与主色对比度较高者                           |
| `semantic[mode].background`                | `--f-bg`                                         | 模式的默认画布色                                               |
| `semantic[mode].surface`                   | `--f-surface`                                    | 模式的默认组件表面色                                           |
| `semantic[mode].text` / `muted` / `border` | `--f-text` / `--f-muted` / `--f-border`          | 模式的默认语义色                                               |
| `radius`                                   | `--f-radius`                                     | 全局圆角                                                       |
| `density`                                  | `--f-control-height`、`--f-space`                | 默认控件高度与基础间距                                         |
| `components.button`                        | `--f-button-radius`、`--f-button-height`         | 全局圆角、密度对应高度                                         |
| `components.input`                         | `--f-input-radius`、`--f-input-height`           | 全局圆角、密度对应高度                                         |
| `components.card`                          | `--f-card-radius`、`--f-card-padding`            | 全局圆角 + 3 px；舒适 20 px / 紧凑 15 px 内边距                |
| `components.field`                         | `--f-field-gap`、`--f-field-label-size`          | 舒适 8 px / 紧凑 6 px 间距；标签 13 px                         |
| `components.table`                         | `--f-table-cell-padding`、`--f-table-row-height` | 舒适 12 px / 紧凑 8 px 内边距；最小行高舒适 44 px / 紧凑 36 px |
| `components.form`                          | `--f-form-gap`、`--f-form-section-gap`           | 舒适 20 / 32 px；紧凑 12 / 20 px                               |
| `components.choice`                        | `--f-choice-size`、`--f-choice-gap`              | 舒适 18 / 12 px；紧凑 16 / 8 px                                |
| `components.calendar`                      | `--f-calendar-cell-size`、`--f-calendar-gap`     | 舒适 36 / 4 px；紧凑 30 / 2 px                                 |
| `components.tree`                          | `--f-tree-row-height`、`--f-tree-indent`         | 舒适 38 / 20 px；紧凑 30 / 16 px                               |
| `components.navigation`                    | `--f-nav-item-height`、`--f-nav-padding`         | 舒适 40 / 12 px；紧凑 32 / 8 px                                |
| `components.list`                          | `--f-list-row-padding`、`--f-list-gap`           | 舒适 16 / 4 px；紧凑 10 / 0 px                                 |
| `components.overlay`                       | `--f-overlay-radius`、`--f-overlay-padding`      | 圆角继承全局 radius；内边距舒适 12 px / 紧凑 8 px              |

主题引擎还生成 primary 的 hover/soft 色、反馈状态色、字体、阴影和焦点色。当前 JSON API 没有为所有内部变量提供独立编辑入口。按钮的 `md` 使用主题高度；`sm` 使用主题高度减 8 px，最低 24 px；`lg` 使用主题高度加 6 px。三个尺寸都随密度或组件高度覆盖调整，同时保持各自的尺寸层级。

共享 CSS 使用组件变量，并在其不存在时回退到全局变量。动态 `createTheme()` 会输出解析后的全部变量。业务方直接在元素上设置同名 CSS 变量或 `style`，仍能改变结果；这种直接覆盖不经过主题策略校验。

Studio 的组件画布与文档实验台共用真实 React / Vue 组件。可以在画布中选择表单、日期、树、导航或高级表格，切换状态、尺寸和框架，再用 Lab 的「更多组件规则」修改对应类别。重置单类覆盖后恢复继承，锁定组件规则后该区段的编辑和补丁都会保留已有值。组件层规则共同作用于主体与细分部件，导出的 CSS 和项目 JSON 保留相同配置。

## 项目更新与提案应用

Studio 的人工编辑和 AI 提案通过 `updateProject(project, patch)` 更新。它保留项目 ID，按原有 policy 调用 `applyThemePatch`，再接受新的策略。即使同一补丁同时要求解锁和改色，原先锁定的颜色仍保留；需要先单独解锁，再进行编辑。

```ts
import { updateProject } from '@btdesign/core';

const next = updateProject(project, {
  content: { actionLabel: '邀请协作者' },
  theme: { components: { button: { height: 40 } } },
});
```

DeepSeek 当前返回场景、项目名称、文案与品牌种子建议；语义层和组件覆盖继续由既有项目保留，除非编辑操作明确修改。模型不会返回可执行页面源码。实际页面始终由维护好的场景及组件渲染，应用提案时再次遵守当前锁定规则。

## 补丁与完整导入是两种操作

`applyThemePatch(base, patch, policy)` 适合编辑某个控件、应用 AI 的局部建议、或修改一个语义角色。未指定的字段继承已有值。语义层按模式合并，组件层按组件合并；原始对象不会被修改。

```ts
import { applyThemePatch } from '@btdesign/tokens';

const next = applyThemePatch(
  current,
  {
    semantic: { dark: { surface: '#1C2635' } },
    components: { button: { height: 44 } },
  },
  policy,
);
```

`components.button.height` 会更新；原来的按钮圆角、输入框和卡片配置继续存在。可用 `components: null` 清除整个组件覆盖区段，或 `components: { button: null }` 清除单个组件；语义模式也支持 `semantic: { dark: null }`。锁定的区段不会被清除。

完整导入则应恢复文件中的完整配置。不要把完整 JSON 直接当成补丁，否则文件中缺少的可选覆盖会沿用当前主题的值，导致跨设备渲染不同。需要遵守当前策略时，可以先清除未锁定覆盖，再应用完整配置：

```ts
import { applyThemePatch, normalizeTheme } from '@btdesign/tokens';

const imported = normalizeTheme(envelope.theme);
const cleared = applyThemePatch(
  current,
  {
    semantic: null,
    components: null,
  },
  currentPolicy,
);
const restored = applyThemePatch(cleared, imported, currentPolicy);
```

Studio 区分三种动作：

- **迁入现有风格**：解析第三方 token、CSS 变量或 BTDESIGN 主题，先显示映射；仅作为补丁应用已识别字段，保持当前 policy 和未指定的覆盖。
- **打开主题 JSON**：在当前项目中恢复完整主题，先清除未锁定的可选覆盖，再应用新配置；当前 policy 继续生效。
- **打开项目 JSON / 恢复项目版本**：恢复那份项目的内容、主题和 policy，是明确切换设计上下文的动作。打开文件前，Studio 将当前项目保留为本地快照；这不是跨企业的权限操作。

项目文件有格式与大小校验。当前项目和最多 20 个命名快照保存在浏览器，撤销栈只存在于当前会话。主题与 policy 一起持久化，避免重新打开页面后只有颜色而丢失规则。企业如需禁止打开文件时改变权威策略，应在服务端另行约束。

## 品牌策略与授权边界

```ts
type ThemeLock = 'primary' | 'radius' | 'density' | 'font' | 'semantic' | 'components';

interface ThemePolicy {
  locked: ThemeLock[];
}
```

策略以 `base` 中已有的值为准。锁定 `primary` 时，新补丁里的主色被忽略；锁定 `semantic` 或 `components` 时，整个区段保留。`name` 可修改。锁定全局 `radius` 并不会级联禁止组件层自己的圆角，锁定 `density` 也不会禁用已有的组件高度覆盖；需要限制这些能力时，应同时锁定组件层，或在组织服务端增加更细的规则。

当前 `ThemePolicy` 是本地编辑流程的约束，不是企业权限系统。用户可以修改浏览器状态、直接调用包函数、替换策略、或覆盖 CSS。当前 AI API 生成主题种子或受约束的场景提案，也不保存企业的权威品牌策略。

多人企业服务应由后端保存权威配置和策略，并至少在写入时执行：身份与租户检查、角色权限、按服务端策略重新应用补丁、版本冲突检测，以及必要的变更审计。允许修改策略的权限应与普通主题编辑权限分开。前端禁用控件改善操作体验；它不能代替服务端校验。以上是部署到多租户企业场景时的集成要求，当前仓库没有声称已经实现这些后台能力。

## React 消费方式

静态应用先引入组件样式，再引入导出的主题：

```tsx
import '@btdesign/tokens/styles.css';
import './theme.css';
import { Button, Input } from '@btdesign/react';

export function TeamForm() {
  return (
    <form>
      <label htmlFor="team-name">团队名称</label>
      <Input id="team-name" name="teamName" required />
      <Button type="submit">保存</Button>
    </form>
  );
}
```

通过 `document.documentElement.dataset.theme = 'dark'` 切换导出 CSS 的模式。动态编辑或嵌入式预览使用有边界的主题容器：

```tsx
import type { CSSProperties } from 'react';
import { createTheme, type ThemeConfig, type ThemeMode } from '@btdesign/tokens';

export function ThemeScope({
  theme,
  mode,
  children,
}: {
  theme: ThemeConfig;
  mode: ThemeMode;
  children: React.ReactNode;
}) {
  return (
    <section data-theme={mode} style={createTheme(theme, mode) as CSSProperties}>
      {children}
    </section>
  );
}
```

行内变量的优先级高于主题选择器；在这种模式下切换 `data-theme` 时必须同步重新调用 `createTheme(theme, mode)`。仅修改属性、不重算行内变量，不会改变已写入的颜色。

## Vue 3 消费方式

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button, Input } from '@btdesign/vue';
import { createTheme, defaultTheme, type ThemeMode } from '@btdesign/tokens';
import '@btdesign/tokens/styles.css';

const theme = ref({ ...defaultTheme });
const mode = ref<ThemeMode>('light');
const variables = computed(() => createTheme(theme.value, mode.value));
const teamName = ref('Acme');
</script>

<template>
  <section :data-theme="mode" :style="variables">
    <label for="team-name">团队名称</label>
    <Input id="team-name" v-model="teamName" />
    <Button @click="mode = mode === 'light' ? 'dark' : 'light'">切换模式</Button>
  </section>
</template>
```

React 基础输入使用原生 `value`/`onChange`，复合选择控件使用 `value`/`onValueChange`；Vue 使用 `v-model`/`update:modelValue`。共享的是视觉与功能语义，两种框架保留各自事件语法。Form / FormField 可管理同步规则、字段值、错误与提交；业务异步校验、服务端验证与保存仍由应用提供。Button 默认 `type="button"`，需要提交时显式指定。安装时需同时提供 `@btdesign/engine`、`@btdesign/tokens` 和所选框架包；详见 [企业组件指南](./enterprise-components.md)。

## 与现有第三方组件逐步共存

BTDESIGN 的变量和 class 使用 `--f-` / `f-` 前缀；它不会自动改写其他组件库的专有 token、DOM 或业务事件。导入 BTDESIGN 主题，不等于现有 Ant Design、Arco、shadcn 或其他系统的组件会自动变成相同外观。

迁移时可采用稳定的业务包装层：

1. 先定义产品自己的 `AppButton`、`AppField`、`AppDialog` 等入口，让业务页面依赖这些入口。
2. 在包装层把共享语义映射到现有库支持的主题 API；该映射需要按所用版本验证。仅有 CSS 变量名称相近不足以证明兼容。
3. 逐个将包装层内部实现切换到 BTDESIGN，保留业务侧的名称、值格式、事件、校验信息和焦点行为。
4. 用真实业务页面检查两套组件共存时的层级、弹层、尺寸、深浅色和键盘操作，再扩大迁移范围。

不要对第三方库所有内部选择器做全局覆盖来模拟兼容；这样会把未声明的 DOM 结构变成隐含依赖。也不要将 BTDESIGN 的 `Button` 视为另一套组件库 Button 的无损替代：props、插槽、事件、图标位置和加载状态都需要显式核对。

对于跨系统组件目录，可把业务组件的契约与具体实现分开管理，并记录 React/Vue 是否都有对应实现、支持状态和依赖的主题版本。当前仓库提供 66 个组件族、88 个公开组件的两个框架实现，包含本地树与级联、日期与范围、表单、多级高级表格。时间范围与时区、远程节点加载、虚拟化、拖动列宽或任意单元格合并等能力需要另行实现或保留已有组件；主题相同不代表第三方 API、数据格式与业务行为等价。

## 验证与发布

发布一个企业主题前，检查浅色和深色的真实页面，而不仅是主色样本。主题引擎会选择主按钮的黑/白前景；它不会自动修复所有语义覆盖的对比度。正文对画布、正文对卡片表面、次要文字、表格、禁用状态、焦点与反馈信息都需要分别检查。

Studio 的开发交付由 `@btdesign/core` 生成，包含可读规则、项目 JSON、真实组件注册表以及与预览同源的 React/Vue 场景代码。页面主体的样式在 `.btdesign-demo` 下作用，主题 CSS 仍使用上述主题选择器；集成时需要同时理解这两种作用范围。

版本包应保留配置、策略、生成 CSS 与组件版本的对应关系。修改 token 名称、CSS 语义、组件 props 或默认行为时，记录迁移说明；只更换视觉颜色，也应复查真实业务状态。不要将通过若干对比度或 SSR 测试等同于整个产品的可访问性认证。

# BTDESIGN 架构

BTDESIGN 以一份可移植的项目规范连接意图、设计规则、真实组件和开发交付。Studio 中的当前项目是工作对象：使用者从需求或场景开始，在界面中理解设计理由与实现结构，确认规则、保存版本，再把上下文与源代码交给开发或 AI 编程工具。

v0.9 当前维护团队工作台、项目协作和登录三个场景，以及 69 个组件族、91 个公开组件的 React / Vue 3 实现。AI 在受约束的结构中提出场景、文案与主题建议；组件行为来自仓库中维护的代码。

## 包与运行时职责

```mermaid
flowchart LR
  Studio[Studio 项目工作空间] --> Core[@btdesign/core]
  Core --> Tokens[@btdesign/tokens]
  Studio --> React[@btdesign/react]
  Studio --> Vue[@btdesign/vue]
  React --> Tokens
  Vue --> Tokens
  React --> Engine[@btdesign/engine]
  Vue --> Engine
  Studio --> API[服务端 DeepSeek API]
```

| 模块                                | 职责                                                                                           |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| `@btdesign/tokens`                  | 校验与合并 ThemeConfig，解析深浅主题，生成 CSS 变量与共享组件样式；不依赖框架                  |
| `@btdesign/engine`                  | 同步校验、日期、树选择、多级表头与层级数据处理等纯函数；无框架、DOM、tokens 或运行时依赖       |
| `@btdesign/core`                    | ProjectSpec、项目更新、组件 API 注册表、设计知识说明、AI 上下文与交付文件；运行时只依赖 tokens |
| `@btdesign/react` / `@btdesign/vue` | 共享 engine 与 tokens；各自提供 DOM、受控状态、事件、焦点和键盘适配，两包不互相依赖            |
| `apps/docs`                         | Studio、真实场景预览、检查器、版本与迁入面板、组件和指南文档                                   |
| `apps/api`                          | 调用 DeepSeek、校验输入与输出、处理认证及错误；不保存权威项目或企业规则                        |

网站使用 React，Vue 场景通过独立 Vue 应用挂载真实组件。切换框架改变场景实现，保留项目中的内容与主题；网站的技术栈不限制使用者选择哪个组件包。

共享行为层输出数据与状态，不生成 HTML。`TreeNode`、`DataColumn`、`ValidationRule`、`ChoiceOption` 等数据契约可被两个适配器直接使用，事件仍保持 React 回调与 Vue `v-model` / emits 的惯用写法。日期校验、树的禁用继承与半选、过滤保留祖先、表头跨行跨列及根行分页因此使用同一套规则。其他框架可复用这些纯函数，但仍需实现并验证自己的渲染适配器。

## 项目是设计与代码之间的契约

`ProjectSpec` 使用 `schemaVersion: 1`，包含项目标识与名称、需求描述、场景、目标框架、主题、锁定策略、主标题/描述/主操作文案以及更新时间。完整字段见 [主题与项目契约](./theme-contract.md)。

`normalizeProject` 拒绝未知格式版本、场景和框架，并限制文本及主题字段。`updateProject` 保留项目标识，合并内容，并通过现有 policy 约束主题补丁。切换场景时文案回到对应场景默认值，可在同一补丁中提供新文案。

检查器消费 core 的 `selectionKnowledge`，针对 page、button、input、card、table 展示设计意图、实现机制、变量和指导原则。设计师可以从布局与动作了解原生结构，工程师可以从 API 与变量了解设计原因。结构标签页的短代码是解释用示意；开发交付面板提供完整的当前场景源码。

组件画布复用文档实验台，覆盖 69 个组件族及其部件解剖、交互预览和实际示例。切换组件、框架、状态及选择模式不改变主题来源；预览始终消费当前项目的主题。右侧 Lab 可调整九组新增几何规则，观察表单、日历、树、导航、列表、选择浮层、伸缩框与进度中的同步变化。画布不将任意拖拽操作转换成页面结构，也不改变三个场景的导出边界。

## 从自然语言到可确认的提案

Studio 将需求文字和当前项目的场景、文案、名称、主题种子发送至 `/api/compose`。服务端要求模型返回固定 JSON：名称、三个场景之一、文案、主题种子、解释；不接收模型生成的 HTML、JavaScript、组件实现或外部插件。

返回结果经过服务端字段与范围校验，再由 core 的 `updateProject` 按当前品牌锁应用为待确认提案。使用者可以比较、编辑、应用或放弃；失败或取消不应被描述为生成成功。基础主题、场景和导出可在没有模型连接时使用。

仓库不提供可用的 DeepSeek 凭据。模型密钥由服务端环境变量提供，生产 API 另需访问令牌；这套访问保护不等于企业账号、租户权限或项目授权。具体请求与错误见 [AI 接口](./ai-api.md)。

## 预览与交付使用同一份场景定义

真实 React 场景、Vue render 定义与场景 CSS 位于 `apps/docs/src/studio/ScenePreview.tsx` 和同名 CSS。core 的构建脚本解析这份源文件，抽取场景、数据、辅助函数和样式，生成可随包分发的静态源码字符串。

这是构建时依赖；浏览器中的 core 不读取文件、不动态执行源码字符串，也不需要加载第二份框架组件。`getProjectFiles(project)` 将项目文案安全序列化到相同的场景定义中，返回：

- `.btdesign/system.json`：机器可读项目规范。
- `.btdesign/components.json`：69 个组件族、91 个公开组件的 API、能力边界和语义变量。
- `AGENTS.md`：设计规则、原生语义、品牌锁、状态反馈和业务接入约定。
- `App.tsx` 或 `App.vue`、`app.css`、`theme.css` 与安装说明。
- Vite + TypeScript 的 `package.json`、`index.html`、启动入口、构建配置、类型配置与页面基线样式。

导出页面主体与预览共享结构和行为；独立页面额外提供模式切换和状态反馈，移除检查器。CSS 在 `.btdesign-demo` 下作用，React 页面使用 Lucide 图标，Vue 页面使用同源 render 函数。仓库分发 engine、tokens、React、Vue 四个运行时包；项目 ZIP 按所选框架附带 engine、tokens 和一个框架包。脚手架通过 `file:./packages/*.tgz` 引用它们，其他依赖在 package.json 中声明。包齐备后执行 `npm install`、`npm run dev` 启动，`npm run build` 先检查类型再构建。运行页面不需要 core 包，也不会自带业务后端。

修改 canonical 场景后需要重建 core。源码指纹测试检查导出是否过期；生成的 React 页面与 Vue render 函数均针对实际组件 API 做 TypeScript 检查，Vue SFC 另做编译检查；两种完整脚手架还会执行各自的 Vite 生产构建。

`npm run verify:examples` 读取实验台真实代码生成入口，检查全部 65 族的默认示例，以及新增组件的禁用、多选、级联等适用变体；React 经过严格 TypeScript 检查，Vue 经过 SFC 编译与严格 `vue-tsc` 检查。`verify:packages` 则在仓库之外安装四个 tarball，验证两端 88 个导出、Form / Calendar / Tree / DataTable SSR、共享依赖及无 `skipLibCheck` 的消费方类型检查。

## 规则、版本与本地状态

主题分为品牌基础、深浅色语义层、组件局部几何三个层级。React 和 Vue 消费同一组 `--f-*` 变量，组件覆盖不会要求复制整套实现。组件层包含按钮、输入、卡片、字段、表格，以及新增的表单、选择、日历、树、导航、列表、浮层共 12 类。七个新类别的范围、默认值与变量名由 tokens 的 `componentGeometry` 同时驱动归一化、Lab 控件和导入导出，避免编辑器与组件各自维护尺寸范围。详见 [主题契约](./theme-contract.md)。

当前项目与最多 20 个命名快照保存在浏览器 `localStorage`。撤销/重做保存当前会话最多 50 步记录，刷新不会恢复这条撤销栈；命名快照可以比较或恢复。版本名称用于记录设计决定，项目 JSON 用于备份、转交和继续编辑。

这里只管理一个活动项目及本地快照，没有云端多项目目录、实时协作者或服务端冲突解决。品牌锁是编辑约束；可以由当前使用者主动解除，也不能阻止直接修改 CSS。企业如需权威策略、审计或共享版本，需在自己的服务中增加身份、权限、存储及写入校验。

## 接入与扩展

已有项目可保留路由、状态管理、请求层和业务逻辑，先在一条路由中使用 BTDESIGN，再通过业务包装组件逐步扩大范围。主题迁入只是字段映射，代码审计只是用法清单；框架匹配不代表组件 API 或业务行为自动兼容。详见 [迁移流程](./migration.md)。

```tsx
import { createTheme } from '@btdesign/tokens';
import type { CSSProperties } from 'react';

<section data-theme="light" style={createTheme(theme, 'light') as CSSProperties}>
  <NewForm />
</section>;
```

共享样式使用 `f-` 类名，默认主题与 `themeToCSS` 包含 `:root` / `[data-theme]` 选择器。这不是 Shadow DOM 隔离；共存期需检查 reset、变量层叠与弹层，必要时使用局部行内主题变量。

业务扩展可通过 children、slots 和企业包装包组合组件。Form 支持同步规则与字段状态，日期使用无时区的 ISO 日期字符串，Tree / Cascader / OrgPicker 处理本地层级数据，DataTable 处理本地排序筛选、树行、多级表头、分页与基础编辑。异步校验、动态字段数组、时间范围与时区、远程树加载、虚拟表格、拖动列宽、任意单元格合并及服务端数据持久化仍需业务实现或保留已有能力。迁移工具将这些第三方组件列为部分能力候选，按实际 Table 属性区分基础表格与 DataTable；不改写源码或承诺 API 对等。详见 [企业组件指南](./enterprise-components.md)。

新增框架适配器需要实现对应行为与验证，并扩展项目、导出和场景契约；当前运行时支持的是 React 与 Vue 3。

包产物为 ESM 与 TypeScript 声明，使用本地 `.tgz` 分发。主题与组件升级应一起记录版本和迁移说明；当前未实现的多租户、远程版本或任意应用生成能力，不能通过界面文案代替实际服务。

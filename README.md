# BTDESIGN

BTDESIGN 是面向 UI 设计师、前端工程师与 AI 编程工具的设计工作空间。你可以从一句需求开始，在真实组件组成的场景里调整风格、理解结构，把设计规则与 React / Vue 3 页面代码一起带进项目。

工作流程是：**表达意图 → 选择场景 → 理解设计与结构 → 确认共享规则 → 保存版本 → 交付给开发与 AI**。组件文档、开发指南、设计指南和最佳实践随时可查，创作入口围绕当前项目展开。

在线使用：[design.btbon.cn](https://design.btbon.cn)。源码仓库：[BTBON9090/btdesign-system](https://github.com/BTBON9090/btdesign-system)。当前为 v0.1，Studio 与文档网站已部署至腾讯云 EdgeOne，React / Vue 组件包可从网站下载，尚未发布到 npm 公共注册表。DeepSeek 服务端密钥仍待配置。

## 在工作空间里做什么

1. **从意图或场景开始。** 描述使用者、任务与希望传达的感受；连接 DeepSeek 后生成可比较、可修改、可放弃的提案。也可以直接选择团队工作台、项目协作或登录场景。
2. **在真实界面里理解规则。** 切换 React / Vue、深浅色与窄屏预览，操作成员筛选、表单和项目状态。在检查模式中选择页面、按钮、输入、卡片或表格，同时查看设计原因、前端语义、相关变量与组件用法。
3. **让修改影响整套系统。** 品牌基础、语义颜色与组件尺寸由共享主题控制；组件覆盖有明确范围，锁定字段会在编辑和 AI 提案应用时保留。
4. **留下可追溯的决定。** 当前项目自动保存在浏览器；支持撤销、重做、命名版本、前后比较与恢复。重要版本可导出 JSON，交给后续参与者继续使用。
5. **把上下文交给开发。** 复制 AI 上下文，或下载包含项目规范、组件 API、主题、场景源代码及可选组件安装包的 ZIP。

## 当前实现与范围

| 能力     | 当前实现                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 场景     | 3 个维护好的场景：团队工作台、项目协作、登录；两种框架均真实渲染                                                                                          |
| AI 提案  | 服务端调用 DeepSeek，返回场景选择、名称、文案、主题种子与解释；校验后在浏览器预览与应用                                                                   |
| 组件     | Button、Input、Textarea、Select、Checkbox、Switch、Badge、Card、Alert、Tabs、Dialog、Avatar、Separator、Table、Skeleton、Progress，16 类 React / Vue 实现 |
| 设计规则 | 品牌主色、圆角、密度、字体；深浅色语义颜色；按钮、输入框、卡片的几何覆盖与品牌锁                                                                          |
| 项目记录 | 一个本地活动项目、最多 20 个命名快照；当前会话最多 50 步撤销记录                                                                                          |
| 迁入     | 风格映射预览、只读源码审计、报告筛选与处理建议                                                                                                            |
| 交付     | `AGENTS.md`、机器可读项目与组件约定、主题 CSS、同源 React/Vue 页面代码、安装说明                                                                          |

AI 当前在这三个场景中选择并配置内容与主题，不生成任意应用架构或新的组件实现。场景里的成员、项目、设置和登录操作是本地示例；认证、邮件、权限与持久化需接入业务服务。Table / Select 是原生语义基础组件，尚无高级数据表格、表单引擎、树、日期选择器或虚拟滚动。

本地版本与品牌锁用于编辑流程；当前没有云端项目列表、协作账号、租户权限或组织审批服务。浏览器数据不是跨设备备份，导出的项目文件可用于保存与转交。

## 本地运行

需要 Node.js **22.12 或更高版本**与 npm。仓库使用 npm workspaces。

```sh
git clone https://github.com/BTBON9090/btdesign-system.git
cd btdesign-system
npm ci
npm run dev
```

网站默认在 `http://127.0.0.1:5173`，AI API 在 `http://127.0.0.1:8787`。开发命令先构建包、生成可下载的安装包，再启动网站和 API。网站源码由 Vite 热更新；修改组件包或场景定义后，应重新运行 `npm run build:packages`，同步包产物与导出源代码。

仓库不附带可用的服务端密钥。手动编辑、场景预览与导出无需连接模型；启用 AI 时：

```sh
cp .env.example .env
# 在 .env 中填写 DEEPSEEK_API_KEY，然后重启开发服务。
```

模型和接口地址由服务端 `AI_MODEL`、`AI_BASE_URL` 配置。生产环境还要求独立的 `LAB_API_TOKEN`；浏览器只在当前页面内存中使用该访问令牌，模型密钥保留在服务端。未配置或请求失败时显示连接状态与错误，不会用预设结果冒充 AI 回复。详见 [AI 接入说明](docs/ai-api.md)。

## 从 Studio 启动新项目或接入已有系统

在「开发交付」中可以检查每个文件，再复制上下文或下载项目包：

```text
AGENTS.md                    给编程助手的设计与实现约定
.btdesign/system.json         ProjectSpec：场景、内容、主题、策略与版本格式
.btdesign/components.json     16 个组件的真实 API 与语义变量映射
App.tsx 或 App.vue           当前场景的页面组件
app.css / theme.css          页面样式与深浅色主题
package.json / vite.config.ts 运行依赖与 Vite 配置
index.html / main.tsx 或 .ts  启动入口
tsconfig.json / base.css      类型检查与基础页面样式
README.md                    安装与接入说明
btdesign-project.json         Studio 项目恢复文件
packages/*.tgz               可选的 tokens 与对应框架安装包
```

页面主体和 Studio 预览来自同一份 React/Vue 渲染定义与样式。构建时提取定义，浏览器导出静态源码；导出的独立页面补充模式切换与操作反馈，移除 Studio 检查器。交付包含完整的 Vite + TypeScript 前端脚手架。保持「包含组件安装包」开启，解压后在项目目录执行 `npm install`、`npm run dev` 即可启动；`npm run build` 执行类型检查并生成静态网站。React 图标及所选 Inter 字体依赖已声明。运行仍需网络安装框架与构建工具；未包含组件包时，需先补齐 `packages/` 下的两个本地 tgz。

脚手架不包含业务后端；认证、邮件、权限和持久化需接入自己的服务。已有项目也可只复制 App 与主题/场景 CSS，按包内 README 安装运行时依赖，不覆盖已有入口和构建配置。

组件包尚未发布到 npm。可从项目 ZIP 获取本地安装包，或在本仓库运行：

```sh
npm run pack:libs
```

产物位于 `apps/docs/public/downloads/`。把 tokens 和对应框架包复制至目标项目，以实际路径安装：

```sh
# 目标项目已安装 React / React DOM 18 或 19
npm install ./btdesign-tokens-0.1.0.tgz ./btdesign-react-0.1.0.tgz

# 或目标项目已安装 Vue 3.4+、低于 4
npm install ./btdesign-tokens-0.1.0.tgz ./btdesign-vue-0.1.0.tgz
```

包提供 ESM 与 TypeScript 声明。基础使用示例：

```tsx
import { Button, Card } from '@btdesign/react';
import '@btdesign/tokens/styles.css';
import './theme.css';

export default function App() {
  return (
    <Card>
      <h1>团队工作空间</h1>
      <Button>开始构建</Button>
    </Card>
  );
}
```

Vue 使用同名组件及 `v-model` / slots；样式顺序同样为基础组件样式、导出主题、业务样式。用 `data-theme="light"` 或 `data-theme="dark"` 切换导出 CSS 的模式，动态局部主题使用 `createTheme(theme, mode)`。详见 [主题契约](docs/theme-contract.md)。

## 命令与项目结构

| 命令                                                                     | 用途                                           |
| ------------------------------------------------------------------------ | ---------------------------------------------- |
| `npm run dev`                                                            | 构建包与下载产物，启动 Studio、文档与本地 API  |
| `npm run build`                                                          | 构建库、API、下载包与网站                      |
| `npm test`                                                               | 检查主题、组件、项目契约、AI API 与迁移工具    |
| `npm run typecheck`                                                      | 构建包并检查网站类型                           |
| `npm run pack:libs`                                                      | 生成 tokens / React / Vue 本地安装包           |
| `npm run migrate:audit -- /path/to/app --framework react --out ./report` | 只读审计并创建报告；Vue 使用 `--framework vue` |

```text
packages/tokens/     主题结构、生成逻辑、共享组件 CSS
packages/core/       项目规范、组件注册表、设计知识、AI 上下文与源码交付
packages/react/      React 组件与类型
packages/vue/        Vue 3 组件与类型
apps/docs/           Studio、真实场景、检查器、迁入工具与文档
apps/api/            DeepSeek 配置/场景提案 API、本地服务与测试
api/                 Vercel 函数入口
scripts/             开发启动、打包、只读迁移审计
```

## 构建与部署

```sh
npm test
npm run build
```

静态网站产物为 `apps/docs/dist/`，Node API 为 `apps/api/dist/`。可把仓库根目录导入 Vercel 并使用 `vercel.json`，或将静态网站部署在个人网站的子目录，通过同源反向代理提供 API。例如：

```sh
BASE_PATH=/design-system/ VITE_API_BASE_URL=/design-system/api npm run build
```

静态托管不会自动提供 AI 服务，GitHub Actions 也不会自动发布网站或 npm 包。部署方式、环境变量与回滚步骤见 [部署指南](docs/deployment.md)。

## 进一步了解

- [项目架构与扩展](docs/architecture.md)
- [主题、项目格式与品牌约束](docs/theme-contract.md)
- [框架与组件支持边界](docs/compatibility.md)
- [带入现有风格与渐进迁移](docs/migration.md)
- [DeepSeek 接入与错误处理](docs/ai-api.md)
- [验证记录](docs/verification.md)

自动检查覆盖代表性语义、主题计算、项目校验、源代码一致性与接口行为。真实业务仍需验证自己的数据、状态、目标设备和辅助技术使用方式。本仓库原创代码采用 [MIT License](LICENSE)，第三方依赖及字体保留各自许可。

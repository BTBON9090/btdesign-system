# 验证记录

记录日期：2026-11-10（Asia/Shanghai）。本记录区分自动化覆盖、实际执行和待检查内容；它不构成全浏览器或无障碍认证。

## 已执行的组件与示例检查

本次在 Node.js 25.9.0、TypeScript 5.9.3 环境执行：

| 检查                                         | 结果                           | 能证明的范围                                      |
| -------------------------------------------- | ------------------------------ | ------------------------------------------------- |
| `npm run build -w @forma-ui/vue`             | 通过                           | Vue 组件包可输出 ESM 与声明文件                   |
| `npm run test -w @forma-ui/vue`              | 10 项通过                      | 代表性 SSR 语义、状态、原生属性透传与两端外观属性 |
| `node --test scripts/migrate-audit.test.mjs` | 6 项通过                       | 导入扫描、源文件不变、排除目录、报告写入与不覆盖  |
| 16 个 React 文档示例                         | TypeScript API 与语法检查通过  | 示例可作为完整组件编译，组件 props 与当前声明匹配 |
| 16 个 Vue 文档示例                           | SFC script / template 编译通过 | 示例模板与脚本可解析编译；不等价于运行时交互测试  |

文档示例检查在内存中调用 TypeScript 编译器和 Vue SFC 编译器，未向项目写入生成的示例文件。示例均显式导入基础样式；多个 JSX 元素已包在有效的组件返回值中。

## 仓库自动化覆盖

统一命令为 `npm test`；完整生产构建使用 `npm run build`。下面列出已有测试范围，不单独宣称它们在后续每次修改后都已通过。

| 测试文件                                                                | 覆盖内容                                                                                                                     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [tokens.test.mjs](../packages/tokens/test/tokens.test.mjs)              | 配置标准化、颜色注入拒绝、对比计算、主色前景、双模式导出、语义/组件字段白名单、企业锁与局部补丁                              |
| [React components.test.mjs](../packages/react/test/components.test.mjs) | loading 与默认按钮类型、原生表单属性、Switch 标签/表单值、Tabs 关联与禁用状态、Dialog SSR、Progress 边界、Table/Avatar 语义  |
| [Vue components.test.mjs](../packages/vue/test/components.test.mjs)     | loading、v-model 初值、Select 单选/多选 SSR、原生 value/checked 透传、Switch、Tabs、Dialog、Progress、插件注册与两端外观属性 |
| [service.test.ts](../apps/api/test/service.test.ts)                     | 未配置状态、模型请求、生产访问令牌、请求校验、方法/媒体类型/跨站拒绝、限流、非法输出、超时、错误脱敏和上游体积限制           |
| [http.test.ts](../apps/api/test/http.test.ts)                           | HTTP health、错误 JSON 与流式请求体上限                                                                                      |
| [migrate-audit.test.mjs](../scripts/migrate-audit.test.mjs)             | import 别名与未支持组件、Vue 行号、namespace/deep/require/re-export/dynamic import、忽略目录与符号链接、只读及报告不覆盖     |

AI 服务单元测试使用替身网络响应，不能证明真实模型账户、额度、API key 或生产环境配置可用。组件 SSR 测试也不验证浏览器原生焦点移动、弹层显示、触屏手势或视觉效果。

## 浏览器实际检查

在 Codex 内置浏览器中检查桌面默认视口（约 1242 × 1134）、390 × 844 移动布局，以及 768 × 1024 中间断点。测试数据均为本项目示例。

- 16 个组件分别切换 React 与 Vue 3，32 个预览均实际挂载组件。
- React Tabs 的方向键、Vue Tabs 的 End 导航均改变选中面板。
- React Dialog 的 Escape 关闭后恢复触发按钮焦点；Vue 邀请表单通过校验后关闭并显示明确的示例反馈。
- 搜索 Button 后进入对应文档；深浅色文档和 Vue 深色登录页均检查了实际截图。
- Lab 预设、带空格的名称、品牌色锁定、重新加载后的锁定保留、保存与恢复均通过实际操作检查。
- 完整 JSON 导入清除了之前的按钮高度覆盖，恢复紧凑模式的 32 px 基准，同时合并导入的字体锁定。
- 调整按钮高度为 56 px 后，小尺寸按钮实测高度为 48 px，符合派生规则。
- ZIP 实际下载并解压检查，包含 theme.json、双模式 theme.css、React / Vue 示例和三个安装包。
- DeepSeek 未配置时请求返回明确的不可用信息，没有伪造生成结果。
- 390 px 与 768 px 页面宽度均未超过视口；宽表格在自身滚动区内保留列宽。

截图：[首页](./previews/home.png)、[Design Lab](./previews/design-lab.png)、[深色组件文档](./previews/components-dark.png)。截图用于观察当前外观，不能替代完整辅助技术测试。

## 构建与安装包验证

最终执行 `npm test`：**45 项通过**（Tokens 7、React 8、Vue 10、API 14、迁移 6）。`npm run build` 及 Vercel API 入口类型检查通过。

`node scripts/verify-packages.mjs --skip-pack` 在独立临时项目中安装三个实际 tarball，验证组件导出、React / Vue SSR、CSS、主题覆盖、声明文件、共享 tokens 依赖，并通过 `skipLibCheck: false` 的严格消费端 TypeScript 检查。版本：React 19.3.1、Vue 3.5.45、TypeScript 5.9.3。

网站尚未部署到个人域名。真实 DeepSeek 调用因未配置密钥未执行；AI 测试使用替身响应。GitHub Actions 的远端结果应以仓库对应提交的 Checks 为准。

## 尚未由上述检查覆盖

- React 18 与 19、所有目标浏览器最低版本和移动真机的完整组合。
- 屏幕阅读器手动测试、全站 WCAG 合规或用户可用性研究。
- 真实企业系统迁移、复杂第三方组件行为对等和生产负载。
- 多组织身份权限、远程主题策略、共享限流与审批流程。

这些边界与 [兼容性说明](./compatibility.md) 和 [迁移指南](./migration.md) 一致。

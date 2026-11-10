# @btdesign/core

BTDESIGN 的可移植项目规范、组件注册表与 AI 交付上下文。React 和 Vue 页面共享同一份 `ProjectSpec`；主题计算由 `@btdesign/tokens` 提供。

```ts
import { createProject, updateProject, getProjectFiles } from '@btdesign/core';

const project = createProject({
  name: '团队工作空间',
  scene: 'workspace',
  framework: 'react',
  policy: { locked: ['primary'] },
});
const edited = updateProject(project, { content: { title: '我们的团队' } });
const files = getProjectFiles(edited);
```

- `createProject(options)` 创建 schemaVersion 1 项目，默认使用工作空间场景和 React。
- `normalizeProject(unknown)` 拒绝未知版本、框架与场景；限定文本长度，白名单处理主题与策略。
- `updateProject(project, patch)` 保留项目标识，先按当前品牌锁执行主题补丁，再接受策略修改。切换场景时重置场景文案。
- `getProjectFiles(project)` 输出项目 JSON、16 个真实组件的 API 注册表、AGENTS.md、主题、页面样式与 React/Vue 的 Vite + TypeScript 前端脚手架。源代码安全序列化文本，使用本地示例状态。
- `getContextText(project)` 返回可复制给编程助手的设计约定，明确原生语义、主题锁、可访问性与后端边界。
- `selectionKnowledge` 提供 page/button/input/card/table 的设计意图、实现机制、token 与学习提示。

导出包依赖本地 `btdesign-tokens-0.1.0.tgz` 及对应框架安装包；未声称公开发布到 npm。导出的 App 与 Studio 同源，完整脚手架可在补齐本地组件包后运行 npm install、npm run dev；不包含真实认证、邮件发送或持久化。品牌锁约束编辑行为，不代替服务端授权。

构建脚本从 `apps/docs/src/studio/ScenePreview.tsx` 和同名 CSS 抽取实际 React/Vue 渲染定义，生成静态字符串。浏览器导出不读取文件、不运行字符串，也不会产生第二套手写模板。修改预览后重新构建 core 即可同步交付源代码；导出保留页面主体，并补充独立的模式切换与操作反馈，移除 Studio 检查器。React 的 `lucide-react` 依赖及选中的 Inter 字体会在脚手架中声明。

开发时先构建 tokens，再运行本包 `npm run build` 和 `npm test`。测试覆盖规范校验、品牌锁、场景转换、组件 API 注册表、源代码转义，以及三个场景的 React TypeScript 类型检查与 Vue SFC 编译及两种完整脚手架的生产构建。

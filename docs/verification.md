# 验证记录

记录日期：2026-11-10（Asia/Shanghai）。以下区分自动化验证、浏览器实际操作与尚未覆盖的范围。

## Studio 重构后的自动验证

`npm test` **82 项通过**：Tokens 7、React 8、Vue 10、Core 11、API 21、迁移审计 6、Studio 模型与迁移映射 19。

- Tokens：配置标准化、双模式颜色、对比度、语义与组件覆盖、品牌锁、局部继承。
- React / Vue：16 个组件的代表性 SSR 语义、原生属性、状态与声明兼容性。
- Core：ProjectSpec 校验、锁定规则、用户文本转义、简报空格与段落保留、场景源码指纹；三个场景的 React 类型检查、Vue render 类型检查与 SFC 编译；两套完整前端脚手架的类型检查和 Vite 构建。
- API：DeepSeek generate / compose 输入输出校验、认证、请求来源、速率与体积限制、超时、错误脱敏。模型响应使用测试替身。
- 迁移审计：导入方式与别名、框架识别、排除目录、只读扫描、报告不覆盖原文件。
- Studio：存储异常、损坏版本恢复、元数据验证、撤销重做、50 步历史上限、差异比较；Ant/CSS/BTDESIGN 风格映射、非法值拒绝、锁定继承及真实审计报告解析。

`npm run build`、Vercel 三个 API 入口类型检查、`git diff --check` 均通过。

## 独立安装与交付包

`npm run verify:packages` 将 tokens、React、Vue 三个实际 tarball 安装到干净临时项目，验证 16 + 16 个导出、SSR、原生输入值、主题覆盖、CSS 导出、共享 tokens 依赖，以及 `skipLibCheck: false` 的消费端类型检查。

另外分别生成 React 和 Vue 的完整项目，在没有工作区 node_modules 链接的临时目录中，复制实际 tokens / 对应框架 tgz，执行 `npm install --prefer-offline`、`npm run build`。两套均通过，包含 Inter 字体的依赖也正确产出。前端脚手架无需依赖 core 包。

浏览器中实际下载了 Vue 项目 ZIP。解压清单包含入口、构建配置、App.vue、样式、AGENTS.md、组件注册表、两个实际安装包与项目 JSON；确认 `.btdesign/system.json` 与 `btdesign-project.json` 一致，主题名称为 BTDESIGN。

## 浏览器实际操作

在 Codex 内置浏览器默认桌面视口及 390 × 844 移动视口检查：

- 主入口直接进入 Studio；画布、规则、交付三个工作阶段可切换。
- React 和真实挂载的 Vue 工作台都通过成员搜索筛选；Vue 项目场景通过创建表单添加本地示例项目。
- 选中按钮后可查看设计意图、框架实现、实际 token 值，并编辑全局/局部规则。
- 将主色改为绿色并锁定；导入蓝色 Ant 主题与 12 px 圆角后，绿色保持，圆角更新。
- 保存设计版本、修改规则、恢复后回到 8 px；刷新后简报、主题、品牌锁和历史版本仍保留。
- 撤销/重做可在两个场景之间往返。
- 深浅编辑器与深浅业务画布分别切换；检查器随画布模式显示对应语义颜色。
- 点击「复制给 AI」后，剪贴板包含当前项目与实现契约；项目 ZIP 可实际下载。
- DeepSeek 未配置时展示明确服务端配置说明，没有生成伪造结果；该错误不阻塞独立的代码导出。
- 移动端画布、侧边检查器与交付页正常显示，页面 scrollWidth 与 390 px 视口一致；侧边面板可以关闭。

截图：[创作空间](./previews/studio.png)、[规则](./previews/studio-rules.png)、[开发交付](./previews/studio-handoff.png)、[深色工作空间](./previews/studio-dark.png)。截图不替代辅助技术测试。

组件初版还实际检查过 32 个 React / Vue 文档预览、Tabs 键盘导航、Dialog Escape / 焦点恢复、文档搜索与 768 px 中间布局。本次保留这些组件行为，并通过当前自动测试和生产构建检查重命名后的引用。

## 尚未验证或实现的部分

真实 DeepSeek 请求因未配置密钥未执行。当前 AI 是三个受约束场景的选择、文案与主题提案，不是任意业务系统生成器。

个人网站尚未绑定部署目标或域名。GitHub Actions 的远端结果以对应提交的 Checks 为准。未验证真实企业迁移、复杂组件行为对等、全浏览器矩阵、移动真机、屏幕阅读器或 WCAG 全站合规。

项目与版本保存在本地浏览器。多人实时协作、组织级服务端权限、真实业务认证与数据持久化尚不包含在当前版本中。品牌锁约束编辑行为，不能代替服务器授权。

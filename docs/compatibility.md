# 兼容性与支持边界

本页区分设计目标、包声明和已执行验证。BTDESIGN v0.10 的 React 与 Vue 包均提供 70 个组件族、92 个公开组件，并通过 `@btdesign/engine` 共用表单、日期、树与表格行为。项目构建通过或服务端渲染测试通过，不等于所有浏览器、框架版本和辅助技术组合均已验证。

## 框架与构建

| 范围           | 当前合同                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| React          | 使用 React 18 起提供的 Hooks；目标 React 18 / 19，react 与 react-dom 保持同版本；具体 peer 声明见包 manifest |
| Vue            | Vue 3.4+、低于 4；使用标准 Composition API、原生事件和 v-model                                               |
| 包格式         | ESM JavaScript 与 TypeScript 声明；没有独立 UMD 或 CommonJS 发布产物                                         |
| 构建环境       | 本仓库 Node.js >=22.12、npm workspaces；消费者按自己的 bundler 支持 ESM/CSS 导入                             |
| SSR            | 组件可服务端渲染；交互仍需客户端挂载或 hydration；Dialog 挂载后调用 showModal                                |
| Next / Nuxt 等 | 可在满足运行时条件时接入；本仓库没有完整覆盖这些框架的集成测试                                               |

React 包中的交互组件使用状态、effect 和 `useId`。在 React Server Components 项目中，应由自己的 `"use client"` 边界模块导出或消费这些组件，不能假设整个包是纯 Server Component。React 的 ID 关联要求服务端/客户端组件树一致，见 [useId 官方说明](https://react.dev/reference/react/useId)。

Vue Tabs 的 `id` 可显式指定，以便服务端首屏建立完整 aria 关联；未指定时在挂载后生成。Vue Dialog 使用原生 dialog，服务端输出关闭状态，挂载后同步受控打开状态。

## 浏览器目标

建议以现代常青桌面/移动浏览器为目标。项目的保守支持目标为 Chrome/Edge 121+、Firefox 121+、Safari/iOS Safari 17.4+；这不是对这些最低版本逐一实测的声明。当前不支持 IE。

样式与交互依赖 CSS 自定义属性、Flex/Grid、`:has()`、`focus-visible`、`dvh` 和原生 `<dialog>`。企业若需要更旧浏览器，应先在实际设备验证并选择必要的 polyfill 或降级样式；库当前没有打包这些兼容层。

`Inter` 主题选项只指定字体栈，不会下载字体。需要品牌字体时，应用负责合法字体文件、`@font-face`、加载策略和回退测试。

## 两端 API 一致性

| 意图              | React                             | Vue                                  |
| ----------------- | --------------------------------- | ------------------------------------ |
| 外观、大小        | `variant` / `size`                | `variant` / `size`                   |
| 输入值            | 原生 `value` / `onChange`         | `v-model`                            |
| Checkbox / Switch | `checked`、`onCheckedChange`      | 布尔 `v-model`                       |
| Tabs              | `items`、`value`、`onValueChange` | `items`、`v-model`、同名 panel slots |
| Dialog            | `open`、`onOpenChange`、`footer`  | `v-model`、`footer` slot             |
| Avatar            | `name`、`src`、`size`             | 同名属性，另有 `alt` / `fallback`    |
| Skeleton          | `width`、`height`                 | `width`、`height`                    |
| Separator         | `orientation`                     | `orientation`                        |
| 自定义内容        | children / ReactNode              | 默认和命名 slots                     |

一致性指语义与主题输出，不是把两个框架强行统一成相同事件签名。React 原生输入 change 接收事件对象；Vue v-model 更新接收值。Checkbox 的混合状态、组件 refs 等高级行为仍需核对对应包 API。

## 可访问性与业务能力

组件提供基础 HTML 语义、可见焦点、Tabs 键盘导航、受控 Dialog 和相关 ARIA 属性。使用方仍需提供标签、正确标题结构、业务错误说明、足够的点击区域与符合场景的对比度。任意自定义语义色可能降低对比度；局部对比计算不是全站 WCAG 合规认证。

`Table` 保留原生表格容器 API，`Select` 保留原生选择器 API。v0.3 新增的企业组件提供以下能力；它们与旧容器是不同入口。

| 组件                                     | 已有能力                                                                 | 应用仍需处理                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Form / FormField                         | 值状态、同步校验、错误摘要、提交与重置、自定义控件绑定                   | 异步校验、服务端提交、动态字段业务和第三方 Form 实例适配     |
| Calendar / DatePicker / DateRangePicker  | 严格 ISO 日期、日期网格、输入与浮层、端点限制、范围排序                  | 时间与时区、其他日期模式、区间内连续可用性                   |
| Tree / TreeSelect / Cascader / OrgPicker | 本地层级数据、单多选、级联半选、搜索与组织路径                           | 业务权限、懒加载、远程同步、虚拟化和原有值形状转换           |
| DataTable                                | 多级表头、树形行、本地排序筛选、根行分页、选择、列显隐、固定列与基础编辑 | 远程请求、虚拟滚动、拖动列宽、任意单元格合并、公式与文件导出 |
| FileList                                 | 文件信息、状态、真实进度和移除/重试回调                                  | 上传传输、鉴权、校验和实际删除                               |

所有组件与细分部件共用 Lab 主题规则；值形状、受控事件和业务能力仍需按实际使用适配。支持同一技术框架不代表任意现有系统能够自动替换。详细约定见[企业组件指南](enterprise-components.md)和[迁移指南](migration.md)。当前没有自动化的无障碍认证、旧浏览器矩阵、完整移动端真机矩阵或第三方 API 兼容认证。

## 验证方式

```sh
npm run build
npm test
node --test scripts/migrate-audit.test.mjs
```

组件包测试覆盖代表性的 SSR 语义、状态、安全数值处理，以及表单提交与错误、日期边界、树选择、表格排序筛选和列布局等行为；迁移工具测试覆盖导入检测、只读行为与报告写入边界。浏览器检查应额外执行真实交互、主题切换、窄屏和键盘路径；实际覆盖范围以本次交付记录为准。

# Design Lab AI 接入

Design Lab 调用服务端 API，由服务端请求 DeepSeek。浏览器只接收经过校验的主题配置，不会拿到模型密钥，也不会执行模型返回的代码。

## 本地启用

在仓库根目录创建 `.env`，不要提交该文件：

```dotenv
DEEPSEEK_API_KEY=你的服务端密钥
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-flash
# 本地可选；生产环境必填。设置后需在 Design Lab 中输入该访问令牌。
LAB_API_TOKEN=自行生成的长随机字符串
```

运行根目录的开发命令，或单独运行 `npm run dev --workspace=@forma-ui/api`。API 默认监听 `127.0.0.1:8787`；文档站开发服务器应将 `/api` 代理到这个地址。Node.js 需支持 `--env-file-if-exists`，推荐 Node 22.9 或更高版本。

`DEEPSEEK_API_KEY` 优先，也支持 `AI_API_KEY`。`AI_BASE_URL` 是 API 根地址，服务会追加 `/chat/completions`，不接受来自浏览器的模型地址或密钥。`AI_MODEL` 可覆盖模型名称。只有 DeepSeek 官方地址会发送 `thinking: { type: "disabled" }`；兼容服务只发送通用参数。

默认 `deepseek-flash` 依据 2026-11-10 查阅的 [DeepSeek Chat Completions 文档](https://api-docs.deepseek.com/api/create-chat-completion/)。旧名称 `deepseek-chat` 已在官方 [V4 公告](https://api-docs.deepseek.com/news/news260424/)中宣布于 2026-07-24 退役，因而没有将它用作默认值。模型可用性以你的账户和服务端实际响应为准。

## 接口

`GET /api/health` 不发起付费模型调用。返回 `configured`、`authRequired` 和 `provider`，不返回密钥或令牌。`configured` 只表示环境配置齐全，不保证密钥额度或网络可用。

```json
{ "configured": true, "authRequired": true, "provider": "DeepSeek" }
```

`POST /api/generate` 必须使用 `Content-Type: application/json`。设置 `LAB_API_TOKEN` 后同时发送 `Authorization: Bearer <访问令牌>`。令牌是站点访问令牌，不是 DeepSeek 密钥。

```json
{
  "prompt": "为企业财务系统设计稳健、紧凑的蓝色主题",
  "currentTheme": {
    "name": "Forma",
    "primary": "#2563EB",
    "radius": 8,
    "density": "comfortable",
    "font": "system"
  }
}
```

`prompt` 为 4–2000 个字符。`currentTheme` 可省略；提供时必须满足主题结构。成功返回：

```json
{
  "theme": {
    "name": "财务蓝",
    "primary": "#1D4ED8",
    "radius": 4,
    "density": "compact",
    "font": "system"
  },
  "rationale": "蓝色突出主要操作，紧凑密度适合频繁查看业务信息。",
  "source": "ai"
}
```

返回字段中 `primary` 只接受六位十六进制颜色，`radius` 只能为 0–20 的整数，字体和密度使用固定枚举。额外字段会被拒绝。AI 生成的是现有组件的主题配置；不会生成或执行新的组件源码。

错误统一为 `{ "error": "可显示的中文提示", "code": "错误类型" }`。客户端应保留现有主题并展示提示，不应用不完整结果。

| HTTP      | 场景                                  |
| --------- | ------------------------------------- |
| 400       | 输入结构、长度或 JSON 无效            |
| 401       | 缺少或错误的 Design Lab 访问令牌      |
| 403       | 浏览器跨站请求                        |
| 405 / 415 | 方法或 Content-Type 不受支持          |
| 413       | 请求体超过 16 KiB                     |
| 429       | 站点限流，带 `Retry-After`            |
| 502       | 上游错误或生成结果未通过严格校验      |
| 503       | 环境未配置，或模型服务繁忙 / 额度不足 |
| 504       | 模型请求超过 30 秒                    |

服务使用 DeepSeek 的 [JSON Output](https://api-docs.deepseek.com/guides/json_mode/) 模式，并独立验证响应。空输出、截断、代码块、额外属性和无效值都作为失败处理。系统提示中的用户内容是数据，不允许扩展为 CSS、脚本或外部资源。

## 发布

仓库根目录的 `api/generate.ts` 和 `api/health.ts` 是 Vercel Node 函数入口，与本地服务复用同一处理逻辑。在部署平台设置 `DEEPSEEK_API_KEY` 和 `LAB_API_TOKEN`。`NODE_ENV=production` 或 `VERCEL=1` 时，缺少访问令牌将关闭生成功能。

静态托管仍可使用组件、文档和手动主题编辑。要使用 AI，必须另外部署 Node API 并配置同源 `/api` 反向代理。不要把服务端密钥放进 `VITE_*` 环境变量或浏览器代码。

默认限流是每个客户端每分钟 10 次、每个服务进程每分钟总共 60 次。Node 服务使用 TCP 对端地址；Vercel 适配器使用平台覆盖的 `x-real-ip`。限流保存在进程内，重启会清空，多实例之间不会共享。面向公众或多个企业正式运营时，需要平台级限流、登录与租户权限、持久化配额和审计；当前的共享访问令牌适合受控预览，不是完整企业账户系统。

运行 `npm run test --workspace=@forma-ui/api` 验证请求校验、服务端密钥隔离、生产鉴权、模型响应校验、超时、上游错误与限流。测试使用模拟响应，不产生模型费用。没有真实密钥时不能宣称完成实际 DeepSeek 联调。

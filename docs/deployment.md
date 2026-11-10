# 发布到个人网站

仓库提供 Studio 与文档网站、Node AI 服务，以及 EdgeOne / Vercel 函数入口。BTDESIGN 已上线至 [design.btbon.cn](https://design.btbon.cn)，使用独立 EdgeOne 项目和免费 HTTPS 证书。本文记录发布结果与可用部署方式。

## 构建与交付产物

在仓库根目录使用 Node.js 22.12 或更高版本：

```sh
npm ci
npm test
npm run build
```

| 产物        | 位置                                                 | 用途                                                               |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| 静态网站    | `apps/docs/dist/`                                    | Studio、设计/开发指南与组件示例                                    |
| Node API    | `apps/api/dist/`                                     | 自有服务器上的 DeepSeek 服务                                       |
| Vercel 入口 | `api/health.ts`、`api/compose.ts`、`api/generate.ts` | Vercel 构建时自动处理的 Node 函数                                  |
| 安装包      | `apps/docs/public/downloads/*.tgz`                   | tokens、React 与 Vue 的本地分发包，构建时也进入网站 downloads 目录 |

网站使用 hash 路由，例如 `/#/lab`。内部页面刷新不会要求服务器处理 `/lab` 路径，因此不需要把所有请求重写为 `index.html`；尤其不要把 `/api/*` 重写成 HTML。

## 目标站点：design.btbon.cn（EdgeOne）

BTDESIGN 使用独立子域名 `design.btbon.cn`，保留 `www.btbon.cn` 的个人作品集。使用独立 EdgeOne Pages / Makers 项目，不更改作品集的仓库、部署或 DNS 记录。

截至 2026-11-10：

- 已创建 EdgeOne 项目 `btdesign`（项目 ID：`makers-ltsnqerkhnbf`），连接本仓库的 `main` 分支。
- 已发布部署 `dp6pg47jjowu`，对应提交 [`79c4ff9`](https://github.com/BTBON9090/btdesign-system/commit/79c4ff9)；同一提交的 [GitHub CI](https://github.com/BTBON9090/btdesign-system/actions/runs/42780783478) 已全部通过。
- DNSPod 中新增 `design` 的 CNAME：`design.btbon.cn.pages.dnsoe6.com`，TTL 600。免费证书使用自动验证、自动续签。权威 DNS、公网 HTTPS 与浏览器访问均已验证。
- 首页及 Studio 静态资源、`/api/health`、三个组件安装包均返回 HTTP 200；安装包内的所有文件与本地分发内容一致。React / Vue 预览、主题切换及组件文档导航通过浏览器检查，未出现脚本错误。发布截图见 [production.png](previews/production.png)。
- `www.btbon.cn` 原作品集保持可访问，其部署与 DNS 记录未改动。
- 生产环境的自动部署开关默认开启，但本次 Git 推送未出现在自动构建列表，最新版本通过控制台“新建部署 → main”发布。后续更新需确认平台是否实际创建新部署；未出现时使用该手动入口，不能只凭开关开启认定代码已上线。
- DeepSeek 服务端密钥和生产访问令牌尚未配置，真实 AI 调用未启用。手动编辑、组件预览与项目导出不依赖模型密钥。

仓库根目录的 `edgeone.json` 设置安装、构建与输出目录，并选择 Node 22.21.1。函数时限使用当前构建器要求的 `cloudFunctions.maxDuration: 40`，已替换弃用的 `cloudFunctions.nodejs.maxDuration`。平台预装版本以 [EdgeOne 构建指南](https://pages.edgeone.ai/document/build-guide) 为准；不要使用不满足 Vite 要求的 Node 22.11。

从 GitHub 导入本仓库时：

1. 选择 `BTBON9090/btdesign-system` 的 `main` 分支，根目录为仓库根目录。
2. 使用 `npm ci`、`npm run build`，静态输出 `apps/docs/dist`，保留默认根路径 `/`。
3. `/cloud-functions/api/` 中的三个 Node Functions 入口提供 `/api/health`、`/api/compose`、`/api/generate`；不能只把 Vercel `api/` 当作 EdgeOne 的函数目录。
4. 先验证平台提供的项目 URL，再绑定 `design.btbon.cn`，按平台返回的实际 CNAME 与验证记录配置 DNS；不要猜测 CNAME 值。
5. 检查 HTTPS、静态资源、安装包下载与 `/api/health`。AI 的服务端密钥和访问令牌在 EdgeOne 环境变量中配置；未配置时其余 Studio 功能仍可使用。

Cloud Functions 适配器复用同一套输入校验、生产认证、超时与限流逻辑。请求身份只使用平台 `context.clientIp`，请求体在读取流时限制体积；不依赖客户端自填的转发 IP 头。适配依据 [EdgeOne Node Functions](https://pages.edgeone.ai/document/node-functions)。

每次上线应核对部署对应的提交，并通过正式域名验证页面与 API；不要只凭平台构建成功认定域名、证书或 AI 配置已就绪。

## 方案一：Vercel

1. 在 Vercel 导入 [BTBON9090/btdesign-system](https://github.com/BTBON9090/btdesign-system)。
2. **Root Directory 选择仓库根目录**，不要选 `apps/docs`。这样 npm workspaces、组件包与根目录 `api/` 都会参与构建。
3. 使用 `vercel.json` 中的配置：Framework 为 Other，安装命令 `npm ci`，构建命令 `npm run build`，输出目录 `apps/docs/dist`。Node.js 选择 22.x 或满足仓库要求的更新受支持版本。
4. 若启用 AI，在对应部署环境配置 `DEEPSEEK_API_KEY` 与 `LAB_API_TOKEN`；可选配置 `AI_MODEL`、`AI_BASE_URL`。Preview 与 Production 环境应分别确认变量。
5. 部署后检查首页、`/#/lab`、安装包下载和 `/api/health`。`configured: true` 仅证明配置齐全，仍需一次真实生成验证密钥和额度。
6. 在平台绑定个人域名，按平台返回的记录配置 DNS。域名和 DNS 尚未确定时，不应假定此步骤已经完成。

在站点根目录部署时，保留默认 `BASE_PATH=/` 与 `VITE_API_BASE_URL=/api` 即可。静态目录和函数配置依据 [Vercel 配置文档](https://vercel.com/docs/project-configuration/vercel-json)；平台支持 Node 函数，无需填写第三方 `runtime` 字符串。

仓库的 GitHub Actions 只运行检查与构建，不部署。连接 Vercel Git 集成后，后续是否自动部署由该 Vercel 项目配置决定。

## 方案二：现有个人网站子目录

假设网站希望使用 `/design-system/`。先设置构建变量：

```sh
BASE_PATH=/design-system/ VITE_API_BASE_URL=/design-system/api npm run build
```

- `BASE_PATH` 必须与实际静态资源路径一致，建议以 `/` 开头并以 `/` 结尾。
- `VITE_API_BASE_URL` 是 API 前缀，包含 `/api`，不要包含 `/health` 、`/compose` 或 `/generate`。建议使用同源路径，避免浏览器跨域问题。
- 这两个值在构建时确定。使用 shell 环境或部署平台的构建变量，不要假设根目录的服务端 `.env` 会自动被文档站读取。
- 将 `apps/docs/dist/` **内部文件**复制到个人网站对应目录，例如 `/srv/www/design-system/`。

如果只部署静态文件，文档、组件展示和手动主题定制仍可使用；AI 会显示接口不可用。要启用 AI，需要同时部署下面的 Node 服务，并把接口前缀反向代理到该服务。

### Node API

在服务器保留该仓库和安装依赖，完成构建后，将 `.env.example` 复制为 `.env` 并在服务器填写密钥和访问令牌。然后运行：

```sh
NODE_ENV=production npm run start --workspace=@btdesign/api
```

服务默认监听 `127.0.0.1:8787`。用服务器的进程管理器维持运行、重启和日志；不要直接把开发模式 Vite 服务作为生产网站。需要容器网络监听时，可显式设置 `API_HOST=0.0.0.0`，同时由部署网络限制外部访问。

如果 Nginx 站点根目录为 `/srv/www`，下列位置规则展示同源子目录的对应关系；将它们合并进现有站点，不要覆盖个人网站的其他配置：

```nginx
root /srv/www;

location /design-system/api/ {
    proxy_pass http://127.0.0.1:8787/api/;
    proxy_set_header Host $host;
    proxy_read_timeout 40s;
    client_max_body_size 16k;
}

location /design-system/ {
    try_files $uri $uri/ =404;
}
```

`/design-system/api/health` 会被转发至 Node 的 `/api/health`。Node 服务不默认信任转发 IP 头；在自己的反向代理后，多个访问者可能共享同一个每客户端限额。当前方案适合受控预览；正式多人服务需要明确可信代理、平台级限流或共享配额存储。

## 环境变量

| 变量                    | 阶段           | 默认 / 作用                                              |
| ----------------------- | -------------- | -------------------------------------------------------- |
| `DEEPSEEK_API_KEY`      | 服务端运行     | 无默认；未设置时 AI 关闭                                 |
| `AI_API_KEY`            | 服务端运行     | 可选的兼容接口密钥，优先级低于 `DEEPSEEK_API_KEY`        |
| `AI_BASE_URL`           | 服务端运行     | `https://api.deepseek.com`；服务追加 `/chat/completions` |
| `AI_MODEL`              | 服务端运行     | `deepseek-flash`                                         |
| `LAB_API_TOKEN`         | 服务端运行     | 生产环境必填；独立于模型密钥的访问令牌                   |
| `API_HOST` / `API_PORT` | 自建 Node 运行 | `127.0.0.1` / `8787`，Vercel 不使用监听设置              |
| `BASE_PATH`             | 网站构建       | `/`，静态资源路径                                        |
| `VITE_API_BASE_URL`     | 网站构建       | `/api`，同源 API 前缀                                    |

所有 `VITE_*` 变量都会进入前端构建，不能存储密钥或访问令牌。`LAB_API_TOKEN` 在需要时由使用者输入界面，前端不会内置这个值。当前 API 不提供任意跨域 CORS 开放；不同域名的后端应由站点同源代理接入。

## 上线与回退

上线前至少验证文档导航、React / Vue 示例、深浅色切换、主题保存 / 导入 / ZIP 导出、接口健康状态及一次真实 AI 请求。确认生产站不会将 `.env`、日志或源目录当作静态资源公开。

保留上一个构建对应的 Git commit 和部署版本。静态网站回退时恢复同一版本的完整 `dist`；API 也回退到兼容的源码版本。企业主题应保存 JSON、CSS 与组件版本的对应关系，避免主题配置与安装包不同步。

GitHub Actions 配置位于 `.github/workflows/ci.yml`，使用锁文件安装依赖后运行测试、构建和 API 入口类型检查，测试不会调用真实模型。工作流方式参考 [GitHub Node.js CI 文档](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)。

本仓库提供 MIT 许可的原创代码。网站上线并不等于组件已发布到 npm；公开发布包前，还需确认 npm scope 所有权、包名、版本和依赖许可。

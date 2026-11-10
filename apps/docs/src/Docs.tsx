import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Layers3,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Alert, Badge, Button } from '@forma-ui/react';
import { catalog, componentCode, type ComponentId, type Framework } from './catalog';
import { ComponentDemo } from './ComponentDemo';
import { VueDemo } from './VueDemo';
import { CodeBlock, FrameworkToggle, Notice, PageLead } from './shared';
const links = [
  ['/guides/development', '快速开始'],
  ['/guides/design', '设计指南'],
  ['/practices', '最佳实践'],
  ['/migration', '系统迁移'],
];
export function Docs({ path, notify }: { path: string; notify: (s: string) => void }) {
  const [framework, setFramework] = useState<Framework>('react');
  const [filter, setFilter] = useState('');
  const selected = catalog.find((c) => `/components/${c.id}` === path);
  return (
    <main className="docs-shell" id="main">
      <aside className="docs-sidebar">
        <a href="#/guides/development" className="sidebar-title">
          开始使用
        </a>
        {links.map(([url, label]) => (
          <a
            key={url}
            href={`#${url}`}
            aria-current={path === url ? 'page' : undefined}
            className={path === url ? 'active' : ''}
          >
            {label}
          </a>
        ))}
        <a href="#/lab" className="sidebar-lab">
          <Sparkles size={14} />
          Design Lab
          <ArrowUpRight size={12} />
        </a>
        <div className="sidebar-group">
          <a href="#/components" className={path === '/components' ? 'active' : ''}>
            组件总览<span>16</span>
          </a>
        </div>
        {['通用', '数据输入', '数据展示', '导航', '反馈', '布局'].map((group) => (
          <div className="sidebar-group" key={group}>
            <span className="sidebar-label">{group}</span>
            {catalog
              .filter((c) => c.category === group)
              .map((c) => (
                <a
                  key={c.id}
                  href={`#/components/${c.id}`}
                  className={selected?.id === c.id ? 'active' : ''}
                  aria-current={selected?.id === c.id ? 'page' : undefined}
                >
                  {c.name}
                  <span>{c.cn}</span>
                </a>
              ))}
          </div>
        ))}
        <div className="sidebar-foot">
          <span className="status-dot" />
          Forma UI v0.1.0
        </div>
      </aside>
      <div className="docs-main">
        <div className="breadcrumbs">
          <a href="#/">Forma UI</a>
          <ChevronRight size={12} />
          <span>
            {selected
              ? '组件'
              : path === '/components'
                ? '组件总览'
                : links.find((l) => l[0] === path)?.[1] || '文档'}
          </span>
          {selected && (
            <>
              <ChevronRight size={12} />
              <span>{selected.name}</span>
            </>
          )}
        </div>
        {selected ? (
          <>
            <PageLead
              eyebrow={`${selected.category.toUpperCase()} / ${selected.cn}`}
              title={selected.name}
              description={selected.description}
            >
              <div className="doc-badges">
                <Badge>React</Badge>
                <Badge>Vue 3</Badge>
                <span>
                  <Check size={12} />
                  TypeScript
                </span>
              </div>
            </PageLead>
            <div className="example-heading">
              <h2 id="preview">交互预览</h2>
              <FrameworkToggle value={framework} onChange={setFramework} />
            </div>
            <div className={`component-example example-${selected.id}`}>
              {framework === 'react' ? (
                <ComponentDemo key={selected.id} kind={selected.id} onAction={notify} />
              ) : (
                <VueDemo key={selected.id} kind={selected.id} onAction={notify} />
              )}
            </div>
            <CodeBlock
              label={framework === 'react' ? 'React · TSX' : 'Vue · SFC'}
              code={componentCode(selected.id, framework)}
            />
            <h2 className="doc-section-title" id="usage">
              使用建议
            </h2>
            <div className="usage-columns">
              <div>
                <h3>保持意图清晰</h3>
                <p>
                  {selected.id === 'button'
                    ? '一个操作区域只保留一个主要按钮。用动词描述动作，如「保存更改」，让用户预期操作结果。'
                    : selected.id === 'table'
                      ? '为表格添加 caption，为列添加 th。状态需要文字说明，数字与日期使用一致格式。'
                      : '使用清晰可见的标签，优先采用原生语义。提供明确的默认、禁用与错误状态。'}
                </p>
              </div>
              <div>
                <h3>跟随整体主题</h3>
                <p>
                  通过 Design Lab
                  调整全局或组件变量。不要在业务页面写死颜色和尺寸，避免破坏企业风格与深浅色适配。
                </p>
              </div>
            </div>
            <h2 className="doc-section-title" id="api">
              API
            </h2>
            <div className="api-table-wrap">
              <table className="api-table">
                <thead>
                  <tr>
                    <th>属性</th>
                    <th>类型</th>
                    <th>默认值</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.props.map(([name, type, value]) => (
                    <tr key={name}>
                      <td>
                        <code>{name}</code>
                      </td>
                      <td>
                        <code>{type}</code>
                      </td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Notice>
              React 支持标准 HTML 属性与 className；Vue 支持 attrs / class；适用表单组件通过
              v-model，内容组件通过插槽组合。两者的状态事件遵循各自框架约定。完整类型以组件包内
              .d.ts 为准。
            </Notice>
            <div className="doc-next">
              <a
                href={`#/components/${catalog[(catalog.findIndex((c) => c.id === selected.id) + 1) % catalog.length].id}`}
              >
                下一个组件
                <ArrowRight size={15} />
              </a>
              <a href="#/lab">
                在 Design Lab 定制
                <Sparkles size={14} />
              </a>
            </div>
          </>
        ) : path === '/components' ? (
          <>
            <PageLead
              eyebrow="COMPONENTS"
              title="细节到位，组合自在。"
              description="16 个基础组件，两套框架实现。每一个都遵循相同的设计语言，随你的品牌一起变化。"
            />
            <label className="catalog-search">
              <Search size={16} />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="查找组件…"
                aria-label="查找组件"
              />
              <span>16 components</span>
            </label>
            <div className="component-catalog">
              {catalog
                .filter((c) =>
                  (c.name + c.cn + c.category).toLowerCase().includes(filter.toLowerCase()),
                )
                .map((c) => (
                  <a href={`#/components/${c.id}`} key={c.id}>
                    <div className={`catalog-visual visual-${c.id}`} aria-hidden="true">
                      <Miniature kind={c.id} />
                    </div>
                    <div className="catalog-card-title">
                      <strong>{c.name}</strong>
                      <span>{c.cn}</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </a>
                ))}
            </div>
            {!catalog.some((c) =>
              (c.name + c.cn + c.category).toLowerCase().includes(filter.toLowerCase()),
            ) && <p className="empty-state">没有找到匹配的组件。试试「输入」或「Button」。</p>}
          </>
        ) : (
          <Guide path={path} framework={framework} setFramework={setFramework} />
        )}
      </div>
      {selected && (
        <aside className="docs-toc">
          <strong>本页内容</strong>
          <a
            href="#preview"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            交互预览
          </a>
          <a
            href="#usage"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('usage')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            使用建议
          </a>
          <a
            href="#api"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('api')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            API
          </a>
          <div>
            <Sparkles size={18} />
            <p>让它成为你的风格。</p>
            <a href="#/lab">进入 Design Lab →</a>
          </div>
        </aside>
      )}
    </main>
  );
}
function Miniature({ kind }: { kind: ComponentId }) {
  switch (kind) {
    case 'button':
      return (
        <>
          <span className="mini-button">Button</span>
          <span className="mini-button secondary">Button</span>
        </>
      );
    case 'input':
      return (
        <span className="mini-input">
          you@company.com<span>│</span>
        </span>
      );
    case 'textarea':
      return <span className="mini-input mini-textarea">在这里记录你的想法…</span>;
    case 'select':
      return (
        <span className="mini-input">
          选择团队角色<span>⌄</span>
        </span>
      );
    case 'checkbox':
      return (
        <>
          <span className="mini-checkbox">✓</span>
          <span>保持同步</span>
        </>
      );
    case 'switch':
      return (
        <>
          <span className="mini-switch">
            <i />
          </span>
          <span>开启通知</span>
        </>
      );
    case 'badge':
      return (
        <>
          <Badge variant="success">已发布</Badge>
          <Badge variant="warning">审核中</Badge>
        </>
      );
    case 'card':
      return (
        <span className="mini-card">
          <span className="mini-line" />
          <span className="mini-line short" />
          <span className="mini-dot-row">
            <i />
            <i />
            <i />
          </span>
        </span>
      );
    case 'alert':
      return (
        <span className="mini-alert">
          <Check size={14} />
          更改已保存
        </span>
      );
    case 'tabs':
      return (
        <span className="mini-tabs">
          <b>概览</b>
          <span>设置</span>
          <span>成员</span>
        </span>
      );
    case 'dialog':
      return (
        <span className="mini-modal">
          <b>开始新的项目</b>
          <i />
          <span className="mini-button">确认</span>
        </span>
      );
    case 'avatar':
      return (
        <span className="mini-avatars">
          <i>AC</i>
          <i>林</i>
          <i>YN</i>
        </span>
      );
    case 'separator':
      return (
        <span className="mini-separator">
          <i />
          <hr />
          <i />
        </span>
      );
    case 'table':
      return (
        <span className="mini-table">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      );
    case 'skeleton':
      return (
        <span className="mini-skeleton">
          <i />
          <div>
            <i />
            <i />
          </div>
        </span>
      );
    case 'progress':
      return (
        <span className="mini-progress">
          <i />
        </span>
      );
  }
}
function Guide({
  path,
  framework,
  setFramework,
}: {
  path: string;
  framework: Framework;
  setFramework: (f: Framework) => void;
}) {
  if (path === '/guides/design')
    return (
      <article className="guide-article">
        <PageLead
          eyebrow="DESIGN FOUNDATIONS"
          title="秩序之上，自由表达。"
          description="Forma 的设计语言由清晰、一致和适度表达组成。把重复决策交给系统，把注意力留给用户与业务。"
        />
        <h2>01 · 先建立层级，再选择颜色</h2>
        <p>
          通过字号、字重、间距和位置表达主次。颜色用于标识品牌、操作与状态，不承担全部的信息含义。相同语义在不同页面保持相同表达。
        </p>
        <div className="design-type-spec">
          <div>
            <span>Display / 48</span>
            <strong>为清晰而设计。</strong>
          </div>
          <div>
            <span>Heading / 24</span>
            <h3>让每一步都有据可循</h3>
          </div>
          <div>
            <span>Body / 14</span>
            <p>精确的标签、适当的留白与及时的反馈，让复杂的工作更加从容。</p>
          </div>
        </div>
        <h2>02 · 三层变量，一条清晰的继承关系</h2>
        <div className="token-flow">
          <div>
            <span>01</span>
            <h3>全局基础</h3>
            <p>品牌色、圆角、字体、密度</p>
            <code>primary / radius / font</code>
          </div>
          <ArrowRight size={18} />
          <div>
            <span>02</span>
            <h3>语义角色</h3>
            <p>正文、背景、边界与状态</p>
            <code>--f-text / --f-bg</code>
          </div>
          <ArrowRight size={18} />
          <div>
            <span>03</span>
            <h3>组件表达</h3>
            <p>按钮、输入框、容器</p>
            <code>--f-button-radius</code>
          </div>
        </div>
        <p>
          默认使用继承值，需要差异时使用明确的组件变量覆盖。主题模式、界面密度和组件状态是独立维度，不要用深色模式同时改变内容密度。
        </p>
        <h2>03 · 用角色定义颜色</h2>
        <div className="semantic-swatches">
          {[
            ['品牌', 'var(--f-primary)'],
            ['成功', 'var(--f-success)'],
            ['提醒', 'var(--f-warning)'],
            ['错误', 'var(--f-danger)'],
            ['信息', 'var(--f-info)'],
          ].map(([name, color]) => (
            <div key={name}>
              <i style={{ background: color }} />
              <span>{name}</span>
            </div>
          ))}
        </div>
        <p>
          深浅色由同一组语义角色生成。品牌按钮自动选择黑色或白色前景；额外定制语义颜色时仍需验证正文、边框、焦点和状态提示的对比度。
        </p>
        <h2>04 · 布局与空间</h2>
        <p>
          界面使用 4 px 为基础的空间节奏：紧密相关的内容采用 4–8 px，控件组使用 12–16 px，区块使用
          24–32 px。密集系统可以缩小控件高度，但不应牺牲文字可读性与点击区域。
        </p>
        <h2>05 · 可访问性是日常工作</h2>
        <ul>
          <li>为每个输入提供可见标签，为图标按钮提供可读取名称。</li>
          <li>键盘可以到达所有操作；标签页支持方向键，对话框支持 Escape。</li>
          <li>状态同时用文字和颜色表达，错误提示说明修复方法。</li>
          <li>在深浅色、放大、窄屏与减少动效设置下检验界面。</li>
        </ul>
        <Notice>
          基础语义和键盘行为已纳入组件实现，但不代表使用这些组件的整个业务系统自动符合
          WCAG。需要结合页面内容与用户任务继续验证。
        </Notice>
        <a className="text-link" href="#/lab">
          在 Design Lab 中实践这些原则
          <ArrowRight size={15} />
        </a>
      </article>
    );
  if (path === '/practices')
    return (
      <article className="guide-article">
        <PageLead
          eyebrow="BEST PRACTICES"
          title="让系统，真正成为系统。"
          description="一套组件的价值，来自它在真实业务、团队协作和长期演进中的一致表现。"
        />
        <h2>从真实任务组织界面</h2>
        <p>
          后台系统按用户的工作流组织信息：查看状态、筛选对象、完成操作、确认结果。用表格对照结构化数据；用表单完成明确任务；让当前状态和下一步始终可见。
        </p>
        <div className="practice-pair">
          <div>
            <Badge variant="success">推荐</Badge>
            <h3>保存客户资料</h3>
            <p>按钮写明动作；保存时显示进行中；失败保留输入并说明原因。</p>
          </div>
          <div>
            <Badge variant="warning">需要改进</Badge>
            <h3>确定</h3>
            <p>含糊的动作名称、无响应的请求状态、错误后被清空的表单，会增加理解成本。</p>
          </div>
        </div>
        <h2>把状态作为设计的一部分</h2>
        <table className="api-table">
          <thead>
            <tr>
              <th>状态</th>
              <th>界面应提供</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>加载</td>
              <td>真实进度或骨架屏，防止重复提交</td>
            </tr>
            <tr>
              <td>空数据</td>
              <td>解释原因，并提供创建或调整筛选的行动</td>
            </tr>
            <tr>
              <td>失败</td>
              <td>错误说明、重试入口、保留用户输入</td>
            </tr>
            <tr>
              <td>成功</td>
              <td>与实际结果一致的反馈与后续入口</td>
            </tr>
            <tr>
              <td>权限不足</td>
              <td>说明限制和获取权限的途径</td>
            </tr>
          </tbody>
        </table>
        <h2>把企业风格约束写进配置</h2>
        <p>
          先由品牌负责人确定基础主题，再锁定品牌色、字体或语义配置。产品团队可以在允许的范围内调节密度和组件尺寸。AI
          输出与导入主题都通过相同的补丁函数。
        </p>
        <CodeBlock
          label="TypeScript"
          code={`import { applyThemePatch, type ThemePolicy } from '@forma-ui/tokens';\n\nconst policy: ThemePolicy = { locked: ['primary', 'font'] };\nconst next = applyThemePatch(companyTheme, proposedTheme, policy);\n// locked 中的字段继续使用 companyTheme 的值。`}
        />
        <Notice>
          Lab 的锁定是主题编辑约束。CSS
          本身可被业务代码覆盖；正式的多企业服务还应在服务端保存、校验组织策略，并通过 CI
          检查绕过主题变量的代码。
        </Notice>
        <h2>保持组件 API 的可预测性</h2>
        <p>
          React 使用标准事件、props 和组合；Vue 使用 attrs、插槽和
          v-model。跨框架共享的是设计与行为约定，而不是强行把一个框架的运行时嵌进另一个框架。
        </p>
        <h2>发布前的检查</h2>
        <ul>
          <li>主题变更同时检查深浅色与紧凑密度。</li>
          <li>复杂组件用实际业务数据验证，包含长文本、空数据与错误。</li>
          <li>组件升级采用语义化版本，记录破坏性变更和回退方式。</li>
          <li>为公共组件提供代码、类型、行为说明与迁移示例。</li>
        </ul>
        <a className="text-link" href="#/migration">
          阅读渐进迁移指南
          <ArrowRight size={15} />
        </a>
      </article>
    );
  if (path === '/migration')
    return (
      <article className="guide-article">
        <PageLead
          eyebrow="MIGRATION"
          title="让迁移，保持可控。"
          description="从统一主题开始，按页面与组件逐步迁移。保留业务行为，显式处理框架差异。"
        />
        <Alert variant="info" title="兼容的边界">
          Forma v0.1 支持 React 18 / 19 与 Vue 3.4+。现有 Ant Design、Arco、shadcn/ui 等组件的 API
          需要逐项适配，并非替换包名即可完成。
        </Alert>
        <h2>1. 先做依赖清点</h2>
        <p>
          迁移审计工具静态读取源代码，列出已有第三方组件、Forma
          候选映射，以及不能自动确认的用法。它不会修改业务代码。
        </p>
        <CodeBlock
          label="Terminal"
          code={
            'npm run migrate:audit -- /path/to/your-app --framework react --out ./migration-report\n# Vue 项目使用 --framework vue'
          }
        />
        <h2>2. 建立品牌主题</h2>
        <p>
          将现有主色、圆角、字体和密度录入 Design
          Lab。检查实际页面后锁定品牌规则。旧系统可先消费导出的 CSS
          变量，让主题先统一，再逐步替换组件。
        </p>
        <CodeBlock
          label="CSS"
          code={
            '.legacy-primary-button {\n  color: var(--f-on-primary);\n  background: var(--f-primary);\n  border-radius: var(--f-button-radius);\n}\n\n.legacy-panel {\n  color: var(--f-text);\n  background: var(--f-surface);\n  border-color: var(--f-border);\n}'
          }
        />
        <h2>3. 从简单、独立的组件开始</h2>
        <p>
          先迁移 Button、Input、Badge、Card，再迁移表单与弹窗。为第三方复杂 API
          编写临时兼容包装层，逐步消除旧依赖。通过组件前缀与作用域主题让新旧界面共存。
        </p>
        <table className="api-table">
          <thead>
            <tr>
              <th>已有功能</th>
              <th>迁移方式</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>基础按钮、输入、标签</td>
              <td>候选组件映射后核对 props、事件和样式</td>
            </tr>
            <tr>
              <td>Dialog / Modal</td>
              <td>适配受控状态、关闭事件与异步确认行为</td>
            </tr>
            <tr>
              <td>高级表格 / Form</td>
              <td>保留成熟业务层；Forma Table 仅提供原生表格样式与语义</td>
            </tr>
            <tr>
              <td>树、复杂日期、上传、虚拟列表</td>
              <td>本版未提供，继续通过主题适配使用原库</td>
            </tr>
          </tbody>
        </table>
        <h2>4. 验证与分批上线</h2>
        <p>
          对关键路径做行为回归；比较键盘焦点、校验、异步状态和深浅色。使用功能开关逐页启用，保留旧版本以便回退。迁移完成度以真实业务验收为准。
        </p>
        <a
          className="text-link"
          href="https://github.com/BTBON9090/btdesign-system/blob/main/docs/architecture.md"
          target="_blank"
          rel="noreferrer"
        >
          阅读底层架构与扩展协议
          <ArrowUpRight size={15} />
        </a>
      </article>
    );
  return (
    <article className="guide-article">
      <PageLead
        eyebrow="GET STARTED"
        title="从这里，开始构建。"
        description="选择你的框架，让设计与工程从第一行代码起保持一致。"
      />
      <div className="guide-framework">
        <FrameworkToggle value={framework} onChange={setFramework} />
        <span>Node.js ≥ 22.12 · TypeScript · ESM</span>
      </div>
      <h2>1. 获取并启动项目</h2>
      <p>当前版本通过源码仓库和本地安装包分发，尚未发布到 npm 公共注册表。</p>
      <CodeBlock
        label="Terminal"
        code={
          'git clone https://github.com/BTBON9090/btdesign-system.git\ncd btdesign-system\nnpm install\nnpm run dev'
        }
      />
      <h2>2. 在已有项目中安装</h2>
      <p>
        运行打包命令生成带有类型声明的组件安装包，再将 tokens 与对应框架包复制到目标项目安装。Design
        Lab 也可以直接导出安装包。
      </p>
      <CodeBlock
        label="Terminal"
        code={`# 在 Forma 仓库中\nnpm run pack:libs\n\n# 在目标项目中，替换为实际文件路径\nnpm install /path/to/forma-ui-tokens-0.1.0.tgz \\\n  /path/to/forma-ui-${framework}-0.1.0.tgz`}
      />
      <h2>3. 使用组件</h2>
      <CodeBlock
        label={framework === 'react' ? 'App.tsx' : 'App.vue'}
        code={
          framework === 'react'
            ? `import { Button, Card } from '@forma-ui/react';\nimport '@forma-ui/tokens/styles.css';\n\nexport default function App() {\n  return <Card>\n    <h2>你好，Forma。</h2>\n    <Button onClick={() => console.log('开始构建')}>开始构建</Button>\n  </Card>;\n}`
            : `<script setup>\nimport { Button, Card } from '@forma-ui/vue';\nimport '@forma-ui/tokens/styles.css';\n</script>\n\n<template>\n  <Card>\n    <h2>你好，Forma。</h2>\n    <Button @click="console.log('开始构建')">开始构建</Button>\n  </Card>\n</template>`
        }
      />
      <h2>4. 接入品牌主题与深色模式</h2>
      <p>
        在 Lab 中导出 theme.css，在组件基础样式之后加载。使用 data-theme 切换深浅色，也可以通过
        createTheme 给局部容器赋值。
      </p>
      <CodeBlock
        label="TypeScript"
        code={`import '@forma-ui/tokens/styles.css';\nimport './theme.css';\n\ndocument.documentElement.dataset.theme = 'dark';\n// 切回浅色：'light'`}
      />
      <h2>5. 启用 DeepSeek</h2>
      <p>
        在根目录创建 .env，参考 .env.example 设置服务端密钥。重启 npm run dev 后，Design Lab
        会连接本地 API。密钥不会进入前端构建。
      </p>
      <CodeBlock
        label=".env"
        code={
          'DEEPSEEK_API_KEY=your-server-side-key\nAI_MODEL=deepseek-flash\n# 公开部署时同时配置访问令牌\nLAB_API_TOKEN=your-lab-access-token'
        }
      />
      <Notice>
        AI
        根据描述生成主题配置，由主题引擎应用到已有组件。它不会自动生成任意新交互组件。对外提供多企业服务前，还需接入组织登录、策略存储和共享限流。
      </Notice>
      <h2>6. 构建与发布</h2>
      <CodeBlock
        label="Terminal"
        code={
          'npm test\nnpm run build\n# 静态站产物：apps/docs/dist\n# Node API：apps/api/dist/server.js'
        }
      />
      <p>
        仓库提供 Vercel 部署配置与 GitHub Actions 检查。静态站可以部署在个人网站子目录；DeepSeek
        功能需要 Node API 或 Vercel 函数。详细部署方法见仓库 README。
      </p>
      <div className="doc-next">
        <a href="#/components">
          浏览组件
          <ArrowRight size={15} />
        </a>
        <a href="#/lab">
          定制主题
          <Sparkles size={15} />
        </a>
      </div>
    </article>
  );
}

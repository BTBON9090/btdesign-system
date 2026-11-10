import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Search, Sparkles } from 'lucide-react';
import { Alert, Badge } from '@btdesign/react';
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
          创作空间
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
          BTDESIGN v0.1.0
        </div>
      </aside>
      <div className="docs-main">
        <div className="breadcrumbs">
          <a href="#/">BTDESIGN</a>
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
                  在创作空间选择一个元素，查看它继承的设计规则。调整品牌、语义或组件变量，让各页面与
                  React / Vue 实现共同遵循一份主题。
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
                在创作空间中理解与调整
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
            <a href="#/lab">进入创作空间 →</a>
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
          title="让设计决策，看得见、带得走。"
          description="从使用者与任务开始，在真实界面里观察规则的影响，再把这些决定交给团队和 AI 继续使用。"
        />
        <h2>01 · 用简报确定方向</h2>
        <p>
          在创作空间描述谁会使用系统、要完成什么任务，以及希望传达的感受。比如「为创意工作室做项目协作界面，方便查看进度；清爽、有秩序，保留一点活力」。
          连接 DeepSeek 后可生成设计提案；也可以直接选择团队工作台、项目协作或账户登录，手动开始。
        </p>
        <p>
          生成结果会先作为提案展示。检查场景、文案与主题，比较调整前后，再选择应用或放弃。当前 AI
          在这三个场景中配置设计，不生成任意新组件或完整业务系统。
        </p>
        <h2>02 · 在画布里理解设计与结构</h2>
        <p>
          点击「选择并理解界面」，再选页面、按钮、输入框、容器或表格。「设计」面板说明当前元素的意图并提供主题调整；「前端结构」展示组件语义、结构示意与关联变量。也可以用画布下方的类别按钮选择。
        </p>
        <p>
          对按钮、输入框和容器的修改作用于该类组件规则，而非某一个实例。关闭检查模式即可实际操作界面。切换
          React / Vue、深浅色与移动端画布，观察同一设计在不同条件下的表现。
        </p>
        <h2>03 · 先建立层级，再选择颜色</h2>
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
        <h2>04 · 三层变量，一条清晰的继承关系</h2>
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
        <h2>05 · 用角色定义颜色</h2>
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
        <h2>06 · 布局与空间</h2>
        <p>
          界面使用 4 px 为基础的空间节奏：紧密相关的内容采用 4–8 px，控件组使用 12–16 px，区块使用
          24–32 px。密集系统可以缩小控件高度，但不应牺牲文字可读性与点击区域。
        </p>
        <h2>07 · 可访问性是日常工作</h2>
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
          打开创作空间，实践这些原则
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
        <h2>让设计、实现与 AI 使用同一份上下文</h2>
        <p>
          先在画布里确定目标场景与内容，再到「设计规则」核对共享主题。在「开发交付」查看文件，复制给
          AI 的上下文，或下载项目包。让编程助手先读取项目规范与组件约定，再继续扩展业务界面。
        </p>
        <CodeBlock
          label="交付约定"
          code={
            'AGENTS.md                    设计与实现约定\n.btdesign/system.json         场景、文案、主题与品牌策略\n.btdesign/components.json     真实组件 API 与语义变量\nApp.tsx / App.vue            与画布同源的场景实现\ntheme.css / app.css          深浅色主题与页面样式'
          }
        />
        <p>
          预览与导出的页面主体使用同一份场景定义和样式。结构面板里的短代码用于解释组合方式；完整可运行的页面代码在「开发交付」中。扩展功能时保留这份规则，新增复杂能力前核对组件实际
          API。
        </p>
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
          提案和导入的主题补丁都通过相同的约束函数。打开一个完整项目则会载入该项目自己的主题与策略。
        </p>
        <CodeBlock
          label="TypeScript"
          code={`import { applyThemePatch, type ThemePolicy } from '@btdesign/tokens';\n\nconst policy: ThemePolicy = { locked: ['primary', 'font'] };\nconst next = applyThemePatch(companyTheme, proposedTheme, policy);\n// locked 中的字段继续使用 companyTheme 的值。`}
        />
        <Notice>
          工作空间的锁定是主题编辑约束。CSS
          本身可被业务代码覆盖；正式的多企业服务还应在服务端保存、校验组织策略，并通过 CI
          检查绕过主题变量的代码。
        </Notice>
        <h2>给重要决定留下版本</h2>
        <p>
          当前项目自动保存在本机浏览器；关键调整前使用「保存版本」命名快照，再比较或恢复。最多保留
          20 个命名版本，当前会话支持最多 50 步撤销。重要版本及时导出项目 JSON，便于备份和转交。
        </p>
        <p>
          版本记录保存场景、内容、主题和规则。画布里的示例成员、项目状态与表单输入是临时交互数据，不属于设计版本，也不会随交付包导出。当前没有云端协作、跨设备同步或组织审批。
        </p>
        <h2>把演示行为接入真实服务</h2>
        <p>
          示例中的邀请、项目创建、设置和登录仅在本地演示。接入业务后端时补充认证与权限、持久化、加载和错误状态；收到服务端成功结果后再展示成功反馈。不要把本地校验通过当成真实登录或邮件送达。
        </p>
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
          description="先带入熟悉的品牌风格，再识别旧系统的组件与差异，按业务页面逐步迁入同一套规则。"
        />
        <Alert variant="info" title="兼容的边界">
          BTDESIGN v0.1 支持 React 18 / 19 与 Vue 3.4+。现有 Ant Design、Arco、shadcn/ui 等组件的
          API 需要逐项适配，并非替换包名即可完成。
        </Alert>
        <h2>1. 带入已有的品牌风格</h2>
        <p>
          在创作空间打开「迁入」，选择「带入现有风格」。粘贴 Ant Design token JSON、BTDESIGN 主题
          JSON，或受支持的 CSS 变量，例如 --primary、--radius、--background、--foreground。颜色使用
          HEX，圆角使用 px。
        </p>
        <p>
          先「检查映射」，逐项查看识别字段与差异提示，再应用到当前项目。只更新识别出的字段，当前已锁定的品牌规则继续生效。HSL、OKLCH
          等颜色表达式需先转换为支持的格式。
        </p>
        <h2>2. 在本地清点组件依赖</h2>
        <p>
          迁移审计工具静态读取源代码，列出已有第三方组件、BTDESIGN
          候选映射，以及不能自动确认的用法。支持识别 Ant Design、Arco、Ant Design Vue、Element Plus
          和常见 shadcn 本地导入。候选表示需要评估的对应关系，不代表已完成迁移。
        </p>
        <CodeBlock
          label="Terminal"
          code={
            'npm run migrate:audit -- /path/to/your-app --framework react --out ./migration-report\n# Vue 项目使用 --framework vue'
          }
        />
        <p>
          在 BTDESIGN
          仓库根目录运行命令，把路径替换为业务项目的绝对路径；包含空格时加引号，输出目录使用尚未生成过报告的位置。然后在「迁移现有代码」中打开生成的
          migration-report.json，按「可评估替换」「需补齐能力」「暂无对应」等状态筛选处理。
        </p>
        <Notice>
          审计工具只读扫描业务源代码，另行写入报告；浏览器只在本地读取报告，不上传报告或源码。自动导入、全局注册和自定义包装仍需人工核查，零记录不代表迁移完成。
        </Notice>
        <h2>3. 让新旧界面共用设计规则</h2>
        <p>
          在画布验证品牌主题的深浅色表现，锁定共享规则后导出
          theme.css。旧系统先通过兼容样式消费同一组语义变量，新页面再使用 BTDESIGN
          组件。将兼容样式限定在业务作用域内，逐步减少旧依赖。
        </p>
        <CodeBlock
          label="CSS"
          code={
            '.legacy-primary-button {\n  color: var(--f-on-primary);\n  background: var(--f-primary);\n  border-radius: var(--f-button-radius);\n}\n\n.legacy-panel {\n  color: var(--f-text);\n  background: var(--f-surface);\n  border-color: var(--f-border);\n}'
          }
        />
        <h2>4. 从简单、独立的组件开始</h2>
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
              <td>保留成熟业务层；BTDESIGN Table 仅提供原生表格样式与语义</td>
            </tr>
            <tr>
              <td>树、复杂日期、上传、虚拟列表</td>
              <td>本版未提供，继续通过主题适配使用原库</td>
            </tr>
          </tbody>
        </table>
        <Notice>
          特别检查按钮的 type：Ant Design / Arco 中它可能代表视觉样式，BTDESIGN 中它是原生 button /
          submit / reset。视觉样式使用 variant；不要直接复制属性后跳过行为验证。
        </Notice>
        <h2>5. 验证与分批上线</h2>
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
        title="从想法，到可以继续开发的界面。"
        description="在同一个工作空间表达需求、理解设计、确认规则，把可运行的场景和上下文一起带进 React 或 Vue 项目。"
      />
      <div className="guide-framework">
        <FrameworkToggle value={framework} onChange={setFramework} />
        <span>Node.js ≥ 22.12 · TypeScript · ESM</span>
      </div>
      <h2>1. 在工作空间确定设计</h2>
      <ol>
        <li>
          写下使用者、任务和期望的风格，连接 DeepSeek
          生成提案；或直接选择团队工作台、项目协作、账户登录。
        </li>
        <li>在画布切换框架、深浅色与移动端。选中元素，在「设计」与「前端结构」中理解并调整它。</li>
        <li>到「设计规则」确认主题与锁定项。应用提案后保存命名版本，比较需要保留的改动。</li>
        <li>进入「开发交付」，检查完整源代码与规则，再复制给 AI 或下载项目包。</li>
      </ol>
      <p>
        手动调整、场景预览和交付无需连接
        AI。当前提案只选择与配置上述三个场景；场景中的成员、项目和表单使用本地示例数据。
      </p>
      <a className="text-link" href="#/studio">
        进入创作空间
        <ArrowRight size={15} />
      </a>
      <h2>2. 获取并启动源码项目</h2>
      <p>当前版本通过源码仓库和本地安装包分发，尚未发布到 npm 公共注册表。</p>
      <CodeBlock
        label="Terminal"
        code={
          'git clone https://github.com/BTBON9090/btdesign-system.git\ncd btdesign-system\nnpm ci\nnpm run dev'
        }
      />
      <h2>3. 将交付包接入已有项目</h2>
      <p>
        在「开发交付」下载项目包，可选包含 tokens 与当前框架的组件安装包。将 App.tsx 或
        App.vue、theme.css、app.css 放入同一源码目录，把 App 作为页面组件引用。React 场景还需安装
        lucide-react。目标项目需已具备 React 18 / 19 或 Vue 3.4+、低于 4 的运行环境。
      </p>
      <CodeBlock
        label="项目包内容"
        code={
          'AGENTS.md\n.btdesign/system.json\n.btdesign/components.json\nApp.tsx 或 App.vue\ntheme.css / app.css\nREADME.md\nbtdesign-project.json\npackages/*.tgz（可选）'
        }
      />
      <p>
        保留 AGENTS.md 和 .btdesign 目录，让 AI 编程工具读取设计约束与真实组件 API
        后再修改页面。btdesign-project.json 用于重新打开 Studio
        项目；交付包提供页面组件，不包含完整构建脚手架、路由或业务后端。
      </p>
      <p>也可以在仓库运行打包命令，再将安装包复制到目标项目：</p>
      <CodeBlock
        label="Terminal"
        code={`# 在 BTDESIGN 仓库中\nnpm run pack:libs\n\n# 在目标项目中，替换为实际文件路径\nnpm install /path/to/btdesign-tokens-0.1.0.tgz \\\n  /path/to/btdesign-${framework}-0.1.0.tgz${framework === 'react' ? '\n\n# 使用导出的 React 场景时\nnpm install lucide-react' : ''}`}
      />
      <h2>4. 单独使用组件</h2>
      <CodeBlock
        label={framework === 'react' ? 'App.tsx' : 'App.vue'}
        code={
          framework === 'react'
            ? `import { Button, Card } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function App() {\n  return <Card>\n    <h2>你好，BTDESIGN。</h2>\n    <Button onClick={() => console.log('开始构建')}>开始构建</Button>\n  </Card>;\n}`
            : `<script setup>\nimport { Button, Card } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  <Card>\n    <h2>你好，BTDESIGN。</h2>\n    <Button @click="console.log('开始构建')">开始构建</Button>\n  </Card>\n</template>`
        }
      />
      <h2>5. 接入主题与深色模式</h2>
      <p>
        按基础组件样式、theme.css、业务页面样式的顺序加载。使用 data-theme 切换深浅色，也可以通过
        createTheme 给局部容器赋值。Studio 的外壳明暗与画布预览模式分别控制。
      </p>
      <CodeBlock
        label="TypeScript"
        code={`import '@btdesign/tokens/styles.css';\nimport './theme.css';\n\ndocument.documentElement.dataset.theme = 'dark';\n// 切回浅色：'light'`}
      />
      <h2>6. 启用 DeepSeek 设计提案</h2>
      <p>
        在根目录创建 .env，参考 .env.example 填写服务端密钥并重启 npm run dev。服务端调用
        DeepSeek，返回场景、名称、文案、主题种子与解释，校验后作为待确认提案显示。模型密钥保留在服务端。
      </p>
      <CodeBlock
        label=".env"
        code={
          'DEEPSEEK_API_KEY=your-server-side-key\nAI_MODEL=deepseek-flash\n# 公开部署时同时配置访问令牌\nLAB_API_TOKEN=your-lab-access-token'
        }
      />
      <Notice>
        公开部署还需要独立的 LAB_API_TOKEN，在工作空间的「AI 连接设置」输入访问令牌；这里不填写
        DeepSeek
        密钥。未配置或请求失败会显示真实状态，手动工作仍然可用。多企业服务的组织登录、策略存储与共享限流需另行接入。
      </Notice>
      <h2>7. 构建与发布</h2>
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
          继续创作
          <Sparkles size={15} />
        </a>
      </div>
    </article>
  );
}

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Command,
  Layers3,
  MousePointer2,
  Palette,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Avatar, Badge, Button, Card, Input, Switch } from '@forma-ui/react';
import { MembersTable } from './ComponentDemo';
import { useState, type CSSProperties } from 'react';
import { createTheme, defaultTheme } from '@forma-ui/tokens';
export function Home({ notify }: { notify: (message: string) => void }) {
  const [color, setColor] = useState('#D43845');
  return (
    <main id="main">
      <section className="home-hero">
        <a href="#/components" className="release-pill">
          <span className="status-dot" />
          <span>Forma UI 0.1</span>
          <span className="pill-divider" />
          <span>从一致，到独特</span>
          <ArrowRight size={13} />
        </a>
        <h1>
          让好的设计，
          <br />
          成为<span>共同语言。</span>
        </h1>
        <p className="hero-description">
          为设计师与开发者而生的企业级 UI 基础。
          <br className="desktop-break" />
          跨越 React 与 Vue，用一套设计系统，构建属于你的产品。
        </p>
        <div className="hero-actions">
          <a className="button-link solid" href="#/guides/development">
            开始构建
            <ArrowRight size={16} />
          </a>
          <a className="button-link outline" href="#/lab">
            <Sparkles size={16} />
            探索 Design Lab
          </a>
        </div>
        <div className="hero-meta">
          <span>
            <span className="framework-dot react-dot" />
            React
          </span>
          <span>
            <span className="framework-dot vue-dot" />
            Vue 3
          </span>
          <i />
          <span>
            <Code2 size={13} />
            TypeScript
          </span>
          <span>
            <Check size={13} />
            MIT 开源
          </span>
        </div>
      </section>
      <section
        className="hero-showcase"
        aria-label="组件交互预览"
        style={createTheme({ ...defaultTheme, primary: color }, 'light') as CSSProperties}
        data-theme="light"
      >
        <div className="showcase-grid-lines" aria-hidden="true" />
        <div className="showcase-label">
          <span>DESIGNED TO WORK TOGETHER</span>
          <span>01 — 16</span>
        </div>
        <div className="showcase-left">
          <div className="swatch-card">
            <div className="sample-label">
              <Palette size={15} />
              <span>你的品牌，你的色彩</span>
            </div>
            <div className="swatch-options">
              {['#D43845', '#2563EB', '#16815D', '#7C3AED', '#262626'].map((c) => (
                <button
                  style={{ background: c }}
                  aria-label={`预览品牌色 ${c}`}
                  aria-pressed={color === c}
                  key={c}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check size={17} />}
                </button>
              ))}
            </div>
            <div className="swatch-caption">
              <span>Brand / Primary</span>
              <code>{color}</code>
            </div>
          </div>
          <Card className="home-profile">
            <div className="profile-heading">
              <Avatar name="Alex Chen" size="lg" />
              <Badge variant="success">在线</Badge>
            </div>
            <h3>Alex Chen</h3>
            <p>把想法变成更好的产品。</p>
            <div className="profile-foot">
              <span>Product designer</span>
              <ArrowUpRight size={15} />
            </div>
          </Card>
        </div>
        <div className="showcase-center">
          <div className="showcase-app-header">
            <span className="mini-logo">f</span>
            <strong>Acme Workspace</strong>
            <span className="app-header-spacer" />
            <Avatar name="林晓" size="sm" />
          </div>
          <div className="showcase-app-body">
            <div className="showcase-app-title">
              <div>
                <h3>团队成员</h3>
                <p>好设计，从默契的协作开始。</p>
              </div>
              <Button size="sm" onClick={() => notify('前往 Design Lab，体验完整的团队邀请表单。')}>
                <Plus size={13} />
                邀请
              </Button>
            </div>
            <div className="sample-tabs">
              <span>所有成员</span>
              <span>邀请中</span>
            </div>
            <MembersTable compact />
            <div className="sample-setting">
              <div>
                <strong>让灵感保持同步</strong>
                <p>接收团队动态与设计更新</p>
              </div>
              <Switch aria-label="接收团队动态" defaultChecked />
            </div>
          </div>
          <div className="showcase-app-footer">
            <span>
              <span className="status-dot" />
              共享一套设计语言
            </span>
            <span>React + Vue</span>
          </div>
        </div>
        <div className="showcase-right">
          <Card className="quick-form">
            <div className="surface-icon">
              <Layers3 size={20} />
            </div>
            <h3>好想法，从这里开始。</h3>
            <p>为下一个项目创建空间。</p>
            <label className="demo-field">
              项目名称
              <Input placeholder="我的新项目" />
            </label>
            <Button
              className="full-width"
              onClick={() => notify('进入 Design Lab 可预览完整表单与自定义主题。')}
            >
              创建项目
              <ArrowRight size={14} />
            </Button>
          </Card>
          <div className="floating-cursor" aria-hidden="true">
            <MousePointer2 size={21} fill="var(--f-primary)" />
            <span>Make it yours.</span>
          </div>
          <div className="status-samples">
            <Badge variant="success">设计就绪</Badge>
            <Badge variant="info">正在构建</Badge>
            <Badge>无限可能</Badge>
          </div>
        </div>
        <div className="showcase-bottom">
          <span>
            <span className="status-dot" />
            真实组件，可直接交互
          </span>
          <a href="#/components">
            浏览全部组件
            <ArrowUpRight size={13} />
          </a>
        </div>
      </section>
      <section className="principles-section">
        <div className="section-intro">
          <span className="eyebrow">ONE SYSTEM. YOUR EXPRESSION.</span>
          <h2>
            统一的是基础，
            <br />
            自由的是表达。
          </h2>
          <p>从设计决策到代码实现，让每一个环节都使用同一种语言。</p>
        </div>
        <div className="principle-list">
          <a href="#/guides/design">
            <span className="principle-number">01</span>
            <div>
              <h3>一套可延续的设计秩序</h3>
              <p>色彩、排版、间距和状态，通过语义变量建立清晰的规则。</p>
            </div>
            <ArrowUpRight size={18} />
          </a>
          <a href="#/components">
            <span className="principle-number">02</span>
            <div>
              <h3>跨框架，相同的体验</h3>
              <p>独立的 React 与 Vue 3 组件包，共用主题和样式规范。</p>
            </div>
            <ArrowUpRight size={18} />
          </a>
          <a href="#/lab">
            <span className="principle-number">03</span>
            <div>
              <h3>让品牌，成为系统的一部分</h3>
              <p>在 Design Lab 中调整、预览与导出，也可以借助 AI 探索风格。</p>
            </div>
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="home-lab-banner">
        <div>
          <span className="eyebrow">
            <Sparkles size={13} /> DESIGN LAB
          </span>
          <h2>
            你的设计语言，
            <br />
            不必从零开始。
          </h2>
          <p>
            用一句话描述品牌，用细节打磨风格。
            <br />
            一份配置，贯穿整个产品。
          </p>
          <a className="button-link solid" href="#/lab">
            开始定制
            <Sparkles size={15} />
          </a>
        </div>
        <div className="brand-compositions" aria-hidden="true">
          <div className="brand-study">
            <span>Fintech / 01</span>
            <h3>
              Clarity
              <br />
              in every detail.
            </h3>
            <div>
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="study-button">Continue →</span>
          </div>
          <div className="brand-study alternate">
            <span>Creative / 02</span>
            <h3>
              Space for
              <br />
              what’s next.
            </h3>
            <div>
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="study-button">Let’s create →</span>
          </div>
        </div>
      </section>
      <section className="getting-started">
        <span className="eyebrow">BUILD WITH FORMA</span>
        <h2>从下一次构建开始。</h2>
        <div>
          <a href="#/guides/development">
            <Code2 size={21} />
            <h3>我是开发者</h3>
            <p>安装组件包，接入主题，开始构建。</p>
            <span>
              阅读开发指南
              <ArrowRight size={14} />
            </span>
          </a>
          <a href="#/guides/design">
            <Palette size={21} />
            <h3>我是设计师</h3>
            <p>理解设计原则，建立一致的产品体验。</p>
            <span>
              阅读设计指南
              <ArrowRight size={14} />
            </span>
          </a>
          <a href="#/practices">
            <ShieldCheck size={21} />
            <h3>我在构建一个系统</h3>
            <p>从品牌规范到渐进迁移，形成团队共识。</p>
            <span>
              探索最佳实践
              <ArrowRight size={14} />
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}

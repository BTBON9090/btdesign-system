import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Command, GitBranch, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { Dialog, Input } from '@btdesign/react';
import { createTheme, defaultTheme, type ThemeMode } from '@btdesign/tokens';
import { catalog } from './catalog';
import { Footer, Logo } from './shared';

const Docs = lazy(() => import('./Docs').then((m) => ({ default: m.Docs })));
const Studio = lazy(() => import('./studio/Studio').then((m) => ({ default: m.Studio })));
function currentPath() {
  return location.hash.replace(/^#/, '') || '/';
}
function savedMode(): ThemeMode {
  try {
    const saved = localStorage.getItem('forma-mode');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export function App() {
  const [path, setPath] = useState(currentPath);
  const isStudio = ['/', '/lab', '/studio'].includes(path);
  const [mode, setMode] = useState<ThemeMode>(savedMode);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function notify(message: string) {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 4500);
  }
  useEffect(() => {
    const change = () => {
      setPath(currentPath());
      setMenu(false);
      setSearch(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    const vars = createTheme(defaultTheme, mode);
    for (const [key, value] of Object.entries(vars))
      document.documentElement.style.setProperty(key, value);
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    try {
      localStorage.setItem('forma-mode', mode);
    } catch {}
  }, [mode]);
  useEffect(() => {
    document.title = ['/', '/lab', '/studio'].includes(path)
      ? 'BTDESIGN · 设计与开发的共同工作空间'
      : path.startsWith('/components')
        ? '组件 · BTDESIGN'
        : path === '/'
          ? 'BTDESIGN — 让好的设计成为共同语言'
          : '指南 · BTDESIGN';
  }, [path]);
  const searchItems = [
    { title: '快速开始', detail: '安装与配置', url: '/guides/development' },
    { title: '设计指南', detail: '色彩、排版与语义变量', url: '/guides/design' },
    { title: '创作空间', detail: '自然语言、设计规则与开发交付', url: '/' },
    { title: '最佳实践', detail: '从组件到系统', url: '/practices' },
    { title: '系统迁移', detail: '渐进替换与兼容架构', url: '/migration' },
    ...catalog.map((c) => ({ title: c.name, detail: c.cn, url: `/components/${c.id}` })),
  ].filter((c) => (c.title + c.detail).toLowerCase().includes(query.toLowerCase()));
  const isKnown =
    path === '/' ||
    path === '/lab' ||
    path === '/studio' ||
    path === '/components' ||
    path === '/practices' ||
    path === '/migration' ||
    ['/guides/development', '/guides/design'].includes(path) ||
    catalog.some((c) => path === `/components/${c.id}`);
  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.setAttribute('tabindex', '-1');
          document.getElementById('main')?.focus();
          document.getElementById('main')?.scrollIntoView();
        }}
      >
        跳到主要内容
      </a>
      {!isStudio && (
        <header className="site-header">
          <div className="header-inner">
            <Logo />
            <span className="header-version">v0.7</span>
            <nav className={`desktop-nav ${menu ? 'mobile-open' : ''}`} aria-label="主导航">
              <a
                href="#/guides/development"
                className={path === '/guides/development' ? 'active' : ''}
              >
                开发指南
              </a>
              <a href="#/guides/design" className={path === '/guides/design' ? 'active' : ''}>
                设计指南
              </a>
              <a href="#/components" className={path.startsWith('/components') ? 'active' : ''}>
                组件
              </a>
              <a href="#/practices" className={path === '/practices' ? 'active' : ''}>
                最佳实践
              </a>
              <a href="#/lab" className={`nav-lab ${path === '/lab' ? 'active' : ''}`}>
                进入创作空间<span>AI</span>
              </a>
            </nav>
            <div className="header-actions">
              <button
                aria-label="搜索文档"
                className="search-trigger"
                onClick={() => setSearch(true)}
              >
                <Search size={14} />
                <span>搜索文档…</span>
                <kbd>⌘ K</kbd>
              </button>
              <span className="header-divider" />
              <a
                className="icon-button github-link"
                aria-label="GitHub 仓库"
                href="https://github.com/BTBON9090/btdesign-system"
                target="_blank"
                rel="noreferrer"
              >
                <GitBranch size={18} />
              </a>
              <button
                className="icon-button"
                aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
                title={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
                onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
              >
                {mode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>
              <button
                className="icon-button mobile-menu-button"
                aria-label="展开导航"
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>
        </header>
      )}
      <Suspense
        fallback={
          <main id="main" className="route-loading">
            正在加载…
          </main>
        }
      >
        {isStudio ? (
          <Studio
            notify={notify}
            mode={mode}
            onModeChange={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
          />
        ) : isKnown ? (
          <Docs path={path} notify={notify} mode={mode} />
        ) : (
          <main id="main" className="not-found">
            <span>404</span>
            <h1>这一页还不存在。</h1>
            <p>回到首页，继续探索 BTDESIGN。</p>
            <a className="button-link solid" href="#/">
              返回首页
              <ArrowRight size={15} />
            </a>
          </main>
        )}
      </Suspense>
      {!isStudio && <Footer />}
      <Dialog
        open={search}
        onOpenChange={setSearch}
        title="搜索 BTDESIGN"
        className="search-dialog"
      >
        <div className="search-box">
          <Search size={18} />
          <Input
            placeholder="搜索组件、指南和工具…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="搜索组件与文档"
          />
        </div>
        <div className="search-results">
          {searchItems.map((c) => (
            <a
              href={`#${c.url}`}
              key={c.url}
              onClick={() => {
                setSearch(false);
                setQuery('');
              }}
            >
              <strong>{c.title}</strong>
              <span>{c.detail}</span>
              <ArrowRight size={14} />
            </a>
          ))}
          {searchItems.length === 0 && <p>没有找到相关内容，试试「按钮」或「主题」。</p>}
        </div>
        <div className="search-help">按 Esc 关闭 · 使用 Tab 浏览结果</div>
      </Dialog>
      <div className="toast-container" role="status" aria-live="polite">
        {toast && (
          <div className="toast">
            <span>{toast}</span>
            <button aria-label="关闭通知" onClick={() => setToast('')}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

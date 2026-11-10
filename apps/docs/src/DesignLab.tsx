import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  History,
  LockKeyhole,
  Monitor,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  Select,
  Switch,
  Textarea,
} from '@forma-ui/react';
import {
  applyThemePatch,
  contrastRatio,
  createTheme,
  defaultTheme,
  normalizeTheme,
  presets,
  themeToCSS,
  type ThemeConfig,
  type ThemeMode,
  type ThemePolicy,
  type ThemeLock,
} from '@forma-ui/tokens';
import { zipSync, strToU8 } from 'fflate';
import { ComponentDemo, WorkspaceDemo } from './ComponentDemo';
import { VueDemo } from './VueDemo';
import { CodeBlock, FrameworkToggle } from './shared';
import type { Framework } from './catalog';
const storageKey = 'forma-lab-v1';
const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
type SavedTheme = { id: string; theme: ThemeConfig; policy: ThemePolicy; date: string };
function readSaved(): SavedTheme[] {
  try {
    const saved = JSON.parse(localStorage.getItem('forma-saved-v1') || '[]');
    return Array.isArray(saved)
      ? saved
          .filter((x) => x && typeof x.id === 'string' && x.theme)
          .slice(0, 12)
          .map((x) => ({ ...x, theme: normalizeTheme(x.theme), policy: cleanPolicy(x.policy) }))
      : [];
  } catch {
    return [];
  }
}
const lockKeys: ThemeLock[] = ['primary', 'radius', 'density', 'font', 'semantic', 'components'];
function cleanPolicy(value: unknown): ThemePolicy {
  const raw = value as { locked?: unknown };
  return {
    locked: Array.isArray(raw?.locked)
      ? raw.locked.filter((key): key is ThemeLock => lockKeys.includes(key))
      : [],
  };
}
function readDraft() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return {
      theme: normalizeTheme(data?.theme || data || defaultTheme),
      policy: cleanPolicy(data?.policy),
    };
  } catch {
    return { theme: defaultTheme, policy: { locked: [] } as ThemePolicy };
  }
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function themeSeed(theme: ThemeConfig) {
  return {
    name: theme.name,
    primary: theme.primary,
    radius: theme.radius,
    density: theme.density,
    font: theme.font,
  };
}
export function DesignLab({ notify }: { notify: (message: string) => void }) {
  const [initialDraft] = useState(readDraft);
  const [theme, setTheme] = useState<ThemeConfig>(initialDraft.theme);
  const [policy, setPolicy] = useState<ThemePolicy>(initialDraft.policy);
  const [mode, setMode] = useState<ThemeMode>('light');
  const [framework, setFramework] = useState<Framework>('react');
  const [view, setView] = useState('workspace');
  const [panel, setPanel] = useState('theme');
  const [advanced, setAdvanced] = useState(false);
  const [saved, setSaved] = useState(readSaved);
  const [history, setHistory] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [includePackages, setIncludePackages] = useState(true);
  const [exportError, setExportError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [draft, setDraft] = useState<{ theme: ThemeConfig; rationale: string } | null>(null);
  const [health, setHealth] = useState<{ configured: boolean; authRequired: boolean } | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [tokenModal, setTokenModal] = useState(false);
  const [fileError, setFileError] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const effective = draft ? applyThemePatch(theme, draft.theme, policy) : theme;
  const vars = createTheme(effective, mode);
  const ratio = contrastRatio(vars['--f-primary'], vars['--f-on-primary']);
  const textRatio = contrastRatio(vars['--f-text'], vars['--f-bg']);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 1, theme, policy }));
    } catch {
      notify('浏览器存储不可用，请导出主题以保留更改。');
    }
  }, [theme, policy]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/health`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setHealth)
      .catch(() => setHealth(null));
    return () => {
      controller.abort();
      abortRef.current?.abort();
    };
  }, []);
  function patch(value: unknown) {
    setDraft(null);
    setTheme((t) => applyThemePatch(t, value, policy));
  }
  function save() {
    const next = [
      { id: crypto.randomUUID(), theme, policy, date: new Date().toLocaleString('zh-CN') },
      ...saved,
    ].slice(0, 12);
    try {
      localStorage.setItem('forma-saved-v1', JSON.stringify(next));
      setSaved(next);
      notify('主题与品牌约束已保存到此浏览器。');
    } catch {
      notify('保存失败：浏览器存储空间不足，请导出主题。');
    }
  }
  function toggleLock(key: ThemeLock) {
    setPolicy((p) => ({
      locked: p.locked.includes(key) ? p.locked.filter((k) => k !== key) : [...p.locked, key],
    }));
  }
  async function generate() {
    setAiError('');
    setDraft(null);
    setGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${apiBase}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ prompt, currentTheme: themeSeed(theme) }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || '生成失败，请稍后重试。');
      setDraft({ theme: normalizeTheme(result.theme), rationale: result.rationale });
    } catch (error) {
      setAiError(
        error instanceof Error && error.name === 'AbortError'
          ? '已取消生成。'
          : error instanceof Error
            ? error.message
            : 'AI 服务暂时不可用。',
      );
    } finally {
      setGenerating(false);
    }
  }
  async function importTheme(file?: File) {
    if (!file) return;
    setFileError('');
    try {
      if (file.size > 65536) throw Error('主题文件不能超过 64 KB。');
      const raw = JSON.parse(await file.text());
      if (raw?.schemaVersion !== undefined && raw.schemaVersion !== 1)
        throw Error('暂不支持此主题版本，请使用 schemaVersion 1。');
      const parsed = raw?.theme || raw;
      if (
        !parsed ||
        typeof parsed.primary !== 'string' ||
        !/^#[0-9a-f]{6}$/i.test(parsed.primary) ||
        typeof parsed.name !== 'string'
      )
        throw Error('需要有效的 Forma 主题 JSON，包含 name 和六位 primary 色值。');
      setDraft(null);
      setTheme((current) =>
        applyThemePatch(
          applyThemePatch(current, { semantic: null, components: null }, policy),
          normalizeTheme(parsed),
          policy,
        ),
      );
      const importedPolicy = cleanPolicy(raw.policy);
      setPolicy((current) => ({
        locked: [...new Set([...current.locked, ...importedPolicy.locked])],
      }));
      notify('主题已导入，现有品牌锁定已保留，导入的约束已合并。');
    } catch (e) {
      setFileError(e instanceof Error ? e.message : '无法读取主题文件。');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  }
  async function exportKit() {
    setExporting(true);
    setExportError('');
    try {
      const files: Record<string, Uint8Array> = {
        'theme.json': strToU8(JSON.stringify({ schemaVersion: 1, theme, policy }, null, 2)),
        'theme.css': strToU8(themeToCSS(theme)),
        'ReactExample.tsx': strToU8(
          "import { Button, Card } from '@forma-ui/react';\nimport '@forma-ui/tokens/styles.css';\nimport './theme.css';\n\nexport default function App() { return <Card><h1>你的工作空间</h1><Button>开始使用</Button></Card>; }\n",
        ),
        'VueExample.vue': strToU8(
          '<script setup>\nimport { Button, Card } from "@forma-ui/vue";\nimport "@forma-ui/tokens/styles.css";\nimport "./theme.css";\n</script>\n<template><Card><h1>你的工作空间</h1><Button>开始使用</Button></Card></template>\n',
        ),
      };
      if (includePackages) {
        const res = await fetch(`${import.meta.env.BASE_URL}downloads/manifest.json`);
        if (!res.ok)
          throw Error(
            '组件安装包不可用。请先在项目中运行 npm run pack:libs，或关闭「包含组件安装包」。',
          );
        const manifest = (await res.json()) as { file: string }[];
        for (const item of manifest) {
          const response = await fetch(`${import.meta.env.BASE_URL}downloads/${item.file}`);
          if (!response.ok) throw Error('下载组件包失败，请重试。');
          files[`packages/${item.file}`] = new Uint8Array(await response.arrayBuffer());
        }
      }
      files['README.md'] = strToU8(
        `# ${theme.name}\n\nForma UI 0.1.0 企业主题包\n\n${includePackages ? '安装：在项目中执行 npm install ./packages/*.tgz（同时安装 React 和 Vue 适配包）。React 项目可仅安装 tokens 与 react 包；Vue 项目可仅安装 tokens 与 vue 包。' : '先从 Forma UI 源码运行 npm run pack:libs，然后安装 tokens 与目标框架包。'}\n\n加载顺序：@forma-ui/tokens/styles.css → theme.css。\n通过 document.documentElement.dataset.theme = 'dark' 切换深色。\n\n包含 React 与 Vue 使用示例。组件包使用 MIT 协议。\n品牌锁定规则：${policy.locked.join(', ') || '无'}。调用 applyThemePatch 时传入 theme.json 中的 policy。它约束主题编辑流程，不是安全边界；直接覆盖 CSS 可绕开约束。\n`,
      );
      const bytes = zipSync(files);
      download(
        new Blob([bytes as BlobPart], { type: 'application/zip' }),
        `forma-${theme.name.replace(/[^a-z\d\u4e00-\u9fa5-]/gi, '-')}.zip`,
      );
      notify('主题、使用示例与所选组件包已导出。');
      setExportOpen(false);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : '导出失败，请重试。');
    } finally {
      setExporting(false);
    }
  }
  return (
    <main id="main" className="lab-page">
      <div className="lab-top">
        <div>
          <span className="eyebrow">
            <span className="status-dot" /> YOUR BRAND, YOUR SYSTEM
          </span>
          <h1>
            Design Lab<span className="lab-beta">BETA</span>
          </h1>
          <p>从一个想法，到属于你的设计语言。</p>
        </div>
        <div className="lab-actions">
          <button className="quiet-button" onClick={() => setHistory(true)}>
            <History size={16} />
            我的主题{saved.length > 0 && <span>{saved.length}</span>}
          </button>
          <Button variant="secondary" onClick={save}>
            <Save size={14} />
            保存主题
          </Button>
          <Button onClick={() => setExportOpen(true)}>
            <ArrowDownToLine size={15} />
            导出组件库
          </Button>
        </div>
      </div>
      <div className="lab-layout">
        <aside className="lab-controls">
          <div className="control-tabs">
            <button className={panel === 'theme' ? 'active' : ''} onClick={() => setPanel('theme')}>
              <Settings2 size={14} />
              主题配置
            </button>
            <button className={panel === 'ai' ? 'active' : ''} onClick={() => setPanel('ai')}>
              <Sparkles size={14} />
              AI 生成
            </button>
          </div>
          {panel === 'theme' ? (
            <div className="controls-body">
              <div className="control-heading">
                <h2>品牌风格</h2>
                <button
                  className="icon-button"
                  aria-label="重置主题"
                  title="重置未锁定的设置"
                  onClick={() => {
                    patch({ ...defaultTheme, semantic: null, components: null });
                    notify('已重置未锁定的主题设置');
                  }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
              <label className="control-label">
                主题名称
                <Input
                  key={theme.name}
                  defaultValue={theme.name}
                  maxLength={60}
                  onBlur={(e) => patch({ name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </label>
              <div className="control-label">
                从预设开始
                <div className="presets">
                  {presets.map((p) => (
                    <button
                      key={p.name}
                      title={p.name}
                      aria-label={`应用 ${p.name} 主题`}
                      onClick={() => patch({ ...p, semantic: null, components: null })}
                      className={theme.primary === p.primary ? 'selected' : ''}
                    >
                      <span style={{ background: p.primary }}>
                        {theme.primary === p.primary && (
                          <Check size={14} color={createTheme(p)['--f-on-primary']} />
                        )}
                      </span>
                      <small>{p.name}</small>
                    </button>
                  ))}
                </div>
              </div>
              <label className="control-label">
                品牌主色{policy.locked.includes('primary') && <LockKeyhole size={12} />}
                <div className="color-control">
                  <input
                    aria-label="选择品牌主色"
                    type="color"
                    disabled={policy.locked.includes('primary')}
                    value={theme.primary}
                    onChange={(e) => patch({ primary: e.target.value })}
                  />
                  <input
                    key={theme.primary}
                    aria-label="品牌主色色值"
                    defaultValue={theme.primary}
                    disabled={policy.locked.includes('primary')}
                    maxLength={7}
                    onBlur={(e) => {
                      if (/^#[\da-f]{6}$/i.test(e.target.value)) patch({ primary: e.target.value });
                      else {
                        e.target.value = theme.primary;
                        notify('请输入 #RRGGBB 格式的颜色。');
                      }
                    }}
                  />
                  <span>HEX</span>
                </div>
              </label>
              <label className="control-label">
                圆角<span className="control-value">{theme.radius} px</span>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={theme.radius}
                  disabled={policy.locked.includes('radius')}
                  onChange={(e) => patch({ radius: Number(e.target.value) })}
                />
                <div className="range-labels">
                  <span>利落</span>
                  <span>柔和</span>
                </div>
              </label>
              <label className="control-label">
                界面密度
                <Select
                  disabled={policy.locked.includes('density')}
                  value={theme.density}
                  onChange={(e) => patch({ density: e.target.value })}
                >
                  <option value="comfortable">舒适 · 38 px</option>
                  <option value="compact">紧凑 · 32 px</option>
                </Select>
              </label>
              <label className="control-label">
                字体
                <Select
                  disabled={policy.locked.includes('font')}
                  value={theme.font}
                  onChange={(e) => patch({ font: e.target.value })}
                >
                  <option value="system">系统字体 · 清晰自然</option>
                  <option value="inter">Inter · 现代简洁</option>
                  <option value="mono">等宽字体 · 技术风格</option>
                </Select>
              </label>
              <button
                className="advanced-toggle"
                aria-expanded={advanced}
                onClick={() => setAdvanced(!advanced)}
              >
                <span>
                  <Settings2 size={14} />
                  高级定制与品牌约束
                </span>
                <ChevronDown size={14} style={{ transform: advanced ? 'rotate(180deg)' : '' }} />
              </button>
              {advanced && (
                <div className="advanced-panel">
                  <p>语义层与组件层继承全局设置，可在这里细调。</p>
                  <label className="control-label">
                    {mode === 'light' ? '浅色' : '深色'}画布背景
                    <input
                      aria-label="画布背景"
                      type="color"
                      value={vars['--f-bg']}
                      disabled={policy.locked.includes('semantic')}
                      onChange={(e) =>
                        patch({ semantic: { [mode]: { background: e.target.value } } })
                      }
                    />
                  </label>
                  <label className="control-label">
                    {mode === 'light' ? '浅色' : '深色'}正文颜色
                    <input
                      aria-label="正文颜色"
                      type="color"
                      value={vars['--f-text']}
                      disabled={policy.locked.includes('semantic')}
                      onChange={(e) => patch({ semantic: { [mode]: { text: e.target.value } } })}
                    />
                  </label>
                  <label className="control-label">
                    按钮圆角 <span>{theme.components?.button?.radius ?? theme.radius} px</span>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      disabled={policy.locked.includes('components')}
                      value={theme.components?.button?.radius ?? theme.radius}
                      onChange={(e) =>
                        patch({ components: { button: { radius: Number(e.target.value) } } })
                      }
                    />
                  </label>
                  <label className="control-label">
                    按钮高度{' '}
                    <span>
                      {theme.components?.button?.height ?? (theme.density === 'compact' ? 32 : 38)}{' '}
                      px
                    </span>
                    <input
                      type="range"
                      min={28}
                      max={56}
                      disabled={policy.locked.includes('components')}
                      value={
                        theme.components?.button?.height ?? (theme.density === 'compact' ? 32 : 38)
                      }
                      onChange={(e) =>
                        patch({ components: { button: { height: Number(e.target.value) } } })
                      }
                    />
                  </label>
                  <strong className="mini-heading">
                    <ShieldCheck size={14} />
                    锁定品牌规则
                  </strong>
                  <p>锁定后，预设、导入和 AI 均保留这些值。</p>
                  {(
                    [
                      ['primary', '品牌色'],
                      ['radius', '全局圆角'],
                      ['density', '界面密度'],
                      ['font', '字体'],
                      ['semantic', '语义颜色'],
                      ['components', '组件定制'],
                    ] as [ThemeLock, string][]
                  ).map(([key, label]) => (
                    <div className="lock-line" key={key}>
                      <span>{label}</span>
                      <Switch
                        checked={policy.locked.includes(key)}
                        onCheckedChange={() => toggleLock(key)}
                        aria-label={`锁定${label}`}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="control-bottom">
                <button className="quiet-button" onClick={() => importRef.current?.click()}>
                  <Upload size={14} />
                  导入主题 JSON
                </button>
                <input
                  type="file"
                  accept=".json,application/json"
                  ref={importRef}
                  hidden
                  onChange={(e) => importTheme(e.target.files?.[0])}
                />
                {fileError && (
                  <p role="alert" className="error-text">
                    {fileError}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="controls-body ai-panel">
              <div className="ai-orb">
                <Sparkles size={24} />
              </div>
              <h2>描述你想要的风格</h2>
              <p>告诉 DeepSeek 你的行业、品牌气质和使用场景。</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  generate();
                }}
              >
                <label className="sr-only" htmlFor="ai-prompt">
                  设计需求
                </label>
                <Textarea
                  id="ai-prompt"
                  rows={6}
                  placeholder="例如：面向企业的财务系统，沉稳、专业，以深蓝色为主，界面紧凑、圆角克制。"
                  value={prompt}
                  maxLength={2000}
                  minLength={4}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  disabled={generating}
                />
                <div className="prompt-count">{prompt.length} / 2000</div>
                <Button type="submit" loading={generating} className="full-width">
                  <Sparkles size={14} />
                  {generating ? '正在生成主题…' : '生成设计方案'}
                </Button>
                {generating && (
                  <button
                    type="button"
                    className="quiet-button"
                    onClick={() => abortRef.current?.abort()}
                  >
                    取消生成
                  </button>
                )}
              </form>
              <div className="prompt-suggestions">
                <span>试试这些灵感</span>
                {[
                  '金融科技，深蓝、理性、紧凑',
                  '创意工作室，紫色、灵动、宽松',
                  '医疗协作，绿色、清晰、平静',
                ].map((s) => (
                  <button key={s} onClick={() => setPrompt(s)}>
                    {s}
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
              <div className="ai-connection">
                <span className={`status-dot ${health?.configured ? '' : 'muted'}`} />
                <span>DeepSeek · {health?.configured ? '已连接' : '待配置'}</span>
                <button
                  className="icon-button"
                  aria-label="AI 连接设置"
                  onClick={() => setTokenModal(true)}
                >
                  <Settings2 size={14} />
                </button>
              </div>
              {!health?.configured && (
                <p className="connection-hint">
                  在服务端设置 DEEPSEEK_API_KEY 后即可启用。
                  <a href="#/guides/development">
                    查看接入指南
                    <ArrowRight size={11} />
                  </a>
                </p>
              )}
              {aiError && (
                <Alert variant="danger" title="生成未完成">
                  {aiError}
                </Alert>
              )}
              {draft && (
                <div className="ai-result">
                  <strong>
                    <Check size={14} />
                    方案已生成
                  </strong>
                  <p>{draft.rationale}</p>
                  <small>预览已更新；锁定的品牌规则保持不变。</small>
                  <Button
                    size="sm"
                    onClick={() => {
                      setTheme(effective);
                      setDraft(null);
                      notify('AI 方案已应用到当前主题');
                    }}
                  >
                    应用方案
                  </Button>
                  <button className="quiet-button" onClick={() => setDraft(null)}>
                    放弃
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
        <section className="lab-preview-area" aria-label="主题实时预览">
          <div className="preview-toolbar">
            <div className="preview-view-switch">
              <button
                className={view === 'workspace' ? 'active' : ''}
                onClick={() => setView('workspace')}
              >
                工作空间
              </button>
              <button
                className={view === 'components' ? 'active' : ''}
                onClick={() => setView('components')}
              >
                组件
              </button>
              <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>
                登录页
              </button>
            </div>
            <div className="preview-options">
              <FrameworkToggle value={framework} onChange={setFramework} />
              <span className="toolbar-divider" />
              <button
                className="icon-button"
                title="浅色预览"
                aria-label="浅色预览"
                aria-pressed={mode === 'light'}
                onClick={() => setMode('light')}
              >
                <Sun size={16} />
              </button>
              <button
                className="icon-button"
                title="深色预览"
                aria-label="深色预览"
                aria-pressed={mode === 'dark'}
                onClick={() => setMode('dark')}
              >
                <Moon size={16} />
              </button>
            </div>
          </div>
          <div className="preview-stage">
            <div
              className={`preview-window ${view === 'login' ? 'login-window' : ''}`}
              data-theme={mode}
              style={vars as CSSProperties}
            >
              <div className="preview-window-bar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>{effective.name.toLowerCase().replace(/\s/g, '-')}.workspace</span>
                <Monitor size={12} />
              </div>
              {framework === 'vue' ? (
                <div className="vue-workspace">
                  <VueDemo
                    kind={
                      view === 'workspace' ? 'workspace' : view === 'login' ? 'login' : 'button'
                    }
                    onAction={notify}
                  />
                  {view === 'components' && (
                    <>
                      <VueDemo kind="input" />
                      <VueDemo kind="switch" />
                      <VueDemo kind="badge" />
                      <VueDemo kind="tabs" />
                      <VueDemo kind="table" />
                    </>
                  )}
                </div>
              ) : view === 'components' ? (
                <div className="component-preview-grid">
                  <section>
                    <h3>操作与状态</h3>
                    <ComponentDemo kind="button" onAction={notify} />
                    <ComponentDemo kind="badge" />
                  </section>
                  <section>
                    <h3>表单输入</h3>
                    <ComponentDemo kind="input" />
                    <ComponentDemo kind="switch" />
                  </section>
                  <section>
                    <h3>反馈信息</h3>
                    <ComponentDemo kind="alert" />
                  </section>
                  <section>
                    <h3>数据展示</h3>
                    <ComponentDemo kind="table" />
                  </section>
                </div>
              ) : (
                <WorkspaceDemo view={view} onAction={notify} />
              )}
            </div>
          </div>
          <div className="preview-status">
            <span>
              <span className="status-dot" />
              {draft ? 'AI 方案预览' : '实时同步'}
              <span className="status-separator">/</span>
              {framework === 'react' ? 'React' : 'Vue 3'} 实际组件
            </span>
            <span>
              <ShieldCheck size={13} />
              按钮对比度 {ratio.toFixed(2)}:1
              {textRatio < 4.5 && (
                <strong className="error-text">正文对比度偏低 {textRatio.toFixed(2)}:1</strong>
              )}
            </span>
          </div>
          <div className="lab-note">
            <div>
              <Code2 size={19} />
              <strong>同一份主题，两种技术框架。</strong>
              <p>导出 CSS 变量与组件包，在你的项目中延续同一种设计语言。</p>
            </div>
            <button className="quiet-button" onClick={() => setExportOpen(true)}>
              查看代码
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>
      <Dialog
        open={history}
        onOpenChange={setHistory}
        title="我的主题"
        description="主题保存在当前浏览器中。导出 JSON 或 ZIP 可以跨设备使用。"
      >
        <div className="saved-list">
          {saved.length === 0 ? (
            <p>还没有保存的主题。配置好风格后，点击「保存主题」。</p>
          ) : (
            saved.map((s) => (
              <div key={s.id}>
                <span className="saved-swatch" style={{ background: s.theme.primary }} />
                <div>
                  <strong>{s.theme.name}</strong>
                  <small>{s.date}</small>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setDraft(null);
                    setTheme(s.theme);
                    setPolicy(s.policy);
                    setHistory(false);
                    notify('已恢复主题与品牌约束');
                  }}
                >
                  恢复
                </Button>
                <button
                  className="icon-button"
                  aria-label={`删除 ${s.theme.name}`}
                  onClick={() => {
                    const next = saved.filter((t) => t.id !== s.id);
                    try {
                      localStorage.setItem('forma-saved-v1', JSON.stringify(next));
                      setSaved(next);
                    } catch {
                      notify('无法更新浏览器存储。');
                    }
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </Dialog>
      <Dialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="让你的设计系统落地"
        description="导出主题配置、双模式 CSS 和 React / Vue 使用示例。"
      >
        <div className="export-detail">
          <span className="saved-swatch" style={{ background: theme.primary }} />
          <div>
            <strong>{theme.name}</strong>
            <small>React + Vue 3 · Light + Dark</small>
          </div>
        </div>
        <Switch
          label="包含可安装的组件包（.tgz）"
          checked={includePackages}
          onCheckedChange={setIncludePackages}
        />
        <CodeBlock
          label="theme.css"
          code={themeToCSS(theme).split('\n').slice(0, 11).join('\n') + '\n  /* … */\n}'}
        />
        <div className="dialog-actions">
          <Button
            variant="secondary"
            onClick={() =>
              download(
                new Blob([JSON.stringify({ schemaVersion: 1, theme, policy }, null, 2)], {
                  type: 'application/json',
                }),
                'forma-theme.json',
              )
            }
          >
            仅导出 JSON
          </Button>
          <Button onClick={exportKit} loading={exporting}>
            <Download size={14} />
            下载 ZIP
          </Button>
        </div>
        {exportError && <Alert variant="danger">{exportError}</Alert>}
      </Dialog>
      <Dialog
        open={tokenModal}
        onOpenChange={setTokenModal}
        title="DeepSeek 连接"
        description="模型密钥仅保存在服务端，浏览器不会存储或发送 DeepSeek 密钥。"
      >
        <p>服务状态：{health?.configured ? '已配置' : '未配置或服务不可用'}</p>
        {health?.authRequired && (
          <label className="demo-field">
            Design Lab 访问令牌
            <Input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="管理员提供的 LAB_API_TOKEN"
              autoComplete="off"
            />
            <small>仅用于访问本项目 API，当前页面关闭后即清除。</small>
          </label>
        )}
        <p>
          本地项目：在根目录 .env 设置 DEEPSEEK_API_KEY 并重启开发服务。公开部署同时配置
          LAB_API_TOKEN。
        </p>
        <a className="text-link" href="#/guides/development" onClick={() => setTokenModal(false)}>
          查看完整接入说明
          <ArrowRight size={14} />
        </a>
      </Dialog>
    </main>
  );
}

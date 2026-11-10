import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Columns2,
  Copy,
  Download,
  FileCode2,
  FileJson,
  FolderOpen,
  GitBranch,
  History,
  Import,
  Layers3,
  LockKeyhole,
  Maximize2,
  Monitor,
  Moon,
  MousePointer2,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { Dialog, Button, Input, Alert } from '@btdesign/react';
import {
  createTheme,
  contrastRatio,
  normalizeTheme,
  type ThemeLock,
  type ThemeMode,
} from '@btdesign/tokens';
import {
  createProject,
  getContextText,
  getProjectFiles,
  normalizeProject,
  updateProject,
  selectionKnowledge,
  type ProjectSpec,
  type ProjectScene,
} from '@btdesign/core';
import { zipSync, strToU8 } from 'fflate';
import { ScenePreview, type SceneSelection } from './ScenePreview';
import { Inspector } from './Inspector';
import { MigrationPanel } from './MigrationPanel';
import {
  loadStudio,
  projectDifferences,
  recordChange,
  redoChange,
  STORE_KEY,
  undoChange,
  type Revision,
  type Timeline,
} from './model';
import './Studio.css';
const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const sceneLabels: Record<ProjectScene, string> = {
  workspace: '团队工作台',
  projects: '项目协作',
  login: '账户登录',
};
const sceneBriefs: Record<ProjectScene, string> = {
  workspace: '为团队搭建一个清晰、克制的管理工作台，便于管理成员和设置。',
  projects: '为设计团队搭建项目协作系统，便于查看项目、筛选状态和追踪任务。',
  login: '为企业产品搭建一个舒适、可信赖的账户登录页面。',
};
const selectionLabels: Record<SceneSelection, string> = {
  page: '页面',
  button: '按钮',
  input: '输入框',
  card: '容器',
  table: '表格',
};
function downloadFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function seed(theme: ProjectSpec['theme']) {
  return {
    name: theme.name,
    primary: theme.primary,
    radius: theme.radius,
    density: theme.density,
    font: theme.font,
  };
}
export function Studio({
  mode,
  onModeChange,
  notify,
}: {
  mode: ThemeMode;
  onModeChange: () => void;
  notify: (s: string) => void;
}) {
  const [initial] = useState(loadStudio);
  const [timeline, setTimeline] = useState<Timeline>({
    past: [],
    present: initial.project,
    future: [],
  });
  const project = timeline.present;
  const [revisions, setRevisions] = useState(initial.revisions);
  const prompt = project.brief;
  function setPrompt(brief: string) {
    setProposal(null);
    setCompareBase(null);
    setComparing(false);
    setTimeline((s) => ({ ...s, present: updateProject(s.present, { brief }), future: [] }));
  }
  const currentProject = useRef(project);
  currentProject.current = project;
  const [stage, setStage] = useState<'canvas' | 'rules' | 'handoff'>('canvas');
  const [selection, setSelection] = useState<SceneSelection | null>('page');
  const [inspect, setInspect] = useState(false);
  const [viewport, setViewport] = useState<'auto' | 'mobile'>('auto');
  const [previewMode, setPreviewMode] = useState<ThemeMode>('light');
  const [leftOpen, setLeftOpen] = useState(() => window.innerWidth >= 1100);
  const [rightOpen, setRightOpen] = useState(() => window.innerWidth >= 1200);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [health, setHealth] = useState<{ configured: boolean; authRequired: boolean } | null>(null);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [proposal, setProposal] = useState<{ project: ProjectSpec; rationale: string } | null>(
    null,
  );
  const [comparing, setComparing] = useState(false);
  const [compareBase, setCompareBase] = useState<ProjectSpec | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'error'>('saved');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [includePackages, setIncludePackages] = useState(true);
  const [fileName, setFileName] = useState('AGENTS.md');
  const [revisionName, setRevisionName] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    controller.current?.abort();
    setBusy(false);
  }, [project]);
  const shown = proposal?.project || project;
  const files = useMemo(() => getProjectFiles(shown), [shown]);
  const activeFile = files[fileName] !== undefined ? fileName : Object.keys(files)[0];
  const previous = compareBase || timeline.past.at(-1) || project;
  const changes = projectDifferences(previous, shown);
  const tokens = createTheme(shown.theme, previewMode);
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ project, revisions }));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [project, revisions]);
  useEffect(() => {
    const ac = new AbortController();
    fetch(`${apiBase}/health`, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setConnectionChecked(true));
    return () => {
      ac.abort();
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement;
      if (el.closest('input,textarea,select,[contenteditable=true],dialog')) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        setProposal(null);
        setCompareBase(null);
        setComparing(false);
        setTimeline((s) => (event.shiftKey ? redoChange(s) : undoChange(s)));
      }
      if (event.key === 'Escape') {
        setInspect(false);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  function commit(next: ProjectSpec) {
    controller.current?.abort();
    setCompareBase(null);
    setComparing(false);
    setProposal(null);
    setTimeline((s) => recordChange(s, next));
  }
  function patch(value: unknown) {
    if (proposal) {
      setProposal((p) => (p ? { ...p, project: updateProject(p.project, value) } : p));
    } else setTimeline((s) => recordChange(s, updateProject(s.present, value)));
  }
  function selectScene(scene: ProjectScene) {
    setError('');
    patch({ scene });
    setStage('canvas');
    setSelection('page');
    setInspect(false);
  }
  function saveVersion() {
    const label = revisionName.trim() || `版本 ${revisions.length + 1}`;
    const revision = {
      id: crypto.randomUUID(),
      label,
      project,
      createdAt: new Date().toISOString(),
    };
    setRevisions((current) => [revision, ...current].slice(0, 20));
    setRevisionName('');
    setSaveOpen(false);
    notify('已保存版本，可以随时比较或恢复。');
  }
  function toggleLock(key: ThemeLock) {
    patch({
      policy: {
        locked: shown.policy.locked.includes(key)
          ? shown.policy.locked.filter((k) => k !== key)
          : [...shown.policy.locked, key],
      },
    });
  }
  async function generate() {
    setError('');
    setBusy(true);
    setProposal(null);
    setCompareBase(null);
    setComparing(false);
    setStage('canvas');
    const ac = new AbortController();
    controller.current = ac;
    try {
      const response = await fetch(`${apiBase}/compose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          currentProject: {
            name: project.name,
            scene: project.scene,
            content: project.content,
            theme: seed(project.theme),
          },
        }),
        signal: ac.signal,
      });
      const result = await response.json();
      if (ac.signal.aborted || currentProject.current !== project)
        throw new DOMException('项目已改变', 'AbortError');
      if (!response.ok) throw Error(result.error || '方案未生成，请稍后重试。');
      const next = updateProject(project, {
        name: result.name,
        brief: prompt,
        scene: result.scene,
        content: result.content,
        theme: result.theme,
      });
      setProposal({ project: next, rationale: result.rationale });
      setCompareBase(project);
      setInspect(false);
    } catch (e) {
      if (controller.current !== ac) return;
      setError(
        e instanceof Error && e.name === 'AbortError'
          ? '生成已取消，已保留当前设计。'
          : e instanceof Error
            ? e.message
            : '暂时无法连接 AI 服务。',
      );
    } finally {
      if (controller.current === ac) {
        setBusy(false);
        controller.current = null;
      }
    }
  }
  async function copy(text: string, success: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(success);
    } catch {
      notify('剪贴板不可用，请在代码区手动选择复制。');
    }
  }
  async function exportSystem() {
    setExporting(true);
    setExportError('');
    try {
      const exported = getProjectFiles(project);
      const bundle: Record<string, Uint8Array> = {};
      for (const [name, text] of Object.entries(exported)) bundle[name] = strToU8(text);
      if (includePackages) {
        const response = await fetch(`${import.meta.env.BASE_URL}downloads/manifest.json`);
        if (!response.ok)
          throw Error('安装包不可用，请运行 npm run pack:libs 后重试，或取消包含安装包。');
        const manifest = (await response.json()) as { name: string; file: string }[];
        for (const entry of manifest.filter(
          (p) => p.name === '@btdesign/tokens' || p.name === `@btdesign/${project.framework}`,
        )) {
          const res = await fetch(`${import.meta.env.BASE_URL}downloads/${entry.file}`);
          if (!res.ok) throw Error('组件包下载失败，请重试。');
          bundle[`packages/${entry.file}`] = new Uint8Array(await res.arrayBuffer());
        }
      }
      bundle['btdesign-project.json'] = strToU8(JSON.stringify(project, null, 2));
      const bytes = zipSync(bundle);
      downloadFile(
        new Blob([bytes as BlobPart], { type: 'application/zip' }),
        `BTDESIGN-${project.name.replace(/[^a-z\d\u4e00-\u9fa5-]/gi, '-')}.zip`,
      );
      notify('设计规则、主题、场景代码与所选组件包已导出。');
    } catch (e) {
      setExportError(e instanceof Error ? e.message : '导出失败，请重试。');
      setStage('handoff');
    } finally {
      setExporting(false);
    }
  }
  async function importProject(file?: File) {
    if (!file) return;
    setImportError('');
    try {
      if (file.size > 256000) throw Error('项目文件过大，请选择 256 KB 以内的 JSON。');
      const raw = JSON.parse(await file.text());
      if (raw?.scene) {
        const next = normalizeProject(raw);
        setRevisions((r) =>
          [
            {
              id: crypto.randomUUID(),
              label: `导入前 · ${project.name}`,
              project,
              createdAt: new Date().toISOString(),
            },
            ...r,
          ].slice(0, 20),
        );
        commit(next);
        setPrompt(next.brief);
        notify('已打开项目；之前的设计保留在版本历史。');
      } else if (raw?.theme || raw?.primary) {
        if (raw?.schemaVersion !== undefined && raw.schemaVersion !== 1)
          throw Error('暂不支持此主题版本。');
        const imported = raw.theme || raw;
        if (!/^#[0-9a-f]{6}$/i.test(imported?.primary || ''))
          throw Error('主题需要有效的六位品牌色。');
        const cleared = updateProject(project, { theme: { semantic: null, components: null } });
        commit(updateProject(cleared, { theme: normalizeTheme(imported) }));
        notify('已导入主题，保留当前锁定的品牌规则。');
      } else throw Error('请选择 BTDESIGN 项目或主题 JSON。');
      setStage('canvas');
    } catch (e) {
      setImportError(e instanceof Error ? e.message : '无法读取文件。');
      notify(e instanceof Error ? e.message : '无法读取文件。');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }
  return (
    <main id="main" className="bt-studio" data-shell-theme={mode}>
      <nav className="bt-rail" aria-label="工作空间导航">
        <a className="bt-brand" href="#/" aria-label="BTDESIGN 工作空间">
          bt<span>•</span>
        </a>
        <div className="bt-rail-main">
          <button
            className="active"
            title="创作空间"
            aria-label="创作空间"
            onClick={() => setStage('canvas')}
          >
            <Layers3 size={19} />
            <span>创作</span>
          </button>
          <button title="版本历史" aria-label="版本历史" onClick={() => setHistoryOpen(true)}>
            <History size={18} />
            <span>版本</span>
          </button>
          <button
            title="迁入现有系统"
            aria-label="迁入现有系统"
            onClick={() => setMigrationOpen(true)}
          >
            <Import size={18} />
            <span>迁入</span>
          </button>
          <a title="组件与设计指南" aria-label="组件与设计指南" href="#/components">
            <BookOpen size={18} />
            <span>知识</span>
          </a>
        </div>
        <div className="bt-rail-bottom">
          <a
            aria-label="GitHub 仓库"
            href="https://github.com/BTBON9090/btdesign-system"
            target="_blank"
            rel="noreferrer"
          >
            <GitBranch size={17} />
          </a>
          <button
            aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
            onClick={onModeChange}
          >
            {mode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button aria-label="AI 连接设置" onClick={() => setSettingsOpen(true)}>
            <Settings2 size={17} />
          </button>
          <span className="bt-you" title="本地工作空间">
            你
          </span>
        </div>
      </nav>
      <div className="bt-workspace">
        <header className="bt-workspace-header">
          <div className="bt-project-title">
            <span className="bt-product-name">BTDESIGN</span>
            <span className="bt-slash">/</span>
            <input
              key={shown.id + shown.name}
              defaultValue={shown.name}
              aria-label="设计系统名称"
              maxLength={80}
              onBlur={(e) => patch({ name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
            />
            <button
              className="bt-icon"
              aria-label="新建设计系统"
              title="新建设计系统"
              onClick={() => setNewOpen(true)}
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="bt-header-actions">
            <span className={`bt-save-status ${saveState === 'error' ? 'error' : ''}`}>
              <span />
              {saveState === 'saved' ? '已保存在本地' : '保存失败，请导出'}
            </span>
            <button
              className="bt-button subtle"
              disabled={!!proposal}
              onClick={() => setSaveOpen(true)}
            >
              <Save size={13} />
              保存版本
            </button>
            <button
              className="bt-button primary"
              disabled={!!proposal}
              onClick={() => setStage('handoff')}
            >
              <Code2 size={14} />
              交给开发
              <ArrowUpRight size={12} />
            </button>
          </div>
        </header>
        <div className="bt-work-area">
          {(leftOpen || rightOpen) && (
            <button
              aria-label="关闭侧边面板"
              className={`bt-overlay-shade ${leftOpen ? 'for-left' : ''} ${rightOpen ? 'for-right' : ''}`}
              onClick={() => {
                setLeftOpen(false);
                setRightOpen(false);
              }}
            />
          )}
          {leftOpen && (
            <aside className="bt-brief-panel" aria-label="创作简报">
              <div className="bt-panel-heading">
                <span>
                  <Sparkles size={15} />
                  创作简报
                </span>
                <button
                  className="bt-icon"
                  aria-label="收起创作简报"
                  onClick={() => setLeftOpen(false)}
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>
              <div className="bt-brief-body">
                <div className="bt-intro">
                  <span className="bt-overline">从一个想法开始</span>
                  <h1>
                    你想做一个
                    <br />
                    <span>怎样的系统？</span>
                  </h1>
                  <p>
                    说说使用者、要解决的问题，
                    <br />
                    以及你希望它带给人的感受。
                  </p>
                </div>
                <form
                  className="bt-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    generate();
                  }}
                >
                  <label htmlFor="studio-brief" className="sr-only">
                    描述想要的系统
                  </label>
                  <textarea
                    id="studio-brief"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：给一家创意工作室搭建项目协作系统。清爽、有秩序，保留一点活力。"
                    minLength={4}
                    maxLength={2000}
                    required
                    disabled={busy}
                  />
                  <div className="bt-composer-footer">
                    <span>
                      <span
                        className={`bt-connection-dot ${health?.configured ? 'connected' : ''}`}
                      />
                      DeepSeek
                    </span>
                    <button
                      type="button"
                      aria-label="配置 DeepSeek"
                      onClick={() => setSettingsOpen(true)}
                    >
                      <Settings2 size={12} />
                    </button>
                    <small>{prompt.length}/2000</small>
                  </div>
                  <button className="bt-generate" type="submit" disabled={busy}>
                    <Sparkles size={14} />
                    {busy ? '正在构思设计提案…' : '生成设计提案'}
                    {!busy && <ArrowRight size={15} />}
                  </button>
                </form>
                {busy && (
                  <button className="bt-text-button" onClick={() => controller.current?.abort()}>
                    取消生成
                  </button>
                )}
                {!busy && connectionChecked && !health?.configured && (
                  <div className="bt-connection-help">
                    AI 尚未连接。你可以先从下方场景开始。
                    <button onClick={() => setSettingsOpen(true)}>
                      配置连接
                      <ArrowUpRight size={10} />
                    </button>
                  </div>
                )}
                {error && stage !== 'handoff' && (
                  <div className="bt-inline-error" role="alert">
                    {error}
                  </div>
                )}
                <div className="bt-starter-heading">
                  <span>或者，从一个熟悉的场景开始</span>
                </div>
                <div className="bt-scene-list">
                  {(['workspace', 'projects', 'login'] as ProjectScene[]).map((scene) => (
                    <button
                      key={scene}
                      aria-pressed={shown.scene === scene}
                      className={shown.scene === scene ? 'selected' : ''}
                      onClick={() => selectScene(scene)}
                    >
                      <SceneThumbnail scene={scene} />
                      <div>
                        <strong>{sceneLabels[scene]}</strong>
                        <small>
                          {scene === 'workspace'
                            ? '成员 · 表单 · 团队设置'
                            : scene === 'projects'
                              ? '项目 · 状态 · 协作'
                              : '账户 · 身份 · 登录表单'}
                        </small>
                      </div>
                      {shown.scene === scene ? <Check size={13} /> : <ChevronRight size={13} />}
                    </button>
                  ))}
                </div>
                <button className="bt-existing-entry" onClick={() => setMigrationOpen(true)}>
                  <Import size={16} />
                  <span>
                    已经有一个系统？<small>带入风格，逐步迁移</small>
                  </span>
                  <ArrowUpRight size={13} />
                </button>
                <div className="bt-brief-note">
                  <span className="bt-tiny-rule" />
                  AI 生成的每个方案，都遵守你锁定的品牌规则。
                </div>
              </div>
              <div className="bt-brief-footer">
                <ShieldCheck size={13} />
                <span>设计规则与组件代码一起交付</span>
              </div>
            </aside>
          )}
          <section className="bt-center">
            <div className="bt-canvas-nav">
              <div className="bt-stage-tabs" aria-label="工作阶段">
                {!leftOpen && (
                  <button
                    className="bt-icon"
                    aria-label="展开创作简报"
                    onClick={() => setLeftOpen(true)}
                  >
                    <PanelLeftClose size={15} />
                  </button>
                )}
                {(
                  [
                    ['canvas', '画布'],
                    ['rules', '设计规则'],
                    ['handoff', '开发交付'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    aria-pressed={stage === id}
                    className={stage === id ? 'active' : ''}
                    onClick={() => setStage(id)}
                  >
                    {id === 'canvas' ? (
                      <Layers3 size={13} />
                    ) : id === 'rules' ? (
                      <ShieldCheck size={13} />
                    ) : (
                      <Braces size={13} />
                    )}{' '}
                    {label}
                  </button>
                ))}
              </div>
              <div className="bt-history-controls">
                <button
                  className="bt-icon"
                  title="撤销 ⌘Z"
                  aria-label="撤销"
                  disabled={!timeline.past.length || !!proposal}
                  onClick={() => setTimeline(undoChange)}
                >
                  <Undo2 size={14} />
                </button>
                <button
                  className="bt-icon"
                  title="重做 ⌘⇧Z"
                  aria-label="重做"
                  disabled={!timeline.future.length || !!proposal}
                  onClick={() => setTimeline(redoChange)}
                >
                  <Redo2 size={14} />
                </button>
                <span />
                <button
                  className={`bt-icon ${comparing ? 'pressed' : ''}`}
                  aria-label="比较调整前后"
                  title="比较调整前后"
                  disabled={!timeline.past.length && !proposal && !compareBase}
                  onClick={() => {
                    setStage('canvas');
                    setComparing((c) => !c);
                    if (comparing) setCompareBase(null);
                  }}
                >
                  <Columns2 size={15} />
                </button>
                <button
                  className="bt-icon"
                  aria-label={rightOpen ? '收起属性面板' : '展开属性面板'}
                  onClick={() => setRightOpen(!rightOpen)}
                >
                  <PanelRightClose size={15} />
                </button>
              </div>
            </div>
            {stage === 'canvas' ? (
              <>
                <div className="bt-canvas-toolbar">
                  <div className="bt-canvas-label">
                    <span className="bt-live-dot" />
                    {sceneLabels[shown.scene]}
                    {proposal && <em>提案</em>}
                  </div>
                  <div className="bt-canvas-tools">
                    <div className="bt-framework-toggle">
                      <button
                        aria-pressed={shown.framework === 'react'}
                        onClick={() => patch({ framework: 'react' })}
                      >
                        React
                      </button>
                      <button
                        aria-pressed={shown.framework === 'vue'}
                        onClick={() => patch({ framework: 'vue' })}
                      >
                        Vue 3
                      </button>
                    </div>
                    <i />
                    <button
                      className={`bt-icon ${viewport === 'auto' ? 'pressed' : ''}`}
                      aria-label="自适应画布"
                      title="自适应画布"
                      onClick={() => setViewport('auto')}
                    >
                      <Monitor size={15} />
                    </button>
                    <button
                      className={`bt-icon ${viewport === 'mobile' ? 'pressed' : ''}`}
                      aria-label="移动端画布"
                      title="移动端画布"
                      onClick={() => setViewport('mobile')}
                    >
                      <Smartphone size={14} />
                    </button>
                    <i />
                    <button
                      className="bt-icon"
                      aria-label={previewMode === 'light' ? '预览深色界面' : '预览浅色界面'}
                      title="切换画布明暗"
                      onClick={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
                    >
                      {previewMode === 'light' ? <Sun size={15} /> : <Moon size={15} />}
                    </button>
                  </div>
                </div>
                <div
                  className={`bt-canvas ${viewport === 'mobile' ? 'mobile-canvas' : ''} ${comparing ? 'compare-canvas' : ''}`}
                >
                  <div className="bt-canvas-topline">
                    <span>{comparing ? '设计对照' : '真实组件 · 可以直接操作'}</span>
                    <span>
                      {viewport === 'mobile' ? '390 px' : '自适应宽度'}
                      <span className="bt-keycap">
                        {shown.framework === 'react' ? 'React' : 'Vue 3'}
                      </span>
                    </span>
                  </div>
                  {comparing ? (
                    <div className="bt-compare-layout">
                      <div>
                        <div className="bt-compare-label">
                          调整前<small>{previous.name}</small>
                        </div>
                        <ScenePreview
                          project={previous}
                          mode={previewMode}
                          inspect={false}
                          selected={null}
                          onSelect={() => {}}
                          notify={notify}
                        />
                      </div>
                      <div>
                        <div className="bt-compare-label">
                          当前设计<small>{changes.length} 项规则或内容变化</small>
                        </div>
                        <ScenePreview
                          project={shown}
                          mode={previewMode}
                          inspect={false}
                          selected={null}
                          onSelect={() => {}}
                          notify={notify}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bt-artboard">
                      <ScenePreview
                        project={shown}
                        mode={previewMode}
                        inspect={inspect}
                        selected={selection}
                        onSelect={(s) => {
                          setSelection(s);
                          setRightOpen(true);
                        }}
                        notify={notify}
                      />
                    </div>
                  )}
                  {comparing && (
                    <div className="bt-diff-summary">
                      {changes.length ? (
                        changes.map((c) => (
                          <div key={c.label}>
                            <strong>{c.label}</strong>
                            <span>{c.before}</span>
                            <ArrowRight size={11} />
                            <span>{c.after}</span>
                          </div>
                        ))
                      ) : (
                        <p>当前没有规则或内容差异。</p>
                      )}
                    </div>
                  )}
                  <div className="bt-canvas-caption">
                    <span>
                      <span className="bt-live-dot" />
                      主题与组件实时同步
                    </span>
                    <span>示例数据 · 本地交互</span>
                  </div>
                </div>
                <div className="bt-selection-bar">
                  <button
                    className={inspect ? 'active' : ''}
                    aria-pressed={inspect}
                    onClick={() => setInspect(!inspect)}
                  >
                    <MousePointer2 size={15} />
                    {inspect ? '正在检查元素' : '选择并理解界面'}
                  </button>
                  <span className="bt-selection-divider" />
                  {(['page', 'button', 'input', 'card', 'table'] as SceneSelection[])
                    .filter(
                      (s) =>
                        (shown.scene === 'workspace' || s !== 'table') &&
                        (shown.scene !== 'projects' || s !== 'input'),
                    )
                    .map((s) => (
                      <button
                        key={s}
                        className={selection === s ? 'selected' : ''}
                        onClick={() => {
                          setSelection(s);
                          setInspect(true);
                          setRightOpen(true);
                        }}
                      >
                        {selectionLabels[s]}
                      </button>
                    ))}
                  <span className="bt-selection-hint">
                    {inspect
                      ? '点击画布元素，看懂它的设计与代码'
                      : '切换「选择」后，点击元素查看规则'}
                  </span>
                </div>
              </>
            ) : stage === 'rules' ? (
              <RulesView project={shown} mode={previewMode} onLock={toggleLock} onPatch={patch} />
            ) : (
              <section className="bt-handoff">
                <header>
                  <span className="bt-overline">把设计意图完整带进项目</span>
                  <h1>规则，跟着代码一起走。</h1>
                  <p>
                    设计师的决策、组件的约定和当前主题，都在这份交付包里。新成员与 AI
                    可以从同一个起点继续。
                  </p>
                </header>
                <div className="bt-handoff-actions">
                  <button
                    className="bt-button primary"
                    disabled={!!proposal}
                    onClick={() =>
                      copy(getContextText(project), '已复制设计上下文，可交给 AI 编程工具。')
                    }
                  >
                    <Sparkles size={14} />
                    复制给 AI
                  </button>
                  <button
                    className="bt-button"
                    disabled={!!proposal || exporting}
                    onClick={exportSystem}
                  >
                    <ArrowDownToLine size={14} />
                    {exporting ? '正在打包…' : '下载项目包'}
                  </button>
                  <label>
                    <input
                      type="checkbox"
                      checked={includePackages}
                      onChange={(e) => setIncludePackages(e.target.checked)}
                    />
                    包含组件安装包
                  </label>
                </div>
                {exportError && (
                  <div className="bt-inline-error" role="alert">
                    {exportError}
                  </div>
                )}
                {!includePackages && (
                  <p className="bt-handoff-note">
                    未包含安装包时，请先从本仓库获取 tokens 与所选框架的 tarball，放入 packages
                    目录后再安装依赖。
                  </p>
                )}
                <div className="bt-code-workspace">
                  <div className="bt-file-tree">
                    <span>
                      <FolderOpen size={13} />
                      交付文件
                    </span>
                    {Object.keys(files).map((name) => (
                      <button
                        key={name}
                        className={activeFile === name ? 'active' : ''}
                        onClick={() => setFileName(name)}
                      >
                        {name.endsWith('.json') ? <FileJson size={13} /> : <FileCode2 size={13} />}
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="bt-file-content">
                    <div>
                      <span>{activeFile}</span>
                      <button
                        aria-label="复制当前文件"
                        onClick={() => copy(files[activeFile], '已复制当前文件。')}
                      >
                        <Copy size={12} />
                        复制
                      </button>
                    </div>
                    <pre>
                      <code>{files[activeFile]}</code>
                    </pre>
                  </div>
                </div>
                <div className="bt-handoff-steps">
                  <div>
                    <span>01</span>
                    <strong>启动你的项目</strong>
                    <p>解压项目包，安装依赖后即可运行。</p>
                  </div>
                  <div>
                    <span>02</span>
                    <strong>让 AI 理解规则</strong>
                    <p>将设计上下文交给你的编程工具。</p>
                  </div>
                  <div>
                    <span>03</span>
                    <strong>持续沿用</strong>
                    <p>后续页面继续使用同一份组件和约束。</p>
                  </div>
                </div>
                <p className="bt-handoff-note">
                  导出包含前端示例与本地演示数据。账号服务、业务 API 和权限需要接入你的项目。
                </p>
              </section>
            )}
            {proposal && (
              <div className="bt-proposal-bar">
                <Sparkles size={17} />
                <div>
                  <strong>设计提案已就绪</strong>
                  <p>{proposal.rationale}</p>
                  <small>尚未应用 · 已保留 {project.policy.locked.length} 项品牌锁定</small>
                </div>
                <button
                  className="bt-button"
                  onClick={() => {
                    setProposal(null);
                    setCompareBase(null);
                    setComparing(false);
                  }}
                >
                  放弃
                </button>
                <button
                  className="bt-button primary"
                  onClick={() => {
                    commit(proposal.project);
                    setComparing(false);
                    notify('已应用提案，可用撤销恢复之前的设计。');
                  }}
                >
                  <Check size={14} />
                  应用提案
                </button>
              </div>
            )}
            <div className="bt-workflow-status">
              <span>
                <ShieldCheck size={12} />
                {shown.policy.locked.length
                  ? `${shown.policy.locked.length} 项品牌规则已锁定`
                  : '当前可自由探索'}
                <button onClick={() => setStage('rules')}>
                  管理规则
                  <ChevronRight size={10} />
                </button>
              </span>
              <span>
                设计意图 <ArrowRight size={10} /> 组件契约 <ArrowRight size={10} /> 项目代码
              </span>
            </div>
          </section>
          {rightOpen && (
            <Inspector
              project={shown}
              mode={previewMode}
              selected={selection}
              onPatch={patch}
              onSelect={setSelection}
              onClose={() => setRightOpen(false)}
              inspect={inspect}
              onInspect={() => setInspect(!inspect)}
            />
          )}
        </div>
      </div>
      <Dialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title="版本历史"
        description="保存在当前浏览器。保存重要决定，让后续成员理解变化，并随时恢复。"
      >
        <div className="bt-revision-list">
          {revisions.length === 0 ? (
            <div className="bt-dialog-empty">
              <History size={26} />
              <h3>留下第一个设计决定</h3>
              <p>可以在顶部「保存版本」，为当前规则与界面记录一个名字。</p>
            </div>
          ) : (
            revisions.map((r) => (
              <div key={r.id}>
                <i style={{ background: r.project.theme.primary }} />
                <div>
                  <strong>{r.label}</strong>
                  <span>
                    {r.project.name} · {new Date(r.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <button
                  className="bt-button compact"
                  onClick={() => {
                    setCompareBase(r.project);
                    setComparing(true);
                    setStage('canvas');
                    setHistoryOpen(false);
                  }}
                >
                  比较
                </button>
                <button
                  className="bt-button compact"
                  onClick={() => {
                    commit(r.project);
                    setPrompt(r.project.brief);
                    setHistoryOpen(false);
                    notify('已恢复这个版本，恢复操作也可以撤销。');
                  }}
                >
                  恢复
                </button>
              </div>
            ))
          )}
        </div>
        <div className="bt-dialog-footer">
          <button className="bt-button" onClick={() => fileRef.current?.click()}>
            <Upload size={13} />
            打开项目 JSON
          </button>
          <button
            className="bt-button"
            onClick={() =>
              downloadFile(
                new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }),
                'btdesign-project.json',
              )
            }
          >
            <Download size={13} />
            导出当前项目
          </button>
        </div>
      </Dialog>
      <Dialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title="保存一个设计版本"
        description="用一句话记录这次决定，便于以后理解为什么这样设计。"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveVersion();
          }}
        >
          <label className="bt-field">
            版本说明
            <input
              value={revisionName}
              onChange={(e) => setRevisionName(e.target.value)}
              maxLength={80}
              placeholder="例如：品牌蓝确认，保留紧凑布局"
              autoFocus
            />
          </label>
          <div className="bt-dialog-footer">
            <button type="button" className="bt-button" onClick={() => setSaveOpen(false)}>
              取消
            </button>
            <button className="bt-button primary" type="submit">
              保存版本
            </button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={newOpen}
        onOpenChange={setNewOpen}
        title="开启一套新的设计系统"
        description="当前设计会自动留存在版本历史中。"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setRevisions((r) =>
              [
                {
                  id: crypto.randomUUID(),
                  label: `新建前 · ${project.name}`,
                  project,
                  createdAt: new Date().toISOString(),
                },
                ...r,
              ].slice(0, 20),
            );
            commit(
              createProject({ name: newName || '未命名设计系统', framework: project.framework }),
            );
            setPrompt('');
            setNewName('');
            setNewOpen(false);
            setStage('canvas');
            setComparing(false);
          }}
        >
          <label className="bt-field">
            设计系统名称
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={80}
              placeholder="为你的团队命名"
              autoFocus
            />
          </label>
          <div className="bt-dialog-footer">
            <button className="bt-button primary" type="submit">
              <Plus size={13} />
              创建工作空间
            </button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={migrationOpen}
        onOpenChange={setMigrationOpen}
        title="从已有系统继续"
        description="带入已确认的风格，保留业务逻辑，再逐步替换界面。"
        className="bt-migration-dialog"
      >
        <MigrationPanel
          onImportTheme={(theme) => {
            patch({ theme });
            setStage('canvas');
            setMigrationOpen(false);
          }}
          onClose={() => setMigrationOpen(false)}
          notify={notify}
        />
      </Dialog>
      <Dialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="连接 DeepSeek"
        description="模型密钥保留在服务端。你的品牌规则会在应用提案时再次校验。"
      >
        <div className="bt-connection-state">
          <span className={`bt-connection-dot ${health?.configured ? 'connected' : ''}`} />
          {health?.configured ? '服务端已配置' : '等待服务端配置'}
        </div>
        <p>在项目根目录 .env 设置 DEEPSEEK_API_KEY 并重启服务，或在部署平台设置同名环境变量。</p>
        {health?.authRequired && (
          <label className="bt-field">
            工作空间访问令牌
            <input
              type="password"
              autoComplete="off"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="管理员提供的 LAB_API_TOKEN"
            />
            <small>仅在当前页面内存中使用，不保存在浏览器。</small>
          </label>
        )}
        <a
          className="bt-inline-link"
          href="#/guides/development"
          onClick={() => setSettingsOpen(false)}
        >
          查看接入指南
          <ArrowUpRight size={12} />
        </a>
        <div className="bt-connection-scope">
          <strong>当前支持的生成范围</strong>
          <p>团队工作台、项目协作与登录场景的组合选择、文案和主题。应用前可以比较、调整或放弃。</p>
        </div>
      </Dialog>
      <input
        hidden
        type="file"
        ref={fileRef}
        accept=".json,application/json"
        onChange={(e) => importProject(e.target.files?.[0])}
      />
    </main>
  );
}
function SceneThumbnail({ scene }: { scene: ProjectScene }) {
  return (
    <span className={`bt-scene-thumb thumb-${scene}`} aria-hidden="true">
      <i className="thumb-top" />
      {scene === 'workspace' ? (
        <>
          <b />
          <i />
          <i />
          <i />
        </>
      ) : scene === 'projects' ? (
        <div>
          <i />
          <i />
          <i />
        </div>
      ) : (
        <>
          <span />
          <b />
          <b />
          <em />
        </>
      )}
    </span>
  );
}
function RulesView({
  project,
  mode,
  onLock,
  onPatch,
}: {
  project: ProjectSpec;
  mode: ThemeMode;
  onLock: (key: ThemeLock) => void;
  onPatch: (patch: unknown) => void;
}) {
  const tokens = createTheme(project.theme, mode);
  return (
    <section className="bt-rules-view">
      <header>
        <span className="bt-overline">让团队始终使用同一种语言</span>
        <h1>把经验，留在规则里。</h1>
        <p>这里既解释设计决定，也展示代码如何遵守。锁定的内容会在预设、导入和 AI 调整中保留。</p>
      </header>
      <div className="bt-rule-inheritance">
        <div>
          <span>01</span>
          <strong>品牌基础</strong>
          <p>气质、颜色、字体、密度</p>
        </div>
        <ArrowRight size={17} />
        <div>
          <span>02</span>
          <strong>语义规则</strong>
          <p>文字、容器、边界、状态</p>
        </div>
        <ArrowRight size={17} />
        <div>
          <span>03</span>
          <strong>组件实现</strong>
          <p>React / Vue 共享约定</p>
        </div>
      </div>
      <div className="bt-rules-heading">
        <h2>哪些决定需要保持一致？</h2>
        <span>锁定后仍可由你主动解锁</span>
      </div>
      <div className="bt-rule-list">
        {(
          [
            [
              'primary',
              '品牌主色',
              project.theme.primary,
              '用于主要操作和品牌强调，避免每个页面各选一套颜色。',
            ],
            ['font', '字体', project.theme.font, '让阅读节奏与信息层级在跨团队协作中保持一致。'],
            [
              'radius',
              '整体圆角',
              `${project.theme.radius} px`,
              '定义整体形状语言，组件默认继承。',
            ],
            [
              'density',
              '信息密度',
              project.theme.density === 'compact' ? '紧凑' : '舒适',
              '根据任务选择空间节奏，不因页面作者变化而漂移。',
            ],
            [
              'semantic',
              '语义颜色',
              `${mode === 'light' ? '浅色' : '深色'}模式`,
              '用「正文、背景、边界」表达用途，代替分散的色值。',
            ],
            [
              'components',
              '组件定制',
              '按钮 / 输入 / 字段 / 容器 / 表格',
              '局部调整有明确范围，其他组件继续遵循整体规则。',
            ],
          ] as [ThemeLock, string, string, string][]
        ).map(([key, label, value, why]) => (
          <div key={key}>
            <div>
              <strong>{label}</strong>
              <p>{why}</p>
            </div>
            <span>
              {key === 'primary' && <i style={{ background: value }} />}
              {value}
            </span>
            <button
              className={project.policy.locked.includes(key) ? 'locked' : ''}
              aria-pressed={project.policy.locked.includes(key)}
              aria-label={`${project.policy.locked.includes(key) ? '解锁' : '锁定'}${label}`}
              onClick={() => onLock(key)}
            >
              <LockKeyhole size={13} />
              {project.policy.locked.includes(key) ? '已锁定' : '可调整'}
            </button>
          </div>
        ))}
      </div>
      <div className="bt-rules-heading">
        <h2>从设计语言，到前端变量</h2>
        <span>当前 {mode === 'light' ? '浅色' : '深色'}模式</span>
      </div>
      <div className="bt-rule-mappings">
        {[
          ['正文', '--f-text', '阅读内容，保持主次清晰'],
          ['画布', '--f-bg', '页面最底层的背景'],
          ['容器', '--f-surface', '承载相关内容的表面'],
          ['边界', '--f-border', '区分分组与交互区域'],
          ['按钮圆角', '--f-button-radius', '未覆盖时继承整体圆角'],
        ].map(([name, key, why]) => (
          <div key={key}>
            <span>{name}</span>
            <code>{key}</code>
            <span>
              {tokens[key].startsWith('#') && <i style={{ background: tokens[key] }} />}
              {tokens[key]}
            </span>
            <small>{why}</small>
          </div>
        ))}
      </div>
      <div className="bt-contrast-note">
        <ShieldCheck size={16} />
        <div>
          <strong>
            当前文字与背景对比度 {contrastRatio(tokens['--f-text'], tokens['--f-bg']).toFixed(2)}:1
          </strong>
          <p>改变语义颜色后，也要检查焦点、状态和实际内容。规则文件会随交付包一起导出。</p>
        </div>
      </div>
    </section>
  );
}

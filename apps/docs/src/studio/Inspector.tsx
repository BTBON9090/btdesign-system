import { useState } from 'react';
import {
  ArrowUpRight,
  Braces,
  Check,
  ChevronRight,
  Code2,
  CornerDownRight,
  Info,
  LockKeyhole,
  Palette,
  SlidersHorizontal,
  Unlock,
  X,
} from 'lucide-react';
import {
  createTheme,
  defaultTheme,
  presets,
  type ThemeLock,
  type ThemeMode,
} from '@btdesign/tokens';
import { selectionKnowledge, type ProjectSpec } from '@btdesign/core';
import { CodeBlock } from '../shared';
import type { SceneSelection } from './ScenePreview';
import { ComponentRules } from './ComponentRules';
export const knowledge = selectionKnowledge;
const elementLabels = {
  page: '页面',
  button: '按钮',
  input: '输入框',
  card: '容器',
  table: '表格',
};
export function Inspector({
  project,
  selected,
  mode,
  onPatch,
  onSelect,
  onInspect,
  inspect,
  onClose,
}: {
  project: ProjectSpec;
  selected: SceneSelection | null;
  mode: ThemeMode;
  onPatch: (patch: unknown) => void;
  onSelect: (s: SceneSelection) => void;
  onInspect: () => void;
  inspect: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'design' | 'structure'>('design');
  const kind = selected || 'page';
  const info = knowledge[kind];
  const vars = createTheme(project.theme, mode);
  const locks = project.policy.locked;
  const component = kind === 'button' || kind === 'input' || kind === 'card' ? kind : null;
  const local = component ? project.theme.components?.[component] : undefined;
  const localRadius = local?.radius ?? project.theme.radius;
  const locked = locks.includes(component ? 'components' : 'radius');
  function patchTheme(v: unknown) {
    onPatch({ theme: v });
  }
  function lock(key: ThemeLock) {
    onPatch({
      policy: { locked: locks.includes(key) ? locks.filter((k) => k !== key) : [...locks, key] },
    });
  }
  const code =
    project.framework === 'react'
      ? kind === 'button'
        ? `<Button variant="primary">\n  {${JSON.stringify(project.content.actionLabel)}}\n</Button>`
        : kind === 'input'
          ? `<Field label="名称" description="团队成员可见">\n  <Input value={name}\n    onChange={e => setName(e.target.value)} />\n</Field>`
          : kind === 'card'
            ? `<Card>\n  <CardHeader>\n    <CardTitle>内容标题</CardTitle>\n  </CardHeader>\n  <CardContent>相关信息</CardContent>\n  <CardFooter><Button>查看详情</Button></CardFooter>\n</Card>`
            : kind === 'table'
              ? `<Table>\n  <TableHeader><TableRow>\n    <TableHead>名称</TableHead>\n  </TableRow></TableHeader>\n  <TableBody>{/* TableRow / TableCell */}</TableBody>\n</Table>`
              : `<main style={createTheme(theme, mode)}>\n  <PageHeader />\n  <WorkspaceContent />\n</main>`
      : kind === 'button'
        ? `<Button variant="primary">\n  {{ actionLabel }}\n</Button>`
        : kind === 'input'
          ? `<Field label="名称" description="团队成员可见">\n  <Input v-model="name" />\n</Field>`
          : kind === 'card'
            ? `<Card>\n  <CardHeader>\n    <CardTitle>内容标题</CardTitle>\n  </CardHeader>\n  <CardContent>相关信息</CardContent>\n  <CardFooter><Button>查看详情</Button></CardFooter>\n</Card>`
            : kind === 'table'
              ? `<Table>\n  <TableHeader><TableRow>\n    <TableHead>名称</TableHead>\n  </TableRow></TableHeader>\n  <TableBody><!-- TableRow / TableCell --></TableBody>\n</Table>`
              : `<main :style="createTheme(theme, mode)">\n  <PageHeader />\n  <WorkspaceContent />\n</main>`;
  return (
    <aside className="bt-inspector" aria-label="设计与前端说明">
      <div className="bt-panel-tabs">
        <button
          aria-pressed={tab === 'design'}
          className={tab === 'design' ? 'active' : ''}
          onClick={() => setTab('design')}
        >
          <SlidersHorizontal size={13} />
          设计
        </button>
        <button
          aria-pressed={tab === 'structure'}
          className={tab === 'structure' ? 'active' : ''}
          onClick={() => setTab('structure')}
        >
          <Braces size={13} />
          前端结构
        </button>
        <button className="bt-close-inspector bt-icon" aria-label="关闭属性面板" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <div className="bt-inspector-content">
        <div className="bt-selection-heading">
          <div>
            <span>当前选择</span>
            <h2>
              {elementLabels[kind]}
              <code>{info.component}</code>
            </h2>
          </div>
          <span className="bt-selection-dot" />
        </div>
        <div className="bt-breadcrumb">
          <span>界面</span>
          <ChevronRight size={10} />
          <span>{component ? '组件规则' : '整体规则'}</span>
        </div>
        <div className="bt-meaning">
          <span>
            <Info size={12} />
            设计意图
          </span>
          <p>{info.designIntent}</p>
        </div>
        {tab === 'design' ? (
          <>
            {kind === 'page' && (
              <>
                <label className="bt-field">
                  主标题
                  <input
                    key={`title-${project.content.title}`}
                    defaultValue={project.content.title}
                    maxLength={120}
                    onBlur={(e) => onPatch({ content: { title: e.target.value } })}
                  />
                </label>
                <label className="bt-field">
                  说明
                  <textarea
                    key={`desc-${project.content.description}`}
                    defaultValue={project.content.description}
                    rows={2}
                    maxLength={300}
                    onBlur={(e) => onPatch({ content: { description: e.target.value } })}
                  />
                </label>
              </>
            )}
            {kind === 'button' && (
              <label className="bt-field">
                主操作文案
                <input
                  key={project.content.actionLabel}
                  defaultValue={project.content.actionLabel}
                  maxLength={40}
                  onBlur={(e) => onPatch({ content: { actionLabel: e.target.value } })}
                />
                <small>修改当前页面的主要操作按钮。</small>
              </label>
            )}
            <div className="bt-inspector-section">
              <div className="bt-section-label">
                <span>品牌色</span>
                <button
                  title={locks.includes('primary') ? '解锁品牌色' : '锁定品牌色'}
                  aria-label={locks.includes('primary') ? '解锁品牌色' : '锁定品牌色'}
                  onClick={() => lock('primary')}
                >
                  {locks.includes('primary') ? <LockKeyhole size={12} /> : <Unlock size={12} />}
                </button>
              </div>
              <div className="bt-color-editor">
                <input
                  type="color"
                  aria-label="品牌色"
                  value={project.theme.primary}
                  disabled={locks.includes('primary')}
                  onChange={(e) => patchTheme({ primary: e.target.value })}
                />
                <input
                  key={project.theme.primary}
                  aria-label="品牌色色值"
                  defaultValue={project.theme.primary}
                  maxLength={7}
                  disabled={locks.includes('primary')}
                  onBlur={(e) => {
                    if (/^#[a-f0-9]{6}$/i.test(e.target.value))
                      patchTheme({ primary: e.target.value });
                    else e.target.value = project.theme.primary;
                  }}
                />
                <code>HEX</code>
              </div>
              <div className="bt-color-options">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    aria-label={`使用 ${p.name} 品牌色`}
                    disabled={locks.includes('primary')}
                    onClick={() => patchTheme({ primary: p.primary })}
                    style={{ background: p.primary }}
                  >
                    {project.theme.primary === p.primary && (
                      <Check size={11} color={createTheme(p)['--f-on-primary']} />
                    )}
                  </button>
                ))}
              </div>
              <small className="bt-impact">
                <CornerDownRight size={11} />
                同步所有主操作与品牌强调
              </small>
            </div>
            <div className="bt-inspector-section">
              <div className="bt-section-label">
                <span>{component ? `${elementLabels[kind]}圆角` : '全局圆角'}</span>
                <code>{localRadius} px</code>
              </div>
              <input
                type="range"
                aria-label={component ? `${elementLabels[kind]}圆角` : '全局圆角'}
                min={0}
                max={20}
                value={localRadius}
                disabled={locked}
                onChange={(e) =>
                  patchTheme(
                    component
                      ? { components: { [component]: { radius: Number(e.target.value) } } }
                      : { radius: Number(e.target.value) },
                  )
                }
              />
              <div className="bt-range-ends">
                <span>利落</span>
                <span>柔和</span>
              </div>
              {component && (
                <button
                  className="bt-inherit"
                  disabled={locked || local?.radius === undefined}
                  onClick={() => patchTheme({ components: { [component]: { radius: null } } })}
                >
                  <CornerDownRight size={11} />
                  {local?.radius === undefined ? '继承全局圆角' : '恢复继承全局'}
                </button>
              )}
            </div>
            {component && (
              <div className="bt-inspector-section">
                <div className="bt-section-label">
                  <span>{component === 'card' ? '容器内边距' : '控件基准高度'}</span>
                  <code>
                    {component === 'card'
                      ? vars['--f-card-padding']
                      : vars[`--f-${component}-height`]}
                  </code>
                </div>
                <input
                  type="range"
                  aria-label={component === 'card' ? '容器内边距' : '控件基准高度'}
                  min={component === 'card' ? 8 : 28}
                  max={component === 'card' ? 40 : 56}
                  disabled={locks.includes('components')}
                  value={parseInt(
                    vars[component === 'card' ? '--f-card-padding' : `--f-${component}-height`],
                  )}
                  onChange={(e) =>
                    patchTheme({
                      components: {
                        [component]: {
                          [component === 'card' ? 'padding' : 'height']: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
                <small className="bt-impact">
                  <CornerDownRight size={11} />
                  应用到这套系统的全部{elementLabels[kind]}
                </small>
              </div>
            )}
            {(kind === 'input' || kind === 'table') && (
              <div className="bt-inspector-section">
                <div className="bt-section-label">
                  <span>{kind === 'input' ? '字段结构' : '表格密度'}</span>
                  <button
                    aria-label={locks.includes('components') ? '解锁组件规则' : '锁定组件规则'}
                    onClick={() => lock('components')}
                  >
                    {locks.includes('components') ? (
                      <LockKeyhole size={12} />
                    ) : (
                      <Unlock size={12} />
                    )}
                  </button>
                </div>
                {(kind === 'input'
                  ? ([
                      ['field', 'gap', '标签与控件间距', '--f-field-gap', 4, 20],
                      ['field', 'labelSize', '标签字号', '--f-field-label-size', 11, 16],
                    ] as const)
                  : ([
                      ['table', 'cellPadding', '单元格内边距', '--f-table-cell-padding', 6, 24],
                      ['table', 'rowHeight', '最小行高', '--f-table-row-height', 28, 72],
                    ] as const)
                ).map(([section, property, label, token, min, max]) => (
                  <label className="bt-field" key={token}>
                    <span>
                      {label} · {vars[token]}
                    </span>
                    <input
                      type="range"
                      aria-label={label}
                      min={min}
                      max={max}
                      value={parseInt(vars[token])}
                      disabled={locks.includes('components')}
                      onChange={(event) =>
                        patchTheme({
                          components: { [section]: { [property]: Number(event.target.value) } },
                        })
                      }
                    />
                  </label>
                ))}
                <button
                  className="bt-inherit"
                  disabled={
                    locks.includes('components') ||
                    !project.theme.components?.[kind === 'input' ? 'field' : 'table']
                  }
                  onClick={() =>
                    patchTheme({ components: { [kind === 'input' ? 'field' : 'table']: null } })
                  }
                >
                  <CornerDownRight size={11} />
                  恢复继承系统规则
                </button>
                <small className="bt-impact">
                  同步 React、Vue 与导出项目；锁定后，后续方案保留这些规则。
                </small>
              </div>
            )}
            <ComponentRules
              theme={project.theme}
              mode={mode}
              locked={locks.includes('components')}
              onLock={() => lock('components')}
              onPatch={patchTheme}
            />
            <div className="bt-inspector-section">
              <label className="bt-field">
                信息密度
                <select
                  value={project.theme.density}
                  disabled={locks.includes('density')}
                  onChange={(e) => patchTheme({ density: e.target.value })}
                >
                  <option value="comfortable">舒适 · 更从容的阅读空间</option>
                  <option value="compact">紧凑 · 更多信息同屏</option>
                </select>
              </label>
              <label className="bt-field">
                字体
                <select
                  value={project.theme.font}
                  disabled={locks.includes('font')}
                  onChange={(e) => patchTheme({ font: e.target.value })}
                >
                  <option value="system">系统字体</option>
                  <option value="inter">Inter</option>
                  <option value="mono">等宽字体</option>
                </select>
              </label>
            </div>
            <div className="bt-inspector-section">
              <div className="bt-section-label">
                <span>{mode === 'light' ? '浅色' : '深色'}语义颜色</span>
                {locks.includes('semantic') && <LockKeyhole size={12} />}
              </div>
              {(
                [
                  ['background', '画布', '--f-bg'],
                  ['surface', '容器', '--f-surface'],
                  ['text', '正文', '--f-text'],
                  ['border', '边界', '--f-border'],
                ] as const
              ).map(([key, label, css]) => (
                <label className="bt-semantic-field" key={key}>
                  <span>{label}</span>
                  <code>{vars[css]}</code>
                  <input
                    type="color"
                    aria-label={`${label}颜色`}
                    value={vars[css]}
                    disabled={locks.includes('semantic')}
                    onChange={(e) =>
                      patchTheme({ semantic: { [mode]: { [key]: e.target.value } } })
                    }
                  />
                </label>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="bt-structure-tree">
              <strong>界面是怎样组成的</strong>
              {(['page', 'button', 'input', 'card', 'table'] as SceneSelection[])
                .filter(
                  (k) =>
                    (project.scene === 'workspace' || k !== 'table') &&
                    (project.scene !== 'projects' || k !== 'input'),
                )
                .map((k) => (
                  <button
                    key={k}
                    className={kind === k ? 'active' : ''}
                    onClick={() => {
                      onSelect(k);
                      if (!inspect) onInspect();
                    }}
                  >
                    <span>{k === 'page' ? <LayersIcon /> : <CornerDownRight size={12} />}</span>
                    <b>{elementLabels[k]}</b>
                    <code>{knowledge[k].component}</code>
                  </button>
                ))}
            </div>
            <div className="bt-implementation">
              <span>前端实现</span>
              <p>{info.implementation}</p>
            </div>
            <CodeBlock
              label={`${project.framework === 'react' ? 'React' : 'Vue 3'} · 结构示意`}
              code={code}
            />
            <div className="bt-token-bindings">
              <strong>由哪些规则控制</strong>
              {info.tokenKeys.map((key) => (
                <div key={key}>
                  <code>{key}</code>
                  <span title={vars[key]}>
                    {vars[key].startsWith('#') ? <i style={{ background: vars[key] }} /> : null}
                    {key === '--f-font' ? project.theme.font : vars[key]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        <a className="bt-component-link" href={`#${info.docPath}`}>
          完整原理与组件用法
          <ArrowUpRight size={12} />
        </a>
      </div>
      <div className="bt-inspector-foot">
        <span className="bt-live-dot" />
        一处调整，React 与 Vue 同步
      </div>
    </aside>
  );
}
function LayersIcon() {
  return <Code2 size={12} />;
}

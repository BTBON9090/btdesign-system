import { useState } from 'react';
import {
  ArrowUpRight,
  Braces,
  Check,
  LockKeyhole,
  SlidersHorizontal,
  Unlock,
  X,
} from 'lucide-react';
import { createTheme, presets, type ThemeLock, type ThemeMode } from '@btdesign/tokens';
import type { ProjectSpec } from '@btdesign/core';
import { componentAnatomy } from '../catalog';
import { ComponentRules, GeometryControl } from './ComponentRules';
import {
  componentControls,
  controlDefinitions,
  getSelectedPart,
  selectionLabel,
  type EditorSelection,
} from './component-controls';
import './Inspector.css';

export function Inspector({
  project,
  selection,
  mode,
  onPatch,
  onSelect,
  onClose,
  onBeginChange,
  onEndChange,
}: {
  project: ProjectSpec;
  selection: EditorSelection;
  mode: ThemeMode;
  onPatch: (patch: unknown) => void;
  onSelect: (selection: EditorSelection) => void;
  onClose: () => void;
  onBeginChange: () => void;
  onEndChange: () => void;
}) {
  const [tab, setTab] = useState<'design' | 'structure'>('design');
  const [colorError, setColorError] = useState('');
  const vars = createTheme(project.theme, mode);
  const locks = project.policy.locked;
  const definition = selection.component === 'page' ? null : componentControls[selection.component];
  const part = getSelectedPart(selection);
  const patchTheme = (theme: unknown) => onPatch({ theme });
  const lock = (key: ThemeLock) =>
    onPatch({
      policy: {
        locked: locks.includes(key) ? locks.filter((item) => item !== key) : [...locks, key],
      },
    });
  const colorGesture = {
    onPointerDown: onBeginChange,
    onFocus: onBeginChange,
    onBlur: onEndChange,
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key))
        onBeginChange();
    },
  };
  const controlTokens = (part?.controls ?? []).map((id) => controlDefinitions[id].token);
  const anatomy = selection.component === 'page' ? [] : componentAnatomy[selection.component];
  const matched = part?.anatomy
    ? part.anatomy.flatMap((index) => (anatomy[index] ? [anatomy[index]] : []))
    : anatomy.filter((item) => item.tokens.some((token) => controlTokens.includes(token)));
  const shownAnatomy = matched.length ? matched : anatomy;
  const tokens =
    selection.component === 'page'
      ? [
          '--f-primary',
          '--f-bg',
          '--f-surface',
          '--f-text',
          '--f-border',
          '--f-radius',
          '--f-control-height',
          '--f-font',
        ]
      : [...new Set([...controlTokens, ...shownAnatomy.flatMap((item) => item.tokens)])];
  const lockButton = (key: ThemeLock, label: string) => (
    <button
      type="button"
      className="bt-rule-lock"
      aria-label={`${locks.includes(key) ? '解锁' : '锁定'}${label}`}
      title={`${locks.includes(key) ? '解锁' : '锁定'}${label}`}
      onClick={() => lock(key)}
    >
      {locks.includes(key) ? <LockKeyhole size={14} /> : <Unlock size={14} />}
    </button>
  );
  return (
    <aside className="bt-inspector bt-focused-inspector" aria-label="样式设置">
      <div className="bt-panel-tabs">
        <button
          type="button"
          aria-pressed={tab === 'design'}
          className={tab === 'design' ? 'active' : ''}
          onClick={() => setTab('design')}
        >
          <SlidersHorizontal size={14} />
          设计
        </button>
        <button
          type="button"
          aria-pressed={tab === 'structure'}
          className={tab === 'structure' ? 'active' : ''}
          onClick={() => setTab('structure')}
        >
          <Braces size={14} />
          结构
        </button>
        <button
          type="button"
          className="bt-close-inspector bt-icon"
          aria-label="关闭属性面板"
          onClick={onClose}
        >
          <X size={15} />
        </button>
      </div>
      <div className="bt-inspector-content">
        <div className="bt-focused-heading">
          <h2>{selectionLabel(selection)}</h2>
          {definition && (
            <button
              type="button"
              className="bt-global-link"
              onClick={() => onSelect({ component: 'page' })}
            >
              整体样式
            </button>
          )}
        </div>
        {definition &&
          part &&
          (definition.parts.length > 1 ? (
            <label className="bt-part-picker">
              <span>部件</span>
              <select
                aria-label="编辑部件"
                value={part.id}
                onChange={(event) =>
                  onSelect({ component: definition.id, part: event.currentTarget.value })
                }
              >
                {definition.parts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="bt-single-part">{part.label}</p>
          ))}
        {tab === 'design' ? (
          definition ? (
            <ComponentRules
              theme={project.theme}
              mode={mode}
              selection={selection}
              locked={locks.includes('components')}
              onLock={() => lock('components')}
              onPatch={patchTheme}
              onSelectGlobal={() => onSelect({ component: 'page' })}
              onBeginChange={onBeginChange}
              onEndChange={onEndChange}
            />
          ) : (
            <>
              <section className="bt-global-section">
                <div className="bt-setting-title">
                  <h3>品牌色</h3>
                  {lockButton('primary', '品牌色')}
                </div>
                <div className="bt-color-editor">
                  <input
                    type="color"
                    aria-label="品牌色"
                    value={project.theme.primary}
                    disabled={locks.includes('primary')}
                    {...colorGesture}
                    onChange={(event) => patchTheme({ primary: event.currentTarget.value })}
                  />
                  <input
                    key={project.theme.primary}
                    aria-label="品牌色色值"
                    aria-invalid={Boolean(colorError) || undefined}
                    aria-describedby={colorError ? 'bt-color-error' : undefined}
                    defaultValue={project.theme.primary}
                    maxLength={7}
                    disabled={locks.includes('primary')}
                    onChange={() => setColorError('')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur();
                    }}
                    onBlur={(event) => {
                      if (/^#[a-f0-9]{6}$/i.test(event.currentTarget.value)) {
                        setColorError('');
                        patchTheme({ primary: event.currentTarget.value });
                      } else {
                        setColorError('使用 #RRGGBB 格式，例如 #2563EB。');
                        event.currentTarget.value = project.theme.primary;
                      }
                    }}
                  />
                </div>
                {colorError && (
                  <p id="bt-color-error" className="bt-setting-error" role="alert">
                    {colorError}
                  </p>
                )}
                <div className="bt-color-options">
                  {presets.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      aria-label={`使用 ${preset.name} 品牌色`}
                      title={preset.name}
                      disabled={locks.includes('primary')}
                      onClick={() => patchTheme({ primary: preset.primary })}
                      style={{ background: preset.primary }}
                    >
                      {project.theme.primary === preset.primary && (
                        <Check size={11} color={createTheme(preset)['--f-on-primary']} />
                      )}
                    </button>
                  ))}
                </div>
              </section>
              <section className="bt-global-section">
                <div className="bt-setting-title">
                  <h3>形状</h3>
                  {lockButton('radius', '全局圆角')}
                </div>
                <GeometryControl
                  label="全局圆角"
                  min={0}
                  max={20}
                  value={project.theme.radius}
                  disabled={locks.includes('radius')}
                  onChange={(radius) => patchTheme({ radius })}
                  onBeginChange={onBeginChange}
                  onEndChange={onEndChange}
                />
                <p className="bt-rule-scope">组件有单独设置时，优先使用组件规则。</p>
              </section>
              <section className="bt-global-section bt-global-selects">
                <div className="bt-setting-title">
                  <label htmlFor="bt-density">密度</label>
                  {lockButton('density', '信息密度')}
                </div>
                <select
                  id="bt-density"
                  aria-label="信息密度"
                  value={project.theme.density}
                  disabled={locks.includes('density')}
                  onChange={(event) => patchTheme({ density: event.currentTarget.value })}
                >
                  <option value="comfortable">舒适</option>
                  <option value="compact">紧凑</option>
                </select>
                <div className="bt-setting-title">
                  <label htmlFor="bt-font">字体</label>
                  {lockButton('font', '字体')}
                </div>
                <select
                  id="bt-font"
                  value={project.theme.font}
                  disabled={locks.includes('font')}
                  onChange={(event) => patchTheme({ font: event.currentTarget.value })}
                >
                  <option value="system">系统字体</option>
                  <option value="inter">Inter</option>
                  <option value="mono">等宽字体</option>
                </select>
              </section>
              <details className="bt-settings-details">
                <summary>{mode === 'light' ? '浅色' : '深色'}界面颜色</summary>
                <div className="bt-setting-title">
                  <span>颜色规则</span>
                  {lockButton('semantic', '界面颜色')}
                </div>
                {(
                  [
                    ['background', '画布', '--f-bg'],
                    ['surface', '容器', '--f-surface'],
                    ['text', '正文', '--f-text'],
                    ['muted', '次要文字', '--f-muted'],
                    ['border', '边界', '--f-border'],
                  ] as const
                ).map(([key, label, token]) => (
                  <label key={key} className="bt-semantic-field">
                    <span>{label}</span>
                    <code>{vars[token]}</code>
                    <input
                      type="color"
                      aria-label={`${label}颜色`}
                      value={vars[token]}
                      disabled={locks.includes('semantic')}
                      {...colorGesture}
                      onChange={(event) =>
                        patchTheme({ semantic: { [mode]: { [key]: event.currentTarget.value } } })
                      }
                    />
                  </label>
                ))}
              </details>
              <details className="bt-settings-details">
                <summary>页面文案</summary>
                <label className="bt-field">
                  主标题
                  <input
                    key={`title-${project.content.title}`}
                    defaultValue={project.content.title}
                    maxLength={120}
                    onBlur={(event) => onPatch({ content: { title: event.currentTarget.value } })}
                  />
                </label>
                <label className="bt-field">
                  说明
                  <textarea
                    key={`description-${project.content.description}`}
                    defaultValue={project.content.description}
                    rows={3}
                    maxLength={300}
                    onBlur={(event) =>
                      onPatch({ content: { description: event.currentTarget.value } })
                    }
                  />
                </label>
                <label className="bt-field">
                  主按钮文字
                  <input
                    key={`action-${project.content.actionLabel}`}
                    defaultValue={project.content.actionLabel}
                    maxLength={40}
                    onBlur={(event) =>
                      onPatch({ content: { actionLabel: event.currentTarget.value } })
                    }
                  />
                </label>
              </details>
            </>
          )
        ) : (
          <section className="bt-part-structure">
            {definition ? (
              <>
                <code className="bt-component-code-name">{definition.name}</code>
                {shownAnatomy.map((item) => (
                  <div key={item.name} className="bt-structure-item">
                    <h3>{item.name}</h3>
                    <p>{item.purpose}</p>
                    <code>{item.structure}</code>
                  </div>
                ))}
              </>
            ) : (
              <p>整体规则由 React、Vue 和导出项目共同使用。</p>
            )}
            <div className="bt-token-bindings">
              <h3>当前规则值</h3>
              {tokens
                .filter((token) => vars[token] !== undefined)
                .map((token) => (
                  <div key={token}>
                    <code>{token}</code>
                    <span title={vars[token]}>
                      {vars[token].startsWith('#') && <i style={{ background: vars[token] }} />}
                      {token === '--f-font' ? project.theme.font : vars[token]}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}
        <a
          className="bt-component-link"
          href={definition ? `#/components/${definition.id}` : '#/guides/design'}
        >
          {definition ? '组件用法' : '设计指南'}
          <ArrowUpRight size={12} />
        </a>
      </div>
    </aside>
  );
}

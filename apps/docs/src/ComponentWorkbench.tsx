import { useState, type CSSProperties } from 'react';
import { createTheme, defaultTheme, type ThemeMode } from '@btdesign/tokens';
import { loadStudio } from './studio/model';
import {
  catalog,
  componentAnatomy,
  componentCode,
  defaultDemoOptions,
  type ComponentId,
  type DemoOptions,
  type Framework,
} from './catalog';
import { ComponentDemo } from './ComponentDemo';
import { VueDemo } from './VueDemo';
import { CodeBlock, FrameworkToggle } from './shared';
import './ComponentWorkbench.css';

const sizeable: ComponentId[] = [
  'button',
  'input',
  'textarea',
  'select',
  'field',
  'input-group',
  'number-input',
  'avatar',
  'spinner',
];
const disableable: ComponentId[] = [
  'button',
  'input',
  'textarea',
  'select',
  'checkbox',
  'switch',
  'field',
  'input-group',
  'radio-group',
  'number-input',
  'pagination',
];
const invalidable: ComponentId[] = [
  'input',
  'textarea',
  'select',
  'field',
  'input-group',
  'number-input',
];
const variants: Partial<Record<ComponentId, string[]>> = {
  button: ['primary', 'secondary', 'ghost', 'danger'],
  badge: ['default', 'success', 'warning', 'danger', 'info'],
  alert: ['info', 'success', 'warning', 'danger'],
};
export function ComponentWorkbench({
  kind,
  framework,
  mode,
  onFrameworkChange,
  onAction,
}: {
  kind: ComponentId;
  framework: Framework;
  mode: ThemeMode;
  onFrameworkChange: (value: Framework) => void;
  onAction: (message: string) => void;
}) {
  const [options, setOptions] = useState<DemoOptions>({
    ...defaultDemoOptions,
    variant: variants[kind]?.[0] ?? 'primary',
    orientation: kind === 'radio-group' ? 'vertical' : 'horizontal',
  });
  const [partIndex, setPartIndex] = useState(0);
  const [project] = useState(() => loadStudio().project);
  const [themeSource, setThemeSource] = useState<'workspace' | 'default'>('workspace');
  const previewTheme = themeSource === 'workspace' ? project.theme : defaultTheme;
  const previewStyle = {
    ...createTheme(previewTheme, mode),
    fontFamily: 'var(--f-font)',
    color: 'var(--f-text)',
    colorScheme: mode,
  } as CSSProperties;
  const parts = componentAnatomy[kind];
  const part = parts[partIndex];
  const update = <K extends keyof DemoOptions>(key: K, value: DemoOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));
  return (
    <>
      <div className="example-heading">
        <h2 id="preview">组件实验台</h2>
        <FrameworkToggle value={framework} onChange={onFrameworkChange} />
      </div>
      <div className="bt-workbench">
        <div className="bt-workbench-controls" aria-label="预览参数">
          <label>
            预览主题
            <select
              aria-label="预览主题"
              value={themeSource}
              onChange={(event) => setThemeSource(event.target.value as 'workspace' | 'default')}
            >
              <option value="workspace">{project.name}</option>
              <option value="default">BTDESIGN 默认</option>
            </select>
          </label>
          {sizeable.includes(kind) && (
            <label>
              尺寸
              <select
                aria-label="预览尺寸"
                value={options.size}
                onChange={(e) => update('size', e.target.value as DemoOptions['size'])}
              >
                <option value="sm">小 · sm</option>
                <option value="md">中 · md</option>
                <option value="lg">大 · lg</option>
              </select>
            </label>
          )}
          {variants[kind] && (
            <label>
              变体
              <select
                aria-label="预览变体"
                value={options.variant}
                onChange={(e) => update('variant', e.target.value)}
              >
                {variants[kind]!.map((variant) => (
                  <option key={variant}>{variant}</option>
                ))}
              </select>
            </label>
          )}
          {disableable.includes(kind) && (
            <label>
              状态
              <select
                aria-label="预览状态"
                value={options.state}
                onChange={(e) => update('state', e.target.value as DemoOptions['state'])}
              >
                <option value="default">默认</option>
                <option value="disabled">禁用</option>
                {invalidable.includes(kind) && <option value="invalid">错误</option>}
                {kind === 'button' && <option value="loading">处理中</option>}
              </select>
            </label>
          )}
          {['separator', 'radio-group'].includes(kind) && (
            <label>
              方向
              <select
                aria-label="预览方向"
                value={options.orientation}
                onChange={(e) =>
                  update('orientation', e.target.value as DemoOptions['orientation'])
                }
              >
                <option value="horizontal">横向</option>
                <option value="vertical">纵向</option>
              </select>
            </label>
          )}
          {kind === 'progress' && (
            <label>
              示例进度 <output>{options.progress}%</output>
              <input
                aria-label="示例进度"
                type="range"
                min={0}
                max={100}
                value={options.progress}
                onChange={(e) => update('progress', Number(e.target.value))}
              />
            </label>
          )}
          <span className="bt-workbench-sync">预览与代码同步</span>
        </div>
        <div className={`component-example example-${kind}`} data-theme={mode} style={previewStyle}>
          {framework === 'react' ? (
            <ComponentDemo kind={kind} options={options} onAction={onAction} />
          ) : (
            <VueDemo kind={kind} options={options} onAction={onAction} />
          )}
        </div>
        <p className="bt-workbench-theme-note">示例展示组件用法，企业主题随 Studio 导出。</p>
        <CodeBlock
          code={componentCode(kind, framework, options)}
          label={framework === 'react' ? 'React · TSX' : 'Vue · SFC'}
        />
      </div>
      <section className="bt-component-anatomy" aria-labelledby="anatomy">
        <div className="bt-anatomy-heading">
          <h2 id="anatomy">理解每一层</h2>
          <span>{parts.length} 个结构层</span>
        </div>
        <div className="bt-anatomy-layout">
          <div
            className="bt-anatomy-parts"
            aria-label={`${catalog.find((c) => c.id === kind)?.name} 结构层`}
          >
            {parts.map((item, index) => (
              <button
                type="button"
                key={item.name}
                aria-pressed={index === partIndex}
                onClick={() => setPartIndex(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.name}
              </button>
            ))}
          </div>
          <div className="bt-anatomy-detail">
            <strong>{part.name}</strong>
            <p>{part.purpose}</p>
            <dl>
              <div>
                <dt>前端结构</dt>
                <dd>
                  <code>{part.structure}</code>
                </dd>
              </div>
              <div>
                <dt>继承规则</dt>
                <dd className="bt-anatomy-tokens">
                  {part.tokens.map((token) => (
                    <code key={token}>{token}</code>
                  ))}
                </dd>
              </div>
            </dl>
            <a href="#/lab">在创作空间统一调整品牌、密度和组件规则 →</a>
          </div>
        </div>
      </section>
    </>
  );
}

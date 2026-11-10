import { useState } from 'react';
import type { ProjectSpec } from '@btdesign/core';
import type { ThemeMode } from '@btdesign/tokens';
import { ComponentWorkbench } from '../ComponentWorkbench';
import { catalog, type ComponentId } from '../catalog';

export function ComponentCanvas({
  project,
  mode,
  onModeChange,
  onPatch,
  notify,
}: {
  project: ProjectSpec;
  mode: ThemeMode;
  onModeChange: () => void;
  onPatch: (patch: unknown) => void;
  notify: (message: string) => void;
}) {
  const [kind, setKind] = useState<ComponentId>('form');
  return (
    <section className="bt-component-canvas">
      <header>
        <span className="bt-overline">在真实组件上验证设计规则</span>
        <h1>一套规则，每一个细节。</h1>
        <p>切换组件、框架和状态，用右侧规则统一调整。当前预览直接继承这套设计系统。</p>
      </header>
      <div className="bt-component-canvas-select">
        <label>
          组件
          <select
            aria-label="组件画布选择"
            value={kind}
            onChange={(e) => setKind(e.target.value as ComponentId)}
          >
            {catalog.map((item) => (
              <option key={item.id} value={item.id}>
                {item.cn} · {item.name}
              </option>
            ))}
          </select>
        </label>
        <button className="bt-button" onClick={onModeChange}>
          {mode === 'light' ? '预览深色组件' : '预览浅色组件'}
        </button>
        <a href={`#/components/${kind}`}>打开完整用法 →</a>
      </div>
      <ComponentWorkbench
        key={kind}
        kind={kind}
        framework={project.framework}
        mode={mode}
        liveProject={project}
        onFrameworkChange={(framework) => onPatch({ framework })}
        onAction={notify}
      />
    </section>
  );
}

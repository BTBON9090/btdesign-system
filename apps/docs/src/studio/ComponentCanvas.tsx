import type { ProjectSpec } from '@btdesign/core';
import type { ThemeMode } from '@btdesign/tokens';
import { Moon, Sun } from 'lucide-react';
import { ComponentWorkbench } from '../ComponentWorkbench';
import { catalog, componentCategories, type ComponentId } from '../catalog';
import type { EditorSelection } from './component-controls';
import './ComponentCanvas.css';

export function ComponentCanvas({
  project,
  selection,
  onSelect,
  mode,
  onModeChange,
  onPatch,
  notify,
}: {
  project: ProjectSpec;
  selection: EditorSelection;
  onSelect: (selection: EditorSelection) => void;
  mode: ThemeMode;
  onModeChange: () => void;
  onPatch: (patch: unknown) => void;
  notify: (message: string) => void;
}) {
  const kind = selection.component === 'page' ? 'button' : selection.component;
  return (
    <section className="bt-component-canvas" aria-label="组件画布">
      <div className="bt-component-canvas-select">
        <label>
          组件
          <select
            aria-label="组件画布选择"
            value={kind}
            onChange={(event) => onSelect({ component: event.target.value as ComponentId })}
          >
            {componentCategories.map((category) => (
              <optgroup key={category} label={category}>
                {catalog
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.cn} · {item.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="bt-component-canvas-actions">
          <button
            className="bt-button"
            onClick={onModeChange}
            aria-label={mode === 'light' ? '预览深色组件' : '预览浅色组件'}
            title={mode === 'light' ? '预览深色组件' : '预览浅色组件'}
          >
            {mode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            {mode === 'light' ? '深色' : '浅色'}
          </button>
          <a href={`#/components/${kind}`}>组件文档 ↗</a>
        </div>
      </div>
      <ComponentWorkbench
        key={kind}
        kind={kind}
        framework={project.framework}
        mode={mode}
        liveProject={project}
        embedded
        onFrameworkChange={(framework) => onPatch({ framework })}
        onAction={notify}
      />
    </section>
  );
}

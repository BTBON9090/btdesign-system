import { useId } from 'react';
import { createTheme, type ThemeConfig, type ThemeMode } from '@btdesign/tokens';
import { LockKeyhole, RotateCcw, Unlock } from 'lucide-react';
import {
  controlDefinitions,
  controlValue,
  getSelectedPart,
  partHasOverrides,
  resetPartPatch,
  sharedControlLabels,
  selectionLabel,
  type EditorSelection,
} from './component-controls';

const rangeKeys = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);
/** One pointer drag or keyboard adjustment is one history transaction. */
export function GeometryControl({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
  onBeginChange,
  onEndChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  onBeginChange: () => void;
  onEndChange: () => void;
}) {
  const id = useId();
  return (
    <div className="bt-rule-control">
      <div className="bt-rule-control-heading">
        <label htmlFor={id}>{label}</label>
        <div className="bt-rule-number">
          <input
            key={value}
            type="number"
            aria-label={`${label}数值`}
            min={min}
            max={max}
            step={1}
            defaultValue={value}
            disabled={disabled}
            onFocus={onBeginChange}
            onBlur={(event) => {
              const next = event.currentTarget.valueAsNumber;
              if (Number.isFinite(next)) onChange(Math.round(Math.max(min, Math.min(max, next))));
              else event.currentTarget.value = String(value);
              onEndChange();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span aria-hidden="true">px</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onFocus={onBeginChange}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onBeginChange();
        }}
        onPointerUp={onEndChange}
        onPointerCancel={onEndChange}
        onLostPointerCapture={onEndChange}
        onKeyDown={(event) => {
          if (rangeKeys.has(event.key)) onBeginChange();
        }}
        onKeyUp={(event) => {
          if (rangeKeys.has(event.key)) onEndChange();
        }}
        onBlur={onEndChange}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </div>
  );
}
export function ComponentRules({
  theme,
  mode,
  selection,
  locked,
  onLock,
  onPatch,
  onSelectGlobal,
  onBeginChange,
  onEndChange,
}: {
  theme: ThemeConfig;
  mode: ThemeMode;
  selection: EditorSelection;
  locked: boolean;
  onLock: () => void;
  onPatch: (patch: unknown) => void;
  onSelectGlobal: () => void;
  onBeginChange: () => void;
  onEndChange: () => void;
}) {
  const part = getSelectedPart(selection);
  const vars = createTheme(theme, mode);
  const shared = sharedControlLabels(selection);
  if (!part?.controls.length)
    return (
      <div className="bt-inherited-part">
        <p>这个部件继承整体样式。</p>
        <button type="button" onClick={onSelectGlobal}>
          调整整体样式
        </button>
      </div>
    );
  const scope = shared.length ? `共享于：${shared.join('、')}` : '应用于所有同类组件';
  return (
    <section className="bt-part-rules" aria-label={`${part.label}规则`}>
      <div className="bt-rule-actions">
        {shared.length ? (
          <details className="bt-shared-scope">
            <summary>共享规则 · 影响 {shared.length + 1} 类组件</summary>
            <p>{[selectionLabel(selection), ...shared].join('、')}</p>
          </details>
        ) : (
          <span className="bt-rule-scope">{scope}</span>
        )}
        <button
          type="button"
          className="bt-rule-lock"
          aria-label={locked ? '解锁全部组件规则' : '锁定全部组件规则'}
          title={locked ? '解锁全部组件规则' : '锁定全部组件规则'}
          onClick={onLock}
        >
          {locked ? <LockKeyhole size={14} /> : <Unlock size={14} />}
        </button>
      </div>
      {part.controls.map((id) => {
        const control = controlDefinitions[id];
        return (
          <GeometryControl
            key={id}
            label={control.label}
            min={control.min}
            max={control.max}
            value={controlValue(control, vars)}
            disabled={locked}
            onBeginChange={onBeginChange}
            onEndChange={onEndChange}
            onChange={(value) =>
              onPatch({ components: { [control.group]: { [control.property]: value } } })
            }
          />
        );
      })}
      <button
        type="button"
        className="bt-rule-reset"
        disabled={locked || !partHasOverrides(theme, selection)}
        onClick={() => onPatch(resetPartPatch(selection))}
        title="移除此部件的覆盖值，恢复继承。共享这些规则的组件也会更新。"
      >
        <RotateCcw size={13} />
        恢复此部件
      </button>
    </section>
  );
}

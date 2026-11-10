import { useState } from 'react';
import { componentGeometry, createTheme, type ThemeConfig, type ThemeMode } from '@btdesign/tokens';
import { LockKeyhole, Unlock, CornerDownRight } from 'lucide-react';

const labels = {
  form: ['表单', { gap: '字段组间距', sectionGap: '表单分组间距' }],
  choice: ['选择控件', { size: '勾选与单选尺寸', gap: '选项间距' }],
  calendar: ['日期与日历', { cellSize: '日期单元格尺寸', gap: '日期间距' }],
  tree: ['树与组织', { rowHeight: '树节点行高', indent: '层级缩进' }],
  navigation: ['导航与菜单', { itemHeight: '导航项高度', padding: '导航项留白' }],
  list: ['列表与文件', { rowPadding: '列表行留白', gap: '列表行间距' }],
  overlay: ['选择浮层', { radius: '浮层圆角', padding: '浮层内边距' }],
} as const;
type Group = keyof typeof componentGeometry;
export function ComponentRules({
  theme,
  mode,
  locked,
  onLock,
  onPatch,
}: {
  theme: ThemeConfig;
  mode: ThemeMode;
  locked: boolean;
  onLock: () => void;
  onPatch: (patch: unknown) => void;
}) {
  const [group, setGroup] = useState<Group>('form');
  const vars = createTheme(theme, mode);
  const fieldLabels = labels[group][1] as Record<string, string>;
  return (
    <div className="bt-inspector-section bt-enterprise-rules">
      <div className="bt-section-label">
        <span>更多组件规则</span>
        <button aria-label={locked ? '解锁全部组件规则' : '锁定全部组件规则'} onClick={onLock}>
          {locked ? <LockKeyhole size={12} /> : <Unlock size={12} />}
        </button>
      </div>
      <label className="bt-field">
        <span>组件规则分类</span>
        <select
          aria-label="组件规则分类"
          value={group}
          onChange={(e) => setGroup(e.target.value as Group)}
        >
          {Object.entries(labels).map(([key, [label]]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {Object.entries(componentGeometry[group]).map(([key, rule]) => (
        <label className="bt-field" key={key}>
          <span>
            {fieldLabels[key]} · {vars[rule.token]}
          </span>
          <input
            type="range"
            aria-label={fieldLabels[key]}
            min={rule.min}
            max={rule.max}
            value={parseInt(vars[rule.token])}
            disabled={locked}
            onChange={(e) =>
              onPatch({ components: { [group]: { [key]: Number(e.target.value) } } })
            }
          />
        </label>
      ))}
      <button
        className="bt-inherit"
        disabled={locked || !theme.components?.[group]}
        onClick={() => onPatch({ components: { [group]: null } })}
      >
        <CornerDownRight size={11} />
        恢复该类组件的继承规则
      </button>
      <small className="bt-impact">
        在组件画布中查看变化。相同规则用于 React、Vue 与导出项目。
      </small>
    </div>
  );
}

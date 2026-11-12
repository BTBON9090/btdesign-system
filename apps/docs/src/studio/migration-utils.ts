import { componentGeometry, normalizeTheme, type ThemeConfig } from '@btdesign/tokens';
import { componentRegistry } from '@btdesign/core';

export interface ThemeMapping {
  source: string;
  target: string;
  before: string;
  after: string;
}
export interface ThemeImport {
  format: 'Ant Design JSON' | 'BTDESIGN JSON' | 'CSS 变量';
  patch: Partial<ThemeConfig>;
  mappings: ThemeMapping[];
  warnings: string[];
}
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);
const show = (value: unknown): string => JSON.stringify(value) ?? String(value);
const hex = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return;
  if (/^#[\da-f]{6}$/i.test(value)) return value.toUpperCase();
  if (/^#[\da-f]{3}$/i.test(value))
    return (
      '#' +
      [...value.slice(1)]
        .map((digit) => digit.repeat(2))
        .join('')
        .toUpperCase()
    );
};

/** Parse data only. Return a patch so missing fields never reset the current theme. */
export function parseThemeImport(text: string): ThemeImport {
  if (text.length > 64 * 1024) throw new Error('风格配置超过 64 KiB，请只保留主题相关字段。');
  const input = text.trim();
  if (!input) throw new Error('请先粘贴 JSON 配置或 CSS 变量。');
  const patch: Record<string, unknown> = {};
  const mappings: ThemeMapping[] = [];
  const warnings: string[] = [];
  const put = (source: string, target: string, before: unknown, after: unknown) => {
    const keys = target.split('.');
    let current = patch;
    for (const key of keys.slice(0, -1)) {
      if (!object(current[key])) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }
    current[keys.at(-1)!] = after;
    mappings.push({ source, target, before: show(before), after: show(after) });
  };
  const color = (source: string, target: string, value: unknown) => {
    const converted = hex(value);
    if (converted) put(source, target, value, converted);
    else warnings.push(`${source} 未导入：仅支持 #RGB 或 #RRGGBB 颜色。`);
  };
  const number = (
    source: string,
    target: string,
    value: unknown,
    min = 0,
    max = 20,
    original: unknown = value,
  ) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      warnings.push(`${source} 未导入：需要有限数值。`);
      return;
    }
    const converted = Math.round(Math.max(min, Math.min(max, value)));
    put(source, target, original, converted);
    if (value !== converted)
      warnings.push(`${source} 已调整为 ${converted}（允许 ${min}–${max} 的整数）。`);
  };
  const unknown = (source: Record<string, unknown>, known: string[], prefix = '') => {
    for (const key of Object.keys(source))
      if (!known.includes(key)) warnings.push(`${prefix}${key} 未识别，未导入。`);
  };
  let format: ThemeImport['format'];
  if (input.startsWith('{')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch {
      throw new Error('JSON 格式不正确。请粘贴纯 JSON，不包含 export、函数或注释。');
    }
    if (!object(parsed)) throw new Error('配置应为 JSON 对象。');
    if (own(parsed, 'schemaVersion') && parsed.schemaVersion !== 1)
      throw new Error('暂不支持此配置版本，请使用 schemaVersion 1。');
    let data = parsed;
    let prefix = '';
    if (object(parsed.theme)) {
      data = parsed.theme;
      prefix = 'theme.';
      unknown(parsed, ['theme', 'schemaVersion', 'policy']);
      if (own(parsed, 'policy')) warnings.push('导入仅包含风格；当前项目的品牌锁定规则继续生效。');
    }
    if (object(data.token)) {
      unknown(data, ['token']);
      data = data.token;
      prefix += 'token.';
    }
    const antSemantic = {
      colorBgBase: 'background',
      colorBgContainer: 'surface',
      colorText: 'text',
      colorTextSecondary: 'muted',
      colorBorder: 'border',
    } as const;
    const antKeys = [
      'colorPrimary',
      'borderRadius',
      'fontFamily',
      'controlHeight',
      ...Object.keys(antSemantic),
    ];
    const ant = antKeys.some((key) => own(data, key));
    if (ant) {
      format = 'Ant Design JSON';
      unknown(data, antKeys, prefix);
      if (own(data, 'colorPrimary')) color(`${prefix}colorPrimary`, 'primary', data.colorPrimary);
      if (own(data, 'borderRadius')) number(`${prefix}borderRadius`, 'radius', data.borderRadius);
      for (const [key, target] of Object.entries(antSemantic))
        if (own(data, key)) color(`${prefix}${key}`, `semantic.light.${target}`, data[key]);
      if (own(patch, 'semantic'))
        warnings.push(
          'Ant Design 语义颜色仅映射到浅色模式；不会推断或覆盖深色配置。深色请使用 BTDESIGN JSON 中的 semantic.dark 配置。',
        );
      if (own(data, 'controlHeight')) {
        for (const component of ['button', 'input'])
          number(
            `${prefix}controlHeight`,
            `components.${component}.height`,
            data.controlHeight,
            28,
            56,
          );
        if (own(patch, 'components'))
          warnings.push(
            'controlHeight 仅映射到按钮与输入框的基准高度；其他控件和已有局部圆角保持当前设置。',
          );
      }
      if (own(data, 'fontFamily')) {
        const first =
          typeof data.fontFamily === 'string'
            ? data.fontFamily
                .split(',')[0]
                .trim()
                .replace(/^['"]|['"]$/g, '')
                .toLowerCase()
            : '';
        const mapped =
          first === 'inter'
            ? 'inter'
            : ['monospace', 'ui-monospace'].includes(first)
              ? 'mono'
              : ['system-ui', '-apple-system', 'blinkmacsystemfont', 'sans-serif'].includes(first)
                ? 'system'
                : undefined;
        if (mapped) {
          put(`${prefix}fontFamily`, 'font', data.fontFamily, mapped);
          warnings.push('fontFamily 已映射为 BTDESIGN 字体预设，未导入原字体文件或完整回退列表。');
        } else
          warnings.push(
            'fontFamily 未导入：当前支持 system、Inter 和等宽字体预设；自定义字体需开发者接入。',
          );
      }
    } else {
      format = 'BTDESIGN JSON';
      unknown(data, [
        'name',
        'primary',
        'radius',
        'density',
        'font',
        'semantic',
        'components',
        'schemaVersion',
      ]);
      if (own(data, 'name')) {
        if (typeof data.name === 'string' && data.name.trim()) {
          const name = data.name.trim().slice(0, 80);
          put(`${prefix}name`, 'name', data.name, name);
          if (name !== data.name) warnings.push('name 已移除首尾空格，并限制为 80 个字符。');
        } else warnings.push('name 未导入：需要非空文本。');
      }
      if (own(data, 'primary')) color(`${prefix}primary`, 'primary', data.primary);
      if (own(data, 'radius')) number(`${prefix}radius`, 'radius', data.radius);
      for (const key of ['density', 'font'] as const) {
        if (!own(data, key)) continue;
        const valid: string[] =
          key === 'density' ? ['comfortable', 'compact'] : ['system', 'inter', 'mono'];
        if (typeof data[key] === 'string' && valid.includes(data[key]))
          put(`${prefix}${key}`, key, data[key], data[key]);
        else warnings.push(`${prefix}${key} 未导入：支持 ${valid.join(' / ')}。`);
      }
      if (own(data, 'semantic')) {
        if (!object(data.semantic)) warnings.push('semantic 未导入：需要 light / dark 对象。');
        else {
          unknown(data.semantic, ['light', 'dark'], `${prefix}semantic.`);
          for (const mode of ['light', 'dark']) {
            const values = data.semantic[mode];
            if (values === undefined) continue;
            if (!object(values)) {
              warnings.push(`semantic.${mode} 未导入：需要颜色对象。`);
              continue;
            }
            const keys = ['background', 'surface', 'text', 'muted', 'border'];
            unknown(values, keys, `${prefix}semantic.${mode}.`);
            for (const key of keys)
              if (own(values, key))
                color(`${prefix}semantic.${mode}.${key}`, `semantic.${mode}.${key}`, values[key]);
          }
        }
      }
      if (own(data, 'components')) {
        if (!object(data.components)) warnings.push('components 未导入：需要组件覆盖对象。');
        else {
          const componentFields: Record<string, Record<string, [number, number]>> = {
            ...Object.fromEntries(
              Object.entries(componentGeometry).map(([section, fields]) => [
                section,
                Object.fromEntries(
                  Object.entries(fields).map(([key, rule]) => [
                    key,
                    [rule.min, rule.max] as [number, number],
                  ]),
                ),
              ]),
            ),
            button: { radius: [0, 20], height: [28, 56] },
            input: { radius: [0, 20], height: [28, 56] },
            card: { radius: [0, 20], padding: [8, 40] },
            field: { gap: [4, 20], labelSize: [11, 16], labelWidth: [64, 240] },
            table: { cellPadding: [6, 24], rowHeight: [28, 72] },
          };
          unknown(data.components, Object.keys(componentFields), `${prefix}components.`);
          for (const [component, fields] of Object.entries(componentFields)) {
            const values = data.components[component];
            if (values === undefined) continue;
            if (!object(values)) {
              warnings.push(`components.${component} 未导入：需要对象。`);
              continue;
            }
            unknown(values, Object.keys(fields), `${prefix}components.${component}.`);
            for (const [key, [min, max]] of Object.entries(fields)) {
              if (own(values, key))
                number(
                  `${prefix}components.${component}.${key}`,
                  `components.${component}.${key}`,
                  values[key],
                  min,
                  max,
                );
            }
          }
        }
      }
    }
  } else {
    format = 'CSS 变量';
    let css = input.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (css.includes('{')) {
      const root = /^:root\s*\{([^{}]*)\}\s*$/.exec(css);
      if (!root)
        throw new Error(
          'CSS 请仅提供变量声明，或单个 :root { … } 区块。暂不导入选择器与媒体查询。',
        );
      css = root[1];
    }
    const targets: Record<string, string> = {
      '--primary': 'primary',
      '--f-primary': 'primary',
      '--radius': 'radius',
      '--f-radius': 'radius',
      '--background': 'semantic.light.background',
      '--f-bg': 'semantic.light.background',
      '--foreground': 'semantic.light.text',
      '--f-text': 'semantic.light.text',
      '--card': 'semantic.light.surface',
      '--f-surface': 'semantic.light.surface',
      '--muted-foreground': 'semantic.light.muted',
      '--f-muted': 'semantic.light.muted',
      '--border': 'semantic.light.border',
      '--f-border': 'semantic.light.border',
    };
    const dimensions: Record<string, [string, number, number]> = {
      ...Object.fromEntries(
        Object.entries(componentGeometry).flatMap(([section, fields]) =>
          Object.entries(fields).map(([key, rule]) => [
            rule.token,
            [`components.${section}.${key}`, rule.min, rule.max] as [string, number, number],
          ]),
        ),
      ),
      '--f-button-radius': ['components.button.radius', 0, 20],
      '--f-button-height': ['components.button.height', 28, 56],
      '--f-input-radius': ['components.input.radius', 0, 20],
      '--f-input-height': ['components.input.height', 28, 56],
      '--f-card-radius': ['components.card.radius', 0, 20],
      '--f-card-padding': ['components.card.padding', 8, 40],
      '--f-field-gap': ['components.field.gap', 4, 20],
      '--f-field-label-size': ['components.field.labelSize', 11, 16],
      '--f-field-label-width': ['components.field.labelWidth', 64, 240],
      '--f-table-cell-padding': ['components.table.cellPadding', 6, 24],
      '--f-table-row-height': ['components.table.rowHeight', 28, 72],
    };
    const seen = new Set<string>();
    for (const declaration of css.split(';')) {
      if (!declaration.trim()) continue;
      const match = /^\s*(--[a-zA-Z0-9_-]+)\s*:\s*([^{};]+?)\s*$/.exec(declaration);
      if (!match)
        throw new Error('发现非变量声明。仅接收 CSS 自定义属性，不执行 JavaScript 或样式代码。');
      const [, key, value] = match;
      const target = targets[key] ?? dimensions[key]?.[0];
      if (!target) {
        warnings.push(`${key} 未识别，未导入。`);
        continue;
      }
      if (seen.has(target)) throw new Error(`${key} 重复定义了 ${target}，请保留一个明确的值。`);
      seen.add(target);
      if (key === '--f-steps-standard-marker' && value === 'initial') {
        warnings.push(
          '步骤标记继承按钮高度；CSS 部分导入不会清除现有覆盖，请在步骤规则中选择恢复。',
        );
        continue;
      }
      if (target === 'radius' || dimensions[key]) {
        const radius = /^(-?\d+(?:\.\d+)?)px$/.exec(value);
        if (radius || value === '0')
          number(
            key,
            target,
            radius ? Number(radius[1]) : 0,
            dimensions[key]?.[1] ?? 0,
            dimensions[key]?.[2] ?? 20,
            value,
          );
        else warnings.push(`${key} 未导入：尺寸需使用 px，例如 8px。`);
      } else color(key, target, value);
    }
    if (own(patch, 'semantic'))
      warnings.push(
        'CSS 颜色映射到浅色模式；深色模式请使用 BTDESIGN JSON 中的 semantic.dark 配置。',
      );
  }
  if (!mappings.length) throw new Error(`没有可导入的风格字段。${warnings.slice(0, 3).join(' ')}`);
  const normalized = normalizeTheme(patch);
  const safePatch: Partial<ThemeConfig> = {};
  for (const key of [
    'name',
    'primary',
    'radius',
    'density',
    'font',
    'semantic',
    'components',
  ] as const)
    if (own(patch, key)) Object.assign(safePatch, { [key]: normalized[key] });
  return { format, patch: safePatch, mappings, warnings: [...new Set(warnings)] };
}

export const auditStatuses = [
  'candidate',
  'partial',
  'unsupported',
  'unresolved',
  'infrastructure',
] as const;
export type AuditStatus = (typeof auditStatuses)[number];
export interface AuditFinding {
  file: string;
  line: number;
  library: string;
  source: string;
  imported: string;
  local: string | null;
  kind: string;
  target: string | null;
  status: AuditStatus;
  confidence: 'high' | 'medium' | 'low';
  issues: string[];
  automaticReplacement: false;
}
export interface MigrationAudit {
  schemaVersion: 1;
  generatedAt: string;
  sourceRoot: string;
  framework: 'react' | 'vue';
  mode: 'read-only-audit';
  summary: { scannedFiles: number; skippedFiles: number; importFindings: number } & Record<
    AuditStatus,
    number
  >;
  limitations: string[];
  dependencies: { file: string; library: string; version: string; group: string }[];
  findings: AuditFinding[];
  warnings: string[];
}
const isText = (value: unknown, max = 4096): value is string =>
  typeof value === 'string' && value.length <= max;
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const textList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= 20000 && value.every((item) => isText(item));

/** Accept the real CLI report contract, never executable source or a migration-success claim. */
export function parseMigrationAudit(text: string): MigrationAudit {
  if (text.length > 2 * 1024 * 1024) throw new Error('报告超过 2 MiB，请按业务子目录分别审计。');
  let report: unknown;
  try {
    report = JSON.parse(text);
  } catch {
    throw new Error('报告不是有效 JSON。请选择命令生成的 migration-report.json。');
  }
  const fail = (): never => {
    throw new Error('报告格式不匹配。请使用当前 BTDESIGN 的 migrate:audit 命令重新生成。');
  };
  if (
    !object(report) ||
    report.schemaVersion !== 1 ||
    report.mode !== 'read-only-audit' ||
    !isText(report.framework) ||
    !['react', 'vue'].includes(report.framework) ||
    !isText(report.sourceRoot) ||
    !report.sourceRoot ||
    !isText(report.generatedAt) ||
    !Number.isFinite(Date.parse(report.generatedAt))
  )
    return fail();
  if (
    !object(report.summary) ||
    !['scannedFiles', 'skippedFiles', 'importFindings', ...auditStatuses].every((key) =>
      isCount((report.summary as Record<string, unknown>)[key]),
    )
  )
    return fail();
  if (
    !Array.isArray(report.findings) ||
    report.findings.length > 20000 ||
    !textList(report.warnings) ||
    !textList(report.limitations) ||
    !Array.isArray(report.dependencies)
  )
    return fail();
  const kinds = [
    'import',
    'style',
    'side-effect',
    'namespace',
    're-export',
    'require',
    'dynamic-import',
  ];
  const targets: string[] = [
    ...componentRegistry.components.map((component) => component.name),
    ...Object.values(componentRegistry.composition).flat(),
  ];
  for (const row of report.findings) {
    if (
      !object(row) ||
      !['file', 'library', 'source', 'imported'].every(
        (key) => isText(row[key]) && row[key].length > 0,
      ) ||
      !isCount(row.line) ||
      row.line < 1 ||
      !(row.local === null || isText(row.local)) ||
      !isText(row.kind) ||
      !kinds.includes(row.kind) ||
      !auditStatuses.includes(row.status as AuditStatus) ||
      !isText(row.confidence) ||
      !['high', 'medium', 'low'].includes(row.confidence) ||
      !textList(row.issues) ||
      row.automaticReplacement !== false
    )
      return fail();
    const mapped = row.status === 'candidate' || row.status === 'partial';
    if (mapped ? !isText(row.target) || !targets.includes(row.target) : row.target !== null)
      return fail();
  }
  if (
    report.summary.importFindings !== report.findings.length ||
    auditStatuses.some(
      (status) =>
        (report.summary as Record<string, unknown>)[status] !==
        (report.findings as AuditFinding[]).filter((row) => row.status === status).length,
    )
  )
    return fail();
  for (const dependency of report.dependencies)
    if (
      !object(dependency) ||
      !['file', 'library', 'version'].every((key) => isText(dependency[key])) ||
      !isText(dependency.group) ||
      !['dependencies', 'devDependencies', 'peerDependencies'].includes(dependency.group)
    )
      return fail();
  return report as unknown as MigrationAudit;
}

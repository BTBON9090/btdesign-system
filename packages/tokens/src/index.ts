/** The same serializable configuration powers both framework libraries. */
export interface ThemeConfig {
  name: string;
  primary: string;
  radius: number;
  density: 'comfortable' | 'compact';
  font: 'system' | 'inter' | 'mono';
  semantic?: Partial<Record<ThemeMode, SemanticOverrides>>;
  components?: ComponentOverrides;
}
export type ThemeMode = 'light' | 'dark';
export interface SemanticOverrides {
  background?: string;
  surface?: string;
  text?: string;
  muted?: string;
  border?: string;
}
export interface ComponentOverrides {
  button?: { radius?: number; height?: number };
  input?: { radius?: number; height?: number };
  card?: { radius?: number; padding?: number };
  field?: { gap?: number; labelSize?: number };
  table?: { cellPadding?: number; rowHeight?: number };
}
export type ThemeLock = 'primary' | 'radius' | 'density' | 'font' | 'semantic' | 'components';
export interface ThemePolicy {
  locked: ThemeLock[];
}

export const defaultTheme: ThemeConfig = {
  name: 'BTDESIGN',
  primary: '#D43845',
  radius: 8,
  density: 'comfortable',
  font: 'system',
};

export const presets: ThemeConfig[] = [
  { ...defaultTheme },
  { name: 'Ocean', primary: '#2563EB', radius: 6, density: 'comfortable', font: 'system' },
  { name: 'Forest', primary: '#16815D', radius: 10, density: 'comfortable', font: 'system' },
  { name: 'Ember', primary: '#C2410C', radius: 4, density: 'compact', font: 'system' },
  { name: 'Graphite', primary: '#262626', radius: 4, density: 'compact', font: 'mono' },
];

const HEX = /^#[\da-f]{6}$/i;
const record = (input: unknown): Record<string, unknown> =>
  input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {};
const bounded = (value: unknown, min: number, max: number): number | undefined =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.round(Math.max(min, Math.min(max, value)))
    : undefined;
function semanticOverrides(input: unknown): ThemeConfig['semantic'] {
  const source = record(input);
  const output: NonNullable<ThemeConfig['semantic']> = {};
  for (const mode of ['light', 'dark'] as const) {
    const candidate = record(source[mode]);
    const values: SemanticOverrides = {};
    for (const key of ['background', 'surface', 'text', 'muted', 'border'] as const) {
      if (typeof candidate[key] === 'string' && HEX.test(candidate[key]))
        values[key] = candidate[key].toUpperCase();
    }
    if (Object.keys(values).length) output[mode] = values;
  }
  return Object.keys(output).length ? output : undefined;
}
function componentOverrides(input: unknown): ComponentOverrides | undefined {
  const source = record(input);
  const output: ComponentOverrides = {};
  for (const key of ['button', 'input', 'card'] as const) {
    const candidate = record(source[key]);
    const radius = bounded(candidate.radius, 0, 20);
    const sizeKey = key === 'card' ? 'padding' : 'height';
    const size = bounded(candidate[sizeKey], key === 'card' ? 8 : 28, key === 'card' ? 40 : 56);
    const values = {
      ...(radius !== undefined ? { radius } : {}),
      ...(size !== undefined ? { [sizeKey]: size } : {}),
    };
    if (Object.keys(values).length) output[key] = values;
  }
  for (const [section, fields] of [
    ['field', { gap: [4, 20], labelSize: [11, 16] }],
    ['table', { cellPadding: [6, 24], rowHeight: [28, 72] }],
  ] as const) {
    const candidate = record(source[section]);
    const values: Record<string, number> = {};
    for (const [key, [min, max]] of Object.entries(fields)) {
      const value = bounded(candidate[key], min, max);
      if (value !== undefined) values[key] = value;
    }
    if (Object.keys(values).length) output[section] = values;
  }
  return Object.keys(output).length ? output : undefined;
}
/** Invalid external values fall back safely; numeric values are bounded. */
export function normalizeTheme(input: unknown): ThemeConfig {
  const data = record(input);
  const semantic = semanticOverrides(data.semantic);
  const components = componentOverrides(data.components);
  return {
    name:
      typeof data.name === 'string' && data.name.trim()
        ? data.name.trim().slice(0, 80)
        : defaultTheme.name,
    primary:
      typeof data.primary === 'string' && HEX.test(data.primary)
        ? data.primary.toUpperCase()
        : defaultTheme.primary,
    radius:
      typeof data.radius === 'number' && Number.isFinite(data.radius)
        ? Math.round(Math.min(20, Math.max(0, data.radius)))
        : defaultTheme.radius,
    density: data.density === 'compact' ? 'compact' : 'comfortable',
    font: data.font === 'inter' || data.font === 'mono' ? data.font : 'system',
    ...(semantic ? { semantic } : {}),
    ...(components ? { components } : {}),
  };
}

/** Apply a user/AI patch while preserving locked brand decisions. Nested overrides merge. */
export function applyThemePatch(
  base: ThemeConfig,
  patch: unknown,
  policy: ThemePolicy = { locked: [] },
): ThemeConfig {
  const cleanBase = normalizeTheme(base);
  const source = record(patch);
  const locked = new Set(policy.locked);
  const result: Record<string, unknown> = { ...cleanBase };
  for (const key of ['name', 'primary', 'radius', 'density', 'font'] as const) {
    if (Object.prototype.hasOwnProperty.call(source, key) && (key === 'name' || !locked.has(key)))
      result[key] = source[key];
  }
  for (const key of ['semantic', 'components'] as const) {
    if (!Object.prototype.hasOwnProperty.call(source, key) || locked.has(key)) continue;
    if (source[key] === null) {
      delete result[key];
      continue;
    }
    const previous = record(cleanBase[key]);
    const incoming = record(source[key]);
    const sections =
      key === 'semantic' ? ['light', 'dark'] : ['button', 'input', 'card', 'field', 'table'];
    const merged: Record<string, unknown> = { ...previous };
    for (const section of sections) {
      if (!Object.prototype.hasOwnProperty.call(incoming, section)) continue;
      if (incoming[section] === null) {
        delete merged[section];
        continue;
      }
      merged[section] = { ...record(previous[section]), ...record(incoming[section]) };
    }
    result[key] = merged;
  }
  return normalizeTheme(result);
}

function rgb(hex: string): number[] {
  if (!HEX.test(hex)) throw new TypeError('Expected a six-digit hex color, for example #6D5EF3.');
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}
function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** WCAG relative-luminance contrast for opaque sRGB hex colors. */
export function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a),
    l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function mix(a: string, b: string, weight: number): string {
  const first = rgb(a),
    second = rgb(b);
  return (
    '#' +
    first
      .map((value, index) =>
        Math.round(value * (1 - weight) + second[index] * weight)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function createTheme(input: ThemeConfig, mode: ThemeMode = 'light'): Record<string, string> {
  const config = normalizeTheme(input);
  const dark = mode === 'dark';
  const semantic = config.semantic?.[mode];
  const bg = semantic?.background ?? (dark ? '#111216' : '#FFFFFF');
  const onPrimary =
    contrastRatio(config.primary, '#FFFFFF') >= contrastRatio(config.primary, '#000000')
      ? '#FFFFFF'
      : '#000000';
  const fonts = {
    system:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    inter:
      '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", "PingFang SC", monospace',
  };
  return {
    '--f-primary': config.primary,
    '--f-primary-hover': mix(config.primary, onPrimary === '#FFFFFF' ? '#000000' : '#FFFFFF', 0.12),
    '--f-primary-soft': mix(config.primary, bg, dark ? 0.79 : 0.92),
    '--f-on-primary': onPrimary,
    '--f-bg': bg,
    '--f-surface': semantic?.surface ?? (dark ? '#191B21' : '#FFFFFF'),
    '--f-subtle': dark ? '#23252D' : '#F5F5F8',
    '--f-text': semantic?.text ?? (dark ? '#F2F3F7' : '#202127'),
    '--f-muted': semantic?.muted ?? (dark ? '#A5A9B5' : '#656975'),
    '--f-border': semantic?.border ?? (dark ? '#363944' : '#E3E4EA'),
    '--f-success': dark ? '#75D5A6' : '#137548',
    '--f-success-soft': dark ? '#18392B' : '#EAF8F0',
    '--f-warning': dark ? '#F1C171' : '#8D5908',
    '--f-warning-soft': dark ? '#3B2E19' : '#FFF5DF',
    '--f-danger': dark ? '#FF9D9D' : '#C02F3B',
    '--f-danger-soft': dark ? '#3E232B' : '#FFF0F1',
    '--f-info': dark ? '#A4BEFF' : '#3557AE',
    '--f-info-soft': dark ? '#202F4D' : '#EDF2FF',
    '--f-radius': `${config.radius}px`,
    '--f-radius-sm': `${Math.max(2, config.radius - 3)}px`,
    '--f-control-height': config.density === 'compact' ? '32px' : '38px',
    '--f-space': config.density === 'compact' ? '12px' : '16px',
    '--f-button-radius': `${config.components?.button?.radius ?? config.radius}px`,
    '--f-button-height': `${config.components?.button?.height ?? (config.density === 'compact' ? 32 : 38)}px`,
    '--f-input-radius': `${config.components?.input?.radius ?? config.radius}px`,
    '--f-input-height': `${config.components?.input?.height ?? (config.density === 'compact' ? 32 : 38)}px`,
    '--f-card-radius': `${config.components?.card?.radius ?? config.radius + 3}px`,
    '--f-card-padding': `${config.components?.card?.padding ?? (config.density === 'compact' ? 15 : 20)}px`,
    '--f-field-gap': `${config.components?.field?.gap ?? (config.density === 'compact' ? 6 : 8)}px`,
    '--f-field-label-size': `${config.components?.field?.labelSize ?? 13}px`,
    '--f-table-cell-padding': `${config.components?.table?.cellPadding ?? (config.density === 'compact' ? 8 : 12)}px`,
    '--f-table-row-height': `${config.components?.table?.rowHeight ?? (config.density === 'compact' ? 36 : 44)}px`,
    '--f-font': fonts[config.font],
    '--f-shadow': dark ? '0 4px 18px #00000030' : '0 4px 18px #20212708',
    '--f-focus':
      contrastRatio(config.primary, bg) >= 3
        ? config.primary
        : contrastRatio('#FFFFFF', bg) >= contrastRatio('#000000', bg)
          ? '#FFFFFF'
          : '#000000',
  };
}

export function themeToCSS(input: ThemeConfig): string {
  const config = normalizeTheme(input);
  const declarations = (mode: ThemeMode) =>
    Object.entries(createTheme(config, mode))
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
  return `/* Generated by BTDESIGN. Import after @btdesign/tokens/styles.css. */\n:root, [data-theme="light"] {\n  color-scheme: light;\n${declarations('light')}\n}\n\n[data-theme="dark"] {\n  color-scheme: dark;\n${declarations('dark')}\n}\n`;
}

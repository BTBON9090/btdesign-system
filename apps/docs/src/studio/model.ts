import { createProject, normalizeProject as normalizeSpec, type ProjectSpec } from '@btdesign/core';

function normalizeProject(value: unknown): ProjectSpec {
  const project = normalizeSpec(value);
  if (['Forma', 'Forma UI'].includes(project.theme.name)) project.theme.name = 'BTDESIGN';
  return project;
}

export type Revision = { id: string; label: string; project: ProjectSpec; createdAt: string };
export type StudioStore = { project: ProjectSpec; revisions: Revision[] };
export type Timeline = { past: ProjectSpec[]; present: ProjectSpec; future: ProjectSpec[] };
export const STORE_KEY = 'btdesign.studio.v1';
const REVISION_LIMIT = 20;
const HISTORY_LIMIT = 50;
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

function readStored(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    // Storage may be unavailable, or an interrupted/manual edit may leave invalid JSON.
    return null;
  }
}

function loadRevisions(value: unknown): Revision[] {
  if (!Array.isArray(value)) return [];
  const revisions: Revision[] = [];
  const ids = new Set<string>();
  for (const item of value) {
    const revision = record(item);
    if (
      typeof revision.id !== 'string' ||
      !/^[A-Za-z0-9_-]{1,80}$/.test(revision.id) ||
      ids.has(revision.id) ||
      typeof revision.label !== 'string' ||
      !revision.label.trim() ||
      typeof revision.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(revision.createdAt))
    )
      continue;
    try {
      const project = normalizeProject(revision.project);
      revisions.push({
        id: revision.id,
        label:
          revision.label
            .replace(/[\u0000-\u001f\u007f]/g, '')
            .trim()
            .slice(0, 80) || '未命名版本',
        project,
        createdAt: new Date(revision.createdAt).toISOString(),
      });
      ids.add(revision.id);
      if (revisions.length === REVISION_LIMIT) break;
    } catch {
      // One invalid snapshot must not hide the other usable versions.
    }
  }
  return revisions;
}

export function loadStudio(): StudioStore {
  const data = record(readStored(STORE_KEY));
  const revisions = loadRevisions(data.revisions);
  try {
    return { project: normalizeProject(data.project), revisions };
  } catch {
    // Preserve recoverable work if only the active snapshot was damaged.
    if (revisions.length) return { project: normalizeProject(revisions[0].project), revisions };
  }
  const legacy = record(readStored('forma-lab-v1'));
  const initial = createProject({ name: '我的第一套设计系统', scene: 'workspace' });
  return {
    project: normalizeProject({
      ...initial,
      ...(legacy.theme ? { theme: legacy.theme } : {}),
      ...(legacy.policy ? { policy: legacy.policy } : {}),
    }),
    revisions,
  };
}

function comparable(project: ProjectSpec) {
  const { updatedAt: _updatedAt, ...rest } = normalizeProject(project);
  // Lock order has no effect on the resulting policy.
  return JSON.stringify({ ...rest, policy: { locked: [...rest.policy.locked].sort() } });
}

export function recordChange(state: Timeline, next: ProjectSpec): Timeline {
  const normalized = normalizeProject(next);
  if (comparable(state.present) === comparable(normalized)) return state;
  return {
    past: [...state.past, normalizeProject(state.present)].slice(-HISTORY_LIMIT),
    present: normalized,
    future: [],
  };
}

export function undoChange(state: Timeline): Timeline {
  if (!state.past.length) return state;
  return {
    past: state.past.slice(0, -1),
    present: normalizeProject(state.past[state.past.length - 1]),
    future: [normalizeProject(state.present), ...state.future].slice(0, HISTORY_LIMIT),
  };
}

export function redoChange(state: Timeline): Timeline {
  if (!state.future.length) return state;
  return {
    past: [...state.past, normalizeProject(state.present)].slice(-HISTORY_LIMIT),
    present: normalizeProject(state.future[0]),
    future: state.future.slice(1),
  };
}

export function projectDifferences(
  beforeProject: ProjectSpec,
  afterProject: ProjectSpec,
): { label: string; before: string; after: string }[] {
  const a = normalizeProject(beforeProject),
    b = normalizeProject(afterProject);
  const fields: [string, unknown, unknown][] = [
    ['项目名称', a.name, b.name],
    ['创作简报', a.brief, b.brief],
    ['技术框架', a.framework, b.framework],
    ['场景', a.scene, b.scene],
    ['主标题', a.content.title, b.content.title],
    ['说明', a.content.description, b.content.description],
    ['主操作', a.content.actionLabel, b.content.actionLabel],
    ['主题名称', a.theme.name, b.theme.name],
    ['品牌色', a.theme.primary, b.theme.primary],
    ['全局圆角', a.theme.radius, b.theme.radius],
    ['信息密度', a.theme.density, b.theme.density],
    ['字体', a.theme.font, b.theme.font],
    ['语义颜色', a.theme.semantic ?? {}, b.theme.semantic ?? {}],
    ['组件配置', a.theme.components ?? {}, b.theme.components ?? {}],
    ['品牌锁定', [...a.policy.locked].sort(), [...b.policy.locked].sort()],
  ];
  return fields
    .filter(([, x, y]) => JSON.stringify(x) !== JSON.stringify(y))
    .map(([label, before, after]) => ({
      label,
      before: typeof before === 'object' ? JSON.stringify(before) : String(before),
      after: typeof after === 'object' ? JSON.stringify(after) : String(after),
    }));
}

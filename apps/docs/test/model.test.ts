import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { createProject, updateProject } from '@btdesign/core';
import {
  loadStudio,
  projectDifferences,
  patchHistory,
  resetProjectStyle,
  recordChange,
  redoChange,
  STORE_KEY,
  undoChange,
  type Timeline,
} from '../src/studio/model.ts';

function storage(t: TestContext, entries: Record<string, string> = {}, blocked = false) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => {
        if (blocked) throw new Error('Storage disabled');
        return entries[key] ?? null;
      },
    },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
}
const snapshot = (index: number) => ({
  id: `revision-${index}`,
  label: `版本 ${index}`,
  createdAt: '2026-11-10T10:00:00+08:00',
  project: createProject({
    name: `系统 ${index}`,
    theme: { name: 'Ocean', primary: '#2563EB', radius: 6, density: 'compact', font: 'inter' },
  }),
});

test('persisted studio normalizes the project and validates every revision metadata field', (t) => {
  const valid = snapshot(1);
  const unsafe = [
    null,
    { ...snapshot(2), label: { invalid: 'cannot render as React child' } },
    { ...snapshot(3), id: { invalid: true } },
    { ...snapshot(4), createdAt: 'not a date' },
    { ...snapshot(5), project: { schemaVersion: 2 } },
    { ...snapshot(6), label: ' ' },
  ];
  const project = {
    ...createProject(),
    name: ' Current ',
    theme: { primary: 'url(javascript:1)', radius: 100 },
  };
  storage(t, {
    [STORE_KEY]: JSON.stringify({
      project,
      revisions: [
        ...unsafe,
        valid,
        { ...valid, label: 'duplicate' },
        { ...snapshot(7), label: 'x'.repeat(100), extra: 'discard' },
      ],
    }),
  });
  const result = loadStudio();
  assert.equal(result.project.name, 'Current');
  assert.equal(result.project.theme.radius, 20);
  assert.match(result.project.theme.primary, /^#[A-F\d]{6}$/);
  assert.equal(result.revisions.length, 2);
  assert.equal(result.revisions[0].label, '版本 1');
  assert.equal(result.revisions[0].createdAt, '2026-11-10T02:00:00.000Z');
  assert.equal(result.revisions[1].label.length, 80);
  assert.equal('extra' in result.revisions[1], false);
});

test('a corrupted active project recovers the newest usable revision without dropping history', (t) => {
  const revision = snapshot(1);
  storage(t, {
    [STORE_KEY]: JSON.stringify({
      project: { schemaVersion: 999 },
      revisions: [revision, snapshot(2)],
    }),
  });
  const result = loadStudio();
  assert.equal(result.project.id, revision.project.id);
  assert.equal(result.revisions.length, 2);
  result.project.theme.primary = '#FFFFFF';
  assert.equal(result.revisions[0].project.theme.primary, '#2563EB');
});

test('only the first twenty valid unique saved revisions are restored', (t) => {
  const revisions = Array.from({ length: 30 }, (_, index) => snapshot(index));
  storage(t, {
    [STORE_KEY]: JSON.stringify({
      project: createProject(),
      revisions: [null, { id: 'broken' }, ...revisions],
    }),
  });
  const result = loadStudio();
  assert.equal(result.revisions.length, 20);
  assert.equal(result.revisions[0].id, 'revision-0');
  assert.equal(result.revisions.at(-1)?.id, 'revision-19');
});

test('legacy Lab settings retain theme and valid brand locks when Studio has no usable project', (t) => {
  storage(t, {
    [STORE_KEY]: '{broken',
    'forma-lab-v1': JSON.stringify({
      theme: snapshot(1).project.theme,
      policy: { locked: ['primary', 'font', 'not-a-lock', 'font'] },
    }),
  });
  const result = loadStudio();
  assert.equal(result.project.theme.primary, '#2563EB');
  assert.deepEqual(result.project.policy.locked, ['primary', 'font']);
  assert.equal(result.revisions.length, 0);
});

test('blocked browser storage yields a usable new local project', (t) => {
  storage(t, {}, true);
  const result = loadStudio();
  assert.equal(result.project.schemaVersion, 1);
  assert.equal(result.project.scene, 'workspace');
  assert.ok(result.project.id);
  assert.equal(result.revisions.length, 0);
});

test('undo, redo and a new branch preserve snapshots while dropping abandoned future changes', () => {
  const initial = createProject({ name: 'Initial' });
  let timeline: Timeline = { past: [], present: initial, future: [] };
  assert.equal(undoChange(timeline), timeline);
  assert.equal(redoChange(timeline), timeline);
  const next = updateProject(initial, { name: 'Second', theme: { radius: 4 } });
  timeline = recordChange(timeline, next);
  next.theme.radius = 20;
  initial.name = 'caller mutated object';
  assert.equal(timeline.present.theme.radius, 4);
  assert.equal(timeline.past[0].name, 'Initial');
  const changed = recordChange(timeline, updateProject(timeline.present, { name: 'Third' }));
  const undone = undoChange(changed);
  assert.equal(undone.present.name, 'Second');
  assert.equal(undone.future[0].name, 'Third');
  assert.equal(redoChange(undone).present.name, 'Third');
  const branch = recordChange(undone, updateProject(undone.present, { name: 'New branch' }));
  assert.equal(branch.future.length, 0);
  assert.equal(redoChange(branch), branch);
  assert.equal(undoChange(branch).present.name, 'Second');
});

test('timestamp-only and reordered equivalent locks do not pollute undo or destroy redo', () => {
  const project = createProject({ policy: { locked: ['primary', 'font'] } });
  const future = updateProject(project, { name: 'Future' });
  const timeline: Timeline = { past: [], present: project, future: [future] };
  assert.equal(
    recordChange(timeline, { ...project, updatedAt: '2020-01-01T00:00:00.000Z' }),
    timeline,
  );
  assert.equal(
    recordChange(timeline, { ...project, policy: { locked: ['font', 'primary'] } }),
    timeline,
  );
  assert.equal(timeline.future[0], future);
});

test('history remains bounded through a long editing session and complete undo/redo cycle', () => {
  let timeline: Timeline = { past: [], present: createProject({ name: '0' }), future: [] };
  for (let index = 1; index <= 60; index++)
    timeline = recordChange(timeline, updateProject(timeline.present, { name: String(index) }));
  assert.equal(timeline.past.length, 50);
  assert.equal(timeline.past[0].name, '10');
  for (let index = 0; index < 50; index++) timeline = undoChange(timeline);
  assert.equal(timeline.present.name, '10');
  assert.equal(timeline.future.length, 50);
  assert.equal(undoChange(timeline), timeline);
  for (let index = 0; index < 50; index++) timeline = redoChange(timeline);
  assert.equal(timeline.present.name, '60');
  assert.equal(timeline.past.length, 50);
  assert.equal(timeline.future.length, 0);
});

test('comparison includes name, brief, framework, theme, content and nested brand decisions', () => {
  const before = createProject();
  const after = updateProject(before, {
    name: 'Company',
    brief: 'Enterprise collaboration',
    framework: 'vue',
    scene: 'projects',
    theme: {
      name: 'Company palette',
      primary: '#123456',
      semantic: { dark: { text: '#FFFFFF' } },
      components: { button: { height: 48 } },
    },
    policy: { locked: ['primary'] },
  });
  const labels = projectDifferences(before, after).map((item) => item.label);
  for (const label of [
    '项目名称',
    '创作简报',
    '技术框架',
    '场景',
    '主标题',
    '主题名称',
    '品牌色',
    '语义颜色',
    '组件配置',
    '品牌锁定',
  ])
    assert.ok(labels.includes(label), label);
  assert.deepEqual(
    projectDifferences(before, { ...before, updatedAt: '2020-01-01T00:00:00.000Z' }),
    [],
  );
  const locked = createProject({ policy: { locked: ['primary', 'font'] } });
  assert.deepEqual(
    projectDifferences(locked, { ...locked, policy: { locked: ['font', 'primary'] } }),
    [],
  );
});

test('stored undo/redo history survives reload with the reachable fifty valid snapshots', (t) => {
  const projects = Array.from({ length: 65 }, (_, index) => createProject({ name: String(index) }));
  const invalid = [
    null,
    { ...projects[0], id: {} },
    { ...projects[0], updatedAt: 'invalid' },
    { ...projects[0], schemaVersion: 9 },
  ];
  storage(t, {
    [STORE_KEY]: JSON.stringify({
      project: projects[64],
      revisions: [],
      past: [...projects, ...invalid],
      future: [...invalid, ...projects],
    }),
  });
  const loaded = loadStudio();
  assert.equal(loaded.past.length, 50);
  assert.equal(loaded.past[0].name, '15');
  assert.equal(loaded.past.at(-1)?.name, '64');
  assert.equal(loaded.future.length, 50);
  assert.equal(loaded.future[0].name, '0');
  assert.equal(loaded.future.at(-1)?.name, '49');
  const timeline: Timeline = { present: loaded.project, past: loaded.past, future: loaded.future };
  assert.equal(undoChange(timeline).present.name, '64');
  assert.equal(redoChange(timeline).present.name, '0');
});

test('legacy stores load with empty history and a recovered project drops unrelated history', (t) => {
  storage(t, { [STORE_KEY]: JSON.stringify({ project: createProject(), revisions: [] }) });
  assert.deepEqual(loadStudio().past, []);
  assert.deepEqual(loadStudio().future, []);
});

test('corrupt active snapshots recover a saved revision without applying stale history', (t) => {
  const revision = snapshot(1);
  storage(t, {
    [STORE_KEY]: JSON.stringify({
      project: { schemaVersion: 999 },
      revisions: [revision],
      past: [createProject({ name: 'Unrelated past' })],
      future: [createProject({ name: 'Unrelated future' })],
    }),
  });
  const loaded = loadStudio();
  assert.equal(loaded.project.id, revision.project.id);
  assert.deepEqual(loaded.past, []);
  assert.deepEqual(loaded.future, []);
});

test('a continuous gesture is one undo step while keeping successive partial edits', () => {
  const initial = createProject({
    theme: {
      primary: '#123456',
      radius: 8,
      density: 'comfortable',
      font: 'system',
      name: 'Company',
    },
  });
  const baseline: Timeline = { past: [], present: initial, future: [] };
  let state = baseline;
  for (let radius = 9; radius <= 20; radius++) {
    state = patchHistory(state, { theme: { radius } }, baseline);
    assert.equal(state.past.length, 1);
  }
  state = patchHistory(state, { theme: { components: { button: { height: 48 } } } }, baseline);
  assert.equal(state.present.theme.radius, 20);
  assert.equal(state.present.theme.components?.button?.height, 48);
  assert.equal(state.past.length, 1);
  assert.equal(undoChange(state).present.theme.radius, 8);
  assert.equal(undoChange(state).present.theme.components, undefined);

  // A new completed gesture is a separate, reachable operation.
  const secondBase = state;
  state = patchHistory(state, { theme: { radius: 12 } }, secondBase);
  state = patchHistory(state, { theme: { radius: 11 } }, secondBase);
  assert.equal(state.past.length, 2);
  assert.equal(undoChange(state).present.theme.radius, 20);
  assert.equal(undoChange(state).present.theme.components?.button?.height, 48);
});

test('returning a gesture to its starting value creates no empty history and preserves redo', () => {
  const present = createProject({
    theme: {
      name: 'Company',
      primary: '#123456',
      radius: 8,
      density: 'comfortable',
      font: 'system',
    },
  });
  const future = updateProject(present, { theme: { radius: 16 } });
  const baseline: Timeline = { past: [], present, future: [future] };
  const moved = patchHistory(baseline, { theme: { radius: 20 } }, baseline);
  assert.equal(moved.future.length, 0);
  const restored = patchHistory(moved, { theme: { radius: 8 } }, baseline);
  assert.equal(restored, baseline);
  assert.equal(redoChange(restored).present.theme.radius, 16);
  const newBranch = patchHistory(restored, { theme: { radius: 10 } });
  assert.equal(newBranch.future.length, 0);
});

test('one long gesture never evicts more than one historical operation', () => {
  let state: Timeline = { past: [], present: createProject({ name: 'Initial' }), future: [] };
  for (let index = 1; index <= 50; index++) state = patchHistory(state, { name: String(index) });
  const baseline = state;
  for (let index = 0; index < 200; index++) {
    state = patchHistory(state, { theme: { radius: index % 21 } }, baseline);
  }
  assert.equal(state.past.length, 50);
  assert.equal(state.past[0].name, '1');
  assert.equal(undoChange(state).present.name, '50');
});

test('resetting style restores defaults while retaining locked decisions and project content', () => {
  const project = createProject({
    name: 'Enterprise workspace',
    brief: 'Keep this brief',
    framework: 'vue',
    scene: 'projects',
    content: { title: 'Delivery', description: 'Custom content', actionLabel: 'New task' },
    theme: {
      name: 'Enterprise brand',
      primary: '#123456',
      radius: 16,
      density: 'compact',
      font: 'inter',
      semantic: { dark: { text: '#FFFFFF' } },
      components: { button: { height: 48 }, calendar: { cellSize: 44 } },
    },
    policy: { locked: ['primary', 'font', 'semantic'] },
  });
  const restored = resetProjectStyle(project);
  assert.equal(restored.id, project.id);
  assert.equal(restored.name, project.name);
  assert.equal(restored.brief, project.brief);
  assert.equal(restored.framework, 'vue');
  assert.equal(restored.scene, 'projects');
  assert.deepEqual(restored.content, project.content);
  assert.deepEqual(restored.policy, project.policy);
  assert.equal(restored.theme.name, 'Enterprise brand');
  assert.equal(restored.theme.primary, '#123456');
  assert.equal(restored.theme.font, 'inter');
  assert.deepEqual(restored.theme.semantic, project.theme.semantic);
  assert.equal(restored.theme.radius, 8);
  assert.equal(restored.theme.density, 'comfortable');
  assert.equal(restored.theme.components, undefined);
  const changed = recordChange({ past: [], present: project, future: [] }, restored);
  assert.equal(changed.past.length, 1);
  assert.deepEqual(undoChange(changed).present, project);
});

test('reset respects component locks and is a no-op when every changed style is locked', () => {
  const project = createProject({
    theme: {
      name: 'Locked',
      primary: '#123456',
      radius: 16,
      density: 'compact',
      font: 'mono',
      semantic: { light: { background: '#121212' } },
      components: { tree: { indent: 28 }, table: { rowHeight: 56 } },
    },
    policy: { locked: ['primary', 'radius', 'density', 'font', 'semantic', 'components'] },
  });
  const state: Timeline = { past: [], present: project, future: [] };
  assert.deepEqual(resetProjectStyle(project).theme, project.theme);
  assert.equal(recordChange(state, resetProjectStyle(project)), state);
});

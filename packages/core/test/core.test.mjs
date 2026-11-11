import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { createTheme, defaultTheme } from '@btdesign/tokens';
import * as reactComponents from '@btdesign/react';
import * as vueComponents from '@btdesign/vue';
import {
  createProject,
  normalizeProject,
  updateProject,
  getProjectFiles,
  getContextText,
  componentRegistry,
  selectionKnowledge,
  sceneDefaults,
} from '../dist/index.js';

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const scenes = ['workspace', 'projects', 'login'];

test('project parser accepts only supported schema, scenes, and frameworks', () => {
  const project = createProject();
  assert.deepEqual(normalizeProject(project), project);
  for (const patch of [{ schemaVersion: 2 }, { scene: '<script>' }, { framework: 'angular' }]) {
    assert.throws(() => normalizeProject({ ...project, ...patch }), TypeError);
  }
  for (const value of [undefined, null, [], 'project'])
    assert.throws(() => normalizeProject(value), TypeError);
  const normalized = normalizeProject({
    ...project,
    name: 'x'.repeat(100),
    brief: 'x'.repeat(2200),
    content: { title: 'x'.repeat(160), description: 'x'.repeat(350), actionLabel: 'x'.repeat(70) },
    id: '../escape',
    theme: { ...defaultTheme, primary: 'red; color:red' },
    policy: { locked: ['primary', 'primary', 'bogus'] },
    unexpected: 'removed',
  });
  assert.equal(normalized.name.length, 80);
  assert.equal(normalized.brief.length, 2000);
  assert.equal(normalized.content.title.length, 120);
  assert.equal(normalized.content.description.length, 300);
  assert.equal(normalized.content.actionLabel.length, 40);
  assert.match(normalized.id, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(normalized.policy.locked, ['primary']);
  assert.equal(normalized.theme.primary, defaultTheme.primary);
  assert.equal(normalized.unexpected, undefined);
});

test('theme edits honor existing locks, even when the same patch unlocks them', () => {
  const initial = createProject({
    theme: { ...defaultTheme, components: { card: { padding: 24 } } },
    policy: { locked: ['primary', 'components'] },
  });
  const changed = updateProject(initial, {
    id: 'other',
    schemaVersion: 4,
    theme: { primary: '#123456', radius: 13, components: { card: { padding: 10 } } },
    policy: { locked: [] },
  });
  assert.equal(changed.id, initial.id);
  assert.equal(changed.schemaVersion, 1);
  assert.equal(changed.theme.primary, initial.theme.primary);
  assert.deepEqual(changed.theme.components, initial.theme.components);
  assert.equal(changed.theme.radius, 13);
  assert.deepEqual(changed.policy.locked, []);
  const unlocked = updateProject(changed, { theme: { primary: '#123456' } });
  assert.equal(unlocked.theme.primary, '#123456');
  assert.equal(initial.theme.radius, defaultTheme.radius);
});

test('scene changes reset scene content while ordinary edits preserve it', () => {
  const project = createProject({ content: { title: '自定义标题' } });
  assert.equal(updateProject(project, { framework: 'vue' }).content.title, '自定义标题');
  const changed = updateProject(project, { scene: 'login', content: { actionLabel: '继续' } });
  assert.equal(changed.content.title, sceneDefaults.login.title);
  assert.equal(changed.content.actionLabel, '继续');
  assert.throws(() => updateProject(project, { scene: 'invalid' }), TypeError);
});

test('handoff contains portable files, true APIs, semantic tokens and honest boundaries', () => {
  const project = createProject({ policy: { locked: ['primary', 'radius'] } });
  const files = getProjectFiles(project);
  assert.deepEqual(
    Object.keys(files).sort(),
    [
      '.btdesign/components.json',
      '.btdesign/system.json',
      'AGENTS.md',
      'App.tsx',
      'README.md',
      'app.css',
      'theme.css',
      '.gitignore',
      'package.json',
      'index.html',
      'main.tsx',
      'tsconfig.json',
      'vite.config.ts',
      'base.css',
    ].sort(),
  );
  assert.deepEqual(JSON.parse(files['.btdesign/system.json']), project);
  assert.equal(componentRegistry.packages.engine, '@btdesign/engine');
  const publicNames = new Set([
    ...componentRegistry.components.map((entry) => entry.name),
    ...Object.values(componentRegistry.composition).flat(),
  ]);
  assert.deepEqual([...publicNames].sort(), Object.keys(reactComponents).sort());
  assert.deepEqual([...publicNames, 'BTDESIGNPlugin'].sort(), Object.keys(vueComponents).sort());
  const tokens = createTheme(project.theme);
  for (const entry of componentRegistry.components) {
    assert.ok(reactComponents[entry.name], `React export ${entry.name}`);
    assert.ok(vueComponents[entry.name], `Vue export ${entry.name}`);
  }
  for (const parts of Object.values(componentRegistry.composition)) {
    for (const part of parts) {
      assert.ok(reactComponents[part], `React composition export ${part}`);
      assert.ok(vueComponents[part], `Vue composition export ${part}`);
    }
  }
  for (const names of Object.values(componentRegistry.semanticTokens))
    for (const name of names) assert.ok(name in tokens, name);
  for (const entry of Object.values(selectionKnowledge)) {
    assert.ok(entry.title && entry.designIntent && entry.implementation && entry.guidelines.length);
    for (const name of entry.tokenKeys) assert.ok(name in tokens, name);
  }
  const context = getContextText(project);
  assert.match(context, /"primary", "radius"/);
  assert.match(context, /do not enforce authorization/);
  assert.match(context, /native main\/section\/form\/button\/input\/table/);
  assert.equal(
    JSON.parse(files['package.json']).dependencies['@btdesign/react'],
    'file:./packages/btdesign-react-0.12.0.tgz',
  );
  assert.equal(
    JSON.parse(files['package.json']).dependencies['@btdesign/engine'],
    'file:./packages/btdesign-engine-0.12.0.tgz',
  );
  assert.match(files['README.md'], /npm install/);
  assert.match(files['README.md'], /npm run dev/);
  assert.match(files['theme.css'], /data-theme="dark"/);
});

test('untrusted content remains inert string data in source output', () => {
  const hostile = '</script><img src=x onerror=alert(1)>${process.exit()} " \\ \u2028';
  for (const framework of ['react', 'vue']) {
    const project = createProject({
      framework,
      name: hostile,
      content: { title: hostile, description: hostile, actionLabel: hostile },
    });
    const files = getProjectFiles(project),
      source = files[framework === 'react' ? 'App.tsx' : 'App.vue'];
    assert.ok(!source.includes('<img src=x'));
    assert.ok(!files['index.html'].includes('<img src=x'));
    assert.ok(files['index.html'].includes('&lt;/script&gt;'));
    assert.ok(!source.includes('"</script>'));
    assert.ok(source.includes('\\u003c/script>'));
    assert.ok(!source.includes('v-html'));
    assert.ok(!source.includes('dangerouslySetInnerHTML'));
    assert.equal(JSON.parse(files['.btdesign/system.json']).content.title, project.content.title);
  }
});

test('all React scenes typecheck against actual exported component APIs', () => {
  const dir = mkdtempSync(join(packageDir, '.generated-'));
  try {
    const sources = scenes.map((scene) => {
      const path = join(dir, `${scene}.tsx`);
      writeFileSync(path, getProjectFiles(createProject({ scene, framework: 'react' }))['App.tsx']);
      return path;
    });
    const program = ts.createProgram(sources, {
      strict: true,
      noEmit: true,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      skipLibCheck: true,
      types: ['react'],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(
      diagnostics.length,
      0,
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (file) => file,
        getCurrentDirectory: () => packageDir,
        getNewLine: () => '\n',
      }),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('all Vue scenes parse and compile with component bindings and safe script boundaries', () => {
  for (const scene of scenes) {
    const source = getProjectFiles(
      createProject({ scene, framework: 'vue', name: '</script><img src=x onerror=alert(1)>' }),
    )['App.vue'];
    const { descriptor, errors } = parse(source, { filename: `${scene}.vue` });
    assert.deepEqual(errors, []);
    assert.ok(descriptor.scriptSetup);
    const script = compileScript(descriptor, { id: `btdesign-${scene}` });
    const template = compileTemplate({
      id: `btdesign-${scene}`,
      filename: `${scene}.vue`,
      source: descriptor.template.content,
      compilerOptions: { bindingMetadata: script.bindings },
    });
    assert.deepEqual(template.errors, []);
    const transpiled = ts.transpileModule(script.content, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      reportDiagnostics: true,
    });
    assert.deepEqual(transpiled.diagnostics, []);
  }
});

test('export templates are generated from the current canonical preview definitions', () => {
  const source = readFileSync(
    join(packageDir, '../../apps/docs/src/studio/ScenePreview.tsx'),
    'utf8',
  );
  const css = readFileSync(join(packageDir, '../../apps/docs/src/studio/ScenePreview.css'), 'utf8');
  const generated = readFileSync(join(packageDir, 'src/scenes.generated.ts'), 'utf8');
  const fingerprint = createHash('sha256').update(source).update(css).digest('hex');
  assert.ok(generated.includes(fingerprint), 'Run the core build after changing a scene');
  for (const framework of ['react', 'vue']) {
    const files = getProjectFiles(createProject({ framework }));
    const app = files[framework === 'react' ? 'App.tsx' : 'App.vue'];
    for (const selector of ['sp-login-layout', 'sp-project-card', 'sp-settings-card', 'sp-members'])
      assert.ok(app.includes(selector), selector);
    assert.ok(files['app.css'].includes('.btdesign-demo .sp-project-card'));
    assert.ok(!files['app.css'].includes('.sp-inspecting'));
  }
});

test('all extracted Vue renderers typecheck against actual component APIs', () => {
  const dir = mkdtempSync(join(packageDir, '.generated-'));
  try {
    const sources = scenes.map((scene) => {
      const app = getProjectFiles(createProject({ scene, framework: 'vue' }))['App.vue'];
      const { descriptor } = parse(app, { filename: `${scene}.vue` });
      const path = join(dir, `${scene}.ts`);
      writeFileSync(path, descriptor.scriptSetup.content);
      return path;
    });
    const program = ts.createProgram(sources, {
      strict: true,
      noEmit: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      skipLibCheck: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(
      diagnostics.length,
      0,
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (file) => file,
        getCurrentDirectory: () => packageDir,
        getNewLine: () => '\n',
      }),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('brief editing preserves spaces, paragraphs and tabs while removing unsafe controls', () => {
  const project = createProject({ brief: 'hello ' });
  assert.equal(project.brief, 'hello ');
  const next = updateProject(project, { brief: 'first paragraph\n\nsecond paragraph\n\t' });
  assert.equal(next.brief, 'first paragraph\n\nsecond paragraph\n\t');
  assert.equal(updateProject(project, { brief: 'a\u0000b\u0008c' }).brief, 'abc');
  assert.equal(createProject({ brief: 'x'.repeat(2001) }).brief.length, 2000);
});

test('React and Vue starters build with their complete Vite entry and TypeScript configuration', () => {
  for (const framework of ['react', 'vue']) {
    const dir = mkdtempSync(join(packageDir, '.starter-'));
    try {
      const files = getProjectFiles(
        createProject({ framework, scene: 'projects', theme: { ...defaultTheme, font: 'inter' } }),
      );
      for (const [name, source] of Object.entries(files)) {
        const path = join(dir, name);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, source);
      }
      // The generated project lives below this workspace and resolves its already-installed dependencies.
      // Tarball installation is separately covered by the repository package consumer checks.
      const output = execFileSync(
        process.platform === 'win32' ? 'npm.cmd' : 'npm',
        ['run', 'build'],
        { cwd: dir, encoding: 'utf8', timeout: 60000, stdio: 'pipe' },
      );
      assert.ok(existsSync(join(dir, 'dist/index.html')), output);
      const pkg = JSON.parse(files['package.json']);
      assert.equal(
        pkg.dependencies['@btdesign/tokens'],
        'file:./packages/btdesign-tokens-0.12.0.tgz',
      );
      assert.equal(
        pkg.dependencies['@btdesign/engine'],
        'file:./packages/btdesign-engine-0.12.0.tgz',
      );
      assert.equal(
        pkg.dependencies[`@btdesign/${framework}`],
        `file:./packages/btdesign-${framework}-0.12.0.tgz`,
      );
      assert.ok(pkg.dependencies['@fontsource-variable/inter']);
      assert.ok(!pkg.dependencies['@btdesign/core']);
    } catch (error) {
      throw new Error(
        `${framework} starter build failed: ${error.stdout?.toString() || error.message} ${error.stderr?.toString() || ''}`,
        { cause: error },
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

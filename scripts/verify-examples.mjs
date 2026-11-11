import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

// Validate the actual code delivered by the component workbench against built packages.
// No source fixtures, copied implementation assertions, network calls or package mutation.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { catalog, componentCode, defaultDemoOptions } = await tsImport(
  '../apps/docs/src/catalog.ts',
  import.meta.url,
);
const { enterpriseCatalog } = await tsImport(
  '../apps/docs/src/enterprise-catalog.ts',
  import.meta.url,
);
const enterpriseIds = new Set(enterpriseCatalog.map((component) => component.id));
const multipleIds = new Set(['toggle-group', 'tree', 'tree-select', 'cascader', 'org-picker']);
const cascadeIds = new Set(['tree', 'tree-select', 'org-picker']);
const directory = mkdtempSync(join(root, '.btdesign-examples-'));
const totals = { react: 0, vue: 0 };
function runCompiler(bin, config) {
  const result = spawnSync(process.execPath, [bin, '-p', config, '--pretty', 'false'], {
    cwd: directory,
    encoding: 'utf8',
    timeout: 120_000,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${result.stdout ?? ''}${result.stderr ?? ''}`);
}
try {
  mkdirSync(join(directory, 'react'));
  mkdirSync(join(directory, 'vue'));
  for (const component of catalog) {
    const defaults = {
      ...defaultDemoOptions,
      variant: component.id === 'alert' ? 'info' : component.id === 'badge' ? 'default' : 'primary',
    };
    const variants = [['default', defaults]];
    if (enterpriseIds.has(component.id) && component.id !== 'list')
      variants.push(['disabled', { ...defaultDemoOptions, state: 'disabled' }]);
    if (multipleIds.has(component.id))
      variants.push(['multiple', { ...defaultDemoOptions, multiple: true }]);
    if (cascadeIds.has(component.id))
      variants.push(['cascade', { ...defaultDemoOptions, multiple: true, cascade: true }]);
    if (component.id === 'cascader')
      variants.push([
        'parent-no-search',
        { ...defaults, multiple: true, cascaderSearchable: false, cascaderChangeOnSelect: true },
      ]);
    if (component.id === 'progress')
      variants.push([
        'circle-warning',
        {
          ...defaults,
          progressType: 'circle',
          progressStatus: 'warning',
          progressShowValue: false,
        },
      ]);
    if (component.id === 'data-table')
      variants.push(['loading', { ...defaultDemoOptions, state: 'loading' }]);
    if (component.id === 'slider') {
      variants.push(['marks', { ...defaults, sliderMarks: true }]);
      variants.push(['disabled', { ...defaults, state: 'disabled' }]);
    }
    if (component.id === 'date-picker' || component.id === 'date-range-picker') {
      variants.push(['readonly', { ...defaults, dateReadOnly: true }]);
      if (component.id === 'date-picker')
        variants.push(['no-clear', { ...defaults, dateClearable: false }]);
      if (component.id === 'date-range-picker')
        variants.push([
          'calendar-presets',
          { ...defaults, dateRangeCalendar: true, dateRangePresets: true },
        ]);
    }
    if (component.id === 'time-picker') {
      variants.push(['disabled', { ...defaults, state: 'disabled' }]);
      variants.push(['invalid', { ...defaults, state: 'invalid' }]);
    }
    if (component.id === 'input') {
      variants.push(['password', { ...defaults, inputKind: 'password' }]);
      variants.push(['search', { ...defaults, inputKind: 'search' }]);
      for (const inputAddon of ['start', 'end', 'both'])
        variants.push([`addon-${inputAddon}`, { ...defaults, inputAddon }]);
    }
    if (component.id === 'input-tag') {
      variants.push(['disabled', { ...defaults, state: 'disabled' }]);
      variants.push(['invalid', { ...defaults, state: 'invalid' }]);
      variants.push(['duplicates', { ...defaults, inputTagDuplicates: true }]);
    }
    if (component.id === 'auto-complete') {
      variants.push(['empty', { ...defaults, autoCompleteEmpty: true }]);
      variants.push(['disabled', { ...defaults, state: 'disabled' }]);
      variants.push(['invalid', { ...defaults, state: 'invalid' }]);
    }
    if (component.id === 'upload') {
      variants.push([
        'multiple-image',
        { ...defaults, uploadMultiple: true, uploadAccept: 'image' },
      ]);
      variants.push(['text', { ...defaults, uploadAccept: 'text' }]);
      variants.push(['disabled', { ...defaults, state: 'disabled' }]);
    }
    if (component.id === 'mention') {
      variants.push(['empty', { ...defaults, mentionEmpty: true }]);
      variants.push(['disabled', { ...defaults, state: 'disabled' }]);
      variants.push(['invalid', { ...defaults, state: 'invalid' }]);
    }
    if (component.id === 'rate') {
      variants.push(['heart-half', { ...defaults, rateShape: 'heart', rateHalf: true }]);
      variants.push(['allow-clear', { ...defaults, rateClear: true }]);
      variants.push(['disabled', { ...defaults, state: 'disabled' }]);
    }
    if (component.id === 'avatar')
      variants.push([
        'group-square',
        { ...defaultDemoOptions, avatarMode: 'group', avatarShape: 'square', avatarMax: 2 },
      ]);
    if (component.id === 'descriptions')
      variants.push([
        'vertical-bordered',
        {
          ...defaultDemoOptions,
          orientation: 'vertical',
          descriptionsBordered: true,
          descriptionsColumns: 2,
        },
      ]);
    if (component.id === 'comment') {
      variants.push([
        'nested-end',
        { ...defaultDemoOptions, commentNested: true, commentAlignment: 'end' },
      ]);
      variants.push(['without-actions', { ...defaultDemoOptions, commentActions: false }]);
    }
    if (component.id === 'statistic')
      variants.push([
        'percent-down',
        {
          ...defaultDemoOptions,
          statisticFormat: 'percent',
          statisticTrend: 'down',
          statisticPrecision: 2,
        },
      ]);
    if (component.id === 'image') {
      variants.push([
        'preview',
        { ...defaultDemoOptions, imageRatio: '3 / 4', imageFit: 'contain', imagePreview: true },
      ]);
      variants.push(['fallback', { ...defaultDemoOptions, imageBroken: true }]);
    }
    if (component.id === 'carousel')
      variants.push([
        'lines-loop',
        {
          ...defaultDemoOptions,
          carouselIndicatorStyle: 'lines',
          carouselIndicatorPlacement: 'end',
          carouselLoop: true,
        },
      ]);
    if (component.id === 'back-top')
      variants.push([
        'circle-primary-top',
        { ...defaults, backTopShape: 'circle', backTopVariant: 'primary', backTopContent: 'top' },
      ]);
    if (component.id === 'data-table')
      variants.push(['separate-expand', { ...defaults, tableExpandColumn: 'separate' }]);
    if (component.id === 'breadcrumb')
      variants.push(['arrow', { ...defaults, breadcrumbSeparator: 'arrow' }]);
    if (component.id === 'checkbox')
      variants.push(['indeterminate', { ...defaults, checkboxIndeterminate: true }]);
    if (component.id === 'checkbox-group')
      variants.push(['horizontal', { ...defaults, orientation: 'horizontal' }]);
    if (component.id === 'list') {
      variants.push(['advanced', { ...defaults, listMode: 'advanced', listBordered: true }]);
      variants.push(['grid', { ...defaults, listMode: 'grid', listColumns: 4, listSplit: false }]);
    }
    if (component.id === 'resize-box')
      variants.push([
        'vertical-disabled',
        { ...defaults, orientation: 'vertical', state: 'disabled' },
      ]);
    if (component.id === 'empty-state')
      variants.push([
        'offline-compact',
        { ...defaults, emptyVariant: 'offline', emptySize: 'compact', emptyHeadingLevel: 2 },
      ]);
    if (component.id === 'popover') {
      variants.push([
        'right-end',
        { ...defaults, popoverPlacement: 'right-end', popoverArrow: false },
      ]);
      variants.push([
        'no-title-disabled',
        { ...defaults, popoverTitle: false, popoverDisabled: true },
      ]);
    }
    if (component.id === 'collapse') {
      variants.push([
        'accordion-end',
        { ...defaultDemoOptions, collapseMode: 'accordion', collapseIcon: 'end' },
      ]);
      variants.push([
        'disabled-no-icon',
        { ...defaultDemoOptions, state: 'disabled', collapseIcon: 'none' },
      ]);
    }
    for (const framework of ['react', 'vue']) {
      const seen = new Set();
      for (const [variant, options] of variants) {
        const source = componentCode(component.id, framework, options);
        assert.ok(source, `${component.id}/${framework}/${variant} must produce example code`);
        if (seen.has(source)) continue;
        seen.add(source);
        const filename = `${component.id}-${variant}.${framework === 'react' ? 'tsx' : 'vue'}`;
        writeFileSync(join(directory, framework, filename), source);
        totals[framework]++;
        if (framework === 'vue') {
          const { descriptor, errors } = parse(source, { filename });
          assert.deepEqual(errors, [], `${filename}: SFC parse`);
          assert.ok(
            descriptor.scriptSetup && descriptor.template,
            `${filename}: requires script and template`,
          );
          const id = `example-${component.id}-${variant}`;
          const script = compileScript(descriptor, { id });
          const template = compileTemplate({
            id,
            filename,
            source: descriptor.template.content,
            compilerOptions: { bindingMetadata: script.bindings },
          });
          assert.deepEqual(template.errors, [], `${filename}: template compile`);
        }
      }
    }
  }
  const compilerOptions = {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  };
  writeFileSync(
    join(directory, 'react.json'),
    JSON.stringify({
      compilerOptions: { ...compilerOptions, jsx: 'react-jsx', types: ['react'] },
      include: ['react/**/*.tsx'],
    }),
  );
  writeFileSync(
    join(directory, 'vue.json'),
    JSON.stringify({ compilerOptions, include: ['vue/**/*.vue'] }),
  );
  runCompiler(require.resolve('typescript/bin/tsc'), 'react.json');
  runCompiler(require.resolve('vue-tsc/bin/vue-tsc.js'), 'vue.json');
  console.log(
    `PASS: ${catalog.length} component families; ${totals.react} React examples and ${totals.vue} Vue SFC examples compile with strict types and no skipLibCheck.`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}

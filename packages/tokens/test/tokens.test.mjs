import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createTheme,
  normalizeTheme,
  themeToCSS,
  contrastRatio,
  presets,
  defaultTheme,
  applyThemePatch,
} from '../dist/index.js';

test('external configuration is normalized and CSS injection cannot escape colors', () => {
  const config = normalizeTheme({
    primary: 'red; background: url(https://bad)',
    radius: Infinity,
    density: 'large',
    font: 'url(bad)',
  });
  assert.deepEqual(config, defaultTheme);
  assert.equal(normalizeTheme({ radius: -4 }).radius, 0);
  assert.equal(normalizeTheme({ radius: 400 }).radius, 20);
  assert.equal(normalizeTheme({ primary: '#abcdef' }).primary, '#ABCDEF');
  assert.equal(normalizeTheme(null).primary, defaultTheme.primary);
});

test('contrast calculation matches known black/white and same-color values', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21);
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF'), 1);
  assert.throws(() => contrastRatio('#fff', '#000000'), TypeError);
});

test('foreground remains readable for any primary color, in either theme', () => {
  for (const primary of [
    ...presets.map((p) => p.primary),
    '#FFFFFF',
    '#000000',
    '#FF0000',
    '#777777',
    '#00FF00',
  ]) {
    for (const mode of ['light', 'dark']) {
      const vars = createTheme({ ...defaultTheme, primary }, mode);
      assert.ok(contrastRatio(vars['--f-primary'], vars['--f-on-primary']) >= 4.5);
      assert.ok(contrastRatio(vars['--f-text'], vars['--f-bg']) >= 7);
      assert.ok(contrastRatio(vars['--f-muted'], vars['--f-bg']) >= 4.5);
    }
  }
});

test('filled semantic buttons stay readable on hover in both modes', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const rule = css.match(
    /\.f-button\[class\*='f-button--tone-'\]\.f-button--primary:hover:not\(:disabled\)\s*\{([^}]+)\}/,
  );
  assert.ok(rule, 'semantic button hover rule exists');
  const mix = rule[1].match(
    /color-mix\(in srgb,\s*var\(--f-button-tone\)\s*(\d+(?:\.\d+)?)%,\s*#([0-9a-f]{3}|[0-9a-f]{6})\)/i,
  );
  assert.ok(mix, 'hover color can be checked against the actual CSS mix');
  const weight = Number(mix[1]) / 100;
  const hex = (color) =>
    color.length === 3
      ? color
          .split('')
          .map((c) => c + c)
          .join('')
      : color;
  const target = hex(mix[2]);
  const blend = (color) => {
    const base = hex(color.replace('#', ''));
    const channels = [0, 2, 4].map((i) =>
      Math.round(
        parseInt(base.slice(i, i + 2), 16) * weight +
          parseInt(target.slice(i, i + 2), 16) * (1 - weight),
      )
        .toString(16)
        .padStart(2, '0'),
    );
    return `#${channels.join('')}`;
  };
  for (const mode of ['light', 'dark']) {
    const vars = createTheme(defaultTheme, mode);
    for (const tone of ['success', 'warning', 'danger', 'info']) {
      const background = blend(vars[`--f-${tone}`]);
      assert.ok(
        contrastRatio(background, vars['--f-on-status']) >= 4.5,
        `${mode} ${tone}: ${background}`,
      );
    }
  }
});

test('export contains both modes and resolves spacing/font choices', () => {
  const config = { ...defaultTheme, radius: 12, density: 'compact', font: 'mono' };
  assert.equal(createTheme(config)['--f-control-height'], '32px');
  assert.equal(createTheme(config)['--f-radius'], '12px');
  assert.match(themeToCSS(config), /\[data-theme="dark"\]/);
  assert.match(themeToCSS(config), /color-scheme: light/);
  assert.match(themeToCSS(config), /SFMono-Regular/);
});

test('semantic and component overrides whitelist fields, colors, and bounded values', () => {
  const result = normalizeTheme({
    ...defaultTheme,
    semantic: {
      light: { background: '#abcdef', text: 'red; display:none', custom: '#000000' },
      dark: { surface: '#202020' },
      unexpected: { text: '#FFFFFF' },
    },
    components: {
      button: { radius: 90, height: 12 },
      input: { radius: NaN, height: 100 },
      card: { padding: 0, radius: -1 },
      script: { height: 30 },
    },
  });
  assert.deepEqual(result.semantic, {
    light: { background: '#ABCDEF' },
    dark: { surface: '#202020' },
  });
  assert.deepEqual(result.components, {
    button: { radius: 20, height: 28 },
    input: { height: 56 },
    card: { radius: 0, padding: 8 },
  });
  assert.equal(createTheme(result, 'light')['--f-bg'], '#ABCDEF');
  assert.equal(createTheme(result, 'dark')['--f-surface'], '#202020');
  assert.equal(createTheme(result)['--f-button-height'], '28px');
  assert.equal(createTheme(result)['--f-card-padding'], '8px');
  assert.equal('semantic' in normalizeTheme({ semantic: { light: { text: 'invalid' } } }), false);
  assert.equal(
    'components' in normalizeTheme({ components: { input: { height: Infinity } } }),
    false,
  );
});

test('enterprise locks preserve original values even when an AI patch replaces entire sections', () => {
  const base = normalizeTheme({
    ...defaultTheme,
    primary: '#2563EB',
    semantic: { light: { surface: '#F2F2F2' } },
    components: { button: { radius: 4 } },
  });
  const result = applyThemePatch(
    base,
    {
      name: 'New draft',
      primary: '#FF0000',
      radius: 14,
      semantic: null,
      components: { button: { radius: 16 } },
    },
    { locked: ['primary', 'semantic', 'components'] },
  );
  assert.equal(result.name, 'New draft');
  assert.equal(result.primary, '#2563EB');
  assert.equal(result.radius, 14);
  assert.deepEqual(result.semantic, base.semantic);
  assert.deepEqual(result.components, base.components);
  assert.deepEqual(base.components, { button: { radius: 4 } });
});

test('partial patches merge independent overrides and can explicitly reset a section', () => {
  const base = normalizeTheme({
    ...defaultTheme,
    semantic: { light: { background: '#F0F0F0', text: '#121212' }, dark: { surface: '#222222' } },
    components: { button: { radius: 4, height: 40 }, card: { padding: 30 } },
  });
  const patched = applyThemePatch(base, {
    semantic: { light: { text: '#333333' } },
    components: { button: { height: 44 } },
  });
  assert.deepEqual(patched.semantic, {
    light: { background: '#F0F0F0', text: '#333333' },
    dark: { surface: '#222222' },
  });
  assert.deepEqual(patched.components, {
    button: { radius: 4, height: 44 },
    card: { padding: 30 },
  });
  assert.deepEqual(applyThemePatch(patched, { components: { button: null } }).components, {
    card: { padding: 30 },
  });
  assert.equal('components' in applyThemePatch(patched, { components: null }), false);
  assert.equal(createTheme(patched)['--f-input-height'], '38px');
  assert.match(themeToCSS(patched), /--f-button-height: 44px/);
});

test('field and table rules survive normalization, partial edits, locks and CSS export', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: {
      field: { gap: 100, labelSize: 0, injected: 'bad' },
      table: { cellPadding: 2, rowHeight: 100 },
    },
  });
  assert.deepEqual(theme.components, {
    field: { gap: 20, labelSize: 11 },
    table: { cellPadding: 6, rowHeight: 72 },
  });
  const edited = applyThemePatch(theme, {
    components: { field: { gap: 10 }, table: { cellPadding: 16 } },
  });
  assert.deepEqual(edited.components.field, { gap: 10, labelSize: 11 });
  assert.deepEqual(edited.components.table, { cellPadding: 16, rowHeight: 72 });
  assert.deepEqual(applyThemePatch(theme, { components: null }, { locked: ['components'] }), theme);
  const reset = applyThemePatch(edited, { components: { field: { gap: null }, table: null } });
  assert.deepEqual(reset.components, { field: { labelSize: 11 } });
  assert.equal(createTheme(reset)['--f-field-gap'], '8px');
  for (const mode of ['light', 'dark']) {
    const values = createTheme(edited, mode);
    assert.equal(values['--f-field-gap'], '10px');
    assert.equal(values['--f-table-cell-padding'], '16px');
    assert.equal(values['--f-table-row-height'], '72px');
  }
  assert.match(themeToCSS(edited), /--f-field-label-size: 11px/);
  assert.equal(
    createTheme({ ...defaultTheme, density: 'compact' })['--f-table-row-height'],
    '36px',
  );
});

test('enterprise geometry shares density defaults, bounds, locks and reset across both modes', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: {
      form: { gap: 999, sectionGap: 2 },
      choice: { size: 22, gap: 10 },
      calendar: { cellSize: 40, gap: 6 },
      tree: { rowHeight: 44, indent: 28 },
      navigation: { itemHeight: 46, padding: 18 },
      list: { rowPadding: 20, gap: 8 },
      overlay: { radius: 12, padding: 20 },
      unknown: { size: 100 },
    },
  });
  assert.deepEqual(theme.components.form, { gap: 32, sectionGap: 12 });
  assert.equal(theme.components.unknown, undefined);
  for (const mode of ['light', 'dark']) {
    const vars = createTheme(theme, mode);
    assert.equal(vars['--f-tree-indent'], '28px');
    assert.equal(vars['--f-calendar-cell-size'], '40px');
    assert.equal(vars['--f-nav-item-height'], '46px');
    assert.equal(vars['--f-list-row-padding'], '20px');
    assert.equal(vars['--f-choice-size'], '22px');
    assert.equal(vars['--f-overlay-radius'], '12px');
  }
  const locked = applyThemePatch(
    theme,
    { components: { tree: { indent: 12 }, calendar: null } },
    { locked: ['components'] },
  );
  assert.deepEqual(locked.components, theme.components);
  const patched = applyThemePatch(theme, { components: { tree: { indent: 16 }, calendar: null } });
  assert.deepEqual(patched.components.tree, { rowHeight: 44, indent: 16 });
  assert.equal(patched.components.calendar, undefined);
  assert.equal(createTheme({ ...patched, density: 'compact' })['--f-calendar-cell-size'], '30px');
  assert.equal(createTheme({ ...defaultTheme, radius: 15 })['--f-overlay-radius'], '15px');
  assert.match(themeToCSS(theme), /--f-form-gap: 32px/);
});

test('ResizeBox handle follows bounded, lockable Lab geometry in both themes', () => {
  const theme = normalizeTheme({ ...defaultTheme, components: { resize: { handleSize: 200 } } });
  assert.equal(theme.components.resize.handleSize, 24);
  for (const mode of ['light', 'dark']) {
    assert.equal(createTheme(theme, mode)['--f-resize-handle-size'], '24px');
    assert.equal(
      createTheme({ ...defaultTheme, density: 'compact' }, mode)['--f-resize-handle-size'],
      '6px',
    );
  }
  assert.deepEqual(
    applyThemePatch(
      theme,
      { components: { resize: { handleSize: 4 } } },
      { locked: ['components'] },
    ),
    theme,
  );
  assert.equal(
    createTheme(applyThemePatch(theme, { components: { resize: { handleSize: null } } }))[
      '--f-resize-handle-size'
    ],
    '8px',
  );
  assert.match(
    readFileSync(new URL('../styles.css', import.meta.url), 'utf8'),
    /flex:\s*0 0 var\(--f-resize-handle-size/,
  );
});

test('Progress line and ring geometry follows bounded, lockable Lab rules', () => {
  const theme = normalizeTheme({
    ...defaultTheme,
    components: { progress: { lineHeight: 20, circleSize: 100, circleStroke: 2 } },
  });
  assert.equal(theme.components.progress.lineHeight, 16);
  for (const mode of ['light', 'dark']) {
    const vars = createTheme(theme, mode);
    assert.equal(vars['--f-progress-line-height'], '16px');
    assert.equal(vars['--f-progress-circle-size'], '100px');
    assert.equal(vars['--f-progress-circle-stroke'], '2px');
  }
  assert.deepEqual(
    applyThemePatch(
      theme,
      { components: { progress: { circleSize: 48 } } },
      { locked: ['components'] },
    ),
    theme,
  );
});

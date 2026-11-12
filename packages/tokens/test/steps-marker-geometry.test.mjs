import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  applyThemePatch,
  createTheme,
  defaultTheme,
  normalizeTheme,
  themeToCSS,
} from '../dist/index.js';

test('old themes retain inherited markers and explicit step sizing does not change buttons', () => {
  const old = normalizeTheme({ ...defaultTheme, components: { button: { height: 50 } } });
  for (const mode of ['light', 'dark']) {
    const oldVars = createTheme(old, mode);
    for (const key of ['standard', 'small', 'dot', 'small-dot'])
      assert.equal(oldVars[`--f-steps-${key}-marker`], 'initial');
    assert.equal(oldVars['--f-button-height'], '50px');
  }
  const changed = applyThemePatch(old, { components: { steps: { markerSize: 44 } } });
  const vars = createTheme(changed, 'dark');
  assert.equal(vars['--f-steps-standard-marker'], '44px');
  assert.equal(vars['--f-button-height'], '50px');
  assert.ok(parseFloat(vars['--f-steps-dot-marker']) > 13);
  const reset = applyThemePatch(changed, { components: { steps: { markerSize: null } } });
  assert.equal(createTheme(reset)['--f-steps-standard-marker'], 'initial');
  assert.equal(createTheme(reset)['--f-button-height'], '50px');
  assert.equal(themeToCSS(changed).split('--f-steps-standard-marker: 44px;').length - 1, 2);
  assert.equal(themeToCSS(reset).split('--f-steps-standard-marker: initial;').length - 1, 2);
});

test('inherited size resolves at the steps element and permits local button height overrides', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  for (const [name, minimum, ratio] of [
    ['standard', 24, 0.74],
    ['small', 20, 0.6],
    ['dot', 8, 0.26],
    ['small-dot', 6, 0.2],
  ]) {
    const escaped = `--f-steps-${name}-marker,`;
    const offset = css.indexOf(escaped);
    assert.ok(offset >= 0, `${name} uses its override token`);
    assert.match(
      css.slice(offset, offset + 130),
      new RegExp(
        `max\\(${minimum}px, calc\\(var\\(--f-button-height, var\\(--f-control-height, 38px\\)\\) \\* ${ratio}\\)\\)`,
      ),
    );
  }
});

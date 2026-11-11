import test from 'node:test';
import assert from 'node:assert/strict';
import {
  navigationExample,
  navigationPreviewItems,
  navigationPreviewLabel,
  navigationPreviewOptions,
} from '../src/NavigationExample.ts';
test('default configuration preserves expanded groups and avoids optional sidebar controls', () => {
  const options = navigationPreviewOptions();
  assert.deepEqual(options, {
    collapsed: false,
    showIcons: false,
    showCollapseControl: false,
    parentLink: false,
    initialExpanded: 'all',
    disabled: false,
  });
  assert.equal(navigationPreviewItems(false).find((item) => item.key === 'work')?.href, undefined);
  const code = navigationExample('sidebar-nav', 'react');
  assert.match(code, /useState<string\[]>\(\['work'\]\)/);
  assert.match(code, /showCollapseControl=\{false\}/);
  assert.doesNotMatch(code, /renderIcon=/);
});
test('configured sidebar examples represent actual controls for React and Vue', () => {
  const options = {
    navCollapsed: true,
    navIcons: true,
    navShowCollapseControl: true,
    navParentLink: true,
    navInitialExpanded: 'none' as const,
    state: 'disabled' as const,
  };
  const react = navigationExample('sidebar-nav', 'react', options),
    vue = navigationExample('sidebar-nav', 'vue', options);
  assert.match(react, /useState\(true\)/);
  assert.match(react, /useState<string\[]>\(\[\]\)/);
  assert.match(react, /showCollapseControl=\{true\}/);
  assert.match(react, /onCollapsedChange=\{setCollapsed\}/);
  assert.match(react, /renderIcon=/);
  assert.match(react, /"parentLink": true/);
  assert.match(react, /preventDefault/);
  assert.match(vue, /v-model:collapsed="collapsed"/);
  assert.match(vue, /:show-collapse-control="true"/);
  assert.match(vue, /<template #icon>/);
  assert.match(vue, /:disabled="true"/);
  assert.match(vue, /"parentLink": true/);
});
test('top nav excludes sidebar-only configuration and retains expansion and icons', () => {
  for (const framework of ['react', 'vue'] as const) {
    const code = navigationExample('top-nav', framework, {
      navCollapsed: true,
      navParentLink: true,
      navIcons: true,
      navInitialExpanded: 'none',
    });
    assert.doesNotMatch(code, /parentLink|showCollapseControl|show-collapse-control|collapsed/);
    assert.match(code, /expandedKeys/);
    assert.match(code, /◆/);
  }
});

test('visible result uses human-readable labels for roots and nested nodes', () => {
  assert.equal(navigationPreviewLabel('overview'), '工作概览');
  assert.equal(navigationPreviewLabel('work'), '协作空间');
  assert.equal(navigationPreviewLabel('projects'), '项目管理');
  assert.equal(navigationPreviewLabel('missing'), '未知入口');
  for (const framework of ['react', 'vue'] as const) {
    const code = navigationExample('sidebar-nav', framework);
    assert.match(code, /labels\[activeKey\]/);
    assert.match(code, /"projects": "项目管理"/);
  }
});

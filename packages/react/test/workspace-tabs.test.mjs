import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkspaceTabs } from '../dist/workspace-tabs.js';
import {
  workspaceItemIsVisible,
  workspaceRevealDistance,
  workspaceScrollDistance,
  workspaceScrollState,
} from '../dist/workspace-tabs-utils.js';
const entries = [
  { key: 'home', label: '工作台', href: '/home' },
  { key: 'edit', label: '设计稿', closable: true },
  { key: 'locked', label: '归档', disabled: true, closable: true },
  { key: 'bad', label: '不安全链接', href: 'javascript:alert(1)' },
];
const render = (props = {}) =>
  renderToStaticMarkup(
    h(WorkspaceTabs, { items: entries, activeKey: 'edit', onClose: () => {}, ...props }),
  );
test('navigation preserves genuine links, actions, current state and sibling close buttons', () => {
  const html = render({ label: '工作区', id: 'work', className: 'custom' });
  assert.match(html, /^<nav id="work" aria-label="工作区" class="f-workspace-tabs custom">/);
  assert.match(html, /<ul class="f-workspace-tabs-list">/);
  assert.match(html, /<a class="f-workspace-tabs-link" href="\/home">工作台<\/a>/);
  assert.match(
    html,
    /<button type="button" class="f-workspace-tabs-link" aria-current="page">设计稿<\/button><button type="button" class="f-workspace-tabs-close f-button f-button--ghost" aria-label="关闭设计稿">/,
  );
  assert.match(
    html,
    /<button type="button" class="f-workspace-tabs-link" disabled="">归档<\/button><button type="button" class="f-workspace-tabs-close f-button f-button--ghost" disabled="" aria-label="关闭归档"/,
  );
  assert.match(html, /aria-label="关闭设计稿"><span aria-hidden="true">×<\/span><\/button>/);
  assert.doesNotMatch(html, /javascript:/);
  assert.doesNotMatch(html, /向左滚动标签|向右滚动标签/);
});
test('caller updates own items and current state; absent close handler has no dead action', () => {
  const before = render({ onClose: undefined, more: h(Fragment, {}, ' \n ') });
  assert.doesNotMatch(before, /f-workspace-tabs-close|f-workspace-tabs-more/);
  const after = render({ items: [entries[0]], activeKey: 'home', more: h('button', {}, '更多') });
  assert.doesNotMatch(after, /设计稿|归档/);
  assert.match(after, /href="\/home" aria-current="page"/);
  assert.match(after, /f-workspace-tabs-more"><button>更多<\/button>/);
});
test('scroll geometry handles dynamic widths, fractional edges and modern RTL offsets', () => {
  assert.deepEqual(workspaceScrollState({ clientWidth: 200, scrollWidth: 200, scrollLeft: 0 }), {
    overflow: false,
    canPrevious: false,
    canNext: false,
  });
  assert.deepEqual(workspaceScrollState({ clientWidth: 0, scrollWidth: 200, scrollLeft: 0 }), {
    overflow: false,
    canPrevious: false,
    canNext: false,
  });
  assert.deepEqual(workspaceScrollState({ clientWidth: 100, scrollWidth: 101, scrollLeft: 0 }), {
    overflow: true,
    canPrevious: false,
    canNext: true,
  });
  assert.deepEqual(workspaceScrollState({ clientWidth: 100, scrollWidth: 101, scrollLeft: 1 }), {
    overflow: true,
    canPrevious: true,
    canNext: false,
  });
  assert.deepEqual(workspaceScrollState({ clientWidth: 100, scrollWidth: 300, scrollLeft: 0 }), {
    overflow: true,
    canPrevious: false,
    canNext: true,
  });
  assert.deepEqual(workspaceScrollState({ clientWidth: 100, scrollWidth: 300, scrollLeft: 80 }), {
    overflow: true,
    canPrevious: true,
    canNext: true,
  });
  assert.deepEqual(
    workspaceScrollState({ clientWidth: 100, scrollWidth: 300, scrollLeft: 199.5 }),
    { overflow: true, canPrevious: true, canNext: false },
  );
  assert.deepEqual(
    workspaceScrollState({ clientWidth: 100, scrollWidth: 300, scrollLeft: 0, direction: 'rtl' }),
    { overflow: true, canPrevious: true, canNext: false },
  );
  assert.deepEqual(
    workspaceScrollState({
      clientWidth: 100,
      scrollWidth: 300,
      scrollLeft: -200,
      direction: 'rtl',
    }),
    { overflow: true, canPrevious: false, canNext: true },
  );
  assert.equal(workspaceScrollDistance(100, 'previous'), -80);
  assert.equal(workspaceScrollDistance(100, 'next'), 80);
});

test('reveal measures the whole item against unobscured bounds', () => {
  const area = { left: 0, right: 200 };
  assert.equal(workspaceRevealDistance(area, { left: 150, right: 195 }, 0, 30), 25);
  assert.equal(workspaceRevealDistance(area, { left: 10, right: 60 }, 30, 0), -20);
  assert.equal(workspaceRevealDistance(area, { left: 35, right: 160 }, 30, 30), 0);
});

test('visible snapshot includes the whole item and accounts for button overlays', () => {
  const area = { left: 0, right: 200 };
  assert.equal(workspaceItemIsVisible(area, { left: 35, right: 170 }, 30, 30), true);
  assert.equal(workspaceItemIsVisible(area, { left: 35, right: 171 }, 30, 30), false);
  assert.equal(workspaceItemIsVisible(area, { left: 29, right: 160 }, 30, 30), false);
  assert.equal(workspaceItemIsVisible(area, { left: 30, right: 170.5 }, 30, 30), true);
});

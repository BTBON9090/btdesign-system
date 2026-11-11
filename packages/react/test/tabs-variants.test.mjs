import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tabs } from '../dist/index.js';

const items = [
  { value: 'one', label: 'One', content: 'First' },
  { value: 'disabled', label: 'Unavailable', disabled: true },
  { value: 'two', label: 'Two', content: 'Second' },
];
test('Tabs expose each visual style and correct orientation without changing default classes', () => {
  assert.match(renderToStaticMarkup(h(Tabs, { items })), /^<div class="f-tabs">/);
  for (const variant of ['line', 'text', 'card', 'card-gutter', 'rounded']) {
    const html = renderToStaticMarkup(h(Tabs, { items, variant, orientation: 'vertical' }));
    assert.match(html, new RegExp(`f-tabs--${variant} f-tabs--vertical`));
    assert.match(html, /role="tablist"[^>]*aria-orientation="vertical"/);
    assert.match(html, /aria-selected="false"[^>]*disabled=""/);
    const tab = html.match(/id="([^"]+-tab-0)" aria-controls="([^"]+-panel-0)"/);
    assert.ok(tab);
    assert.ok(html.includes(`id="${tab[2]}" aria-labelledby="${tab[1]}"`));
  }
});

test('four sizes combine with every variant and orientation without changing tab behavior', () => {
  assert.match(renderToStaticMarkup(h(Tabs, { items, size: 'medium' })), /^<div class="f-tabs">/);
  for (const size of ['mini', 'small', 'medium', 'big']) {
    for (const variant of ['default', 'line', 'text', 'card', 'card-gutter', 'rounded']) {
      for (const orientation of ['horizontal', 'vertical']) {
        const html = renderToStaticMarkup(
          h(Tabs, { items, size, variant, orientation, value: 'two' }),
        );
        if (size !== 'medium') assert.match(html, new RegExp(`f-tabs--${size}`));
        if (variant !== 'default') assert.match(html, new RegExp(`f-tabs--${variant}`));
        assert.match(html, new RegExp(`aria-orientation="${orientation}"`));
        assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
        assert.match(html, /aria-selected="false"[^>]*disabled=""[^>]*>Unavailable<\/button>/);
        assert.match(html, /aria-selected="true"[^>]*>Two<\/button>/);
        assert.match(html, /role="tabpanel"[^>]*>Second<\/div>/);
      }
    }
  }
});

test('renderIcon receives each item/index and decorates without changing accessible labels', () => {
  const calls = [];
  const html = renderToStaticMarkup(
    h(Tabs, {
      items,
      renderIcon: (item, index) => {
        calls.push([item.value, index]);
        return index === 0 ? h('svg', { viewBox: '0 0 1 1' }, h('path', { d: 'M0 0' })) : null;
      },
    }),
  );
  assert.deepEqual(calls, [
    ['one', 0],
    ['disabled', 1],
    ['two', 2],
  ]);
  assert.equal((html.match(/class="f-tab-icon"/g) ?? []).length, 1);
  assert.match(html, /class="f-tab-icon" aria-hidden="true" inert=""/);
  assert.match(html, /<svg[^>]*><path[^>]*><\/path><\/svg><\/span>One/);
});

test('empty icon values do not create a spacer', async () => {
  const { Fragment } = await import('react');
  for (const icon of [
    null,
    undefined,
    false,
    '',
    ' ',
    [],
    h(Fragment, null),
    h(Fragment, null, ' '),
  ]) {
    assert.doesNotMatch(
      renderToStaticMarkup(h(Tabs, { items, renderIcon: () => icon })),
      /f-tab-icon/,
    );
  }
  assert.match(renderToStaticMarkup(h(Tabs, { items, renderIcon: () => 0 })), /f-tab-icon/);
});

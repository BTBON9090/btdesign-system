import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchSelect } from '../dist/search-select.js';
const options = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙', disabled: true },
];
test('single selection exposes a named combobox and submitted value', () => {
  const html = renderToStaticMarkup(
    h(SearchSelect, { id: 'team', label: '团队', name: 'team', options, value: 'a' }),
  );
  assert.match(html, /role="combobox"[^>]*aria-label="团队"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /value="甲"/);
  assert.match(html, /type="hidden" name="team" value="a"/);
});
test('multi selection keeps tags, disabled removals and actual form values', () => {
  const html = renderToStaticMarkup(
    h(SearchSelect, { label: '团队', name: 'team', options, multiple: true, value: ['a', 'b'] }),
  );
  assert.match(html, /aria-label="移除甲"/);
  assert.match(html, /<button type="button" disabled="" aria-label="移除乙"/);
  assert.equal((html.match(/type="hidden" name="team"/g) ?? []).length, 2);
});

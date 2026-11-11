import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DatePicker, DateRangePicker } from '../dist/enterprise-date.js';

test('read-only dates disable selection and clearing without disabling the value', () => {
  const html = renderToStaticMarkup(
    h(DatePicker, { label: '日期', defaultValue: '2024-02-01', readOnly: true }),
  );
  assert.match(html, /<input[^>]*readOnly=""/);
  assert.match(html, /<button[^>]*aria-label="选择日期"[^>]*disabled=""/);
  assert.match(html, /<button[^>]*disabled=""[^>]*aria-label="清空日期"/);
  const range = renderToStaticMarkup(
    h(DateRangePicker, { readOnly: true, defaultValue: ['2024-02-01', '2024-02-05'] }),
  );
  assert.equal((range.match(/readOnly=""/g) ?? []).length, 2);
});
test('clearable=false removes the clear action', () => {
  const html = renderToStaticMarkup(
    h(DatePicker, { defaultValue: '2024-02-01', clearable: false }),
  );
  assert.doesNotMatch(html, /清空日期/);
});

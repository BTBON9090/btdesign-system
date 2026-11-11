import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Calendar, DatePicker, DateRangePicker } from '../dist/enterprise-date.js';

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

test('range calendar is optional and respects disabled and read-only states', () => {
  const initial = renderToStaticMarkup(h(DateRangePicker, { label: '项目周期' }));
  assert.doesNotMatch(initial, /aria-label="选择项目周期"/);
  for (const props of [{ disabled: true }, { readOnly: true }]) {
    const html = renderToStaticMarkup(
      h(DateRangePicker, { label: '项目周期', showCalendar: true, ...props }),
    );
    assert.match(html, /<button[^>]*aria-label="选择项目周期"[^>]*disabled=""/);
    assert.doesNotMatch(html, /role="dialog"/);
  }
});

test('calendar marks range endpoints and interior dates', () => {
  const html = renderToStaticMarkup(
    h(Calendar, { month: '2024-02', value: '2024-02-10', range: ['2024-02-10', '2024-02-12'] }),
  );
  assert.match(html, /aria-multiselectable="true"/);
  assert.equal((html.match(/data-in-range="true"/g) ?? []).length, 3);
  assert.equal((html.match(/data-range-start="true"/g) ?? []).length, 1);
  assert.equal((html.match(/data-range-end="true"/g) ?? []).length, 1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Calendar, DatePicker, DateRangePicker } from '../dist/enterprise-date.js';
const render = (component, props) =>
  renderToString(createSSRApp({ render: () => h(component, props) }));

test('read-only date range passes readonly to both controls and disables actions', async () => {
  const html = await render(DateRangePicker, {
    readonly: true,
    defaultValue: ['2024-02-01', '2024-02-05'],
  });
  assert.equal((html.match(/readonly/g) ?? []).length, 2);
  assert.equal((html.match(/<button[^>]*disabled/g) ?? []).length, 4);
});
test('calendar exposes a named group and month grid with bounded navigation', async () => {
  const html = await render(Calendar, { label: '日期表', month: '0001-01' });
  assert.match(html, /role="group" aria-label="日期表"/);
  assert.match(html, /role="grid" aria-label="1年1月"/);
  assert.match(html, /<button[^>]*disabled[^>]*aria-label="上个月"/);
  const end = await render(Calendar, { month: '9999-12' });
  assert.match(end, /<button[^>]*disabled[^>]*aria-label="下个月"/);
});
test('clearable=false removes the clear action', async () => {
  const html = await render(DatePicker, { defaultValue: '2024-02-01', clearable: false });
  assert.doesNotMatch(html, /清空日期/);
});

test('range calendar is optional and respects disabled and read-only states', async () => {
  const initial = await render(DateRangePicker, { label: '项目周期' });
  assert.doesNotMatch(initial, /aria-label="选择项目周期"/);
  for (const props of [{ disabled: true }, { readonly: true }]) {
    const html = await render(DateRangePicker, { label: '项目周期', showCalendar: true, ...props });
    assert.match(html, /<button[^>]*aria-label="选择项目周期"[^>]*disabled/);
    assert.doesNotMatch(html, /role="dialog"/);
  }
});

test('calendar marks range endpoints and interior dates', async () => {
  const html = await render(Calendar, {
    month: '2024-02',
    modelValue: '2024-02-10',
    range: ['2024-02-10', '2024-02-12'],
  });
  assert.match(html, /aria-multiselectable="true"/);
  assert.equal((html.match(/data-in-range="true"/g) ?? []).length, 3);
  assert.equal((html.match(/data-range-start="true"/g) ?? []).length, 1);
  assert.equal((html.match(/data-range-end="true"/g) ?? []).length, 1);
});

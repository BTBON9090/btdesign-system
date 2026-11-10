import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Badge,
  Card,
  Alert,
  Tabs,
  Dialog,
  Avatar,
  Separator,
  Table,
  Skeleton,
  Progress,
  FormaPlugin,
} from '../dist/index.js';

const render = (component, props = {}, children) =>
  renderToString(createSSRApp({ render: () => h(component, props, children) }));

test('loading buttons disable activation and retain accessible content', async () => {
  const html = await render(Button, { loading: true, variant: 'danger' }, () => '删除');
  assert.match(html, /disabled/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /type="button"/);
  assert.match(html, /f-button--danger/);
  assert.match(html, /删除/);
});

test('form controls pass through native names, labels, and model values', async () => {
  assert.match(
    await render(Input, { modelValue: 'Ada', name: 'name', 'aria-label': '姓名', invalid: true }),
    /value="Ada"/,
  );
  assert.match(await render(Input, { invalid: true }), /aria-invalid="true"/);
  assert.match(await render(Textarea, { modelValue: '需求文档' }), /需求文档/);
  assert.match(
    await render(Select, { modelValue: 'admin' }, () => h('option', { value: 'admin' }, '管理员')),
    /value="admin" selected/,
  );
  assert.match(await render(Checkbox, { modelValue: true, label: '同意' }), /checked/);
  assert.match(
    await render(Checkbox, { indeterminate: true, label: '全部' }),
    /aria-checked="mixed"/,
  );
});

test('select SSR respects initial multi-selection inside option groups', async () => {
  const html = await render(Select, { modelValue: ['editor', 'admin'], multiple: true }, () =>
    h('optgroup', { label: '角色' }, [
      h('option', { value: 'reader' }, '阅读者'),
      h('option', { value: 'editor' }, '编辑者'),
      h('option', { value: 'admin' }, '管理员'),
    ]),
  );
  assert.doesNotMatch(html, /value="reader" selected/);
  assert.match(html, /value="editor" selected/);
  assert.match(html, /value="admin" selected/);
});

test('native value and checked attributes work when v-model is not supplied', async () => {
  assert.match(await render(Input, { value: 'fixed' }), /value="fixed"/);
  assert.match(await render(Textarea, { value: 'plain text' }), /plain text<\/textarea>/);
  assert.match(
    await render(Select, { value: 'b' }, () => [
      h('option', { value: 'a' }, 'A'),
      h('option', { value: 'b' }, 'B'),
    ]),
    /value="b" selected/,
  );
  assert.match(await render(Checkbox, { checked: true, label: '选择' }), /checked/);
  const modelWins = await render(Input, { value: 'native', modelValue: 'controlled' });
  assert.match(modelWins, /value="controlled"/);
  assert.doesNotMatch(modelWins, /value="native"/);
});

test('switch supports accessible state and native form submission', async () => {
  const html = await render(Switch, { modelValue: true, label: '通知', name: 'notifications' });
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /type="hidden" name="notifications" value="on"/);
  const off = await render(Switch, { modelValue: false, name: 'notifications' });
  assert.doesNotMatch(off, /type="hidden"/);
});

test('tabs expose active panel and leave disabled tabs outside tab order', async () => {
  const html = await render(Tabs, {
    id: 'example',
    modelValue: 'vue',
    items: [
      { value: 'react', label: 'React', content: 'React 内容' },
      { value: 'vue', label: 'Vue', content: 'Vue 内容' },
      { value: 'angular', label: 'Angular', disabled: true },
    ],
  });
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-controls="example-panel-1" aria-selected="true" tabindex="0"/);
  assert.match(html, /id="example-panel-0" aria-labelledby="example-tab-0" hidden/);
  assert.match(html, /id="example-panel-1" aria-labelledby="example-tab-1" tabindex="0"/);
  assert.match(html, /aria-selected="false" disabled tabindex="-1"/);
});

test('dialog is server rendered closed and labeled until mounted', async () => {
  const html = await render(
    Dialog,
    { modelValue: true, title: '确认保存', description: '保存主题配置' },
    () => '主题内容',
  );
  assert.match(html, /<dialog[^>]*aria-label="确认保存"/);
  assert.doesNotMatch(html, /<dialog[^>]* open/);
  assert.match(html, /关闭对话框/);
});

test('progress clamps invalid ranges, preventing invalid styles and ARIA', async () => {
  assert.match(
    await render(Progress, { value: 200, max: 100, label: '完成度' }),
    /aria-valuenow="100"/,
  );
  assert.match(await render(Progress, { value: -40 }), /aria-valuenow="0"/);
  assert.match(await render(Progress, { value: NaN, max: 0 }), /width:0%/);
  assert.match(await render(Progress, { value: 25, max: 50 }), /width:50%/);
});

test('all remaining components render semantic content and plugin registers names', async () => {
  const html = await render(Card, {}, () => [
    h(Badge, { variant: 'success' }, () => '成功'),
    h(Alert, { title: '状态', variant: 'info' }, () => '已保存'),
    h(Avatar, { alt: 'Ada', fallback: 'A' }),
    h(Separator),
    h(Skeleton),
    h(Table, { 'aria-label': '成员' }, () => h('tbody', {}, h('tr', {}, h('td', {}, 'Ada')))),
  ]);
  assert.match(html, /f-badge--success/);
  assert.match(html, /role="status"/);
  assert.match(html, /role="region" aria-label="成员"/);
  assert.match(html, /<table/);
  const names = [];
  FormaPlugin.install({
    component: (name) => {
      names.push(name);
    },
  });
  assert.equal(names.length, 16);
  assert.ok(names.includes('FButton') && names.includes('FDialog'));
});

test('cross-framework visual props have equivalent semantics', async () => {
  assert.match(
    await render(Avatar, { name: 'Ada Lovelace' }),
    /aria-label="Ada Lovelace"[^>]*>AL</,
  );
  assert.match(await render(Separator, { orientation: 'vertical' }), /aria-orientation="vertical"/);
  assert.match(await render(Separator, { orientation: 'vertical' }), /f-separator--vertical/);
  assert.match(await render(Skeleton, { width: 120, height: '2rem' }), /width:120px;height:2rem/);
  assert.match(
    await render(Dialog, { modelValue: false, title: 'Save', closeLabel: 'Close' }),
    /aria-label="Close"/,
  );
});

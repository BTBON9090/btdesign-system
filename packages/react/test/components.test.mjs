import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Button,
  Input,
  Checkbox,
  Switch,
  Tabs,
  Dialog,
  Table,
  Progress,
  Avatar,
} from '../dist/index.js';

const render = (component, props, ...children) =>
  renderToStaticMarkup(h(component, props, ...children));

test('loading buttons cannot submit accidentally and communicate busy state', () => {
  const html = render(Button, { loading: true }, 'Save');
  assert.match(html, /type="button"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, />Save<|Save<\/button>/);
});

test('native form attributes and caller error descriptions survive component wrappers', () => {
  const html = render(Input, {
    name: 'email',
    type: 'email',
    required: true,
    'aria-invalid': true,
    'aria-describedby': 'error-message',
  });
  assert.match(html, /name="email"/);
  assert.match(html, /required=""/);
  assert.match(html, /aria-describedby="error-message"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(render(Checkbox, { label: 'Agree', defaultChecked: true }), /checked=""/);
});

test('switch supports label association, boolean state and native form submission values', () => {
  const html = render(Switch, { label: 'Notifications', defaultChecked: true, name: 'notify' });
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /type="hidden" name="notify" value="on"/);
  assert.match(html, /<label[^>]*for="[^"]+"/);
  const unchecked = render(Switch, { label: 'Notifications', name: 'notify' });
  assert.match(unchecked, /type="hidden"[^>]*disabled=""/);
});

test('tabs link controls to their panels and remove inactive panels from display', () => {
  const html = render(Tabs, {
    items: [
      { value: 'one', label: 'One', content: 'First' },
      { value: 'two', label: 'Two', content: 'Second' },
    ],
    defaultValue: 'two',
  });
  assert.equal((html.match(/role="tab"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
  assert.match(html, /hidden=""[^>]*>First<\/div>/);
  assert.match(html, /aria-controls="[^"]+-panel-1"/);
  assert.match(html, /role="tabpanel"[^>]*>Second<\/div>/);
});

test('controlled state takes priority over default state and disabled tabs cannot be selected', () => {
  const checkbox = render(Checkbox, { label: 'Agree', checked: false, readOnly: true });
  assert.doesNotMatch(checkbox, /checked=""/);
  const switchHtml = render(Switch, { label: 'Notify', checked: false, defaultChecked: true });
  assert.match(switchHtml, /aria-checked="false"/);
  const items = [
    { value: 'disabled', label: 'Unavailable', disabled: true },
    { value: 'ready', label: 'Ready' },
  ];
  const tabs = render(Tabs, { items, value: 'disabled' });
  assert.match(tabs, /aria-selected="true"[^>]*>Ready<\/button>/);
  assert.match(tabs, /aria-selected="false"[^>]*disabled=""[^>]*>Unavailable<\/button>/);
});

test('dialog is closed until the client can move it to the native top layer', () => {
  const html = render(
    Dialog,
    { open: true, onOpenChange() {}, title: 'Edit project', description: 'Change project details' },
    'Form',
  );
  assert.match(html, /^<dialog /);
  assert.doesNotMatch(html, / open=/);
  assert.match(html, /aria-labelledby="[^"]+-title"/);
  assert.match(html, /aria-describedby="[^"]+-description"/);
});

test('progress rejects impossible values and has a useful accessible name', () => {
  const high = render(Progress, { value: 400, label: 'Upload', max: 200 });
  assert.match(high, /aria-valuenow="200"/);
  assert.match(high, /aria-valuemax="200"/);
  assert.match(high, /width:100%/);
  const invalid = render(Progress, { value: NaN, max: 0 });
  assert.match(invalid, /aria-valuenow="0"/);
  assert.match(invalid, /aria-valuemax="100"/);
});

test('table preserves captions and avatar has a text alternative', () => {
  const table = render(
    Table,
    {},
    h('caption', {}, 'Team members'),
    h('tbody', {}, h('tr', {}, h('td', {}, 'Aiden'))),
  );
  assert.match(table, /<table[^>]*><caption>Team members<\/caption>/);
  assert.match(render(Avatar, { name: 'Aiden Chen' }), /aria-label="Aiden Chen"[^>]*>AC<\/span>/);
});

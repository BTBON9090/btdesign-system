import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Checkbox, CheckboxGroup, Radio, ToggleGroup } from '../dist/index.js';
const options = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙', disabled: true },
];
const render = (component, props) =>
  renderToString(createSSRApp({ render: () => h(component, props) }));

test('Checkbox exposes mixed state; an icon-only radio retains its accessible label', async () => {
  assert.match(
    await render(Checkbox, { label: '全选', indeterminate: true }),
    /type="checkbox"[^>]*aria-checked="mixed"/,
  );
  const radio = await render(Radio, { 'aria-label': '选择甲', name: 'letter', value: 'a' });
  assert.match(radio, /aria-label="选择甲"[^>]*type="radio"/);
});
test('horizontal checkbox group keeps native checkbox, names, selected and disabled states', async () => {
  const html = await render(CheckboxGroup, {
    options,
    modelValue: ['a'],
    name: 'items',
    label: '项目',
    orientation: 'horizontal',
  });
  assert.match(html, /role="group" aria-label="项目"/);
  assert.match(html, /f-choice-group--horizontal/);
  assert.match(html, /type="checkbox" name="items" value="a"[^>]*checked/);
  assert.match(html, /value="c" disabled/);
});
test('button-style selections retain radio semantics for single and checkbox semantics for multiple', async () => {
  const single = await render(ToggleGroup, { options, modelValue: 'a', label: '城市' });
  const multiple = await render(ToggleGroup, {
    options,
    modelValue: ['a'],
    multiple: true,
    label: '城市',
  });
  assert.match(single, /role="radiogroup"/);
  assert.equal((single.match(/type="radio"/g) ?? []).length, 3);
  assert.match(multiple, /role="group"/);
  assert.equal((multiple.match(/type="checkbox"/g) ?? []).length, 3);
  assert.match(single, /data-disabled="true"/);
});

test('controlled checkbox and button group restore native inputs when parent refuses change', async () => {
  const { createRenderer, markRaw, nextTick } = await import('vue');
  const make = (type) => markRaw({ type, props: {}, children: [], parent: null });
  const walk = (node) => [node, ...node.children.flatMap(walk)];
  const renderer = createRenderer({
    createElement: make,
    createText: (text) => ({ ...make('#text'), text }),
    createComment: (text) => ({ ...make('#comment'), text }),
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.text = text;
      node.children = [];
    },
    patchProp: (node, key, _, value) => {
      node.props[key] = value;
    },
    insert: (node, parent, anchor) => {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
    },
    remove: (node) => {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
  });
  function mount(component, props) {
    const root = make('root');
    const app = renderer.createApp({ render: () => h(component, props) });
    app.mount(root);
    return { inputs: () => walk(root).filter((node) => node.type === 'input'), app };
  }
  const checkboxEvents = [];
  const checkbox = mount(Checkbox, {
    modelValue: false,
    indeterminate: true,
    'onUpdate:modelValue': (value) => checkboxEvents.push(value),
  });
  const checkboxTarget = { checked: true, indeterminate: false };
  checkbox.inputs()[0].props.onChange({ target: checkboxTarget, defaultPrevented: false });
  assert.deepEqual(checkboxEvents, [true]);
  assert.deepEqual(checkboxTarget, { checked: false, indeterminate: true });
  checkbox.app.unmount();

  const changes = [];
  const group = mount(ToggleGroup, {
    options,
    modelValue: 'a',
    'onUpdate:modelValue': (value) => changes.push(value),
  });
  const siblings = [
    { value: 'a', checked: false },
    { value: 'b', checked: true },
  ];
  const target = {
    value: 'b',
    checked: true,
    closest: () => ({ querySelectorAll: () => siblings }),
  };
  group.inputs()[1].props.onChange({ target });
  await nextTick();
  assert.deepEqual(changes, ['b']);
  assert.equal(target.checked, false);
  assert.deepEqual(
    siblings.map((sibling) => sibling.checked),
    [true, false],
  );
  group.app.unmount();
});

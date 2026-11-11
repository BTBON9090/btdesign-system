import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { SearchSelect } from '../dist/search-select.js';
const options = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙', disabled: true },
  { value: 'c', label: '丙' },
];
const render = (props) => renderToString(createSSRApp({ render: () => h(SearchSelect, props) }));
test('single selection exposes a named combobox and submitted value', async () => {
  const html = await render({ id: 'team', label: '团队', name: 'team', options, modelValue: 'a' });
  assert.match(html, /role="combobox"[^>]*aria-label="团队"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /value="甲"/);
  assert.match(html, /type="hidden" name="team" value="a"/);
});
test('multi selection keeps tags, disabled removals and actual form values', async () => {
  const html = await render({
    label: '团队',
    name: 'team',
    options,
    multiple: true,
    modelValue: ['a', 'b'],
  });
  assert.match(html, /aria-label="移除甲"/);
  assert.match(html, /<button type="button" disabled aria-label="移除乙"/);
  assert.equal((html.match(/type="hidden" name="team"/g) ?? []).length, 2);
});
function mount(props) {
  const make = (type) =>
    markRaw({
      type,
      props: {},
      children: [],
      parent: null,
      focus() {
        this.focused = true;
      },
    });
  const walk = (node) => [node, ...node.children.flatMap(walk)];
  const renderer = createRenderer({
    createElement: make,
    createText: (text) => ({ ...make('#text'), text }),
    createComment: (text) => ({ ...make('#comment'), text }),
    setText: (n, t) => {
      n.text = t;
    },
    setElementText: (n, t) => {
      n.text = t;
      n.children = [];
    },
    patchProp: (n, k, _, v) => {
      n.props[k] = v;
    },
    insert: (n, p, a) => {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
      n.parent = p;
      const i = a ? p.children.indexOf(a) : -1;
      p.children.splice(i < 0 ? p.children.length : i, 0, n);
    },
    remove: (n) => {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
    },
    parentNode: (n) => n.parent,
    nextSibling: (n) => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
  });
  const root = make('root');
  const app = renderer.createApp({ render: () => h(SearchSelect, { ...props }) });
  app.mount(root);
  return {
    all: () => walk(root),
    input: () => walk(root).find((node) => node.props.role === 'combobox'),
    app,
  };
}
const key = (value) => ({
  key: value,
  isComposing: false,
  preventDefault() {},
  stopPropagation() {},
});
test('keyboard skips disabled options, selects and reports empty search', async () => {
  const events = [];
  const view = mount({
    options,
    label: '团队',
    'onUpdate:modelValue': (value) => events.push(value),
  });
  view.input().props.onFocus();
  await nextTick();
  view.input().props.onKeydown(key('ArrowDown'));
  await nextTick();
  assert.match(view.input().props['aria-activedescendant'], /-option-0$/);
  view.input().props.onKeydown(key('ArrowDown'));
  await nextTick();
  assert.match(view.input().props['aria-activedescendant'], /-option-2$/);
  view.input().props.onKeydown(key('Enter'));
  await nextTick();
  assert.deepEqual(events, ['c']);
  assert.equal(view.input().props.value, '丙');
  assert.equal(view.input().props['aria-expanded'], false);
  view.input().props.onClick();
  await nextTick();
  assert.equal(view.input().props['aria-expanded'], true);
  view.input().props.onFocus();
  view.input().props.onInput({ target: { value: '不存在' } });
  await nextTick();
  assert.ok(
    view.all().some((node) => node.props.role === 'status' && node.text === '没有匹配的选项'),
  );
  view.input().props.onKeydown(key('Escape'));
  await nextTick();
  assert.equal(view.input().props['aria-expanded'], false);
  view.app.unmount();
});
test('controlled values remain unchanged when parent rejects removal or selection', async () => {
  const events = [];
  const view = mount({
    options,
    multiple: true,
    modelValue: ['a'],
    'onUpdate:modelValue': (value) => events.push(value),
  });
  const remove = view.all().find((node) => node.props['aria-label'] === '移除甲');
  remove.props.onClick();
  await nextTick();
  assert.deepEqual(events, [[]]);
  assert.ok(view.all().some((node) => node.props['aria-label'] === '移除甲'));
  view.input().props.onFocus();
  view.input().props.onKeydown(key('ArrowUp'));
  view.input().props.onKeydown(key('Enter'));
  await nextTick();
  assert.deepEqual(events.at(-1), ['a', 'c']);
  assert.equal(
    view.all().some((node) => node.props['aria-label'] === '移除丙'),
    false,
  );
  view.app.unmount();
});

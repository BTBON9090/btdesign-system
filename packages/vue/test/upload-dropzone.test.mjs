import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, createSSRApp, h, markRaw, nextTick, reactive } from 'vue';
import { renderToString } from '@vue/server-renderer';
const { UploadDropzone } = await import(
  process.env.BT_DROPZONE_TEST_MODULE ?? '../dist/upload-dropzone.js'
);
const file = (name, size, type) => ({ name, size, type });
function mount(input = {}, slots = {}) {
  const make = (type, text = '') =>
    markRaw({
      type,
      text,
      props: {},
      children: [],
      parent: null,
      clicks: 0,
      click() {
        this.clicks++;
      },
      focus() {
        this.focused = true;
      },
    });
  const walk = (node) => [node, ...node.children.flatMap(walk)];
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: (text) => make('#text', text),
    createComment: (text) => make('#comment', text),
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
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
    insert(node, parent, anchor) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
      node.parent = parent;
    },
    remove(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    },
  });
  const props = reactive({ ...input });
  const root = make('root');
  const app = renderer.createApp({ render: () => h(UploadDropzone, props, slots) });
  app.mount(root);
  const all = () => walk(root);
  return {
    props,
    app,
    all,
    wrapper: () => all().find((n) => n.props.class === 'f-upload-dropzone'),
    input: () => all().find((n) => n.type === 'input'),
    trigger: () => all().find((n) => n.type === 'button'),
  };
}
const drag = (files = []) => ({
  dataTransfer: { types: ['Files'], files, dropEffect: '' },
  preventDefault() {
    this.prevented = true;
  },
});

test('button is keyboard-operable and input is hidden without misleading form fields', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () => h(UploadDropzone, { label: '选择附件', multiple: true, accept: '.pdf' }),
    }),
  );
  assert.match(html, /<button[^>]*type="button"[^>]*>选择附件<\/button>/);
  assert.match(html, /<input[^>]*type="file"[^>]*hidden/);
  assert.doesNotMatch(html, /\sname=/);
  const view = mount();
  view.trigger().props.onClick();
  assert.equal(view.input().clicks, 1);
  view.app.unmount();
});

test('picker and drop use shared filtering, report source and rejected reasons', async () => {
  const events = [];
  const view = mount({
    accept: '.pdf',
    multiple: true,
    maxFileSize: 10,
    maxFiles: 2,
    existingCount: 1,
    onFilesChange: (...args) => events.push(args),
  });
  const first = file('a.pdf', 4, 'application/pdf');
  const wrong = file('x.txt', 30, 'text/plain');
  const overflow = file('b.pdf', 6, 'application/pdf');
  const target = { files: [first, wrong, overflow], value: 'selected' };
  view.input().props.onChange({ target });
  await nextTick();
  assert.equal(target.value, '');
  assert.equal(events[0][2], 'picker');
  assert.deepEqual(events[0][0], [first]);
  assert.deepEqual(
    events[0][1].map((item) => item.reasons),
    [['type-not-accepted', 'file-too-large'], ['too-many-files']],
  );
  assert.ok(view.all().some((node) => node.props.role === 'status'));
  assert.ok(view.all().some((node) => node.text.includes('不支持的文件类型')));
  const event = drag([first]);
  view.wrapper().props.onDrop(event);
  await nextTick();
  assert.equal(event.prevented, true);
  assert.equal(events[1][2], 'drop');
  assert.deepEqual(events[1][0], [first]);
  assert.equal(
    view.all().some((node) => node.props.role === 'status'),
    false,
  );
  view.app.unmount();
});

test('nested drag tracking and disabled controls never emit files', async () => {
  const events = [];
  const view = mount({ onFilesChange: (...args) => events.push(args) });
  view.wrapper().props.onDragenter(drag());
  view.wrapper().props.onDragenter(drag());
  await nextTick();
  assert.equal(view.wrapper().props['data-dragging'], true);
  view.wrapper().props.onDragleave(drag());
  await nextTick();
  assert.equal(view.wrapper().props['data-dragging'], true);
  view.props.disabled = true;
  await nextTick();
  assert.equal(view.wrapper().props['data-dragging'], undefined);
  assert.equal(view.trigger().props.disabled, true);
  view.trigger().props.onClick();
  assert.equal(view.input().clicks, 0);
  const event = drag([file('a.pdf', 1, 'application/pdf')]);
  view.wrapper().props.onDrop(event);
  await nextTick();
  assert.equal(event.prevented, true);
  assert.deepEqual(events, []);
  view.app.unmount();
});

test('single-file limit and caller-provided explanatory slot', async () => {
  const events = [];
  const view = mount(
    { onFilesChange: (...args) => events.push(args) },
    { default: () => '企业提示' },
  );
  assert.ok(view.all().some((node) => node.text === '企业提示'));
  const files = [file('a.txt', 1, 'text/plain'), file('b.txt', 1, 'text/plain')];
  view.wrapper().props.onDrop(drag(files));
  await nextTick();
  assert.deepEqual(events[0][0], [files[0]]);
  assert.deepEqual(events[0][1][0].reasons, ['multiple-not-allowed']);
  view.app.unmount();
});

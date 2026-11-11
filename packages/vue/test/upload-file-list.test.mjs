import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, h, markRaw, nextTick, reactive } from 'vue';
import { UploadFileList } from '../dist/upload-file-list.js';

function mount(input) {
  const make = (type, text = '') => markRaw({ type, text, props: {}, children: [], parent: null });
  const walk = (node) => [node, ...node.children.flatMap(walk)];
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: (text) => make('#text', text),
    createComment: (text) => make('#comment', text),
    setText: (n, text) => {
      n.text = text;
    },
    setElementText: (n, text) => {
      n.text = text;
      n.children = [];
    },
    patchProp: (n, key, _, value) => {
      n.props[key] = value;
    },
    parentNode: (n) => n.parent,
    nextSibling: (n) => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
    insert(n, p, anchor) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
      const at = anchor ? p.children.indexOf(anchor) : -1;
      p.children.splice(at < 0 ? p.children.length : at, 0, n);
      n.parent = p;
    },
    remove(n) {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
    },
  });
  const props = reactive(input),
    root = make('root');
  const app = renderer.createApp({ render: () => h(UploadFileList, props) });
  app.mount(root);
  return { props, app, all: () => walk(root) };
}
const find = (view, fn) => view.all().find(fn);
const action = (view, label) =>
  find(view, (node) => node.type === 'button' && node.props['aria-label'] === label);

test('each variant shows real caller state, safe download and determinate progress', () => {
  for (const variant of ['file', 'picture', 'picture-card']) {
    const view = mount({
      items: [
        {
          id: 'a',
          name: '报告.pdf',
          size: 100,
          status: 'uploading',
          progress: 140,
          url: 'https://example.com/a.pdf',
          thumbnailUrl: 'https://example.com/a.png',
        },
      ],
      variant,
    });
    assert.ok(find(view, (n) => n.type === 'ul' && n.props['aria-label'] === '文件列表'));
    assert.ok(find(view, (n) => n.type === 'li'));
    assert.equal(find(view, (n) => n.type === 'progress').props.value, 100);
    assert.equal(find(view, (n) => n.type === 'progress').props['aria-label'], '报告.pdf 上传进度');
    assert.equal(find(view, (n) => n.type === 'a').props.href, 'https://example.com/a.pdf');
    assert.equal(Boolean(find(view, (n) => n.type === 'img')), variant !== 'file');
    assert.equal(view.all().filter((n) => n.type === 'button').length, 0);
    view.app.unmount();
  }
});
test('buttons only appear for supplied handlers and never mutate caller data', async () => {
  const events = [],
    items = [
      {
        id: 'a',
        name: '图片.png',
        status: 'error',
        error: '权限不足',
        thumbnailUrl: '/thumb.png',
      },
    ];
  const view = mount({
    items,
    variant: 'picture-card',
    onRemove: (id) => events.push(['remove', id]),
    onRetry: (id) => events.push(['retry', id]),
    onPreview: (id) => events.push(['preview', id]),
  });
  action(view, '预览 图片.png').props.onClick();
  action(view, '重试 图片.png').props.onClick();
  action(view, '移除 图片.png').props.onClick();
  assert.deepEqual(events, [
    ['preview', 'a'],
    ['retry', 'a'],
    ['remove', 'a'],
  ]);
  assert.deepEqual(items, [
    {
      id: 'a',
      name: '图片.png',
      status: 'error',
      error: '权限不足',
      thumbnailUrl: '/thumb.png',
    },
  ]);
  view.props.disabled = true;
  await nextTick();
  assert.equal(action(view, '移除 图片.png').props.disabled, true);
  action(view, '移除 图片.png').props.onClick();
  assert.equal(events.length, 3);
  view.app.unmount();
});
test('unsafe sources never become img or download, disabled blocks links', async () => {
  const view = mount({
    items: [
      {
        id: 'a',
        name: '恶意',
        url: 'javascript:alert(1)',
        thumbnailUrl: 'data:image/png;base64,xxx',
      },
    ],
    variant: 'picture',
  });
  assert.equal(
    find(view, (n) => n.type === 'a'),
    undefined,
  );
  assert.equal(
    find(view, (n) => n.type === 'img'),
    undefined,
  );
  assert.equal(find(view, (n) => n.props.role === 'img').text, '暂无缩略图');
  view.props.items = [
    {
      id: 'a',
      name: '合法',
      url: '/file.pdf',
      thumbnailUrl: 'blob:https://example.com/id',
    },
  ];
  await nextTick();
  assert.equal(find(view, (n) => n.type === 'img').props.src, 'blob:https://example.com/id');
  assert.ok(find(view, (n) => n.type === 'a'));
  view.props.disabled = true;
  await nextTick();
  assert.equal(
    find(view, (n) => n.type === 'a'),
    undefined,
  );
  view.app.unmount();
});
test('image loading failure is distinct from upload status and URL changes reset fallback', async () => {
  const view = mount({
    items: [{ id: 'a', name: '照片.png', status: 'done', thumbnailUrl: '/a.png' }],
    variant: 'picture',
  });
  find(view, (n) => n.type === 'img').props.onError();
  await nextTick();
  assert.equal(find(view, (n) => n.props.role === 'img').text, '缩略图加载失败');
  assert.ok(view.all().some((n) => n.text === '已完成'));
  view.props.items = [{ id: 'a', name: '照片.png', status: 'done', thumbnailUrl: '/b.png' }];
  await nextTick();
  assert.equal(find(view, (n) => n.type === 'img').props.src, '/b.png');
  view.props.items = [{ id: 'a', name: '照片.png', status: 'done', thumbnailUrl: '/a.png' }];
  await nextTick();
  assert.equal(find(view, (n) => n.type === 'img').props.src, '/a.png');
  view.app.unmount();
});
test('indeterminate progress, file preview and empty state remain semantically correct', () => {
  const view = mount({
    items: [{ id: 'a', name: '文档', status: 'uploading' }],
    onPreview: () => {},
  });
  assert.equal(find(view, (n) => n.type === 'progress').props.value, undefined);
  assert.ok(action(view, '预览 文档'));
  view.app.unmount();
  const empty = mount({ items: [] });
  assert.ok(find(empty, (n) => n.type === 'li' && n.text === '暂无文件'));
  empty.app.unmount();
});

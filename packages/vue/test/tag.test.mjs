import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Tag } from '../dist/tag.js';

test('Tag renders named close action, inherited attrs, tone and disabled state', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          Tag,
          { id: 'tag', tone: 'warning', closable: true, disabled: true, closeLabel: '移除等待' },
          () => '等待',
        ),
    }),
  );
  assert.match(html, /id="tag"[^>]*f-tag--warning/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /<button[^>]*disabled[^>]*aria-label="移除等待"/);
  assert.equal((html.match(/<button/g) ?? []).length, 1);
});

test('Tag close button emits the original click event for the parent to remove the tag', () => {
  const node = (type) => markRaw({ type, props: {}, children: [], parent: null });
  const renderer = createRenderer({
    createElement: node,
    createText: (text) => ({ ...node('#text'), text }),
    createComment: (text) => ({ ...node('#comment'), text }),
    setText: (el, text) => {
      el.text = text;
    },
    setElementText: (el, text) => {
      el.text = text;
    },
    patchProp: (el, key, _prev, value) => {
      el.props[key] = value;
    },
    insert: (el, parent) => {
      el.parent = parent;
      parent.children.push(el);
    },
    remove: () => {},
    parentNode: (el) => el.parent,
    nextSibling: () => null,
  });
  const root = node('root');
  let received;
  renderer
    .createApp({
      render: () =>
        h(
          Tag,
          {
            closable: true,
            onClose: (e) => {
              received = e;
            },
          },
          () => '项目',
        ),
    })
    .mount(root);
  const button = root.children[0].children.find((el) => el.type === 'button');
  const click = { type: 'click' };
  button.props.onClick(click);
  assert.equal(received, click);
});

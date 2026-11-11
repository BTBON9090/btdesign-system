import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { PageHeader } from '../dist/page-header.js';

test('PageHeader renders semantic heading, named back action and content slots', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          PageHeader,
          { id: 'page', title: '项目', headingLevel: 2, onBack: () => {} },
          {
            breadcrumb: () => h('nav', { 'aria-label': '路径' }, '首页'),
            description: () => h('span', {}, '管理工作'),
            actions: () => h('button', {}, '新建'),
          },
        ),
    }),
  );
  assert.match(html, /^<header id="page" class="f-page-header">/);
  assert.match(html, /<nav aria-label="路径">首页<\/nav>/);
  assert.match(html, /<button type="button" class="f-page-header-back" aria-label="返回">/);
  assert.match(html, /<h2 class="f-page-header-title">项目<\/h2>/);
  assert.match(html, /<span>管理工作<\/span>/);
  assert.match(html, /<button>新建<\/button>/);
});
test('PageHeader emits back to the consumer and disables a requested back action without a listener', async () => {
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
  const event = { type: 'click' };
  const listenerEnabled = ref(true);
  const handler = (value) => {
    received = value;
  };
  let received;
  renderer
    .createApp({
      render: () =>
        h(PageHeader, {
          title: '项目',
          showBack: true,
          onBack: listenerEnabled.value ? handler : undefined,
        }),
    })
    .mount(root);
  const find = (el) => (el.type === 'button' ? el : el.children.map(find).find(Boolean));
  const button = find(root);
  assert.equal(button.props.disabled, false);
  button.props.onClick(event);
  assert.equal(received, event);
  listenerEnabled.value = false;
  await nextTick();
  assert.equal(button.props.disabled, true, 'removing a listener disables the back control');
  listenerEnabled.value = true;
  await nextTick();
  assert.equal(button.props.disabled, false, 'restoring a listener re-enables it');
  const disabled = await renderToString(
    createSSRApp({ render: () => h(PageHeader, { title: '项目', showBack: true }) }),
  );
  assert.match(disabled, /f-page-header-back" aria-label="返回" disabled/);
});

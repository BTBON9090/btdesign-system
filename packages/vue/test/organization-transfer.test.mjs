import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, createRenderer, h, markRaw } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { OrganizationTransfer } from '../dist/organization-transfer.js';
const root = { namespace: 'hr', id: 'root' };
const person = { namespace: 'hr', id: 'denied' };
const directory = {
  departments: [
    {
      identity: root,
      parent: null,
      permission: 'allow',
      childrenComplete: true,
      membersComplete: true,
    },
  ],
  people: [{ identity: person, permission: 'deny', membershipsComplete: true }],
  memberships: [{ department: root, person }],
};
const empty = () => ({ departmentRules: [], individuals: [], snapshots: [] });
test('department rules show covered people without implying denied permission', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(OrganizationTransfer, { directory, modelValue: { ...empty(), departmentRules: [root] } }),
    }),
  );
  assert.match(html, /部门规则需由应用按实际组织关系解析/);
  assert.match(html, /已知覆盖或单选成员(?:<!-- -->)? ?0(?:<!-- -->)? ?人/);
  assert.doesNotMatch(html, /移除成员 denied/);
});
test('rejected controlled updates restore the actual checkbox', () => {
  const make = (type) => markRaw({ type, props: {}, children: [], parent: null });
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
    patchProp: (node, key, oldValue, value) => {
      node.props[key] = value;
    },
    insert: (node, parent, anchor) => {
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
  const events = [];
  const host = make('root');
  renderer
    .createApp({
      render: () =>
        h(OrganizationTransfer, {
          directory,
          modelValue: empty(),
          'onUpdate:modelValue': (value) => events.push(value),
        }),
    })
    .mount(host);
  const all = (node) => [node, ...node.children.flatMap(all)];
  const checkbox = all(host).find(
    (node) => node.props['aria-label'] === '持续选择部门 root hr / root',
  );
  assert.ok(checkbox);
  const target = { checked: true };
  checkbox.props.onChange({ target });
  assert.equal(target.checked, false);
  assert.deepEqual(events[0].departmentRules, [root]);
});

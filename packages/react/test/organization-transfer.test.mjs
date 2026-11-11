import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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
test('department rules show covered people without implying denied permission', () => {
  const html = renderToStaticMarkup(
    h(OrganizationTransfer, {
      directory,
      value: { departmentRules: [root], individuals: [], snapshots: [] },
      onValueChange() {},
      onConfirm() {},
    }),
  );
  assert.match(html, /部门规则需由应用按实际组织关系解析/);
  assert.match(html, /已知覆盖或单选成员(?:<!-- -->)? ?0(?:<!-- -->)? ?人/);
  assert.doesNotMatch(html, /移除成员 denied/);
});
test('an empty selection cannot be confirmed', () => {
  const html = renderToStaticMarkup(
    h(OrganizationTransfer, {
      directory,
      value: { departmentRules: [], individuals: [], snapshots: [] },
      onValueChange() {},
      onConfirm() {},
    }),
  );
  assert.match(html, /请选择部门或成员/);
  assert.match(html, /disabled=""[^>]*>确定/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  headerAccountItems,
  headerOrganizationItems,
  systemHeaderExample,
  systemHeaderPreviewOptions,
} from '../src/SystemHeaderExample.ts';

test('system header defaults show each usable area', () => {
  assert.deepEqual(systemHeaderPreviewOptions(), {
    search: true,
    actions: true,
    account: true,
    organization: true,
  });
  assert.ok(headerAccountItems.length > 0);
  assert.ok(headerOrganizationItems.length > 1);
  for (const framework of ['react', 'vue'] as const) {
    const code = systemHeaderExample(framework);
    assert.match(code, /SystemHeader/);
    assert.match(code, /DropdownMenu/);
    assert.match(code, /搜索工作空间/);
    assert.match(code, /演示/);
  }
});

test('area switches affect both framework examples', () => {
  const options = {
    headerSearch: false,
    headerActions: false,
    headerAccount: false,
    headerOrganization: false,
  };
  const react = systemHeaderExample('react', options);
  const vue = systemHeaderExample('vue', options);
  assert.doesNotMatch(react, /search=|actions=|account=|organization=/);
  assert.doesNotMatch(vue, /#search|#actions|#account|#organization/);
  assert.match(react, /brand=/);
  assert.match(vue, /#brand/);
});

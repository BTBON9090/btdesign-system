import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, Fragment, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { AvatarGroup } from '../dist/avatar-group.js';

const avatar = (name) => h('span', { key: name, role: 'img', 'aria-label': name }, name);
const render = (props, children) =>
  renderToString(createSSRApp({ render: () => h(AvatarGroup, props, () => children) }));

test('AvatarGroup limits visible members and describes the remaining count', async () => {
  const html = await render(
    { label: '项目成员', max: 2, size: 'sm', shape: 'square', id: 'team' },
    [avatar('林'), h(Fragment, null, [avatar('王'), avatar('李')])],
  );
  assert.match(html, /id="team"[^>]*role="group"[^>]*aria-label="项目成员"/);
  assert.match(html, /aria-label="林"/);
  assert.match(html, /aria-label="王"/);
  assert.doesNotMatch(html, /aria-label="李"/);
  assert.match(html, /f-avatar--sm[^>]*aria-label="还有 1 个头像"[^>]*>\+1/);
  assert.match(html, /f-avatar--square f-avatar-group-overflow/);
});

test('AvatarGroup shows all members by default, and supports a zero limit', async () => {
  const members = [avatar('林'), avatar('王')];
  const all = await render({}, members);
  assert.match(all, /aria-label="头像组"/);
  assert.doesNotMatch(all, /还有/);
  const none = await render({ max: 0 }, members);
  assert.match(none, /aria-label="还有 2 个头像"[^>]*>\+2/);
  assert.doesNotMatch(none, /aria-label="林"/);
});

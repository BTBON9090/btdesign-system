import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleTransferSelection } from '../dist/transfer-utils.js';

const options = [
  { value: 'design', label: '设计' },
  { value: 'dev', label: '开发' },
  { value: 'locked', label: '受限', disabled: true },
];
test('moving filtered checks leaves hidden checks available when the search is cleared', () => {
  const checked = ['design', 'dev', 'locked'];
  const moving = visibleTransferSelection(options, checked, '开发');
  assert.deepEqual(moving, ['dev']);
  const remaining = checked.filter((key) => !moving.includes(key));
  assert.deepEqual(visibleTransferSelection(options, remaining, ''), ['design']);
  assert.deepEqual(remaining, ['design', 'locked']);
});
test('move action remains unavailable when only hidden or disabled items are checked', () => {
  assert.deepEqual(visibleTransferSelection(options, ['design', 'locked'], '开发'), []);
});

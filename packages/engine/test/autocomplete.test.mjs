import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAutocompleteOptions, moveAutocompleteFocus } from '../dist/autocomplete.js';

const options = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: 'Shanghai', disabled: true },
  { value: 'sz', label: '深圳' },
];

test('local autocomplete filters labels and values without mutating the caller', () => {
  assert.deepEqual(
    filterAutocompleteOptions(options, ' SH ').map((item) => item.value),
    ['sh'],
  );
  assert.deepEqual(
    filterAutocompleteOptions(options, '北').map((item) => item.value),
    ['bj'],
  );
  assert.equal(filterAutocompleteOptions(options, 'not found').length, 0);
  assert.equal(options.length, 3);
});

test('keyboard focus skips disabled entries and does not wrap beyond either boundary', () => {
  assert.equal(moveAutocompleteFocus(options, -1, 1), 0);
  assert.equal(moveAutocompleteFocus(options, 0, 1), 2);
  assert.equal(moveAutocompleteFocus(options, 2, 1), 2);
  assert.equal(moveAutocompleteFocus(options, -1, -1), 2);
  assert.equal(moveAutocompleteFocus(options, 2, -1), 0);
  assert.equal(moveAutocompleteFocus([{ value: 'x', label: 'X', disabled: true }], -1, 1), -1);
});

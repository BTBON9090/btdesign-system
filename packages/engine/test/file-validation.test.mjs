import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFiles } from '../dist/file-validation.js';
const file = (name, size = 1, type = '') => ({ name, size, type });
test('matches case-insensitive extensions, MIME types and standard wildcards', () => {
  const files = [
    file('A.PDF', 2),
    file('photo', 2, 'IMAGE/JPEG'),
    file('document', 2, 'application/pdf'),
    file('music.mp3', 2, 'audio/mpeg'),
  ];
  const result = validateFiles(files, { multiple: true, accept: '.pdf, image/*, application/pdf' });
  assert.deepEqual(result.accepted, files.slice(0, 3));
  assert.deepEqual(
    result.rejected.map(({ index, reasons }) => [index, reasons]),
    [[3, ['type-not-accepted']]],
  );
  assert.strictEqual(result.accepted[0], files[0]);
});
test('unavailable MIME does not masquerade as an accept mismatch or a match', () => {
  const files = [file('unknown.bin'), file('REPORT.PDF'), file('unknown.bin', 1, 'invalid-type')];
  const result = validateFiles(files, { multiple: true, accept: '.pdf, image/*' });
  assert.deepEqual(result.accepted, [files[1]]);
  assert.deepEqual(
    result.rejected.map(({ index, reasons }) => [index, reasons]),
    [
      [0, ['type-unverifiable']],
      [2, ['type-unverifiable']],
    ],
  );
  assert.deepEqual(validateFiles([files[0]], { accept: '.pdf' }).rejected[0].reasons, [
    'type-not-accepted',
  ]);
});
test('type and size failures precede and do not consume count capacity', () => {
  const files = [
    file('bad.txt', 11, 'text/plain'),
    file('a.pdf', 10, 'application/pdf'),
    file('b.pdf', 1, 'application/pdf'),
  ];
  const result = validateFiles(files, {
    multiple: true,
    accept: '.pdf',
    maxFileSize: 10,
    maxFiles: 2,
    existingCount: 1,
  });
  assert.deepEqual(result.accepted, [files[1]]);
  assert.deepEqual(
    result.rejected.map(({ index, reasons }) => [index, reasons]),
    [
      [0, ['type-not-accepted', 'file-too-large']],
      [2, ['too-many-files']],
    ],
  );
});
test('single selection limits this operation, duplicates are retained, existingCount is explicit', () => {
  const same = file('same.txt');
  assert.deepEqual(validateFiles([same, same]).rejected[0].reasons, ['multiple-not-allowed']);
  const both = validateFiles([same, same], { multiple: true, maxFiles: 3, existingCount: 1 });
  assert.equal(both.accepted.length, 2);
  assert.strictEqual(both.accepted[0], same);
  assert.strictEqual(both.accepted[1], same);
  assert.deepEqual(validateFiles([same], { maxFiles: 1, existingCount: 2 }).rejected[0].reasons, [
    'too-many-files',
  ]);
  assert.deepEqual(validateFiles([same], { maxFiles: 0 }).rejected[0].reasons, ['too-many-files']);
});
test('invalid rules and metadata throw instead of silently disabling limits', () => {
  const f = file('x');
  for (const options of [
    { accept: 'application/*' },
    { accept: ', ,' },
    { accept: '.pdf,invalid' },
    { maxFiles: -1 },
    { maxFileSize: NaN },
    { existingCount: 0.5 },
    { multiple: 'yes' },
  ]) {
    assert.throws(() => validateFiles([f], options));
  }
  assert.throws(() => validateFiles([file('bad', -1)]), TypeError);
  assert.deepEqual(validateFiles([f], { accept: '  ' }).accepted, [f]);
  assert.deepEqual(validateFiles([], { multiple: true }), { accepted: [], rejected: [] });
});

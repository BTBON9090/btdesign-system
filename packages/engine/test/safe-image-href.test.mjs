import test from 'node:test';
import assert from 'node:assert/strict';
import { safeImageHref } from '../dist/safe-image-href.js';
test('accepts http(s), valid object URLs and ordinary relative paths', () => {
  for (const value of [
    'https://example.com/image.png',
    'HTTP://example.com/a',
    'blob:https://example.com/3f84',
    'blob:http://localhost:3000/123',
    'blob:null/123',
    '/assets/picture.png',
    '../photo.png',
    './photo.png',
    'images/a.png?size=small',
    '?v=1',
    '#thumbnail',
  ])
    assert.equal(safeImageHref(value), value, value);
  assert.equal(safeImageHref('  /photo.png  '), '/photo.png');
});
test('rejects scripts, unsafe schemes, ambiguous paths and control characters', () => {
  for (const value of [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'java\nscript:alert(1)',
    '\u0000https://example.com/x',
    'data:image/png;base64,AAAA',
    'mailto:x@example.com',
    'tel:123',
    'file:///x',
    'ftp://x/image',
    'vbscript:a',
    '//example.com/x',
    '\\\\example.com\\x',
    '/\\example.com/x',
    'unknown:content',
    'java script:alert(1)',
    'blob:javascript:alert(1)',
    'blob:data:image/png,x',
    'blob:file:///x',
    'blob:null/',
    'https://user:pass@example.com/x',
    'https://',
    '',
    ' \t ',
  ])
    assert.equal(safeImageHref(value), undefined, value);
  for (const value of [undefined, null, 3, {}, false])
    assert.equal(safeImageHref(value), undefined);
});

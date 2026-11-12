import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '../dist/composition.js';
import {
  paginationJumpResolution,
  paginationJumpTarget,
  paginationSizeOptions,
} from '../dist/pagination-utils.js';
const render = (props) =>
  renderToStaticMarkup(h(Pagination, { page: 2, total: 45, pageSize: 10, ...props }));
test('defaults keep legacy markup and pagination semantics', () => {
  const html = render();
  assert.match(
    html,
    /^<nav aria-label="分页导航" class="f-pagination"><ol class="f-pagination-list">/,
  );
  assert.match(html, /aria-label="第 2 页" aria-current="page"/);
  assert.match(html, />上一页<\/button>/);
  assert.doesNotMatch(
    html,
    /f-pagination--|f-pagination-total|f-pagination-jumper|f-pagination-size-select/,
  );
});
test('simple icon mode renders only three items with accessible names', () => {
  const html = render({
    size: 'small',
    simple: true,
    arrow: 'icon',
    showTotal: true,
    showQuickJumper: true,
    pageSizeOptions: [10, 20],
    onPageSizeChange: () => {},
  });
  assert.match(html, /class="f-pagination f-pagination--small"/);
  assert.match(html, /aria-label="上一页"><span aria-hidden="true">‹<\/span>/);
  assert.match(
    html,
    /class="f-pagination-simple" role="status" aria-label="第 2 页，共 5 页">2 \/ 5/,
  );
  assert.match(html, /aria-label="下一页"><span aria-hidden="true">›<\/span>/);
  assert.equal((html.match(/<li>/g) ?? []).length, 3);
  assert.doesNotMatch(html, /f-pagination-total|f-pagination-jumper|f-pagination-size-select/);
});
test('page sizes preserve explicit order, exclude invalid and report the controlled current size', () => {
  const html = render({
    pageSizeOptions: [20, 5, 20, NaN, -1, 2.5],
    onPageSizeChange: () => {},
    showTotal: true,
    showQuickJumper: true,
    onPageChange: () => {},
  });
  assert.match(html, /共 45 条/);
  assert.ok(html.indexOf('f-pagination-total') < html.indexOf('f-pagination-list'));
  assert.match(html, /aria-label="每页条数"/);
  assert.equal((html.match(/value="20"/g) ?? []).length, 1);
  assert.match(html, /<option value="10" selected="">10 条\/页<\/option>/);
  assert.match(html, /aria-label="跳转页码"/);
  assert.doesNotMatch(render({ pageSizeOptions: [20] }), /每页条数/);
  assert.doesNotMatch(
    render({ pageSizeOptions: [0, NaN], onPageSizeChange: () => {} }),
    /每页条数/,
  );
  assert.deepEqual(
    paginationSizeOptions([20, 5, 20, 0, -1, 2.5, NaN, Number.MAX_SAFE_INTEGER + 1]),
    [20, 5],
  );
});
test('disabled, empty datasets and missing callback disable optional controls', () => {
  for (const props of [{ disabled: true }, { total: 0 }]) {
    const html = render({
      ...props,
      showQuickJumper: true,
      pageSizeOptions: [10, 20],
      onPageSizeChange: () => {},
      onPageChange: () => {},
    });
    assert.match(html, /<select[^>]*disabled=""/);
    assert.match(html, /<input[^>]*disabled=""/);
  }
  assert.match(render({ showQuickJumper: true }), /<input[^>]*disabled=""/);
});
test('quick jump recognizes only integers and clamps all out-of-range requests', () => {
  for (const invalid of [
    '',
    ' ',
    '1.2',
    '1e3',
    '1a',
    '-',
    '0x10',
    '9'.repeat(400),
    '-' + '9'.repeat(400),
  ])
    assert.equal(paginationJumpTarget(invalid, 5), undefined, invalid);
  for (const [input, expected] of [
    [' 3 ', 3],
    ['+4', 4],
    ['-99', 1],
    ['0', 1],
    ['99', 5],
  ])
    assert.equal(paginationJumpTarget(input, 5), expected, input);
});
test('only an accepted pending jump normalizes the draft on a controlled page change', () => {
  const pending = { from: 2, target: 5 };
  assert.deepEqual(paginationJumpResolution(pending, 2), { pending });
  assert.deepEqual(paginationJumpResolution(pending, 5), { pending: null, value: '5' });
  assert.deepEqual(paginationJumpResolution(pending, 3), { pending: null });
  assert.deepEqual(paginationJumpResolution(null, 5), { pending: null });
});

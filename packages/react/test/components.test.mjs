import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Button,
  Input,
  Checkbox,
  Switch,
  Tabs,
  Dialog,
  Table,
  Progress,
  Avatar,
} from '../dist/index.js';

const render = (component, props, ...children) =>
  renderToStaticMarkup(h(component, props, ...children));

test('loading buttons cannot submit accidentally and communicate busy state', () => {
  const html = render(Button, { loading: true }, 'Save');
  assert.match(html, /type="button"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, />Save<|Save<\/button>/);
});

test('native form attributes and caller error descriptions survive component wrappers', () => {
  const html = render(Input, {
    name: 'email',
    type: 'email',
    required: true,
    'aria-invalid': true,
    'aria-describedby': 'error-message',
  });
  assert.match(html, /name="email"/);
  assert.match(html, /required=""/);
  assert.match(html, /aria-describedby="error-message"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(render(Checkbox, { label: 'Agree', defaultChecked: true }), /checked=""/);
});

test('switch supports label association, boolean state and native form submission values', () => {
  const html = render(Switch, { label: 'Notifications', defaultChecked: true, name: 'notify' });
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /type="hidden" name="notify" value="on"/);
  assert.match(html, /<label[^>]*for="[^"]+"/);
  const unchecked = render(Switch, { label: 'Notifications', name: 'notify' });
  assert.match(unchecked, /type="hidden"[^>]*disabled=""/);
});

test('tabs link controls to their panels and remove inactive panels from display', () => {
  const html = render(Tabs, {
    items: [
      { value: 'one', label: 'One', content: 'First' },
      { value: 'two', label: 'Two', content: 'Second' },
    ],
    defaultValue: 'two',
  });
  assert.equal((html.match(/role="tab"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
  assert.match(html, /hidden=""[^>]*>First<\/div>/);
  assert.match(html, /aria-controls="[^"]+-panel-1"/);
  assert.match(html, /role="tabpanel"[^>]*>Second<\/div>/);
});

test('controlled state takes priority over default state and disabled tabs cannot be selected', () => {
  const checkbox = render(Checkbox, { label: 'Agree', checked: false, readOnly: true });
  assert.doesNotMatch(checkbox, /checked=""/);
  const switchHtml = render(Switch, { label: 'Notify', checked: false, defaultChecked: true });
  assert.match(switchHtml, /aria-checked="false"/);
  const items = [
    { value: 'disabled', label: 'Unavailable', disabled: true },
    { value: 'ready', label: 'Ready' },
  ];
  const tabs = render(Tabs, { items, value: 'disabled' });
  assert.match(tabs, /aria-selected="true"[^>]*>Ready<\/button>/);
  assert.match(tabs, /aria-selected="false"[^>]*disabled=""[^>]*>Unavailable<\/button>/);
});

test('dialog is closed until the client can move it to the native top layer', () => {
  const html = render(
    Dialog,
    { open: true, onOpenChange() {}, title: 'Edit project', description: 'Change project details' },
    'Form',
  );
  assert.match(html, /^<dialog /);
  assert.doesNotMatch(html, / open=/);
  assert.match(html, /aria-labelledby="[^"]+-title"/);
  assert.match(html, /aria-describedby="[^"]+-description"/);
});

test('progress rejects impossible values and has a useful accessible name', () => {
  const high = render(Progress, { value: 400, label: 'Upload', max: 200 });
  assert.match(high, /aria-valuenow="200"/);
  assert.match(high, /aria-valuemax="200"/);
  assert.match(high, /width:100%/);
  const invalid = render(Progress, { value: NaN, max: 0 });
  assert.match(invalid, /aria-valuenow="0"/);
  assert.match(invalid, /aria-valuemax="100"/);
});

test('table preserves captions and avatar has a text alternative', () => {
  const table = render(
    Table,
    {},
    h('caption', {}, 'Team members'),
    h('tbody', {}, h('tr', {}, h('td', {}, 'Aiden'))),
  );
  assert.match(table, /<table[^>]*><caption>Team members<\/caption>/);
  assert.match(render(Avatar, { name: 'Aiden Chen' }), /aria-label="Aiden Chen"[^>]*>AC<\/span>/);
});

const {
  Field,
  Textarea,
  Select,
  InputGroup,
  InputAddon,
  RadioGroup,
  NumberInput,
  Breadcrumb,
  Pagination,
  EmptyState,
  Spinner,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} = await import('../dist/index.js');
const { numberBounds, clampNumber, stepNativeNumber, paginationState, commitNumberInputBlur } =
  await import('../dist/control-utils.js');

test('Field associates label, help and error with every supported native control', () => {
  for (const Control of [Input, Textarea, Select, NumberInput]) {
    const html = render(
      Field,
      {
        id: 'project',
        label: '项目名称',
        description: '团队可见',
        error: '请填写名称',
        required: true,
        disabled: true,
      },
      h(Control, { name: 'project', 'aria-describedby': 'external-help' }),
    );
    assert.match(html, /<label id="project-label" for="project"/);
    const control = html.match(/<(input|textarea|select)\b[^>]*>/)?.[0];
    assert.ok(control, 'native field exists');
    assert.match(control, /id="project"/);
    assert.match(control, /aria-labelledby="project-label"/);
    assert.match(control, /aria-describedby="external-help project-description project-error"/);
    assert.match(control, /aria-invalid="true"/);
    assert.match(control, /required=""/);
    assert.match(control, /disabled=""/);
    assert.match(html, /id="project-error"[^>]*role="alert"/);
  }
});

test('Field respects explicit control attributes and merges description IDs without duplication', () => {
  const html = render(
    Field,
    { id: 'inherited', label: '继承标签', error: '提示', disabled: true, required: true },
    h(Input, {
      id: 'custom',
      disabled: false,
      required: false,
      'aria-label': '自定义标签',
      'aria-invalid': false,
      'aria-describedby': 'inherited-error extra',
      controlSize: 'sm',
      size: 24,
    }),
  );
  const control = html.match(/<input\b[^>]*>/)?.[0];
  assert.match(control, /id="custom"/);
  assert.match(control, /aria-label="自定义标签"/);
  assert.doesNotMatch(control, /aria-labelledby=/);
  assert.match(control, /aria-describedby="inherited-error extra"/);
  assert.match(control, /aria-invalid="false"/);
  assert.doesNotMatch(control, /disabled=|required=|f-control--invalid/);
  assert.match(control, /size="24"/);
  assert.match(control, /f-control--sm/);
  assert.doesNotMatch(control, /controlSize=/);
});

test('InputGroup preserves one form control and accessible prefix context', () => {
  const html = render(
    Field,
    { id: 'url', label: '工作空间地址', description: '输入子域名' },
    h(
      InputGroup,
      {},
      h(InputAddon, { id: 'url-prefix' }, 'https://'),
      h(Input, { 'aria-describedby': 'url-prefix' }),
      h(InputAddon, {}, '.example.com'),
    ),
  );
  assert.equal((html.match(/<input/g) ?? []).length, 1);
  assert.match(html, /class="f-input-group"/);
  assert.match(html, /aria-describedby="url-prefix url-description"/);
});

test('RadioGroup preserves native grouping, option descriptions and field constraints', () => {
  const html = render(
    Field,
    { id: 'plan', label: '套餐', description: '按团队规模选择', required: true, error: '请选择' },
    h(RadioGroup, {
      name: 'plan',
      defaultValue: 'pro',
      options: [
        { value: 'legacy', label: '旧版', disabled: true },
        { value: 'pro', label: '专业版', description: '适合协作' },
      ],
    }),
  );
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /aria-labelledby="plan-label"/);
  assert.match(html, /aria-required="true"/);
  assert.equal((html.match(/type="radio"/g) ?? []).length, 2);
  const radios = html.match(/<input\b[^>]*>/g);
  assert.match(radios[0], /disabled=""/);
  assert.match(radios[1], /id="plan"/);
  assert.match(radios[1], /name="plan"/);
  assert.match(radios[1], /checked=""/);
  assert.match(radios[0], /aria-labelledby="plan-option-0-label"/);
  assert.match(radios[1], /aria-labelledby="plan-option-1-label"/);
  assert.match(html, /id="plan-option-1-label">专业版<\/span>/);
  assert.doesNotMatch(radios[1], /aria-labelledby="[^"]*description/);
  assert.match(
    radios[1],
    /aria-describedby="plan-description plan-error plan-option-1-description"/,
  );
});

test('NumberInput has native numeric form semantics and bounded stepper buttons', () => {
  const html = render(NumberInput, {
    value: 10,
    min: 0,
    max: 10,
    step: 0.1,
    name: 'budget',
    'aria-label': '预算',
  });
  assert.match(html, /type="number"/);
  assert.match(html, /min="0" max="10" step="0.1"/);
  assert.match(html, /name="budget"/);
  assert.match(html, /value="10"/);
  assert.match(html, /aria-label="增加数值" disabled=""/);
  assert.equal((html.match(/type="button"/g) ?? []).length, 2);
  const empty = render(NumberInput, { defaultValue: '', 'aria-label': '预算' });
  assert.match(empty, /value=""/);
  const invalid = render(NumberInput, {
    value: NaN,
    min: -Infinity,
    max: Infinity,
    step: NaN,
    'aria-label': '预算',
  });
  assert.match(invalid, /value=""/);
  assert.doesNotMatch(invalid, /NaN|Infinity/);
});

test('number blur bounds preserve empty values and reject invalid bounds', () => {
  assert.equal(clampNumber('', 1, 5), '');
  assert.equal(clampNumber(-3, 1, 5), 1);
  assert.equal(clampNumber(8, 1, 5), 5);
  assert.deepEqual(numberBounds(5, 2), { min: 5, max: 5 });
});

test('number step handler delegates native grid results and restores controlled DOM values', () => {
  const cases = [
    { value: 4, result: 4, direction: 1, reason: 'max5 is not on the min0/step2 grid' },
    {
      value: 1.2,
      result: 1.5,
      direction: 1,
      reason: 'off-grid value moves upward to the next valid step',
    },
    {
      value: 1.2,
      result: 1,
      direction: -1,
      reason: 'off-grid value moves downward to the previous valid step',
    },
    { value: 0.2, result: 0.3, direction: 1, reason: 'native decimal result is not recalculated' },
    {
      value: 0.2,
      result: 1.2,
      direction: 1,
      reason: 'native value-attribute base is retained without min',
    },
    { value: '', result: 1, direction: 1, reason: 'empty input follows native increment behavior' },
  ];
  for (const fixture of cases) {
    let calls = 0;
    const input = {
      value: String(fixture.value),
      get valueAsNumber() {
        return Number(this.value);
      },
      validity: {},
      stepUp() {
        assert.equal(fixture.direction, 1);
        calls++;
        this.value = String(fixture.result);
      },
      stepDown() {
        assert.equal(fixture.direction, -1);
        calls++;
        this.value = String(fixture.result);
      },
    };
    assert.equal(
      stepNativeNumber(input, fixture.direction, fixture.value),
      fixture.result,
      fixture.reason,
    );
    assert.equal(calls, 1);
    assert.equal(
      input.value,
      String(fixture.value),
      'controlled DOM must wait for caller acceptance',
    );
  }
});

test('native step failures and invalid candidate values never leak into model state', () => {
  for (const mode of ['throw', 'nonfinite', 'stepMismatch', 'rangeOverflow']) {
    const input = {
      value: '4',
      get valueAsNumber() {
        return Number(this.value);
      },
      validity: {},
      stepUp() {
        this.value = mode === 'nonfinite' ? 'Infinity' : '5';
        if (mode === 'throw') throw new Error('native step unavailable');
        if (mode !== 'nonfinite') this.validity[mode] = true;
      },
      stepDown() {},
    };
    assert.equal(stepNativeNumber(input, 1, 4), 4);
    assert.equal(input.value, '4');
  }
  assert.equal(stepNativeNumber(null, 1, ''), '');
});

test('pagination guards invalid counts and keeps huge datasets bounded', () => {
  assert.deepEqual(paginationState(NaN, -1, 0), { total: 0, page: 1, pageCount: 1, pages: [1] });
  assert.equal(paginationState(100, 25, 10).page, 3);
  assert.equal(paginationState(-1, 25, 10).page, 1);
  const huge = paginationState(500000, 10000000, 10, Infinity);
  assert.equal(huge.pageCount, 1000000);
  assert.ok(huge.pages.length <= 9);
  assert.deepEqual(huge.pages, [1, 'ellipsis', 499999, 500000, 500001, 'ellipsis', 1000000]);
  const html = render(Pagination, { page: 2, total: 45, pageSize: 10 });
  assert.match(html, /<nav[^>]*aria-label="分页导航"/);
  assert.match(html, /aria-label="第 2 页" aria-current="page"/);
  const empty = render(Pagination, { page: 1, total: 0 });
  assert.equal((empty.match(/disabled=""/g) ?? []).length, 3);
});

test('breadcrumb exposes current page and suppresses executable URLs', () => {
  const html = render(Breadcrumb, {
    items: [
      { label: '首页', href: '/' },
      { label: '危险地址', href: 'java\nscript:alert(1)' },
      { label: '当前项目', href: '/current' },
    ],
  });
  assert.match(html, /href="\/"/);
  assert.match(html, /<span aria-current="page">当前项目<\/span>/);
  assert.doesNotMatch(html, /href="\/current"|javascript|java\nscript/);
});

test('compound card and table parts preserve semantic HTML and native attributes', () => {
  const card = render(
    Card,
    {},
    h(CardHeader, {}, h(CardTitle, {}, '团队'), h(CardDescription, {}, '描述')),
    h(CardContent, {}, '内容'),
    h(CardFooter, {}, '操作'),
  );
  assert.match(card, /<h3 class="f-card-title">团队<\/h3>/);
  assert.match(card, /class="f-card-footer"/);
  const table = render(
    Table,
    {},
    h(TableCaption, {}, '账单'),
    h(TableHeader, {}, h(TableRow, {}, h(TableHead, {}, '金额'))),
    h(TableBody, {}, h(TableRow, {}, h(TableCell, { colSpan: 2 }, '100'))),
    h(TableFooter, {}, h(TableRow, {}, h(TableCell, {}, '合计'))),
  );
  assert.match(table, /<caption class="f-table-caption">账单<\/caption>/);
  assert.match(table, /<thead class="f-table-header">/);
  assert.match(table, /<th scope="col"/);
  assert.match(table, /<td colSpan="2"/);
  assert.match(table, /<tfoot class="f-table-footer">/);
});

test('empty state offers a meaningful recovery action and spinner announces its task', () => {
  const html = render(EmptyState, {
    title: '暂无项目',
    description: '创建第一个项目',
    action: h(Button, {}, '创建项目'),
  });
  assert.match(html, /暂无项目/);
  assert.match(html, /class="f-empty-state-action"/);
  assert.match(
    render(Spinner, { label: '加载成员', size: 'sm' }),
    /role="status" aria-label="加载成员"/,
  );
});

test('actual NumberInput blur path never commits read-only, disabled or prevented edits', () => {
  const readonly = render(NumberInput, {
    defaultValue: 20,
    max: 10,
    readOnly: true,
    'aria-label': '只读预算',
  });
  assert.match(readonly, /readonly=""/i);
  assert.match(readonly, /value="20"/);
  assert.equal((readonly.match(/disabled=""/g) ?? []).length, 2);
  const event = { defaultPrevented: false, target: { value: '20', valueAsNumber: 20 } };
  const committed = [];
  for (const options of [{ readOnly: true }, { disabled: true }]) {
    commitNumberInputBlur(event, { max: 10, ...options }, (value) => committed.push(value));
  }
  commitNumberInputBlur({ ...event, defaultPrevented: true }, { max: 10 }, (value) =>
    committed.push(value),
  );
  assert.deepEqual(
    committed,
    [],
    'a protected input must not emit or change internal state on blur',
  );
  commitNumberInputBlur(event, { max: 10 }, (value) => committed.push(value));
  assert.deepEqual(committed, [10], 'editable input still clamps on blur');
  commitNumberInputBlur(
    { defaultPrevented: false, target: { value: '', valueAsNumber: NaN } },
    { min: 1 },
    (value) => committed.push(value),
  );
  assert.deepEqual(committed, [10, ''], 'cleared input is preserved instead of coercing to min');
});

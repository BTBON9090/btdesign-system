import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { stepNativeNumber } from '../dist/number-utils.js';
import {
  Field,
  Input,
  Textarea,
  Select,
  InputGroup,
  InputAddon,
  NumberInput,
  RadioGroup,
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
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '../dist/index.js';

const render = (component, props = {}, children) =>
  renderToString(createSSRApp({ render: () => h(component, props, children) }));

test('Field connects native labels, descriptions, errors and required/disabled state', async () => {
  const html = await render(
    Field,
    {
      id: 'email',
      label: '工作邮箱',
      description: '用于团队邀请',
      error: '邮箱格式有误',
      required: true,
      disabled: true,
    },
    () =>
      h(Input, {
        type: 'email',
        'aria-describedby': 'external email-description',
        controlSize: 'sm',
      }),
  );
  assert.match(html, /<label[^>]+id="email-label"[^>]+for="email"/);
  assert.match(html, /<input[^>]+id="email"[^>]+required[^>]+disabled/);
  assert.match(html, /aria-describedby="external email-description email-error"/);
  assert.match(html, /aria-labelledby="email-label"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /f-control--sm f-control--invalid/);
  assert.match(html, /<p(?=[^>]*id="email-error")(?=[^>]*role="alert")[^>]*>邮箱格式有误/);
});

test('Field assigns stable SSR IDs and honors explicit control attributes', async () => {
  const content = () =>
    h(Field, { label: '说明', error: '请填写' }, () =>
      h(Textarea, {
        id: 'custom',
        invalid: false,
        required: false,
        'aria-label': '自定义名称',
        controlSize: 'lg',
      }),
    );
  const first = await renderToString(createSSRApp({ render: content }));
  const second = await renderToString(createSSRApp({ render: content }));
  assert.equal(first, second);
  assert.match(first, /<textarea[^>]+id="custom"/);
  assert.match(first, /aria-label="自定义名称"/);
  assert.match(first, /aria-invalid="false"/);
  assert.doesNotMatch(first, /<textarea[^>]+aria-labelledby/);
  assert.doesNotMatch(first, /f-control--invalid/);
});

test('Field traverses InputGroup composition and labels native Select controls', async () => {
  const grouped = await render(Field, { id: 'site', label: '网站' }, () =>
    h(InputGroup, {}, () => [h(InputAddon, {}, () => 'https://'), h(Input, { name: 'domain' })]),
  );
  assert.match(grouped, /f-input-addon[^>]*>https:\/\//);
  assert.match(grouped, /<input[^>]+id="site"/);
  const select = await render(Field, { id: 'role', label: '角色', required: true }, () =>
    h(Select, { modelValue: 'editor', controlSize: 'lg' }, () =>
      h('option', { value: 'editor' }, '编辑者'),
    ),
  );
  assert.match(select, /<select[^>]+id="role"[^>]+required/);
  assert.match(select, /f-control--lg/);
  assert.match(select, /value="editor" selected/);
});

test('radio groups expose named native choices and per-option descriptions', async () => {
  const html = await render(
    Field,
    { id: 'plan', label: '订阅方案', description: '选择一个方案', required: true },
    () =>
      h(RadioGroup, {
        name: 'plan',
        modelValue: 'team',
        options: [
          { value: 'free', label: '个人', description: '适合个人项目' },
          { value: 'team', label: '团队' },
          { value: 'enterprise', label: '企业', disabled: true },
        ],
      }),
  );
  assert.match(html, /role="radiogroup"[^>]+aria-labelledby="plan-label"/);
  assert.match(html, /type="radio"[^>]+name="plan"[^>]+value="team" checked/);
  assert.match(html, /<input(?=[^>]*disabled)(?=[^>]*value="enterprise")[^>]*>/);
  assert.match(html, /id="plan-option-0-description">适合个人项目/);
  assert.match(html, /aria-describedby="plan-description plan-option-0-description"/);
  const radios = html.match(/<input\b[^>]*>/g);
  assert.match(radios[0], /aria-labelledby="plan-option-0-label"/);
  assert.match(radios[1], /aria-labelledby="plan-option-1-label"/);
  assert.match(html, /id="plan-option-0-label">个人<\/span>/);
  assert.doesNotMatch(radios[0], /aria-labelledby="[^"]*description/);
});

test('compound cards and tables retain document and table semantics', async () => {
  const html = await render(Card, {}, () => [
    h(CardHeader, {}, () => [
      h(CardTitle, {}, () => '团队'),
      h(CardDescription, {}, () => '共同工作'),
    ]),
    h(CardContent, {}, () =>
      h(Table, {}, () => [
        h(TableCaption, {}, () => '成员'),
        h(TableHeader, {}, () => h(TableRow, {}, () => h(TableHead, {}, () => '姓名'))),
        h(TableBody, {}, () => h(TableRow, {}, () => h(TableCell, {}, () => 'Ada'))),
        h(TableFooter, {}, () =>
          h(TableRow, {}, () => h(TableHead, { scope: 'row' }, () => '合计')),
        ),
      ]),
    ),
    h(CardFooter, {}, () => '一个成员'),
  ]);
  assert.match(html, /<h3 class="f-card-title">团队<\/h3>/);
  assert.match(html, /<caption class="f-table-caption">成员<\/caption>/);
  assert.match(html, /<thead/);
  assert.match(html, /<tbody/);
  assert.match(html, /<tfoot/);
  assert.match(html, /<th scope="col"/);
  assert.match(html, /<th scope="row"/);
});

test('breadcrumb current item is not a link and dangerous link protocols are rejected', async () => {
  const html = await render(Breadcrumb, {
    items: [
      { label: '首页', href: '/' },
      { label: '危险', href: 'java\nscript:alert(1)' },
      { label: '项目', href: '/project' },
    ],
  });
  assert.match(html, /<nav aria-label="面包屑导航"/);
  assert.match(html, /<a href="\/">首页<\/a>/);
  assert.match(html, /<span aria-current="page">项目<\/span>/);
  assert.doesNotMatch(html, /href=".*script/);
  assert.doesNotMatch(html, /href="\/project"/);
});

test('pagination clamps invalid input and limits controls for huge datasets', async () => {
  const html = await render(Pagination, { total: 1000000, page: 50000, pageSize: 10 });
  assert.match(html, /aria-current="page"[^>]*>50000<\/button>/);
  assert.ok((html.match(/<button/g) ?? []).length <= 9);
  assert.equal((html.match(/f-pagination-ellipsis/g) ?? []).length, 2);
  const empty = await render(Pagination, { total: -100, page: Infinity, pageSize: 0 });
  assert.match(empty, /disabled[^>]+aria-label="上一页"/);
  assert.match(empty, /disabled[^>]+aria-label="下一页"/);
  assert.equal((empty.match(/<button[^>]+disabled/g) ?? []).length, 3);
  assert.doesNotMatch(empty, /NaN|Infinity/);
});

test('loading and empty states provide accessible text without fabricated progress', async () => {
  const spinner = await render(Spinner, { label: '正在加载成员', size: 'sm' });
  assert.match(spinner, /role="status" aria-label="正在加载成员"/);
  assert.match(spinner, /aria-hidden="true"/);
  assert.doesNotMatch(spinner, /progressbar|aria-valuenow/);
  const empty = await render(
    EmptyState,
    { title: '暂无项目', description: '创建第一个项目' },
    {
      action: () => h('button', {}, '创建项目'),
    },
  );
  assert.match(empty, /<h3[^>]*>暂无项目<\/h3>/);
  assert.match(empty, /<button>创建项目<\/button>/);
});

// A small Vue host renderer exercises component events and reactive state without a browser dependency.
function mount(component, props = {}, children) {
  const make = (type, text = '') => ({ type, text, props: {}, children: [], parent: null });
  const renderer = createRenderer({
    createElement: (type) => make(type),
    createText: (text) => make('#text', text),
    createComment: (text) => make('#comment', text),
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.text = text;
      node.children = [];
    },
    patchProp: (node, key, _, value) => {
      node.props[key] = value;
      if (key === 'value') node.value = String(value ?? '');
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
    insert(node, parent, anchor = null) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
      node.parent = parent;
    },
    remove(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    },
  });
  const container = make('root');
  const app = renderer.createApp({ render: () => h(component, props, children) });
  app.mount(container);
  const findAll = (type) => {
    const matches = [];
    const visit = (node) => {
      if (node.type === type) matches.push(node);
      node.children.forEach(visit);
    };
    visit(container);
    return matches;
  };
  return { app, findAll };
}

// These tests exercise component event/controlled-state handling. Browser step-grid
// calculation belongs to the native input; provide its result rather than duplicate it.
function provideNativeSteps(node, results) {
  Object.defineProperty(node, 'valueAsNumber', {
    get() {
      return this.value === '' ? NaN : Number(this.value);
    },
  });
  node.validity = {};
  const next = () => {
    assert.ok(results.length, 'unexpected native step');
    node.value = String(results.shift());
  };
  node.stepUp = next;
  node.stepDown = next;
}

test('NumberInput steps decimals, preserves empty values and clamps on blur', async () => {
  const updates = [];
  const view = mount(NumberInput, {
    defaultValue: 0.2,
    step: 0.1,
    min: 0,
    max: 0.4,
    'onUpdate:modelValue': (value) => updates.push(value),
  });
  const input = () => view.findAll('input')[0];
  const plus = () => view.findAll('button')[1];
  provideNativeSteps(input(), [0.3, 0.4, 0.1]);
  plus().props.onClick();
  await nextTick();
  assert.equal(input().props.value, 0.3);
  plus().props.onClick();
  await nextTick();
  assert.equal(input().props.value, 0.4);
  assert.equal(plus().props.disabled, true);
  input().props.onInput({ target: { value: '' } });
  await nextTick();
  assert.equal(input().props.value, '');
  plus().props.onClick();
  await nextTick();
  assert.equal(input().props.value, 0.1);
  input().props.onInput({ target: { value: '7' } });
  await nextTick();
  assert.equal(input().props.value, 7);
  input().props.onBlur({ target: { value: '7' } });
  await nextTick();
  assert.equal(input().props.value, 0.4);
  input().props.onInput({ target: { value: 'NaN' } });
  assert.ok(updates.every((value) => value === '' || Number.isFinite(value)));
  view.app.unmount();
});
test('NumberInput stepper layouts share empty, bounds, stepping and controlled behavior', async () => {
  for (const stepperLayout of ['sides', 'stacked']) {
    const updates = [];
    const view = mount(NumberInput, {
      stepperLayout,
      defaultValue: '',
      min: 0,
      max: 0.2,
      step: 0.1,
      'aria-label': '席位',
      'onUpdate:modelValue': (value) => updates.push(value),
    });
    const input = view.findAll('input')[0];
    const byLabel = (label) =>
      view.findAll('button').find((node) => node.props['aria-label'] === label);
    assert.equal(input.props['aria-label'], '席位');
    assert.equal(input.props.value, '');
    assert.equal(byLabel('减少数值').props.disabled, false);
    assert.equal(byLabel('增加数值').props.disabled, false);
    provideNativeSteps(input, [0.1, 0.2, 0.1, 0]);
    byLabel('增加数值').props.onClick();
    await nextTick();
    byLabel('增加数值').props.onClick();
    await nextTick();
    assert.equal(byLabel('增加数值').props.disabled, true);
    byLabel('减少数值').props.onClick();
    await nextTick();
    byLabel('减少数值').props.onClick();
    await nextTick();
    assert.equal(byLabel('减少数值').props.disabled, true);
    assert.deepEqual(updates, [0.1, 0.2, 0.1, 0]);
    view.app.unmount();

    const controlledUpdates = [];
    const controlled = mount(NumberInput, {
      stepperLayout,
      modelValue: 0.1,
      min: 0,
      max: 0.2,
      step: 0.1,
      'onUpdate:modelValue': (value) => controlledUpdates.push(value),
    });
    provideNativeSteps(controlled.findAll('input')[0], [0.2]);
    controlled
      .findAll('button')
      .find((node) => node.props['aria-label'] === '增加数值')
      .props.onClick();
    await nextTick();
    assert.deepEqual(controlledUpdates, [0.2]);
    assert.equal(controlled.findAll('input')[0].props.value, 0.1);
    controlled.app.unmount();
  }
});

test('controlled number inputs wait for v-model updates; disabled inputs do not emit', async () => {
  const updates = [];
  const controlled = mount(NumberInput, {
    modelValue: 4,
    'onUpdate:modelValue': (value) => updates.push(value),
  });
  provideNativeSteps(controlled.findAll('input')[0], [5]);
  controlled.findAll('button')[1].props.onClick();
  await nextTick();
  assert.deepEqual(updates, [5]);
  assert.equal(controlled.findAll('input')[0].props.value, 4);
  assert.equal(
    controlled.findAll('input')[0].value,
    '4',
    'declined model update must restore DOM value',
  );
  controlled.app.unmount();
  const disabled = mount(NumberInput, {
    modelValue: 4,
    disabled: true,
    'onUpdate:modelValue': (value) => updates.push(value),
  });
  disabled.findAll('button')[1].props.onClick();
  disabled.findAll('input')[0].props.onInput({ target: { value: '9' } });
  assert.deepEqual(updates, [5]);
  disabled.app.unmount();
});

test('RadioGroup and Pagination emit real controlled selection changes', async () => {
  const selection = ref('a');
  const radio = mount({
    setup: () => () =>
      h(RadioGroup, {
        modelValue: selection.value,
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C', disabled: true },
        ],
        'onUpdate:modelValue': (value) => {
          selection.value = value;
        },
      }),
  });
  radio.findAll('input')[1].props.onChange({ target: { checked: true } });
  await nextTick();
  assert.equal(selection.value, 'b');
  assert.equal(radio.findAll('input')[1].props.checked, true);
  radio.findAll('input')[2].props.onChange({ target: { checked: true } });
  assert.equal(selection.value, 'b');
  radio.app.unmount();
  const updates = [];
  const pagination = mount(Pagination, {
    total: 45,
    page: 1,
    'onUpdate:page': (value) => updates.push(value),
  });
  pagination
    .findAll('button')
    .find((button) => button.text === '下一页')
    .props.onClick();
  assert.deepEqual(updates, [2]);
  pagination.app.unmount();
});

test('NumberInput preserves native non-aligned maximum and off-grid step results', async () => {
  const cases = [
    { current: 4, min: 0, max: 5, step: 2, direction: 1, next: 4 },
    { current: 1.2, min: 0.5, max: 5, step: 0.5, direction: 1, next: 1.5 },
    { current: 1.2, min: 0.5, max: 5, step: 0.5, direction: -1, next: 1 },
    { current: 0.2, step: 1, direction: 1, next: 1.2 },
    { current: '', step: 1, direction: 1, next: 1 },
  ];
  for (const fixture of cases) {
    const updates = [];
    const view = mount(NumberInput, {
      defaultValue: fixture.current,
      min: fixture.min,
      max: fixture.max,
      step: fixture.step,
      'onUpdate:modelValue': (value) => updates.push(value),
    });
    provideNativeSteps(view.findAll('input')[0], [fixture.next]);
    view.findAll('button')[fixture.direction > 0 ? 1 : 0].props.onClick();
    await nextTick();
    assert.equal(view.findAll('input')[0].props.value, fixture.next);
    assert.deepEqual(updates, fixture.next === fixture.current ? [] : [fixture.next]);
    view.app.unmount();
  }
});

test('native number stepping handles unavailable APIs and refuses invalid results', () => {
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

test('NumberInput SSR preserves value-based native step base without min', async () => {
  const html = await render(NumberInput, { defaultValue: 0.3, step: 0.2, max: 0.55 });
  assert.match(html, /value="0.3"/);
  assert.match(html, /step="0.2"/);
  assert.doesNotMatch(html, / min=|defaultvalue=/i);
});

test('NumberInput CSR synchronizes native defaultValue on mount and accepted updates', async () => {
  const view = mount(NumberInput, { defaultValue: 0.3, step: 0.2, max: 0.55 });
  const input = view.findAll('input')[0];
  assert.equal(
    input.defaultValue,
    '0.3',
    'value content attribute must establish the same base as SSR/React',
  );
  Object.defineProperty(input, 'valueAsNumber', {
    get() {
      return Number(this.value);
    },
  });
  input.validity = {};
  input.stepUp = function () {
    assert.equal(this.defaultValue, '0.3');
    this.value = '0.5';
  };
  input.stepDown = () => {};
  view.findAll('button')[1].props.onClick();
  await nextTick();
  assert.equal(input.props.value, 0.5);
  assert.equal(
    input.defaultValue,
    '0.5',
    'accepted model changes update the native content attribute too',
  );
  view.app.unmount();

  const updates = [];
  const controlled = mount(NumberInput, {
    modelValue: 0.3,
    step: 0.2,
    max: 0.55,
    'onUpdate:modelValue': (value) => updates.push(value),
  });
  const controlledInput = controlled.findAll('input')[0];
  provideNativeSteps(controlledInput, [0.5]);
  controlled.findAll('button')[1].props.onClick();
  await nextTick();
  assert.deepEqual(updates, [0.5]);
  assert.equal(controlledInput.value, '0.3');
  assert.equal(
    controlledInput.defaultValue,
    '0.3',
    'declined controlled updates preserve both live value and native step base',
  );
  controlled.app.unmount();
});

test('Pagination optional sizes, totals and simple icon mode are semantic and keep defaults', async () => {
  const regular = await render(Pagination, {
    page: 2,
    total: 40,
    size: 'big',
    showTotal: true,
    pageSizeOptions: [20, 20, -1, 1.5, Infinity],
    'onUpdate:pageSize': () => {},
    showQuickJumper: true,
    'onUpdate:page': () => {},
  });
  assert.match(regular, /f-pagination--big/);
  assert.match(regular, /f-pagination-total">共 40 条/);
  assert.match(regular, /aria-label="每页条数"/);
  assert.equal((regular.match(/<option/g) ?? []).length, 2);
  assert.match(regular, /value="10"/);
  assert.match(regular, /aria-label="跳转页码"/);
  const noListener = await render(Pagination, {
    page: 1,
    total: 40,
    pageSizeOptions: [20],
    showQuickJumper: true,
  });
  assert.doesNotMatch(noListener, /f-pagination-size-select/);
  assert.match(noListener, /aria-label="跳转页码"[^>]*disabled/);
  const simple = await render(Pagination, {
    page: 2,
    total: 40,
    simple: true,
    arrow: 'icon',
    showTotal: true,
    showQuickJumper: true,
    pageSizeOptions: [20],
    'onUpdate:pageSize': () => {},
  });
  assert.match(simple, /aria-label="上一页"[^>]*><span aria-hidden="true">‹<\/span>/);
  assert.match(simple, /f-pagination-simple[^>]*>2 \/ 4/);
  assert.match(
    simple,
    /<li><span class="f-pagination-simple" role="status" aria-label="第 2 页，共 4 页">2 \/ 4<\/span><\/li>/,
  );
  assert.doesNotMatch(
    simple,
    /f-pagination-total|f-pagination-size-select|f-pagination-jumper|aria-current/,
  );
});

test('Pagination page size and quick jump emit only valid controlled changes', async () => {
  const pages = [],
    sizes = [];
  const view = mount(Pagination, {
    page: 2,
    total: 100,
    pageSize: 10,
    pageSizeOptions: [10, 20],
    showQuickJumper: true,
    'onUpdate:page': (value) => pages.push(value),
    'onUpdate:pageSize': (value) => sizes.push(value),
  });
  const select = view.findAll('select')[0];
  const target = { value: '20' };
  select.props.onChange({ target });
  assert.deepEqual(sizes, [20]);
  assert.equal(target.value, '10', 'a rejected controlled update restores the original selection');
  assert.deepEqual(pages, []);
  const input = view.findAll('input')[0];
  let prevented = 0;
  const submit = async (value, key = 'Enter', isComposing = false) => {
    input.props.onInput({ target: { value } });
    await nextTick();
    input.props.onKeydown({ key, isComposing, preventDefault: () => prevented++ });
  };
  for (const value of ['', '1.5', '1e2', 'abc', 'Infinity', '9'.repeat(400)]) await submit(value);
  await submit('5', 'Tab');
  await submit('5', 'Enter', true);
  assert.deepEqual(pages, []);
  assert.equal(prevented, 6, 'Enter prevents form submission except during IME composition');
  await submit(' 999 ');
  await submit('-3');
  await submit('2');
  assert.deepEqual(pages, [10, 1]);
  assert.equal(
    input.props.value,
    '2',
    'the application controls page while the draft remains visible',
  );
  view.app.unmount();
});

test('Pagination empty and once listeners do not expose inert actions', async () => {
  const disabled = await render(Pagination, {
    page: 1,
    total: 0,
    pageSizeOptions: [20],
    showQuickJumper: true,
    'onUpdate:page': () => {},
    'onUpdate:pageSize': () => {},
  });
  assert.match(disabled, /<select[^>]*disabled/);
  assert.match(disabled, /aria-label="跳转页码"[^>]*disabled/);
  let sizes = 0,
    pages = 0;
  const view = mount(Pagination, {
    page: 1,
    total: 100,
    pageSizeOptions: [20],
    showQuickJumper: true,
    'onUpdate:pageOnce': () => pages++,
    'onUpdate:pageSizeOnce': () => sizes++,
  });
  view.findAll('select')[0].props.onChange({ target: { value: '20' } });
  const input = view.findAll('input')[0];
  input.props.onInput({ target: { value: '3' } });
  await nextTick();
  input.props.onKeydown({ key: 'Enter', preventDefault: () => {} });
  await nextTick();
  assert.equal(sizes, 1);
  assert.equal(pages, 1);
  assert.equal(view.findAll('select').length, 0);
  assert.equal(view.findAll('input')[0].props.disabled, true);
  view.app.unmount();
});

test('Pagination normalizes a jump only after the parent accepts it and respects later editing', async () => {
  const page = ref(2);
  const updates = [];
  const view = mount({
    setup: () => () =>
      h(Pagination, {
        page: page.value,
        total: 130,
        showQuickJumper: true,
        'onUpdate:page': (value) => updates.push(value),
      }),
  });
  const input = view.findAll('input')[0];
  const edit = async (value) => {
    input.props.onInput({ target: { value } });
    await nextTick();
  };
  const submit = () => input.props.onKeydown({ key: 'Enter', preventDefault() {} });
  await edit('99');
  submit();
  await nextTick();
  assert.deepEqual(updates, [13]);
  assert.equal(input.props.value, '99', 'rejected changes preserve the original input');
  page.value = 13;
  await nextTick();
  await nextTick();
  assert.equal(input.props.value, '13', 'the accepted target replaces the out-of-range draft');
  await edit(' +0013 ');
  submit();
  await nextTick();
  assert.equal(input.props.value, '13', 'the current page is normalized without emitting');
  assert.deepEqual(updates, [13]);
  await edit('8');
  submit();
  await edit('9');
  page.value = 8;
  await nextTick();
  await nextTick();
  assert.equal(input.props.value, '9', 'an edit made while awaiting acceptance is preserved');
  await edit('4');
  submit();
  page.value = 5;
  await nextTick();
  await nextTick();
  page.value = 4;
  await nextTick();
  await nextTick();
  assert.equal(input.props.value, '4', 'unrelated navigation cancels the pending target');
  await edit('draft');
  page.value = 6;
  await nextTick();
  await nextTick();
  assert.equal(
    input.props.value,
    'draft',
    'external navigation does not overwrite an unsubmitted draft',
  );
  view.app.unmount();
});

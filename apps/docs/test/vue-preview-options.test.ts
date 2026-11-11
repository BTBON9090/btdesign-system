import test from 'node:test';
import assert from 'node:assert/strict';
import * as vue from 'vue';
import { createNumberInputVueDemo } from '../src/NumberInputVueDemo';
import type { NumberInputPreviewOptions } from '../src/number-input-example-code';
import { createEnterpriseVueDemo } from '../src/EnterpriseVueDemo';
import { defaultDemoOptions } from '../src/catalog';

type TestNode = {
  type: string;
  text: string;
  props: Record<string, any>;
  children: TestNode[];
  parent: TestNode | null;
};
const node = (type: string, text = ''): TestNode => ({
  type,
  text,
  props: {},
  children: [],
  parent: null,
});
function mount(component: vue.Component) {
  const renderer = vue.createRenderer<TestNode, TestNode>({
    createElement: (type) => node(type),
    createText: (text) => node('#text', text),
    createComment: (text) => node('#comment', text),
    setText: (element, text) => {
      element.text = text;
    },
    setElementText: (element, text) => {
      element.text = text;
      element.children = [];
    },
    patchProp: (element, key, _previous, value) => {
      element.props[key] = value;
    },
    parentNode: (element) => element.parent,
    nextSibling: (element) =>
      element.parent?.children[element.parent.children.indexOf(element) + 1] ?? null,
    insert(element, parent, anchor) {
      if (element.parent)
        element.parent.children.splice(element.parent.children.indexOf(element), 1);
      const position = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(position < 0 ? parent.children.length : position, 0, element);
      element.parent = parent;
    },
    remove(element) {
      if (element.parent)
        element.parent.children.splice(element.parent.children.indexOf(element), 1);
    },
  });
  const host = node('root');
  const app = renderer.createApp(component);
  app.mount(host);
  const find = (type: string): TestNode | undefined => {
    const walk = (element: TestNode): TestNode | undefined =>
      element.type === type ? element : element.children.map(walk).find(Boolean);
    return walk(host);
  };
  return { app, find };
}

test('NumberInput Vue preview preserves entered value while style and state options change', async () => {
  const FakeField = vue.defineComponent({
    setup:
      (_props, { slots }) =>
      () =>
        vue.h('div', slots.default?.()),
  });
  const FakeInput = vue.defineComponent({
    props: ['modelValue', 'stepperLayout', 'disabled'],
    emits: ['update:modelValue'],
    setup:
      (props, { emit }) =>
      () =>
        vue.h('input', {
          value: props.modelValue,
          'data-layout': props.stepperLayout,
          disabled: props.disabled,
          onInput: () => emit('update:modelValue', 13),
        }),
  });
  const Demo = createNumberInputVueDemo(vue, FakeInput, FakeField);
  const options = vue.shallowRef<NumberInputPreviewOptions>({
    stepperLayout: 'sides',
    controlSize: 'md',
    disabled: false,
    invalid: false,
  });
  const view = mount(
    vue.defineComponent({ setup: () => () => vue.h(Demo, { options: options.value }) }),
  );
  const input = view.find('input')!;
  input.props.onInput();
  await vue.nextTick();
  assert.equal(input.props.value, 13);
  options.value = { ...options.value, stepperLayout: 'stacked', disabled: true };
  await vue.nextTick();
  assert.equal(view.find('input'), input);
  assert.equal(input.props.value, 13);
  assert.equal(input.props['data-layout'], 'stacked');
  assert.equal(input.props.disabled, true);
  view.app.unmount();
});

test('enterprise Vue preview preserves selection on presentation changes and resets incompatible multiple mode', async () => {
  const FakeTreeSelect = vue.defineComponent({
    props: ['modelValue', 'multiple', 'disabled'],
    emits: ['update:modelValue'],
    setup:
      (props, { emit }) =>
      () =>
        vue.h('button', {
          'data-value': JSON.stringify(props.modelValue),
          disabled: props.disabled,
          onClick: () => emit('update:modelValue', props.multiple ? ['experience'] : 'experience'),
        }),
  });
  const options = vue.shallowRef({ ...defaultDemoOptions, multiple: false });
  const ui = { TreeSelect: FakeTreeSelect } as unknown as typeof import('@btdesign/vue');
  const view = mount(createEnterpriseVueDemo(vue, ui, 'tree-select', options, () => {}));
  const button = view.find('button')!;
  button.props.onClick();
  await vue.nextTick();
  assert.equal(button.props['data-value'], '"experience"');
  options.value = { ...options.value, state: 'disabled' };
  await vue.nextTick();
  assert.equal(view.find('button'), button);
  assert.equal(button.props['data-value'], '"experience"');
  assert.equal(button.props.disabled, true);
  options.value = { ...options.value, state: 'default', multiple: true };
  await vue.nextTick();
  assert.equal(button.props['data-value'], '["design"]');
  button.props.onClick();
  await vue.nextTick();
  assert.equal(button.props['data-value'], '["experience"]');
  options.value = { ...options.value, multiple: false };
  await vue.nextTick();
  assert.equal(button.props['data-value'], '"design"');
  view.app.unmount();
});

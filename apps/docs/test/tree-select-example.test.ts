import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as vue from 'vue';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { treeSelectExampleCode, treeSelectPreviewOptions } from '../src/TreeSelectExample';
import { treeSelectVuePreview } from '../src/TreeSelectVuePreview';
import { TreeSelectPreview } from '../src/TreeSelectPreview';

test('TreeSelect preview passes the same explicit behavior and defaults to both frameworks', () => {
  const options = treeSelectPreviewOptions({
    multiple: true,
    cascade: true,
    treeSelectSearchable: false,
    treeSelectClearable: false,
    treeSelectShowPath: true,
    treeShowLine: true,
    treeShowIcon: true,
    treeSize: 'big',
    state: 'disabled',
  });
  const react = TreeSelectPreview({ options }).props.children.props;
  const vueNode = treeSelectVuePreview(
    vue,
    { TreeSelect: {} } as typeof import('@btdesign/vue'),
    options,
  );
  const vueProps = (vueNode.children as vue.VNode[])[0].props!;
  for (const key of [
    'label',
    'placeholder',
    'nodes',
    'defaultValue',
    'defaultExpandedKeys',
    'multiple',
    'cascade',
    'searchable',
    'clearable',
    'showPath',
    'size',
    'showLine',
    'disabled',
  ]) {
    assert.deepEqual(react[key], vueProps[key], key);
  }
  assert.deepEqual(react.defaultExpandedKeys, ['team']);
  assert.deepEqual(react.defaultValue, ['design']);
  assert.equal(typeof react.renderIcon, 'function');
  assert.equal(
    typeof ((vueNode.children as vue.VNode[])[0].children as Record<string, unknown>).icon,
    'function',
  );
  assert.equal(treeSelectPreviewOptions().searchable, true);
  assert.equal(treeSelectPreviewOptions().clearable, true);
});

test('TreeSelect generated examples compile and reflect each selected option', () => {
  for (const multiple of [false, true])
    for (const enabled of [false, true]) {
      const options = treeSelectPreviewOptions({
        multiple,
        cascade: enabled,
        treeSelectSearchable: enabled,
        treeSelectClearable: enabled,
        treeSelectShowPath: enabled,
        treeSize: 'small',
        treeShowLine: enabled,
        treeShowIcon: enabled,
        state: enabled ? 'disabled' : 'default',
      });
      const reactCode = treeSelectExampleCode('react', options);
      const vueCode = treeSelectExampleCode('vue', options);
      assert.match(
        reactCode,
        new RegExp(
          `searchable=\\{${enabled}\\} clearable=\\{${enabled}\\} showPath=\\{${enabled}\\}`,
        ),
      );
      assert.match(
        vueCode,
        new RegExp(`:searchable="${enabled}" :clearable="${enabled}" :show-path="${enabled}"`),
      );
      assert.match(reactCode, /defaultExpandedKeys=\{\['team'\]\}/);
      assert.match(vueCode, /:default-expanded-keys="\['team'\]"/);
      assert.equal(reactCode.includes('renderIcon='), enabled);
      assert.equal(vueCode.includes('#icon='), enabled);
      assert.deepEqual(
        ts.transpileModule(reactCode, {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
          reportDiagnostics: true,
        }).diagnostics ?? [],
        [],
      );
      const { descriptor, errors } = parse(vueCode, { filename: 'TreeSelectExample.vue' });
      assert.deepEqual(errors, []);
      assert.doesNotThrow(() => compileScript(descriptor, { id: 'tree-select' }));
      assert.deepEqual(
        compileTemplate({
          source: descriptor.template!.content,
          filename: 'TreeSelectExample.vue',
          id: 'tree-select',
        }).errors,
        [],
      );
    }
});

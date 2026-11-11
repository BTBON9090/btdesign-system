import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as vue from 'vue';
import * as vueUi from '@btdesign/vue';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { tabsDetailExampleCode, tabsDetailOptions } from '../src/TabsDetailExample';
import { TabsDetailPreview } from '../src/TabsDetailPreview';
import { tabsDetailVuePreview } from '../src/TabsDetailVuePreview';

test('both previews receive identical settings and retain the same component identity', () => {
  for (const size of ['mini', 'small', 'medium', 'big'] as const) {
    const options = tabsDetailOptions({
      tabsVariant: 'card',
      orientation: 'vertical',
      tabsDisabledItem: true,
      tabsSize: size,
      tabsShowIcon: true,
    });
    const react = TabsDetailPreview({ options });
    const vueNode = tabsDetailVuePreview(vue, vueUi, options);
    for (const key of ['label', 'items', 'variant', 'orientation', 'size'])
      assert.deepEqual(react.props[key], vueNode.props![key], key);
    assert.equal(react.props.renderIcon(react.props.items[0], 0), '◆');
    assert.equal(vueNode.props!.renderIcon(vueNode.props!.items[0], 0), '◆');
    assert.equal(react.key, null);
    assert.equal(vueNode.key, null);
    assert.equal(
      TabsDetailPreview({ options: { ...options, size: 'big', showIcon: false } }).type,
      react.type,
    );
    assert.equal(
      tabsDetailVuePreview(vue, vueUi, { ...options, size: 'big', showIcon: false }).type,
      vueNode.type,
    );
  }
});

test('both generated examples reflect controls and compile as React/Vue source', () => {
  for (const size of ['mini', 'small', 'medium', 'big'] as const)
    for (const showIcon of [false, true]) {
      const options = tabsDetailOptions({
        tabsVariant: 'line',
        orientation: 'vertical',
        tabsDisabledItem: true,
        tabsSize: size,
        tabsShowIcon: showIcon,
      });
      const react = tabsDetailExampleCode('react', options),
        vueCode = tabsDetailExampleCode('vue', options);
      for (const code of [react, vueCode]) {
        assert.match(code, new RegExp(`size="${size}"`));
        assert.match(code, /variant="line"/);
        assert.match(code, /orientation="vertical"/);
        assert.match(code, /"disabled": true/);
      }
      assert.equal(react.includes('renderIcon='), showIcon);
      assert.equal(vueCode.includes(':render-icon='), showIcon);
      assert.doesNotMatch(vueCode, /#icon/);
      assert.deepEqual(
        ts.transpileModule(react, {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
          reportDiagnostics: true,
        }).diagnostics ?? [],
        [],
      );
      const { descriptor, errors } = parse(vueCode, { filename: 'TabsExample.vue' });
      assert.deepEqual(errors, []);
      assert.doesNotThrow(() => compileScript(descriptor, { id: 'tabs' }));
      assert.deepEqual(
        compileTemplate({
          source: descriptor.template!.content,
          filename: 'TabsExample.vue',
          id: 'tabs',
        }).errors,
        [],
      );
    }
});

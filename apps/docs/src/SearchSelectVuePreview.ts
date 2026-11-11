import { searchSelectPreviewItems, type SearchSelectPreviewOptions } from './SearchSelectExample';
export function searchSelectVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: SearchSelectPreviewOptions,
) {
  return vue.h('div', { class: 'demo-form' }, [
    vue.h(ui.SearchSelect, {
      key: String(options.multiple),
      label: '团队',
      name: 'team',
      options: options.empty ? [] : searchSelectPreviewItems,
      multiple: options.multiple,
      disabled: options.disabled,
    }),
  ]);
}

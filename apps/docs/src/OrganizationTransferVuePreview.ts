import {
  emptyOrganizationSelection,
  type OrganizationSelection,
  type OrganizationConfirmation,
} from '@btdesign/engine';
import { getName, makeDirectory } from './OrganizationTransferFixtures';

export function createOrganizationTransferVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
) {
  const directory = makeDirectory();
  return vue.defineComponent({
    props: { disabled: Boolean },
    setup(props) {
      const value = vue.ref<OrganizationSelection>(emptyOrganizationSelection());
      const message = vue.ref('');
      return () =>
        vue.h('div', [
          vue.h(ui.OrganizationTransfer, {
            directory,
            modelValue: value.value,
            disabled: props.disabled,
            'onUpdate:modelValue': (next: OrganizationSelection) => {
              value.value = next;
            },
            onConfirm: (_next: OrganizationSelection, result: OrganizationConfirmation) => {
              message.value = result.requiresRuleResolution
                ? '已确认；部门规则需由应用解析。'
                : '已确认当前选择。';
            },
            getDepartmentLabel: getName,
            getPersonLabel: getName,
          }),
          vue.h('p', { role: 'status' }, message.value),
        ]);
    },
  });
}

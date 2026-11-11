import type { Framework, DemoOptions } from './component-types';
import { labels, makeDirectory } from './OrganizationTransferFixtures';

export function organizationTransferExampleCode(framework: Framework, options?: DemoOptions) {
  const directory = JSON.stringify(makeDirectory(), null, 2);
  const disabled = options?.state === 'disabled';
  const common = `const directory: OrganizationDirectory = ${directory};\nconst labels: Record<string, string> = ${JSON.stringify(labels, null, 2)};\n// 应用负责加载真实目录、解析持续规则并再次校验权限。\nconst label = (identity: OrganizationIdentity) => labels[identity.namespace + '/' + identity.id] ?? identity.id;`;
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { OrganizationTransfer } from '@btdesign/vue';\nimport { emptyOrganizationSelection, type OrganizationDirectory, type OrganizationIdentity, type OrganizationSelection, type OrganizationConfirmation } from '@btdesign/engine';\nimport '@btdesign/tokens/styles.css';\n${common}\nconst value = ref<OrganizationSelection>(emptyOrganizationSelection());\nfunction confirm(selection: OrganizationSelection, result: OrganizationConfirmation) {\n  console.log(selection, result);\n}\n</script>\n\n<template>\n  <OrganizationTransfer v-model="value" :directory="directory" :get-department-label="label" :get-person-label="label"${disabled ? ' disabled' : ''} @confirm="confirm" />\n</template>`;
  }
  return `import { useState } from 'react';\nimport { OrganizationTransfer } from '@btdesign/react';\nimport { emptyOrganizationSelection, type OrganizationDirectory, type OrganizationIdentity, type OrganizationSelection, type OrganizationConfirmation } from '@btdesign/engine';\nimport '@btdesign/tokens/styles.css';\n${common}\nexport default function Example() {\n  const [value, setValue] = useState<OrganizationSelection>(emptyOrganizationSelection);\n  function confirm(selection: OrganizationSelection, result: OrganizationConfirmation) {\n    console.log(selection, result);\n  }\n  return <OrganizationTransfer directory={directory} value={value} onValueChange={setValue} onConfirm={confirm} getDepartmentLabel={label} getPersonLabel={label}${disabled ? ' disabled' : ''} />;\n}`;
}

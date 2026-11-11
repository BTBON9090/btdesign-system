import type { TagTone } from '@btdesign/react';

export interface TagPreviewOptions {
  tone: TagTone;
  closable: boolean;
  disabled: boolean;
}

/** Generated example owns visibility, just like the interactive preview. */
export function tagExampleCode(framework: 'react' | 'vue', options: TagPreviewOptions): string {
  const { tone, closable, disabled } = options;
  const props = ` tone="${tone}"${closable ? ' closable closeLabel="移除设计系统标签"' : ''}${disabled ? ' disabled' : ''}`;
  if (!closable) {
    return framework === 'react'
      ? `import { Tag } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return <Tag${props}>设计系统</Tag>;\n}`
      : `<script setup lang="ts">\nimport { Tag } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  <Tag${props}>设计系统</Tag>\n</template>`;
  }
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { Tag, Button } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst visible = ref(true);\n</script>\n\n<template>\n  <Tag v-if="visible"${props} @close="visible = false">设计系统</Tag>\n  <Button v-else variant="secondary" @click="visible = true">恢复标签</Button>\n</template>`;
  }
  return `import { useState } from 'react';\nimport { Tag, Button } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  const [visible, setVisible] = useState(true);\n  return visible\n    ? <Tag${props} onClose={() => setVisible(false)}>设计系统</Tag>\n    : <Button variant="secondary" onClick={() => setVisible(true)}>恢复标签</Button>;\n}`;
}

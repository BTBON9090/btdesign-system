export interface BadgePreviewOptions {
  mode: 'status' | 'count' | 'dot';
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  target: 'standalone' | 'avatar' | 'text';
  count: 0 | 8 | 120;
  showZero: boolean;
}

export function badgeExampleCode(framework: 'react' | 'vue', options: BadgePreviewOptions) {
  const { mode, variant, target, count, showZero } = options;
  const useAvatar = mode !== 'status' && target === 'avatar';
  const imports = useAvatar ? 'Badge, Avatar' : 'Badge';
  const props = ` variant="${variant}"${mode === 'dot' ? ` dot ${framework === 'vue' ? 'badge-label' : 'badgeLabel'}="有新消息"` : mode === 'count' ? (framework === 'vue' ? ` :count="${count}"${showZero ? ' show-zero' : ''} badge-label="${count} 条未读消息"` : ` count={${count}}${showZero ? ' showZero' : ''} badgeLabel="${count} 条未读消息"`) : ''}`;
  const child =
    mode === 'status'
      ? '已发布'
      : target === 'avatar'
        ? '<Avatar name="林晓" />'
        : target === 'text'
          ? '<span>消息</span>'
          : '';
  const badge = child ? `<Badge${props}>${child}</Badge>` : `<Badge${props} />`;
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { ${imports} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n</script>\n\n<template>\n  ${badge}\n</template>`;
  }
  return `import { ${imports} } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  return ${badge};\n}`;
}

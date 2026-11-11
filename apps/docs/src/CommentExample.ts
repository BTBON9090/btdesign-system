import type { DemoOptions, Framework } from './component-types';

export interface CommentPreviewOptions {
  alignment: 'start' | 'end';
  nested: boolean;
  showActions: boolean;
}

export function commentPreviewOptions(options?: DemoOptions): CommentPreviewOptions {
  return {
    alignment: options?.commentAlignment ?? 'start',
    nested: options?.commentNested ?? false,
    showActions: options?.commentActions ?? true,
  };
}

/** Build a complete example with the same visible variants as the preview. */
export function commentExampleCode(framework: Framework, options: CommentPreviewOptions) {
  const vue = framework === 'vue';
  if (vue) {
    const refImport = options.showActions ? "import { ref } from 'vue';\n" : '';
    const state = options.showActions
      ? "\nconst liked = ref(false);\nconst reply = () => console.info('回复示例');\n"
      : '';
    const actions = options.showActions
      ? `\n  <template #actions>\n    <Button variant="ghost" size="sm" :aria-pressed="liked" @click="liked = !liked">{{ liked ? '已赞' : '赞' }}</Button>\n    <Button variant="ghost" size="sm" @click="reply">回复</Button>\n  </template>`
      : '';
    const nested = options.nested
      ? '\n  <Comment author="王宁" time="刚刚" content="收到，我们一起检查。" />'
      : '';
    return `<script setup lang="ts">\n${refImport}import { Comment, Avatar${options.showActions ? ', Button' : ''} } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n${state}</script>\n\n<template>\n<Comment author="林晓" time="1 小时前" content="建议补充表单校验。" alignment="${options.alignment}">\n  <template #avatar><Avatar name="林晓" /></template>${actions}${nested}\n</Comment>\n</template>`;
  }
  const reactImport = options.showActions ? "import { useState } from 'react';\n" : '';
  const state = options.showActions
    ? "  const [liked, setLiked] = useState(false);\n  const reply = () => console.info('回复示例');\n"
    : '';
  const actions = options.showActions
    ? ` actions={<><Button variant="ghost" size="sm" aria-pressed={liked} onClick={() => setLiked(!liked)}>{liked ? '已赞' : '赞'}</Button><Button variant="ghost" size="sm" onClick={reply}>回复</Button></>}`
    : '';
  const nested = options.nested
    ? '\n    <Comment author="王宁" time="刚刚" content="收到，我们一起检查。" />\n  '
    : '';
  return `${reactImport}import { Comment, Avatar${options.showActions ? ', Button' : ''} } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n${state}  return <Comment author="林晓" time="1 小时前" content="建议补充表单校验。" alignment="${options.alignment}" avatar={<Avatar name="林晓" />} ${actions}>${nested}</Comment>;\n}`;
}

import { Field, Mention } from '@btdesign/react';
import type { DemoOptions, Framework } from './component-types';

type MentionPreviewOptions = DemoOptions & { mentionEmpty?: boolean };
const people = [
  { value: 'lin', label: '林晓' },
  { value: 'alex', label: 'Alex Chen', disabled: true },
  { value: 'wang', label: '王宁' },
];

export function MentionPreview({ options }: { options: MentionPreviewOptions }) {
  const invalid = options.state === 'invalid';
  return (
    <Field className="demo-form" label="消息" error={invalid ? '请检查输入内容。' : undefined}>
      <Mention
        name="message"
        options={options.mentionEmpty ? [] : people}
        controlSize={options.size}
        disabled={options.state === 'disabled'}
        invalid={invalid}
        placeholder="输入 @ 提及成员"
      />
    </Field>
  );
}

export function mentionVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: MentionPreviewOptions,
) {
  const invalid = options.state === 'invalid';
  return vue.h(
    ui.Field,
    { class: 'demo-form', label: '消息', error: invalid ? '请检查输入内容。' : undefined },
    () =>
      vue.h(ui.Mention, {
        name: 'message',
        options: options.mentionEmpty ? [] : people,
        controlSize: options.size,
        disabled: options.state === 'disabled',
        invalid,
        placeholder: '输入 @ 提及成员',
      }),
  );
}

export function mentionExample(framework: Framework, options: MentionPreviewOptions) {
  const disabled = options.state === 'disabled' ? ' disabled' : '';
  const invalid = options.state === 'invalid';
  const error = invalid ? ' error="请检查输入内容。"' : '';
  const control = ` controlSize="${options.size}"${disabled}${invalid ? ' invalid' : ''}`;
  const choices = options.mentionEmpty
    ? '[]'
    : "[{ value: 'lin', label: '林晓' }, { value: 'alex', label: 'Alex Chen', disabled: true }, { value: 'wang', label: '王宁' }]";
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { Field, Mention } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\nconst people: { value: string; label: string; disabled?: boolean }[] = ${choices};\n</script>\n\n<template>\n<Field label="消息"${error}>\n  <Mention name="message"${control} :options="people" placeholder="输入 @ 提及成员" />\n</Field>\n</template>`;
  }
  return `import { Field, Mention } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  const people: { value: string; label: string; disabled?: boolean }[] = ${choices};\n  return (\n    <Field label="消息"${error}>\n      <Mention name="message"${control} options={people} placeholder="输入 @ 提及成员" />\n    </Field>\n  );\n}`;
}

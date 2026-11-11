import { useState } from 'react';
import { Field, Upload } from '@btdesign/react';
import type { DemoOptions, Framework } from './component-types';

type UploadPreviewOptions = DemoOptions & {
  uploadMultiple?: boolean;
  uploadAccept?: 'any' | 'image' | 'text';
};
const acceptValue = (value: UploadPreviewOptions['uploadAccept']) =>
  value === 'image' ? 'image/*' : value === 'text' ? '.txt' : undefined;

export function UploadPreview({ options }: { options: UploadPreviewOptions }) {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div className="demo-form">
      <Field label="选择文件" description="选择的文件会交给应用处理。">
        <Upload
          name="files"
          accept={acceptValue(options.uploadAccept)}
          multiple={options.uploadMultiple}
          controlSize={options.size}
          disabled={options.state === 'disabled'}
          onFilesChange={(files) => setNames(files.map((file) => file.name))}
        />
      </Field>
      {names.length > 0 && <p aria-live="polite">已选择：{names.join('、')}</p>}
    </div>
  );
}

export function uploadVuePreview(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  options: UploadPreviewOptions,
) {
  const Demo = vue.defineComponent({
    setup() {
      const names = vue.ref<string[]>([]);
      return () =>
        vue.h('div', { class: 'demo-form' }, [
          vue.h(ui.Field, { label: '选择文件', description: '选择的文件会交给应用处理。' }, () =>
            vue.h(ui.Upload, {
              name: 'files',
              accept: acceptValue(options.uploadAccept),
              multiple: options.uploadMultiple,
              controlSize: options.size,
              disabled: options.state === 'disabled',
              onFilesChange: (files: File[]) => {
                names.value = files.map((file) => file.name);
              },
            }),
          ),
          names.value.length
            ? vue.h('p', { 'aria-live': 'polite' }, `已选择：${names.value.join('、')}`)
            : null,
        ]);
    },
  });
  return vue.h(Demo);
}

export function uploadExample(framework: Framework, options: UploadPreviewOptions) {
  const disabled = options.state === 'disabled' ? ' disabled' : '';
  const multiple = options.uploadMultiple ? ' multiple' : '';
  const accept = acceptValue(options.uploadAccept);
  const acceptProp = accept ? ` accept="${accept}"` : '';
  const common = ` name="files" controlSize="${options.size}"${acceptProp}${multiple}${disabled}`;
  if (framework === 'vue') {
    return `<script setup lang="ts">\nimport { Field, Upload } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n\nfunction handleFiles(files: File[]) {\n  console.log('选择的文件', files);\n}\n</script>\n\n<template>\n  <Field label="选择文件" description="选择的文件会交给应用处理。">\n    <Upload${common} @files-change="handleFiles" />\n  </Field>\n</template>`;
  }
  return `import { Field, Upload } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\nexport default function Example() {\n  function handleFiles(files: File[]) {\n    console.log('选择的文件', files);\n  }\n  return (\n    <Field label="选择文件" description="选择的文件会交给应用处理。">\n      <Upload${common} onFilesChange={handleFiles} />\n    </Field>\n  );\n}`;
}

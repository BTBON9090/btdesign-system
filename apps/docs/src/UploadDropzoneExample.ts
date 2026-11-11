import type { Framework } from './component-types';

export type DropzoneSource = 'picker' | 'drop';
export type DropzoneRejection = { file: File; index: number; reasons: string[] };
export type DropzoneResult = { accepted: string[]; source: DropzoneSource };
export interface UploadDropzonePreviewOptions {
  accept?: string;
  multiple: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  existingCount: number;
  disabled: boolean;
}
export type UploadDropzonePreviewFields = {
  uploadDropzoneAccept?: 'any' | 'image' | 'text';
  uploadDropzoneMultiple?: boolean;
  uploadDropzoneSizeLimit?: boolean;
  uploadDropzoneCountLimit?: boolean;
  uploadDropzoneExisting?: boolean;
  state?: 'default' | 'disabled' | 'invalid' | 'loading';
};
export function uploadDropzonePreviewOptions(
  options?: UploadDropzonePreviewFields,
): UploadDropzonePreviewOptions {
  return {
    accept:
      options?.uploadDropzoneAccept === 'image'
        ? 'image/*'
        : options?.uploadDropzoneAccept === 'text'
          ? '.txt'
          : undefined,
    multiple: options?.uploadDropzoneMultiple ?? true,
    maxFileSize: options?.uploadDropzoneSizeLimit ? 1024 * 1024 : undefined,
    maxFiles: options?.uploadDropzoneCountLimit ? 3 : undefined,
    existingCount: options?.uploadDropzoneExisting ? 1 : 0,
    disabled: options?.state === 'disabled',
  };
}
export function dropzoneResult(
  accepted: File[],
  _rejected: DropzoneRejection[],
  source: DropzoneSource,
): DropzoneResult {
  return { accepted: accepted.map((file) => file.name), source };
}
export function uploadDropzoneExampleCode(
  framework: Framework,
  options: UploadDropzonePreviewOptions,
) {
  const attrs = `accept=${JSON.stringify(options.accept ?? '')} multiple={${options.multiple}} maxFileSize={${options.maxFileSize ?? 'undefined'}} maxFiles={${options.maxFiles ?? 'undefined'}} existingCount={${options.existingCount}} disabled={${options.disabled}}`;
  if (framework === 'react')
    return `import { useState } from 'react';\nimport { UploadDropzone } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n\ntype Rejection = { file: File; index: number; reasons: string[] };\ntype Result = { accepted: string[]; source: 'picker' | 'drop' };\n\nexport default function Example() {\n  const [result, setResult] = useState<Result | null>(null);\n  function handleFiles(accepted: File[], _rejected: Rejection[], source: 'picker' | 'drop') {\n    setResult({ accepted: accepted.map(file => file.name), source });\n  }\n  return <div>\n    <UploadDropzone label="选择或拖放文件" ${attrs} onFilesChange={handleFiles} />\n    <p>文件仅在本地处理，不会上传。</p>\n    {result && <div aria-live="polite"><p>来源：{result.source === 'drop' ? '拖放' : '文件选择'}</p><p>已接受：{result.accepted.join('、') || '无'}</p></div>}\n  </div>;\n}`;
  return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { UploadDropzone } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\ntype Rejection = { file: File; index: number; reasons: string[] };\ntype Result = { accepted: string[]; source: 'picker' | 'drop' };\nconst result = ref<Result | null>(null);\nfunction handleFiles(accepted: File[], _rejected: Rejection[], source: 'picker' | 'drop') {\n  result.value = { accepted: accepted.map(file => file.name), source };\n}\n</script>\n\n<template>\n  <UploadDropzone label="选择或拖放文件" accept="${options.accept ?? ''}" :multiple="${options.multiple}" :max-file-size="${options.maxFileSize ?? 'undefined'}" :max-files="${options.maxFiles ?? 'undefined'}" :existing-count="${options.existingCount}" :disabled="${options.disabled}" @files-change="handleFiles" />\n  <p>文件仅在本地处理，不会上传。</p>\n  <div v-if="result" aria-live="polite"><p>来源：{{ result.source === 'drop' ? '拖放' : '文件选择' }}</p><p>已接受：{{ result.accepted.join('、') || '无' }}</p></div>\n</template>`;
}

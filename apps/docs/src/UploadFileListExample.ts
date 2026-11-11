import type { Framework } from './component-types';
export type UploadFileListPreviewVariant = 'file' | 'picture' | 'picture-card';
export type UploadFileListPreviewStatus = 'mixed' | 'ready' | 'uploading' | 'done' | 'error';
export type UploadFileListPreviewOptions = {
  variant: UploadFileListPreviewVariant;
  status: UploadFileListPreviewStatus;
  disabled: boolean;
};
export type UploadFileListPreviewFields = {
  uploadFileListVariant?: UploadFileListPreviewVariant;
  uploadFileListStatus?: UploadFileListPreviewStatus;
  state?: 'default' | 'disabled' | 'invalid' | 'loading';
};
export const uploadFileListImage = '/examples/file-preview.svg';
export const uploadFileListSample = [
  {
    id: 'cover',
    name: '项目封面.png',
    size: 256000,
    thumbnailUrl: uploadFileListImage,
    alt: '项目封面',
    status: 'done' as const,
  },
  {
    id: 'scene',
    name: '界面设计.png',
    size: 512000,
    thumbnailUrl: uploadFileListImage,
    alt: '界面设计',
    status: 'uploading' as const,
    progress: 64,
  },
  {
    id: 'draft',
    name: '设计草稿.png',
    size: 128000,
    thumbnailUrl: uploadFileListImage,
    alt: '设计草稿',
    status: 'error' as const,
    error: '传输中断',
  },
];
export function uploadFileListPreviewOptions(
  options?: UploadFileListPreviewFields,
): UploadFileListPreviewOptions {
  return {
    variant: options?.uploadFileListVariant ?? 'file',
    status: options?.uploadFileListStatus ?? 'mixed',
    disabled: options?.state === 'disabled',
  };
}
export function uploadFileListPreviewItems(
  ids: readonly string[],
  status: UploadFileListPreviewStatus,
) {
  return uploadFileListSample
    .filter((item) => ids.includes(item.id))
    .map((item) =>
      status === 'mixed'
        ? item
        : {
            ...item,
            status,
            progress: status === 'uploading' ? 64 : undefined,
            error: status === 'error' ? '传输中断' : undefined,
          },
    );
}
export function uploadFileListExampleCode(
  framework: Framework,
  options: UploadFileListPreviewOptions,
) {
  const items = JSON.stringify(
    uploadFileListPreviewItems(
      uploadFileListSample.map((item) => item.id),
      options.status,
    ),
  );
  if (framework === 'vue')
    return `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { UploadFileList } from '@btdesign/vue';\nimport type { UploadFileItem } from '@btdesign/vue';\nimport '@btdesign/tokens/styles.css';\n// 将示例图片地址替换为应用自己的资源。\nconst items = ref<UploadFileItem[]>(${items});\nconst preview = ref('');\nconst message = ref('');\nfunction remove(id: string) { items.value = items.value.filter(item => item.id !== id); if (preview.value === id) preview.value = ''; }\nfunction retry(id: string) { message.value = '已请求重试：' + (items.value.find(item => item.id === id)?.name ?? id); }\n</script>\n\n<template>\n  <UploadFileList :items="items" variant="${options.variant}" :disabled="${options.disabled}" @remove="remove" @retry="retry" @preview="id => preview = id" />\n  <p v-if="message" role="status">{{ message }}</p>\n  <div v-for="item in items.filter(item => item.id === preview)" :key="item.id"><p>{{ item.name }}</p><img :src="item.thumbnailUrl" :alt="item.alt" width="160" /><button type="button" @click="preview = ''">关闭预览</button></div>\n</template>`;
  return `import { useState } from 'react';\nimport { UploadFileList } from '@btdesign/react';\nimport type { UploadFileItem } from '@btdesign/react';\nimport '@btdesign/tokens/styles.css';\n// 将示例图片地址替换为应用自己的资源。\nconst initial: UploadFileItem[] = ${items};\n\nexport default function Example() {\n  const [items, setItems] = useState(initial);\n  const [preview, setPreview] = useState('');\n  const [message, setMessage] = useState('');\n  const selected = items.find(item => item.id === preview);\n  return <><UploadFileList items={items} variant="${options.variant}" disabled={${options.disabled}} onRemove={id => { setItems(current => current.filter(item => item.id !== id)); if (preview === id) setPreview(''); }} onRetry={id => setMessage('已请求重试：' + (items.find(item => item.id === id)?.name ?? id))} onPreview={setPreview} />\n    {message && <p role="status">{message}</p>}\n    {selected && <div><p>{selected.name}</p><img src={selected.thumbnailUrl} alt={selected.alt} width="160" /><button type="button" onClick={() => setPreview('')}>关闭预览</button></div>}\n  </>;\n}`;
}

export interface AnchorPreviewOptions {
  nested: boolean;
}

export function anchorPreviewItems({ nested }: AnchorPreviewOptions) {
  const detail = { id: 'detail', href: '#anchor-demo-detail', title: '详细信息' };
  const overview = { id: 'overview', href: '#anchor-demo-overview', title: '概览' };
  return nested ? [{ ...overview, children: [detail] }] : [overview, detail];
}

/** The preview intercepts fragment navigation because the docs site uses a hash router. */
export function anchorExampleCode(framework: 'react' | 'vue', options: AnchorPreviewOptions) {
  const items = JSON.stringify(anchorPreviewItems(options), null, 2);
  if (framework === 'vue') {
    return `<script setup lang="ts">
import { ref } from 'vue';
import { Anchor } from '@btdesign/vue';
import '@btdesign/tokens/styles.css';

const items = ${items};
const activeHref = ref('#anchor-demo-overview');
const content = ref<HTMLElement | null>(null);
function navigate(href: string, event: MouseEvent) {
  event.preventDefault(); // 此示例位于 hash 路由中
  const target = content.value?.querySelector<HTMLElement>(href);
  if (!target || !content.value) return;
  content.value.scrollTop += target.getBoundingClientRect().top - content.value.getBoundingClientRect().top;
  activeHref.value = href;
}
</script>

<template>
  <div style="display: flex; gap: 24px">
    <Anchor :items="items" :active-href="activeHref" @navigate="navigate" />
    <div ref="content" style="height: 144px; overflow-y: auto">
      <section id="anchor-demo-overview" style="min-height: 144px">概览内容</section>
      <section id="anchor-demo-detail" style="min-height: 144px">详细信息内容</section>
    </div>
  </div>
</template>`;
  }
  return `import { useRef, useState, type MouseEvent } from 'react';
import { Anchor } from '@btdesign/react';
import '@btdesign/tokens/styles.css';

const items = ${items};
export default function Example() {
  const [activeHref, setActiveHref] = useState('#anchor-demo-overview');
  const content = useRef<HTMLDivElement>(null);
  function navigate(href: string, event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault(); // 此示例位于 hash 路由中
    const target = content.current?.querySelector<HTMLElement>(href);
    if (!target || !content.current) return;
    content.current.scrollTop += target.getBoundingClientRect().top - content.current.getBoundingClientRect().top;
    setActiveHref(href);
  }
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <Anchor items={items} activeHref={activeHref} onNavigate={navigate} />
      <div ref={content} style={{ height: 144, overflowY: 'auto' }}>
        <section id="anchor-demo-overview" style={{ minHeight: 144 }}>概览内容</section>
        <section id="anchor-demo-detail" style={{ minHeight: 144 }}>详细信息内容</section>
      </div>
    </div>
  );
}`;
}

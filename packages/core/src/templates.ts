import type { ProjectSpec } from './index.js';
import {
  commonSceneSource,
  reactSceneSource,
  vueSceneSource,
  sceneCss,
} from './scenes.generated.js';
const sourceJson = (value: unknown) =>
  JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
const projectType = `type ProjectSpec = {
  name: string;
  scene: 'workspace' | 'projects' | 'login';
  content: {title:string;description:string;actionLabel:string};
};`;
const data = (project: ProjectSpec) =>
  `const project: ProjectSpec = ${sourceJson({ name: project.name, scene: project.scene, content: project.content })};`;
export function reactApp(project: ProjectSpec): string {
  return `import { useEffect, useState, type ReactNode } from 'react';
import { Avatar, Badge, Button, Card, Checkbox, Dialog, Input, Select, Switch, Table } from '@btdesign/react';
import { ArrowRight, ArrowUpRight, Check, FolderOpen, Grid2X2, Plus, Search, Users } from 'lucide-react';
import '@btdesign/tokens/styles.css';
import './theme.css';
import './app.css';

${projectType}
${data(project)}

${commonSceneSource}

${reactSceneSource}

export default function App() {
  const [mode, setMode] = useState<'light'|'dark'>('light');
  const [notice, notify] = useState('');
  return <main className="btdesign-demo sp-scene" data-theme={mode}>
    <ReactScene project={project} notify={notify} />
    <footer className="btdesign-demo-controls">
      <p role="status">{notice}</p>
      <Button variant="ghost" size="sm" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>{mode === 'light' ? '深色模式' : '浅色模式'}</Button>
    </footer>
  </main>;
}
`;
}
export function vueApp(project: ProjectSpec): string {
  return `<script setup lang="ts">
import * as vue from 'vue';
import { defineComponent, h, ref, shallowRef, type VNodeChild } from 'vue';
import * as ui from '@btdesign/vue';
import '@btdesign/tokens/styles.css';
import './theme.css';
import './app.css';

${projectType}
${data(project)}

${commonSceneSource.replace('export type SceneSelection', 'type SceneSelection')}
const projectRef = shallowRef(project);
const mode = ref<'light'|'dark'>('light');
const notice = ref('');
const emit = (message:string) => { notice.value = message; };

${vueSceneSource}
</script>

<template>
  <main class="btdesign-demo sp-scene" :data-theme="mode">
    <Scene />
    <footer class="btdesign-demo-controls">
      <p role="status">{{ notice }}</p>
      <ui.Button variant="ghost" size="sm" @click="mode = mode === 'light' ? 'dark' : 'light'">{{ mode === 'light' ? '深色模式' : '浅色模式' }}</ui.Button>
    </footer>
  </main>
</template>
`;
}
export const appCss = sceneCss;

import type { ProjectSpec } from './index.js';
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
const htmlText = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
export function scaffoldFiles(project: ProjectSpec): Record<string, string> {
  const react = project.framework === 'react';
  const framework = project.framework;
  const main = react ? 'main.tsx' : 'main.ts';
  const dependencies: Record<string, string> = {
    '@btdesign/tokens': 'file:./packages/btdesign-tokens-0.9.0.tgz',
    '@btdesign/engine': 'file:./packages/btdesign-engine-0.9.0.tgz',
    [`@btdesign/${framework}`]: `file:./packages/btdesign-${framework}-0.9.0.tgz`,
    ...(react
      ? { react: '^19.3.1', 'react-dom': '^19.3.1', 'lucide-react': '^1.71.0' }
      : { vue: '^3.5.45' }),
  };
  if (project.theme.font === 'inter') dependencies['@fontsource-variable/inter'] = '^5.3.0';
  const devDependencies = {
    typescript: '~5.9.3',
    vite: '^8.3.7',
    ...(react
      ? {
          '@vitejs/plugin-react': '^6.3.0',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
        }
      : { '@vitejs/plugin-vue': '^6.0.10', 'vue-tsc': '^3.3.14' }),
  };
  const typecheck = react ? 'tsc --noEmit' : 'vue-tsc --noEmit';
  const imports = `import './base.css';\n${project.theme.font === 'inter' ? "import '@fontsource-variable/inter';\n" : ''}`;
  return {
    'package.json': json({
      name: `btdesign-${framework}-starter`,
      version: '0.9.0',
      private: true,
      type: 'module',
      engines: { node: '>=22.12.0' },
      scripts: {
        dev: 'vite --host 127.0.0.1',
        typecheck,
        build: `${typecheck} && vite build`,
        preview: 'vite preview --host 127.0.0.1',
      },
      dependencies,
      devDependencies,
    }),
    'index.html': `<!doctype html>\n<html lang="zh-CN">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${htmlText(project.name)}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="./${main}"></script>\n  </body>\n</html>\n`,
    [main]: react
      ? `${imports}import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\n\ncreateRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);\n`
      : `${imports}import { createApp } from 'vue';\nimport App from './App.vue';\n\ncreateApp(App).mount('#root');\n`,
    'tsconfig.json': json({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        skipLibCheck: true,
        isolatedModules: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        noEmit: true,
        types: ['vite/client'],
        ...(react ? { jsx: 'react-jsx' } : {}),
      },
      include: ['*.ts', '*.tsx', '*.vue'],
    }),
    'vite.config.ts': `import { defineConfig } from 'vite';\nimport ${framework} from '@vitejs/plugin-${framework}';\n\nexport default defineConfig({ plugins: [${framework}()], base: './' });\n`,
    'base.css': `html, body, #root { margin: 0; min-height: 100%; }\nbody { min-width: 320px; }\n.btdesign-demo { min-height: 100vh; }\nbutton, input, select, textarea { font: inherit; }\n`,
    '.gitignore': 'node_modules/\ndist/\n.env\n.env.*\n!.env.example\n*.log\n.DS_Store\n',
  };
}

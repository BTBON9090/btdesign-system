#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

if (typeof ts.createSourceFile !== 'function')
  throw new Error('迁移审计需要 TypeScript 5.x 编译器 API；请按仓库锁文件运行 npm install。');

const ignored = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.output',
  '.turbo',
  '.vercel',
  '.cache',
  'vendor',
]);
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts', '.vue']);
const providers = [
  { name: 'antd', framework: 'react' },
  { name: '@arco-design/web-react', framework: 'react' },
  { name: '@arco-design/web-vue', framework: 'vue' },
  { name: 'ant-design-vue', framework: 'vue' },
  { name: 'element-plus', framework: 'vue' },
];
const supported = new Set([
  'Button',
  'Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Switch',
  'Badge',
  'Card',
  'Alert',
  'Tabs',
  'Dialog',
  'Avatar',
  'Separator',
  'Table',
  'Skeleton',
  'Progress',
]);
const aliases = {
  Modal: 'Dialog',
  Divider: 'Separator',
  Tag: 'Badge',
  TextArea: 'Textarea',
  InputTextArea: 'Textarea',
};
const limitations = {
  Button: [
    '映射 variant、size 和事件；Ant/Arco 的 type 表示视觉，而 Forma type 是原生表单类型。链接按钮、图标插槽和 asChild 需另行处理。',
  ],
  Input: ['确认受控值/事件类型、前后缀、清除按钮、密码和搜索输入；Forma Input 是原生 input。'],
  Textarea: ['确认受控值/事件类型及字数限制；自动高度和字数显示需应用层实现。'],
  Select: ['Forma Select 是原生 select；搜索、远程加载、虚拟列表、标签模式和自定义弹层尚不具备。'],
  Checkbox: ['检查 checked / v-model 和表单提交；组选择、校验上下文需应用层适配。'],
  Switch: ['检查 checked / v-model、事件和表单 name；设置可访问标签。'],
  Badge: ['Forma Badge 是文本状态标签；数字计数、角标定位和 dot 模式需另行实现。'],
  Card: ['Forma Card 是内容容器；标题、封面、actions、嵌套样式需应用层组合。'],
  Alert: ['映射 title、variant 与内容；可关闭通知和全局 message/notification 尚未实现。'],
  Tabs: [
    '转换为 items[value,label,content]，映射 value / v-model；可编辑标签、拖动和垂直布局尚未实现。',
  ],
  Dialog: [
    '转换为 open/onOpenChange（React）或 v-model（Vue）；异步确认、静态方法和复杂嵌套弹层需人工复核。',
  ],
  Avatar: ['映射 name、src、size；头像组和徽标需应用层组合。'],
  Separator: ['映射 orientation；带标题分隔线需应用层组合。'],
  Table: [
    'Forma Table 是语义化原生表格外壳；columns/dataSource、排序、筛选、分页、选择、固定列和虚拟滚动均需保留现有实现或重建。',
  ],
  Skeleton: ['转换为 width/height 和组合布局；现有复杂骨架结构需要重新组合。'],
  Progress: ['映射 value/max；圆形、分段、渐变和步骤进度尚未实现。'],
};

function providerFor(specifier) {
  const provider = providers.find(
    (item) => specifier === item.name || specifier.startsWith(`${item.name}/`),
  );
  if (provider) return provider;
  if (/^(?:@\/|~\/|\.\.?\/).*components\/ui(?:\/|$)/.test(specifier))
    return { name: 'shadcn-local', framework: 'react' };
  return null;
}
function pascal(value) {
  return value.replace(/(^|[-_])([a-z])/g, (_, __, letter) => letter.toUpperCase());
}
function inferDeepImport(specifier, provider) {
  if (provider.name === 'shadcn-local')
    return pascal(
      specifier
        .split('/')
        .at(-1)
        .replace(/\.[^.]+$/, ''),
    );
  const parts = specifier
    .slice(provider.name.length + 1)
    .split('/')
    .filter(Boolean);
  if (['es', 'lib', 'components'].includes(parts[0])) parts.shift();
  if (parts[0] === 'components') parts.shift();
  return parts[0] ? pascal(parts[0]) : '*';
}
function componentMapping(imported) {
  const original = imported;
  if (/^El[A-Z]/.test(imported)) imported = imported.slice(2);
  const target = aliases[imported] ?? imported;
  if (supported.has(target))
    return {
      target,
      status: ['Select', 'Table', 'Dialog', 'Tabs', 'Badge'].includes(target)
        ? 'partial'
        : 'candidate',
      confidence: 'high',
      issues: limitations[target],
    };
  for (const prefix of ['Dialog', 'AlertDialog', 'Select', 'Table', 'Card', 'Tabs', 'Avatar']) {
    if (imported.startsWith(prefix)) {
      const mapped = prefix === 'AlertDialog' ? 'Dialog' : prefix;
      return {
        target: mapped,
        status: 'partial',
        confidence: 'medium',
        issues: [
          `${original} 是复合组件的一部分；Forma 未导出同名子组件，需要重组插槽/子节点。`,
          ...limitations[mapped],
        ],
      };
    }
  }
  if (imported === '*')
    return {
      target: null,
      status: 'unresolved',
      confidence: 'low',
      issues: [
        '整库、动态或命名空间导入尚不能确定实际组件；需人工检查导出、自动导入和运行时访问。',
      ],
    };
  return {
    target: null,
    status: 'unsupported',
    confidence: 'high',
    issues: ['当前 16 个 Forma 组件没有直接对应能力；保留原组件或先实现扩展包，再迁移。'],
  };
}

function scriptParts(source, extension) {
  if (extension !== '.vue')
    return [
      {
        source,
        offset: 0,
        kind: ['.jsx', '.tsx'].includes(extension) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      },
    ];
  const parts = [];
  for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const prefix = source.slice(0, match.index + match[0].indexOf('>') + 1);
    parts.push({
      source: match[2],
      offset: prefix.split('\n').length - 1,
      kind: /lang\s*=\s*["']tsx["']/i.test(match[1]) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    });
  }
  return parts;
}

function scanSource(source, filename, framework) {
  const findings = [];
  const warnings = [];
  for (const part of scriptParts(source, path.extname(filename))) {
    const ast = ts.createSourceFile(filename, part.source, ts.ScriptTarget.Latest, true, part.kind);
    if (ast.parseDiagnostics?.length)
      warnings.push(
        `${filename}: 语法解析出现 ${ast.parseDiagnostics.length} 处问题；结果可能不完整。`,
      );
    const imports = [];
    const add = (node, specifier, imported, local, kind = 'import') => {
      const provider = providerFor(specifier);
      if (!provider) return;
      const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + part.offset + 1;
      imports.push({
        file: filename,
        line,
        library: provider.name,
        source: specifier,
        imported,
        local,
        kind,
        provider,
      });
    };
    const walk = (node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const specifier = node.moduleSpecifier.text;
        const provider = providerFor(specifier);
        if (provider && !node.importClause?.isTypeOnly) {
          const clause = node.importClause;
          if (!clause)
            add(
              node,
              specifier,
              '*',
              null,
              /\.(css|less|scss|sass)(?:$|\?)/i.test(specifier) ? 'style' : 'side-effect',
            );
          if (clause?.name)
            add(node, specifier, inferDeepImport(specifier, provider), clause.name.text);
          if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
            for (const item of clause.namedBindings.elements)
              if (!item.isTypeOnly)
                add(item, specifier, item.propertyName?.text ?? item.name.text, item.name.text);
          } else if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings))
            add(node, specifier, '*', clause.namedBindings.name.text, 'namespace');
        }
      } else if (
        ts.isExportDeclaration(node) &&
        !node.isTypeOnly &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const item of node.exportClause.elements)
            if (!item.isTypeOnly)
              add(
                item,
                node.moduleSpecifier.text,
                item.propertyName?.text ?? item.name.text,
                item.name.text,
                're-export',
              );
        } else add(node, node.moduleSpecifier.text, '*', null, 're-export');
      } else if (
        ts.isCallExpression(node) &&
        node.arguments.length &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const dynamic = node.expression.kind === ts.SyntaxKind.ImportKeyword;
        const requireCall = ts.isIdentifier(node.expression) && node.expression.text === 'require';
        if (dynamic || requireCall) {
          const specifier = node.arguments[0].text;
          const parent = node.parent;
          if (
            requireCall &&
            ts.isVariableDeclaration(parent) &&
            ts.isObjectBindingPattern(parent.name)
          ) {
            for (const item of parent.name.elements)
              add(
                item,
                specifier,
                item.propertyName?.getText(ast) ?? item.name.getText(ast),
                item.name.getText(ast),
                'require',
              );
          } else
            add(
              node,
              specifier,
              '*',
              ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)
                ? parent.name.text
                : null,
              dynamic ? 'dynamic-import' : 'require',
            );
        }
      }
      ts.forEachChild(node, walk);
    };
    walk(ast);
    for (const entry of imports) {
      const members = new Set();
      if (entry.local) {
        const visit = (node) => {
          if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === entry.local
          )
            members.add(node.name.text);
          ts.forEachChild(node, visit);
        };
        visit(ast);
      }
      const entries =
        entry.imported === '*' && members.size && entry.kind !== 'style'
          ? [...members].map((member) => ({
              ...entry,
              imported: member,
              local: `${entry.local}.${member}`,
            }))
          : [entry];
      for (const item of entries) {
        const { provider, ...rest } = item;
        const mapped =
          item.kind === 'style'
            ? {
                target: null,
                status: 'infrastructure',
                confidence: 'high',
                issues: ['现有样式需在共存期保留；移除前检查仍在使用的旧组件及全局 reset。'],
              }
            : componentMapping(item.imported);
        const issues = [...mapped.issues];
        if (provider.framework !== framework)
          issues.push(
            `该导入通常面向 ${provider.framework}，与本次 --framework ${framework} 不同；需核实混合项目边界。`,
          );
        if (entry.imported !== '*' && members.size)
          issues.push(
            `检测到 ${entry.local} 的成员访问（${[...members].join(', ')}）；静态方法/复合子组件 API 不能直接替换。`,
          );
        findings.push({ ...rest, ...mapped, issues, automaticReplacement: false });
      }
    }
  }
  if (path.extname(filename) === '.vue' && /<(?:a|el)-[a-z]/.test(source))
    warnings.push(
      `${filename}: 检测到 a-/el- 模板标签，可能来自全局注册或自动导入；未将这些标签当作已确认导入。`,
    );
  return { findings, warnings };
}

export async function auditProject(directory, framework) {
  if (!['react', 'vue'].includes(framework)) throw new Error('--framework 必须为 react 或 vue。');
  const root = await fs.realpath(directory);
  if (!(await fs.stat(root)).isDirectory()) throw new Error('扫描目标必须为目录。');
  const findings = [],
    warnings = [],
    dependencies = [];
  let scannedFiles = 0,
    skippedFiles = 0;
  const walk = async (current) => {
    const entries = (await fs.readdir(current, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      if (entry.isSymbolicLink()) {
        skippedFiles++;
        continue;
      }
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) await walk(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      if (entry.name === 'package.json') {
        try {
          const manifest = JSON.parse(await fs.readFile(absolute, 'utf8'));
          for (const provider of providers)
            for (const group of ['dependencies', 'devDependencies', 'peerDependencies']) {
              if (typeof manifest[group]?.[provider.name] === 'string')
                dependencies.push({
                  file: relative,
                  library: provider.name,
                  version: manifest[group][provider.name],
                  group,
                });
            }
        } catch {
          warnings.push(`${relative}: 无法读取依赖声明。`);
        }
        continue;
      }
      if (!extensions.has(path.extname(entry.name)) || entry.name.endsWith('.d.ts')) continue;
      if (scannedFiles >= 20000) throw new Error('超过 20,000 个源文件，请缩小扫描目录后重试。');
      try {
        if ((await fs.stat(absolute)).size > 2 * 1024 * 1024) {
          warnings.push(`${relative}: 文件大于 2 MiB，已跳过。`);
          skippedFiles++;
          continue;
        }
        const source = await fs.readFile(absolute, 'utf8');
        const result = scanSource(source, relative, framework);
        findings.push(...result.findings);
        warnings.push(...result.warnings);
        scannedFiles++;
      } catch (error) {
        warnings.push(`${relative}: 无法完成解析（${error.code ?? error.name}）。`);
        skippedFiles++;
      }
    }
  };
  await walk(root);
  const counts = Object.fromEntries(
    ['candidate', 'partial', 'unsupported', 'unresolved', 'infrastructure'].map((status) => [
      status,
      findings.filter((item) => item.status === status).length,
    ]),
  );
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceRoot: root,
    framework,
    mode: 'read-only-audit',
    summary: { scannedFiles, skippedFiles, importFindings: findings.length, ...counts },
    limitations: [
      '这是导入清单与迁移候选分析，不是自动迁移、兼容性认证或工期估算。所有候选都需要验证实际业务行为。',
      'confidence 仅表示组件名称映射的确定程度，不表示 API、布局或可访问性兼容程度。',
      '不执行项目代码、不解析完整模块图；包装组件、运行时导入、路径别名变体、全局注册和 Vue 自动导入可能漏报。',
      '跳过符号链接、依赖/构建目录、类型声明与大于 2 MiB 的文件；Vue 仅解析内联 script 区块。',
      '未检测到导入不代表迁移完成；零候选或高候选占比均不构成可直接上线的证据。',
    ],
    dependencies,
    findings,
    warnings,
  };
}

const escapeCell = (value) =>
  String(value ?? '—')
    .replace(/\|/g, '\\|')
    .replace(/[\r\n]/g, ' ');
export function reportMarkdown(report) {
  const lines = [
    '# Forma UI 迁移审计',
    '',
    `扫描目标：\`${report.sourceRoot}\``,
    '',
    `框架：${report.framework}；源文件：${report.summary.scannedFiles}；导入记录：${report.summary.importFindings}。`,
    '',
    '**源项目未被修改。当前结果不代表 API 可直接替换。**',
    '',
    '| 文件:行 | 来源 | 导入组件 | Forma 候选 | 状态 | 映射置信度 |',
    '| --- | --- | --- | --- | --- | --- |',
    ...report.findings.map(
      (item) =>
        `| ${escapeCell(`${item.file}:${item.line}`)} | ${escapeCell(item.library)} | ${escapeCell(item.imported)} | ${escapeCell(item.target)} | ${item.status} | ${item.confidence} |`,
    ),
    '',
    '## 需要人工处理',
    '',
    ...report.findings.flatMap((item) => [
      `- **${escapeCell(item.file)}:${item.line} · ${escapeCell(item.imported)}**：${item.issues.join(' ')}`,
    ]),
    '',
    '## 审计边界',
    '',
    ...report.limitations.map((item) => `- ${item}`),
    ...(report.warnings.length
      ? ['', '## 警告', '', ...report.warnings.map((item) => `- ${item}`)]
      : []),
    '',
  ];
  return lines.join('\n');
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(
      '用法：node scripts/migrate-audit.mjs <项目目录> --framework react|vue [--out <新报告目录>]\n未提供 --out 时将 JSON 报告写入 stdout；提供时生成 migration-report.json 和 migration-report.md，不覆盖已有报告。\n',
    );
    return;
  }
  let directory, framework, output;
  for (let index = 0; index < argv.length; index++) {
    const value = argv[index];
    if (value === '--framework') framework = argv[++index];
    else if (value === '--out') output = argv[++index];
    else if (value.startsWith('-')) throw new Error(`未知选项：${value}`);
    else if (!directory) directory = value;
    else throw new Error('只接受一个扫描目录。');
  }
  if (!directory || !framework)
    throw new Error('需要项目目录和 --framework react|vue；使用 --help 查看用法。');
  if (argv.at(-1) === '--out') throw new Error('--out 需要一个报告目录。');
  const report = await auditProject(directory, framework);
  if (output) {
    const out = path.resolve(output);
    await fs.mkdir(out, { recursive: true });
    const jsonPath = path.join(out, 'migration-report.json');
    const markdownPath = path.join(out, 'migration-report.md');
    for (const file of [jsonPath, markdownPath]) {
      try {
        await fs.lstat(file);
        throw new Error(`报告已存在，不会覆盖：${file}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
    await fs.writeFile(markdownPath, reportMarkdown(report), { flag: 'wx' });
    process.stdout.write(`已生成只读审计报告：\n${jsonPath}\n${markdownPath}\n`);
  } else process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`迁移审计失败：${error.message}\n`);
    process.exitCode = 1;
  });
}

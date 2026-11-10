import { useId, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@btdesign/react';
import {
  auditStatuses,
  parseMigrationAudit,
  parseThemeImport,
  type AuditStatus,
  type MigrationAudit,
  type ThemeImport,
} from './migration-utils';
import './MigrationPanel.css';

export interface MigrationPanelProps {
  onImportTheme: (theme: unknown) => void;
  onClose: () => void;
  notify: (message: string) => void;
}
const statusLabels: Record<AuditStatus, string> = {
  candidate: '可评估替换',
  partial: '需补齐能力',
  unsupported: '暂无对应',
  unresolved: '待人工识别',
  infrastructure: '样式与基础依赖',
};
const example = '{\n  "token": {\n    "colorPrimary": "#2563EB",\n    "borderRadius": 6\n  }\n}';
const PAGE_SIZE = 30;

export function MigrationPanel({ onImportTheme, onClose, notify }: MigrationPanelProps) {
  const id = useId();
  const [mode, setMode] = useState<'theme' | 'code'>('theme');
  const [source, setSource] = useState('');
  const [preview, setPreview] = useState<ThemeImport | null>(null);
  const [themeError, setThemeError] = useState('');
  const [framework, setFramework] = useState<'react' | 'vue'>('react');
  const [report, setReport] = useState<MigrationAudit | null>(null);
  const [reportError, setReportError] = useState('');
  const [reading, setReading] = useState(false);
  const [filter, setFilter] = useState<AuditStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  const readSequence = useRef(0);
  const command = `npm run migrate:audit -- /path/to/app --framework ${framework} --out ./migration-report`;
  const rows = report?.findings.filter((row) => filter === 'all' || row.status === filter) ?? [];
  const visibleRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function inspect() {
    try {
      setPreview(parseThemeImport(source));
      setThemeError('');
    } catch (error) {
      setPreview(null);
      setThemeError(error instanceof Error ? error.message : '配置读取失败，请检查格式。');
    }
  }
  async function readReport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const sequence = ++readSequence.current;
    setReport(null);
    setReportError('');
    setReading(true);
    setPage(0);
    setFilter('all');
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('报告超过 2 MiB，请按业务子目录分别审计。');
      const parsed = parseMigrationAudit(await file.text());
      if (sequence === readSequence.current) setReport(parsed);
    } catch (error) {
      if (sequence === readSequence.current)
        setReportError(error instanceof Error ? error.message : '无法读取报告，请重新选择文件。');
    } finally {
      if (sequence === readSequence.current) setReading(false);
    }
  }
  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      notify('审计命令已复制，请替换业务项目路径后运行。');
    } catch {
      notify('复制失败，请手动选择并复制下方命令。');
    }
  }

  return (
    <div className="bt-migration">
      <div className="bt-migration-modes" role="group" aria-label="选择接入方式">
        <button type="button" aria-pressed={mode === 'theme'} onClick={() => setMode('theme')}>
          带入现有风格
        </button>
        <button type="button" aria-pressed={mode === 'code'} onClick={() => setMode('code')}>
          迁移现有代码
        </button>
      </div>
      {mode === 'theme' ? (
        <div className="bt-migration-section">
          <p className="bt-migration-intro">保留品牌熟悉的样子，从已有的颜色和圆角开始。</p>
          <label className="bt-migration-label" htmlFor={`${id}-theme`}>
            粘贴风格配置
          </label>
          <p className="bt-migration-help" id={`${id}-help`}>
            支持 Ant Design token JSON、BTDESIGN 主题 JSON，或
            --primary、--radius、--background、--foreground 等 CSS 变量。颜色使用 HEX，圆角使用 px。
          </p>
          <textarea
            id={`${id}-theme`}
            className="bt-migration-source"
            rows={7}
            value={source}
            spellCheck={false}
            maxLength={65537}
            aria-describedby={`${id}-help`}
            placeholder={example}
            onChange={(event) => {
              setSource(event.target.value);
              setPreview(null);
              setThemeError('');
            }}
          />
          <div className="bt-migration-actions">
            <Button variant="secondary" onClick={inspect} disabled={!source.trim()}>
              检查映射
            </Button>
            <button
              className="bt-migration-text-button"
              type="button"
              onClick={() => {
                setSource(example);
                setPreview(null);
                setThemeError('');
              }}
            >
              填入示例
            </button>
          </div>
          {themeError && (
            <p className="bt-migration-error" role="alert">
              {themeError}
            </p>
          )}
          {preview && (
            <div className="bt-migration-preview" aria-live="polite">
              <div className="bt-migration-preview-heading">
                <strong>确认风格映射</strong>
                <span>
                  {preview.format} · {preview.mappings.length} 项
                </span>
              </div>
              <div
                className="bt-migration-table-scroll"
                role="region"
                aria-label="主题映射表"
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      <th scope="col">原配置</th>
                      <th scope="col">BTDESIGN</th>
                      <th scope="col">导入值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.mappings.map((mapping) => (
                      <tr key={`${mapping.source}-${mapping.target}`}>
                        <td>
                          <code>{mapping.source}</code>
                          <small>{mapping.before}</small>
                        </td>
                        <td>
                          <code>{mapping.target}</code>
                        </td>
                        <td>
                          <code>{mapping.after}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.warnings.length > 0 && (
                <div className="bt-migration-notes">
                  <strong>这些差异需要留意</strong>
                  <ul>
                    {preview.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="bt-migration-help">
                仅应用上表已识别的字段，其余保留当前设置。项目中已锁定的品牌规范会继续生效。导入后可在画布检查深浅色效果。
              </p>
              <Button
                onClick={() => {
                  onImportTheme(preview.patch);
                  onClose();
                }}
              >
                应用到当前项目
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bt-migration-section">
          <p className="bt-migration-intro">
            先了解旧系统的组件与差异，再逐页替换。原业务代码保持在你的电脑里。
          </p>
          <div className="bt-migration-step">
            <span aria-hidden="true">1</span>
            <div>
              <h3>在本地生成审计报告</h3>
              <p>
                在下载的 BTDESIGN 仓库根目录运行 <code>npm install</code> 后执行以下命令。将{' '}
                <code>/path/to/app</code>{' '}
                替换为业务项目的绝对路径；路径包含空格时用引号包裹。输出目录需使用尚未生成过报告的位置。
              </p>
            </div>
          </div>
          <div className="bt-migration-command-head">
            <label htmlFor={`${id}-framework`}>业务项目框架</label>
            <select
              id={`${id}-framework`}
              value={framework}
              onChange={(event) => setFramework(event.target.value as 'react' | 'vue')}
            >
              <option value="react">React</option>
              <option value="vue">Vue 3</option>
            </select>
            <button type="button" className="bt-migration-text-button" onClick={copyCommand}>
              复制命令
            </button>
          </div>
          <pre className="bt-migration-command">
            <code>{command}</code>
          </pre>
          <div className="bt-migration-step">
            <span aria-hidden="true">2</span>
            <div>
              <h3>在这里打开 JSON 报告</h3>
              <p>
                选择生成的 <code>migration-report/migration-report.json</code>
                。文件只在当前浏览器内读取，不上传报告或项目源码。
              </p>
            </div>
          </div>
          <label className="bt-migration-file" htmlFor={`${id}-report`}>
            <span>{reading ? '正在读取报告…' : '选择 migration-report.json'}</span>
            <input
              id={`${id}-report`}
              type="file"
              accept=".json,application/json"
              onChange={readReport}
              disabled={reading}
            />
          </label>
          {reportError && (
            <p className="bt-migration-error" role="alert">
              {reportError}
            </p>
          )}
          {report && (
            <div className="bt-migration-report" aria-live="polite">
              <div className="bt-migration-preview-heading">
                <strong>审计结果 · {report.framework === 'react' ? 'React' : 'Vue 3'}</strong>
                <span>
                  扫描 {report.summary.scannedFiles} 个文件 · 跳过 {report.summary.skippedFiles} 个
                </span>
              </div>
              <p className="bt-migration-help bt-migration-path">
                项目目录：<code>{report.sourceRoot}</code>
              </p>
              <p className="bt-migration-help">
                候选仅表示名称存在对应，全部需要验证 API
                与业务行为。此报告没有修改或完成迁移任何代码。
              </p>
              <div className="bt-migration-filters" role="group" aria-label="筛选审计结果">
                {(['all', ...auditStatuses] as const).map((status) => (
                  <button
                    type="button"
                    key={status}
                    aria-pressed={filter === status}
                    onClick={() => {
                      setFilter(status);
                      setPage(0);
                    }}
                  >
                    {status === 'all' ? '全部' : statusLabels[status]}{' '}
                    <span>
                      {status === 'all' ? report.findings.length : report.summary[status]}
                    </span>
                  </button>
                ))}
              </div>
              {rows.length ? (
                <>
                  <div
                    className="bt-migration-table-scroll"
                    role="region"
                    aria-label="组件迁移审计表"
                    tabIndex={0}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">现有组件 / 位置</th>
                          <th scope="col">BTDESIGN 候选</th>
                          <th scope="col">状态与下一步</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRows.map((row, index) => (
                          <tr key={`${page}-${index}`}>
                            <td>
                              <strong>{row.imported}</strong>
                              <small>{row.library}</small>
                              <code>
                                {row.file}:{row.line}
                              </code>
                            </td>
                            <td>
                              {row.target ?? '—'}
                              <small>
                                名称映射确定度：
                                {{ high: '高', medium: '中', low: '低' }[row.confidence]}
                              </small>
                            </td>
                            <td>
                              <span className="bt-migration-status" data-status={row.status}>
                                {statusLabels[row.status]}
                              </span>
                              <details>
                                <summary>查看处理建议</summary>
                                <ul>
                                  {row.issues.map((issue, item) => (
                                    <li key={item}>{issue}</li>
                                  ))}
                                </ul>
                                <small>导入方式：{row.kind}</small>
                              </details>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bt-migration-pagination">
                    <span>
                      {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} /{' '}
                      {rows.length} 条
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={(page + 1) * PAGE_SIZE >= rows.length}
                      onClick={() => setPage(page + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                </>
              ) : (
                <p className="bt-migration-empty">
                  {report.findings.length
                    ? '当前分类没有记录。'
                    : '没有检测到已支持来源的组件导入。包装组件、自动导入或全局注册仍可能需要人工检查；零记录不代表迁移完成。'}
                </p>
              )}
              <details className="bt-migration-details">
                <summary>扫描边界与警告（{report.warnings.length}）</summary>
                <ul>
                  {report.limitations.map((item, index) => (
                    <li key={`limit-${index}`}>{item}</li>
                  ))}
                  {report.warnings.slice(0, 30).map((item, index) => (
                    <li key={`warning-${index}`}>{item}</li>
                  ))}
                </ul>
                {report.warnings.length > 30 && (
                  <p>此处展示前 30 条警告，其余请查阅本地原始报告。</p>
                )}
              </details>
            </div>
          )}
          <div className="bt-migration-step">
            <span aria-hidden="true">3</span>
            <div>
              <h3>选一页试迁移，再逐步扩大</h3>
              <p>
                先统一品牌
                token，保留旧组件并行运行。优先替换简单按钮、输入框；表格、弹窗和复杂选择器按报告逐项补齐。验证业务事件、键盘操作与深浅色后，再迁移下一页。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

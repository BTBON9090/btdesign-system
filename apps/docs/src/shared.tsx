import { useState, type ReactNode } from 'react';
import { Check, Copy, ArrowUpRight } from 'lucide-react';
import { Button } from '@btdesign/react';
import type { Framework } from './catalog';
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <a href="#/" className={`logo ${small ? 'logo-small' : ''}`} aria-label="BTDESIGN 首页">
      <span className="bt-wordmark-symbol" aria-hidden="true">
        bt<span>•</span>
      </span>
      <span className="bt-wordmark-text">BTDESIGN</span>
    </a>
  );
}
export function CodeBlock({ code, label = 'tsx' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('复制失败，请手动选择代码。');
    }
  }
  return (
    <div className="code-block">
      <div className="code-head">
        <span>{label}</span>
        <button type="button" onClick={copy} aria-label="复制代码">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {error && <p role="status">{error}</p>}
    </div>
  );
}
export function FrameworkToggle({
  value,
  onChange,
}: {
  value: Framework;
  onChange: (f: Framework) => void;
}) {
  return (
    <div className="segmented" aria-label="选择技术框架">
      <button
        type="button"
        aria-pressed={value === 'react'}
        className={value === 'react' ? 'selected' : ''}
        onClick={() => onChange('react')}
      >
        <span className="framework-dot react-dot" />
        React
      </button>
      <button
        type="button"
        aria-pressed={value === 'vue'}
        className={value === 'vue' ? 'selected' : ''}
        onClick={() => onChange('vue')}
      >
        <span className="framework-dot vue-dot" />
        Vue 3
      </button>
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return <div className="notice">{children}</div>;
}
export function PageLead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-lead">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <Logo small />
      <span>为每一种产品，构建共同的设计语言。</span>
      <a href="https://github.com/BTBON9090/btdesign-system" target="_blank" rel="noreferrer">
        GitHub <ArrowUpRight size={14} />
      </a>
      <span className="footer-version">v0.11.0 · MIT</span>
    </footer>
  );
}
export function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}

import type { ChoiceOption } from './types.js';

/** Only web/navigation schemes, fragments and relative URLs. Never executable/data URLs. */
export function safeHref(value?: string): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  const compact = trimmed.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(compact)?.[1]?.toLowerCase();
  return scheme && !['http', 'https', 'mailto', 'tel', 'blob'].includes(scheme)
    ? undefined
    : trimmed || undefined;
}
export function formatFileSize(value?: number): string {
  if (value === undefined || !Number.isFinite(value) || value < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = value,
    index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }
  return `${index === 0 ? Math.round(size) : Number(size.toFixed(size < 10 ? 1 : 0))} ${units[index]}`;
}
export function toggleOption(
  selected: readonly string[],
  value: string,
  options?: readonly ChoiceOption[],
): string[] {
  const current = [...new Set(selected)];
  if (options && !options.some((option) => option.value === value && !option.disabled))
    return current;
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

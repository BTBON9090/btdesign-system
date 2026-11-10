import type { FormErrors, FormRules, FormValues, ValidationRule } from './types.js';

const empty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === false ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0);

/** Synchronous rules report the first failure. Exceptions never expose implementation details. */
export function validateValue(
  value: unknown,
  rules: ValidationRule | ValidationRule[],
  values: FormValues = {},
): string | undefined {
  for (const rule of Array.isArray(rules) ? rules : [rules]) {
    if (!rule || typeof rule !== 'object') continue;
    const fail = (fallback: string) => rule.message?.trim() || fallback;
    if (rule.required && empty(value)) return fail('请填写此项');
    if (!empty(value)) {
      if (
        rule.type === 'email' &&
        (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      )
        return fail('请输入有效的邮箱地址');
      if (rule.type === 'url') {
        try {
          const url = new URL(String(value));
          if (!['http:', 'https:'].includes(url.protocol) || !url.hostname)
            return fail('请输入有效的网址');
        } catch {
          return fail('请输入有效的网址');
        }
      }
      const length =
        typeof value === 'string'
          ? Array.from(value).length
          : Array.isArray(value)
            ? value.length
            : undefined;
      if (rule.minLength !== undefined && (length === undefined || length < rule.minLength))
        return fail(`至少需要 ${rule.minLength} 项或字符`);
      if (rule.maxLength !== undefined && (length === undefined || length > rule.maxLength))
        return fail(`最多允许 ${rule.maxLength} 项或字符`);
      if (rule.min !== undefined || rule.max !== undefined) {
        const numeric =
          typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
        if (!Number.isFinite(numeric)) return fail('请输入有效数字');
        if (rule.min !== undefined && numeric < rule.min) return fail(`不能小于 ${rule.min}`);
        if (rule.max !== undefined && numeric > rule.max) return fail(`不能大于 ${rule.max}`);
      }
      if (rule.pattern !== undefined) {
        try {
          if (!new RegExp(rule.pattern).test(String(value))) return fail('格式不符合要求');
        } catch {
          return fail('校验规则无效');
        }
      }
    }
    if (rule.validate) {
      try {
        const message = rule.validate(value, values);
        if (typeof message === 'string' && message.trim()) return rule.message?.trim() || message;
        // Async validators require application orchestration; never silently accept a Promise.
        if (message !== undefined && typeof message !== 'string') return fail('请使用同步校验规则');
      } catch {
        return fail('暂时无法校验此项');
      }
    }
  }
  return undefined;
}

export function validateValues(values: FormValues, rules: FormRules): FormErrors {
  const errors: FormErrors = {};
  for (const name of Object.keys(rules)) {
    const message = validateValue(
      Object.hasOwn(values, name) ? values[name] : undefined,
      rules[name],
      values,
    );
    if (message)
      Object.defineProperty(errors, name, {
        value: message,
        enumerable: true,
        configurable: true,
        writable: true,
      });
  }
  return errors;
}

import {
  validateValues,
  type FormErrors,
  type FormRules,
  type FormValues,
  type ValidationRule,
} from '@btdesign/engine';
export interface NativeFormControl {
  name: string;
  id: string;
  willValidate?: boolean;
  validity?: { valid: boolean };
  validationMessage?: string;
}
/** Include custom controls' native validity even when Form owns the submit validation UI. */
export function formValidation(
  values: FormValues,
  rules: FormRules,
  controls: Iterable<NativeFormControl>,
  fields: Iterable<[string, { id: string }]>,
) {
  const errors: FormErrors = validateValues(values, rules);
  const registered = Array.from(fields).sort((a, b) => b[1].id.length - a[1].id.length);
  for (const control of controls) {
    if (control.willValidate === false || control.validity?.valid !== false) continue;
    const match = registered.find(
      ([, field]) => control.id === field.id || control.id.startsWith(`${field.id}-`),
    );
    const name = match?.[0] ?? control.name;
    if (name && !errors[name]) errors[name] = control.validationMessage || '请检查输入内容。';
  }
  return errors;
}
export function formFieldRules(
  rules: ValidationRule | ValidationRule[] | undefined,
  required: boolean,
  type: string,
): ValidationRule[] {
  const explicit = Array.isArray(rules) ? rules : rules ? [rules] : [];
  return [
    ...explicit,
    ...(required && !explicit.some((rule) => rule.required) ? [{ required: true }] : []),
    ...(type === 'email' && !explicit.some((rule) => rule.type === 'email')
      ? [{ type: 'email' as const }]
      : []),
  ];
}

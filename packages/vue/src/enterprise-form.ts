import {
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  watch,
} from 'vue';
import type { ComputedRef, InjectionKey, PropType } from 'vue';
import { validateValues, validateValue } from '@btdesign/engine';
import type {
  ChoiceOption,
  FormErrors,
  FormRules,
  FormValues,
  ValidationRule,
} from '@btdesign/engine';
import { Field, useControlId } from './field.js';
import { useValue } from './enterprise-shared.js';
interface RegisteredField {
  id: string;
  label: string;
  rules: ValidationRule[];
  disabled: boolean;
}
interface FormContext {
  values: ComputedRef<FormValues>;
  errors: ComputedRef<FormErrors>;
  disabled: ComputedRef<boolean>;
  fields: Map<string, RegisteredField>;
  rules: ComputedRef<FormRules>;
  setValue: (name: string, value: unknown) => void;
  register: (name: string, field: RegisteredField) => void;
  unregister: (name: string) => void;
}
const formKey: InjectionKey<FormContext> = Symbol('BTDESIGNForm');
export const Form = defineComponent({
  name: 'BTDESIGNForm',
  inheritAttrs: false,
  props: {
    initialValues: { type: Object as PropType<FormValues>, default: () => ({}) },
    modelValue: { type: Object as PropType<FormValues>, default: undefined },
    rules: { type: Object as PropType<FormRules>, default: () => ({}) },
    disabled: Boolean,
    submitting: Boolean,
  },
  emits: ['update:modelValue', 'submit', 'invalid', 'reset'],
  setup(props, { attrs, slots, emit, expose }) {
    const root = ref<HTMLFormElement>();
    const state = useValue(
      () => props.modelValue,
      { ...props.initialValues },
      (v) => emit('update:modelValue', v),
    );
    const errors = ref<FormErrors>({});
    const fields = new Map<string, RegisteredField>();
    const disabled = computed(() => props.disabled || props.submitting);
    const rules = () => {
      const result: FormRules = { ...props.rules };
      for (const [name, field] of fields) {
        if (field.disabled) {
          delete result[name];
          continue;
        }
        const external = result[name];
        result[name] = [
          ...(Array.isArray(external) ? external : external ? [external] : []),
          ...field.rules,
        ];
      }
      return result;
    };
    const setValue = (name: string, value: unknown) => {
      if (disabled.value) return;
      const next = { ...state.value.value, [name]: value };
      state.set(next);
      if (errors.value[name]) {
        const message = validateValue(value, rules()[name] ?? [], next);
        const copy = { ...errors.value };
        if (message) copy[name] = message;
        else delete copy[name];
        errors.value = copy;
      }
    };
    const focus = (name: string) =>
      nextTick(() => {
        const id = fields.get(name)?.id;
        const elements = root.value?.querySelectorAll<HTMLElement>('[id]');
        if (id)
          Array.from(elements ?? [])
            .find((el) => el.id === id)
            ?.focus();
      });
    const validate = () => {
      const next = validateValues(state.value.value, rules());
      for (const control of Array.from(
        root.value?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          'input, select, textarea',
        ) ?? [],
      )) {
        if (!control.disabled && control.validity && !control.validity.valid) {
          const name = fields.has(control.name)
            ? control.name
            : [...fields].find(([, field]) => field.id === control.id)?.[0];
          if (name && !fields.get(name)?.disabled)
            next[name] ??= control.validationMessage || '请检查输入内容';
        }
      }
      errors.value = next;
      return Object.keys(errors.value).length === 0;
    };
    const reset = () => {
      if (disabled.value) return;
      errors.value = {};
      state.set({ ...props.initialValues });
      emit('reset');
    };
    provide(formKey, {
      values: state.value,
      errors: computed(() => errors.value),
      disabled,
      fields,
      rules: computed(() => props.rules),
      setValue,
      register: (name, field) => fields.set(name, field),
      unregister: (name) => fields.delete(name),
    });
    expose({
      validate,
      reset,
      getValues: () => ({ ...state.value.value }),
      setValues: (values: FormValues) => {
        if (!disabled.value) state.set({ ...state.value.value, ...values });
      },
    });
    return () =>
      h(
        'form',
        mergeProps(attrs, {
          class: 'f-form',
          ref: root,
          novalidate: true,
          'aria-busy': props.submitting || undefined,
          onSubmit: (event: Event) => {
            event.preventDefault();
            if (disabled.value) return;
            if (validate()) emit('submit', { ...state.value.value });
            else {
              emit('invalid', { ...errors.value });
              focus(Object.keys(errors.value)[0]);
            }
          },
          onReset: (event: Event) => {
            event.preventDefault();
            reset();
          },
        }),
        [
          Object.keys(errors.value).length
            ? h('div', { class: 'f-form-errors', role: 'alert' }, [
                h('strong', {}, '请检查以下内容'),
                h(
                  'ul',
                  {},
                  Object.entries(errors.value).map(([name, message]) =>
                    h(
                      'li',
                      { key: name },
                      h(
                        'button',
                        { type: 'button', class: 'f-form-error-link', onClick: () => focus(name) },
                        `${fields.get(name)?.label ?? name}：${message}`,
                      ),
                    ),
                  ),
                ),
              ])
            : null,
          h(
            'fieldset',
            { class: 'f-form-body', disabled: disabled.value },
            slots.default?.({ values: state.value.value, errors: errors.value, setValue, reset }),
          ),
        ],
      );
  },
});
export interface FormFieldSlot {
  value: unknown;
  setValue: (value: unknown) => void;
  id: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
}
export const FormField = defineComponent({
  name: 'BTDESIGNFormField',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    label: { type: String, required: true },
    description: String,
    layout: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    rules: { type: Array as PropType<ValidationRule[]>, default: () => [] },
    required: Boolean,
    disabled: Boolean,
    placeholder: String,
    type: {
      type: String as PropType<
        'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date'
      >,
      default: 'text',
    },
    options: { type: Array as PropType<ChoiceOption[]>, default: () => [] },
  },
  setup(props, { attrs, slots }) {
    const context = inject(formKey);
    const generated = useControlId('form-field');
    const id = String(attrs.id ?? generated);
    watch(
      () =>
        [
          props.name,
          props.label,
          props.rules,
          props.required,
          props.type,
          props.disabled || Boolean(context?.disabled.value),
        ] as const,
      ([name, label, rules, required, type, disabled], old) => {
        if (old && old[0] !== name) context?.unregister(old[0]);
        context?.register(name, {
          id,
          label,
          rules: [
            ...rules,
            ...(required ? [{ required: true }] : []),
            ...(type === 'email' ? [{ type: 'email' as const }] : []),
          ],
          disabled,
        });
      },
      { immediate: true },
    );
    onBeforeUnmount(() => context?.unregister(props.name));
    return () => {
      const disabled = props.disabled || Boolean(context?.disabled.value);
      const error = context?.errors.value[props.name];
      const inheritedRules = context?.rules.value[props.name];
      const required =
        props.required ||
        props.rules.some((r) => r.required) ||
        (Array.isArray(inheritedRules)
          ? inheritedRules
          : inheritedRules
            ? [inheritedRules]
            : []
        ).some((rule) => rule.required);
      const value = context?.values.value[props.name] ?? (props.type === 'checkbox' ? false : '');
      const setValue = (next: unknown) => {
        if (!disabled) context?.setValue(props.name, next);
      };
      const describedBy =
        [props.description ? `${id}-description` : '', error ? `${id}-error` : '']
          .filter(Boolean)
          .join(' ') || undefined;
      const binding: FormFieldSlot = {
        value,
        setValue,
        id,
        disabled,
        required,
        invalid: Boolean(error),
        describedBy,
      };
      const controlProps = {
        id,
        name: props.name,
        disabled,
        required,
        placeholder: props.placeholder,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error) || undefined,
        'aria-labelledby': `${id}-label`,
      };
      const content = slots.default
        ? slots.default(binding)
        : props.type === 'textarea'
          ? h('textarea', {
              ...controlProps,
              class: 'f-textarea',
              value: String(value),
              onInput: (e: Event) => setValue((e.target as HTMLTextAreaElement).value),
            })
          : props.type === 'select'
            ? h(
                'select',
                {
                  ...controlProps,
                  class: 'f-select',
                  value: String(value),
                  onChange: (e: Event) => setValue((e.target as HTMLSelectElement).value),
                },
                [
                  h('option', { value: '' }, props.placeholder ?? '请选择'),
                  ...props.options.map((option) =>
                    h(
                      'option',
                      {
                        value: option.value,
                        disabled: option.disabled,
                        selected: String(value) === option.value,
                      },
                      option.label,
                    ),
                  ),
                ],
              )
            : h('input', {
                ...controlProps,
                type: props.type,
                class: props.type === 'checkbox' ? 'f-checkbox' : 'f-input',
                value: props.type === 'checkbox' ? undefined : (value as string | number),
                checked: props.type === 'checkbox' ? Boolean(value) : undefined,
                onInput:
                  props.type === 'checkbox'
                    ? undefined
                    : (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        setValue(
                          props.type === 'number'
                            ? target.value === ''
                              ? ''
                              : target.valueAsNumber
                            : target.value,
                        );
                      },
                onChange:
                  props.type === 'checkbox'
                    ? (e: Event) => setValue((e.target as HTMLInputElement).checked)
                    : undefined,
              });
      return h(
        Field,
        {
          ...attrs,
          id,
          label: props.label,
          description: props.description,
          layout: props.layout,
          error,
          required,
          disabled,
          class: ['f-form-field', attrs.class],
        },
        { default: () => content },
      );
    };
  },
});
export const FormSection = defineComponent({
  name: 'BTDESIGNFormSection',
  inheritAttrs: false,
  props: { title: String, description: String, disabled: Boolean },
  setup(props, { attrs, slots }) {
    const parent = inject(formKey);
    if (parent)
      provide(formKey, {
        ...parent,
        disabled: computed(() => props.disabled || parent.disabled.value),
      });
    return () =>
      h('fieldset', mergeProps(attrs, { class: 'f-form-section', disabled: props.disabled }), [
        props.title ? h('legend', { class: 'f-form-section-title' }, props.title) : null,
        props.description
          ? h('p', { class: 'f-form-section-description' }, props.description)
          : null,
        slots.default?.(),
      ]);
  },
});
export const FormActions = defineComponent({
  name: 'BTDESIGNFormActions',
  setup(_, { attrs, slots }) {
    return () => h('div', mergeProps(attrs, { class: 'f-form-actions' }), slots.default?.());
  },
});

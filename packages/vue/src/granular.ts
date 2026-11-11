import { computed, defineComponent, h, mergeProps, ref } from 'vue';
import type { PropType } from 'vue';
import { controlProps, useControlId, useFieldControl } from './field.js';
import type { ControlSize } from './field.js';
import { stepNativeNumber } from './number-utils.js';

const part = (name: string, tag: string, className: string) =>
  defineComponent({
    name: `BTDESIGN${name}`,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h(tag, mergeProps(attrs, { class: className }), slots.default?.());
    },
  });

export const InputGroup = part('InputGroup', 'div', 'f-input-group');
export const InputAddon = part('InputAddon', 'span', 'f-input-addon');
export const CardHeader = part('CardHeader', 'div', 'f-card-header');
export const CardTitle = part('CardTitle', 'h3', 'f-card-title');
export const CardDescription = part('CardDescription', 'p', 'f-card-description');
export const CardContent = part('CardContent', 'div', 'f-card-content');
export const CardFooter = part('CardFooter', 'div', 'f-card-footer');
export const TableCaption = part('TableCaption', 'caption', 'f-table-caption');
export const TableHeader = part('TableHeader', 'thead', 'f-table-header');
export const TableBody = part('TableBody', 'tbody', 'f-table-body');
export const TableFooter = part('TableFooter', 'tfoot', 'f-table-footer');
export const TableRow = part('TableRow', 'tr', 'f-table-row');
export const TableHead = defineComponent({
  name: 'BTDESIGNTableHead',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h('th', mergeProps({ scope: 'col' }, attrs, { class: 'f-table-head' }), slots.default?.());
  },
});
export const TableCell = part('TableCell', 'td', 'f-table-cell');

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const RadioGroup = defineComponent({
  name: 'BTDESIGNRadioGroup',
  inheritAttrs: false,
  props: {
    options: { type: Array as PropType<RadioOption[]>, required: true },
    modelValue: { type: String, default: undefined },
    defaultValue: String,
    name: String,
    label: String,
    disabled: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' },
    ...controlProps,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const field = useFieldControl();
    const generatedId = useControlId('radio');
    const local = ref(props.defaultValue);
    const value = computed(() => (props.modelValue === undefined ? local.value : props.modelValue));
    return () => {
      const bound = field({ ...attrs, disabled: props.disabled ?? attrs.disabled }, props.invalid);
      const id = String(bound.id ?? generatedId);
      const firstEnabled = props.options.findIndex((option) => !option.disabled);
      const isDisabled = bound.disabled === true || bound.disabled === '';
      const { class: className, style, id: _id, name: _name, ...otherAttrs } = attrs;
      const invalid = bound['aria-invalid'] === true || bound['aria-invalid'] === 'true';
      return h(
        'div',
        {
          id: `${id}-group`,
          class: [
            'f-radio-group',
            `f-radio-group--${props.orientation}`,
            `f-control--${props.controlSize}`,
            invalid && 'f-control--invalid',
            className,
          ],
          style,
          role: 'radiogroup',
          'aria-label': attrs['aria-label'] ?? props.label,
          'aria-labelledby':
            attrs['aria-label'] || props.label
              ? attrs['aria-labelledby']
              : bound['aria-labelledby'],
          'aria-describedby': bound['aria-describedby'],
          'aria-invalid': bound['aria-invalid'],
          'aria-required': bound.required || undefined,
          'aria-disabled': isDisabled || undefined,
          'aria-orientation': props.orientation,
        },
        props.options.map((option, index) => {
          const optionId =
            index === (firstEnabled === -1 ? 0 : firstEnabled) ? id : `${id}-option-${index}`;
          const labelId = `${id}-option-${index}-label`;
          const descriptionId = option.description
            ? `${id}-option-${index}-description`
            : undefined;
          return h(
            'label',
            {
              class: 'f-radio-option',
              for: optionId,
              key: option.value,
              'data-disabled': isDisabled || option.disabled || undefined,
            },
            [
              h(
                'input',
                mergeProps(otherAttrs, bound, {
                  id: optionId,
                  class: 'f-radio',
                  type: 'radio',
                  name: props.name ?? attrs.name ?? generatedId,
                  value: option.value,
                  checked: value.value === option.value,
                  disabled: isDisabled || option.disabled,
                  // Name each choice from its title, keeping descriptions separate.
                  'aria-label': undefined,
                  'aria-labelledby': labelId,
                  'aria-describedby':
                    [bound['aria-describedby'], descriptionId].filter(Boolean).join(' ') ||
                    undefined,
                  onChange: (event: Event) => {
                    if (
                      !event.defaultPrevented &&
                      !isDisabled &&
                      !option.disabled &&
                      (event.target as HTMLInputElement).checked
                    ) {
                      local.value = option.value;
                      emit('update:modelValue', option.value);
                    }
                  },
                }),
              ),
              h('span', { class: 'f-radio-option-content' }, [
                h('span', { class: 'f-radio-option-label', id: labelId }, option.label),
                option.description
                  ? h(
                      'span',
                      { class: 'f-radio-option-description', id: descriptionId },
                      option.description,
                    )
                  : null,
              ]),
            ],
          );
        }),
      );
    };
  },
});

const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const NumberInput = defineComponent({
  name: 'BTDESIGNNumberInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: [Number, String] as PropType<number | ''>, default: undefined },
    defaultValue: { type: [Number, String] as PropType<number | ''>, default: '' },
    min: Number,
    max: Number,
    step: { type: Number, default: 1 },
    decrementLabel: { type: String, default: '减少数值' },
    incrementLabel: { type: String, default: '增加数值' },
    disabled: { type: Boolean, default: undefined },
    ...controlProps,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, expose }) {
    const field = useFieldControl();
    const input = ref<HTMLInputElement>();
    expose({ focus: () => input.value?.focus?.() });
    const local = ref<number | ''>(finite(props.defaultValue) ? props.defaultValue : '');
    const current = computed(() => {
      const candidate = props.modelValue === undefined ? local.value : props.modelValue;
      return finite(candidate) ? candidate : '';
    });
    // Native step base uses the value content attribute when min is absent.
    // Vue normally patches only the live value property; sync defaultValue on
    // this control so CSR and SSR match React's value-attribute behavior.
    const syncStepBase = () => {
      if (input.value) input.value.defaultValue = String(current.value);
    };
    const bounds = () => {
      const min = finite(props.min) ? props.min : -Infinity;
      const max = finite(props.max) ? Math.max(min, props.max) : Infinity;
      return { min, max };
    };
    const step = () => (finite(props.step) && props.step > 0 ? props.step : 1);
    const clamp = (value: number) => {
      const { min, max } = bounds();
      return Math.min(max, Math.max(min, value));
    };
    const update = (value: number | '') => {
      if (value !== '' && !finite(value)) return;
      if (props.modelValue === undefined) local.value = value;
      emit('update:modelValue', value);
    };
    return () => {
      const { class: className, style, ...inputAttrs } = attrs;
      const bound = field(
        { ...inputAttrs, disabled: props.disabled ?? inputAttrs.disabled },
        props.invalid,
      );
      const disabled = bound.disabled === true || bound.disabled === '';
      const readOnly = attrs.readonly === true || attrs.readonly === '' || attrs.readOnly === true;
      const invalid = bound['aria-invalid'] === true || bound['aria-invalid'] === 'true';
      const { min, max } = bounds();
      const change = (direction: -1 | 1) => {
        if (disabled || readOnly) return;
        const next = stepNativeNumber(input.value, direction, current.value);
        if (next !== current.value) update(next);
        input.value?.focus?.();
      };
      return h(
        'div',
        {
          class: [
            'f-number-input',
            `f-control--${props.controlSize}`,
            invalid && 'f-control--invalid',
            className,
          ],
          style,
          'data-disabled': disabled || undefined,
        },
        [
          h(
            'button',
            {
              class: 'f-number-input-step',
              type: 'button',
              'aria-label': props.decrementLabel,
              disabled: disabled || readOnly || (current.value !== '' && current.value <= min),
              onClick: () => change(-1),
            },
            '−',
          ),
          h(
            'input',
            mergeProps(inputAttrs, bound, {
              ref: input,
              onVnodeMounted: syncStepBase,
              onVnodeUpdated: syncStepBase,
              class: [
                'f-input',
                `f-control--${props.controlSize}`,
                invalid && 'f-control--invalid',
              ],
              type: 'number',
              inputmode: attrs.inputmode ?? attrs.inputMode ?? 'decimal',
              value: current.value,
              min: finite(min) ? min : undefined,
              max: finite(max) ? max : undefined,
              step: step(),
              onInput: (event: Event) => {
                if (event.defaultPrevented || disabled || readOnly) return;
                const target = event.target as HTMLInputElement;
                if (target.validity?.badInput) return;
                update(target.value === '' ? '' : Number(target.value));
              },
              onBlur: (event: Event) => {
                if (event.defaultPrevented || disabled || readOnly) return;
                const target = event.target as HTMLInputElement;
                if (target.value === '' || target.validity?.badInput) return;
                const value = Number(target.value);
                if (finite(value) && clamp(value) !== value) update(clamp(value));
              },
            }),
          ),
          h(
            'button',
            {
              class: 'f-number-input-step',
              type: 'button',
              'aria-label': props.incrementLabel,
              disabled: disabled || readOnly || (current.value !== '' && current.value >= max),
              onClick: () => change(1),
            },
            '+',
          ),
        ],
      );
    };
  },
});

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export const Breadcrumb = defineComponent({
  name: 'BTDESIGNBreadcrumb',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<BreadcrumbItem[]>, required: true },
    label: { type: String, default: '面包屑导航' },
  },
  setup(props, { attrs }) {
    return () =>
      h('nav', mergeProps({ 'aria-label': props.label }, attrs, { class: 'f-breadcrumb' }), [
        h(
          'ol',
          { class: 'f-breadcrumb-list' },
          props.items.map((item, index) => {
            const current = index === props.items.length - 1;
            const href =
              item.href &&
              !/^(?:javascript|data|vbscript):/i.test(
                item.href.replace(/[\u0000-\u0020\u007f]/g, ''),
              )
                ? item.href
                : undefined;
            return h('li', { class: 'f-breadcrumb-item', key: index }, [
              index
                ? h('span', { class: 'f-breadcrumb-separator', 'aria-hidden': 'true' }, '/')
                : null,
              href && !current
                ? h('a', { href }, item.label)
                : h('span', { 'aria-current': current ? 'page' : undefined }, item.label),
            ]);
          }),
        ),
      ]);
  },
});

export const Pagination = defineComponent({
  name: 'BTDESIGNPagination',
  inheritAttrs: false,
  props: {
    page: { type: Number, required: true },
    total: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
    siblingCount: { type: Number, default: 1 },
    label: { type: String, default: '分页导航' },
    disabled: Boolean,
  },
  emits: ['update:page'],
  setup(props, { attrs, emit }) {
    return () => {
      const pageSize =
        finite(props.pageSize) && props.pageSize >= 1 ? Math.floor(props.pageSize) : 10;
      const total = finite(props.total)
        ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(props.total)))
        : 0;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      const page = finite(props.page) ? Math.min(pages, Math.max(1, Math.floor(props.page))) : 1;
      const siblings = finite(props.siblingCount)
        ? Math.min(5, Math.max(0, Math.floor(props.siblingCount)))
        : 1;
      const visible = new Set([1, pages]);
      for (
        let index = Math.max(1, page - siblings);
        index <= Math.min(pages, page + siblings);
        index++
      )
        visible.add(index);
      const numbers = [...visible].sort((a, b) => a - b);
      const select = (value: number) => {
        if (!props.disabled && total > 0 && value !== page)
          emit('update:page', Math.min(pages, Math.max(1, value)));
      };
      const button = (text: string, target: number, disabled: boolean, current = false) =>
        h(
          'button',
          {
            class: 'f-pagination-button',
            type: 'button',
            disabled: props.disabled || disabled || total === 0,
            'aria-label': current
              ? `第 ${target} 页，当前页`
              : /^\d+$/.test(text)
                ? `第 ${target} 页`
                : text,
            'aria-current': current ? 'page' : undefined,
            onClick: () => select(target),
          },
          text,
        );
      return h('nav', mergeProps({ 'aria-label': props.label }, attrs, { class: 'f-pagination' }), [
        h('ul', { class: 'f-pagination-list' }, [
          h('li', {}, button('上一页', page - 1, page <= 1)),
          ...numbers.flatMap((number, index) => [
            index > 0 && number - numbers[index - 1] === 2
              ? h('li', { key: number - 1 }, button(String(number - 1), number - 1, false))
              : index > 0 && number - numbers[index - 1] > 2
                ? h(
                    'li',
                    { class: 'f-pagination-ellipsis', 'aria-hidden': 'true', key: `gap-${number}` },
                    '…',
                  )
                : null,
            h('li', { key: number }, button(String(number), number, false, number === page)),
          ]),
          h('li', {}, button('下一页', page + 1, page >= pages)),
        ]),
      ]);
    };
  },
});

export { EmptyState } from './empty-state.js';
export type { EmptyStateVariant, EmptyStateSize } from './empty-state.js';

export const Spinner = defineComponent({
  name: 'BTDESIGNSpinner',
  inheritAttrs: false,
  props: {
    label: { type: String, default: '加载中' },
    size: { type: String as PropType<ControlSize>, default: 'md' },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        'span',
        mergeProps(attrs, {
          class: ['f-spinner-wrap', `f-spinner-wrap--${props.size}`],
          role: 'status',
          'aria-label': attrs['aria-label'] ?? props.label,
        }),
        [
          h('span', { class: 'f-spinner', 'aria-hidden': 'true' }),
          h('span', { class: 'f-spinner-label' }, props.label),
        ],
      );
  },
});

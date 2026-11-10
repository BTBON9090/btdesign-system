import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import type { App, PropType, VNodeChild } from 'vue';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type Tone = 'info' | 'success' | 'warning' | 'danger';
export interface TabItem {
  value: string;
  label: string;
  content?: VNodeChild;
  disabled?: boolean;
}

export const Button = defineComponent({
  name: 'BTDESIGNButton',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ButtonVariant>, default: 'primary' },
    size: { type: String as PropType<Size>, default: 'md' },
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    disabled: Boolean,
    loading: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'button',
        mergeProps(attrs, {
          class: ['f-button', `f-button--${props.variant}`, `f-button--${props.size}`],
          type: props.type,
          disabled: props.disabled || props.loading,
          'aria-busy': props.loading || undefined,
        }),
        [
          props.loading ? h('span', { class: 'f-spinner', 'aria-hidden': 'true' }) : null,
          slots.default?.(),
        ],
      );
  },
});

export const Input = defineComponent({
  name: 'BTDESIGNInput',
  inheritAttrs: false,
  props: { modelValue: { type: [String, Number], default: undefined }, invalid: Boolean },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h(
        'input',
        mergeProps(attrs, {
          class: 'f-input',
          value: props.modelValue === undefined ? attrs.value : props.modelValue,
          'aria-invalid': props.invalid || attrs['aria-invalid'],
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        }),
      );
  },
});

export const Textarea = defineComponent({
  name: 'BTDESIGNTextarea',
  inheritAttrs: false,
  props: { modelValue: { type: String, default: undefined }, invalid: Boolean },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h(
        'textarea',
        mergeProps(attrs, {
          class: 'f-textarea',
          value: props.modelValue === undefined ? attrs.value : props.modelValue,
          'aria-invalid': props.invalid || attrs['aria-invalid'],
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLTextAreaElement).value),
        }),
      );
  },
});

export const Select = defineComponent({
  name: 'BTDESIGNSelect',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | Array<string | number>>,
      default: undefined,
    },
    invalid: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const modelValue = computed(() =>
      props.modelValue === undefined ? attrs.value : props.modelValue,
    );
    const selectedOptions = (nodes: VNodeChild[]): VNodeChild[] =>
      nodes.map((node) => {
        if (!isVNode(node)) return node;
        if (node.type === 'option' && modelValue.value !== undefined) {
          const optionValue = String(node.props?.value ?? node.children ?? '');
          const selected = Array.isArray(modelValue.value)
            ? modelValue.value.some((value) => String(value) === optionValue)
            : String(modelValue.value) === optionValue;
          return cloneVNode(node, { selected });
        }
        if (Array.isArray(node.children)) {
          const cloned = cloneVNode(node);
          cloned.children = selectedOptions(node.children);
          return cloned;
        }
        return node;
      });
    return () =>
      h(
        'select',
        mergeProps(attrs, {
          class: 'f-select',
          value: Array.isArray(modelValue.value) ? undefined : modelValue.value,
          'aria-invalid': props.invalid || attrs['aria-invalid'],
          onChange: (event: Event) => {
            const target = event.target as HTMLSelectElement;
            emit(
              'update:modelValue',
              target.multiple
                ? Array.from(target.selectedOptions, (option) => option.value)
                : target.value,
            );
          },
        }),
        selectedOptions(slots.default?.() ?? []),
      );
  },
});

export const Checkbox = defineComponent({
  name: 'BTDESIGNCheckbox',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: undefined },
    disabled: Boolean,
    label: String,
    indeterminate: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const input = ref<HTMLInputElement>();
    watch(
      () => props.indeterminate,
      (value) => {
        if (input.value) input.value.indeterminate = value;
      },
    );
    onMounted(() => {
      if (input.value) input.value.indeterminate = props.indeterminate;
    });
    return () =>
      h('label', { class: 'f-choice' }, [
        h(
          'input',
          mergeProps(attrs, {
            ref: input,
            type: 'checkbox',
            class: 'f-checkbox',
            checked: props.modelValue === undefined ? attrs.checked : props.modelValue,
            disabled: props.disabled,
            'aria-checked': props.indeterminate
              ? 'mixed'
              : props.modelValue === undefined
                ? attrs.checked
                : props.modelValue,
            onChange: (event: Event) =>
              emit('update:modelValue', (event.target as HTMLInputElement).checked),
          }),
        ),
        h('span', {}, slots.default?.() ?? props.label),
      ]);
  },
});

export const Switch = defineComponent({
  name: 'BTDESIGNSwitch',
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    disabled: Boolean,
    label: String,
    name: String,
    value: { type: String, default: 'on' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    return () =>
      h('label', { class: 'f-choice' }, [
        h(
          'button',
          mergeProps(attrs, {
            type: 'button',
            role: 'switch',
            class: 'f-switch',
            disabled: props.disabled,
            'aria-checked': props.modelValue,
            onClick: () => {
              if (!props.disabled) emit('update:modelValue', !props.modelValue);
            },
          }),
          h('span', { class: 'f-switch-thumb', 'aria-hidden': 'true' }),
        ),
        h('span', {}, slots.default?.() ?? props.label),
        props.name && props.modelValue
          ? h('input', {
              type: 'hidden',
              name: props.name,
              value: props.value,
              disabled: props.disabled,
            })
          : null,
      ]);
  },
});

export const Badge = defineComponent({
  name: 'BTDESIGNBadge',
  inheritAttrs: false,
  props: { variant: { type: String as PropType<Tone | 'default'>, default: 'default' } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'span',
        mergeProps(attrs, { class: ['f-badge', `f-badge--${props.variant}`] }),
        slots.default?.(),
      );
  },
});

export const Card = defineComponent({
  name: 'BTDESIGNCard',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', mergeProps(attrs, { class: 'f-card' }), slots.default?.());
  },
});

export const Alert = defineComponent({
  name: 'BTDESIGNAlert',
  inheritAttrs: false,
  props: { variant: { type: String as PropType<Tone>, default: 'info' }, title: String },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        mergeProps({ role: props.variant === 'danger' ? 'alert' : 'status' }, attrs, {
          class: ['f-alert', `f-alert--${props.variant}`],
        }),
        [
          props.title ? h('div', { class: 'f-alert-title' }, props.title) : null,
          h('div', { class: 'f-alert-description' }, slots.default?.()),
        ],
      );
  },
});

let idSequence = 0;
export const Tabs = defineComponent({
  name: 'BTDESIGNTabs',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<TabItem[]>, required: true },
    modelValue: String,
    defaultValue: String,
    id: String,
    label: { type: String, default: '选项卡' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const localValue = ref(props.defaultValue ?? props.items.find((item) => !item.disabled)?.value);
    const active = computed(() => {
      const candidate = props.modelValue ?? localValue.value;
      return props.items.some((item) => item.value === candidate && !item.disabled)
        ? candidate
        : props.items.find((item) => !item.disabled)?.value;
    });
    const generatedId = ref<string>();
    const baseId = computed(() => props.id ?? generatedId.value);
    const buttons = new Map<string, HTMLButtonElement>();
    onMounted(() => {
      generatedId.value = `forma-vue-tabs-${++idSequence}`;
    });
    const select = (value: string) => {
      localValue.value = value;
      emit('update:modelValue', value);
    };
    const keyDown = (event: KeyboardEvent, value: string) => {
      const enabled = props.items.filter((item) => !item.disabled);
      const index = enabled.findIndex((item) => item.value === value);
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % enabled.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + enabled.length) % enabled.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = enabled.length - 1;
      else return;
      if (!enabled[next]) return;
      event.preventDefault();
      select(enabled[next].value);
      buttons.get(enabled[next].value)?.focus();
    };
    const tabId = (index: number) => (baseId.value ? `${baseId.value}-tab-${index}` : undefined);
    const panelId = (index: number) =>
      baseId.value ? `${baseId.value}-panel-${index}` : undefined;
    return () =>
      h('div', mergeProps(attrs, { class: 'f-tabs' }), [
        h(
          'div',
          { class: 'f-tabs-list', role: 'tablist', 'aria-label': props.label },
          props.items.map((item, index) =>
            h(
              'button',
              {
                ref: (element: unknown) => {
                  if (element) buttons.set(item.value, element as HTMLButtonElement);
                  else buttons.delete(item.value);
                },
                key: item.value,
                type: 'button',
                role: 'tab',
                class: 'f-tab',
                id: tabId(index),
                'aria-controls': panelId(index),
                'aria-selected': active.value === item.value,
                disabled: item.disabled,
                tabindex: active.value === item.value ? 0 : -1,
                onClick: () => select(item.value),
                onKeydown: (event: KeyboardEvent) => keyDown(event, item.value),
              },
              item.label,
            ),
          ),
        ),
        ...props.items.map((item, index) =>
          h(
            'div',
            {
              key: item.value,
              role: 'tabpanel',
              class: 'f-tab-panel',
              id: panelId(index),
              'aria-labelledby': tabId(index),
              'aria-label': !baseId.value ? item.label : undefined,
              hidden: active.value !== item.value,
              tabindex: 0,
            },
            [
              slots[item.value]?.() ??
                (active.value === item.value ? slots.default?.() : null) ??
                item.content,
            ],
          ),
        ),
      ]);
  },
});

export const Dialog = defineComponent({
  name: 'BTDESIGNDialog',
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    title: { type: String, required: true },
    description: String,
    closeLabel: { type: String, default: '关闭对话框' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const dialog = ref<HTMLDialogElement>();
    const descriptionId = ref<string>();
    let returnFocus: HTMLElement | null = null;
    let mounted = false;
    const syncOpen = async () => {
      await nextTick();
      const element = dialog.value;
      if (!mounted || !element) return;
      if (props.modelValue && !element.open) {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        element.showModal();
      } else if (!props.modelValue && element.open) element.close();
    };
    onMounted(() => {
      mounted = true;
      descriptionId.value = `forma-vue-dialog-description-${++idSequence}`;
      void syncOpen();
    });
    watch(() => props.modelValue, syncOpen);
    onBeforeUnmount(() => {
      mounted = false;
      if (dialog.value?.open) {
        dialog.value.close();
        if (returnFocus?.isConnected) returnFocus.focus();
      }
    });
    const requestClose = () => emit('update:modelValue', false);
    return () =>
      h(
        'dialog',
        mergeProps(attrs, {
          ref: dialog,
          class: 'f-dialog',
          'aria-label': props.title,
          'aria-describedby':
            attrs['aria-describedby'] ?? (props.description ? descriptionId.value : undefined),
          onCancel: (event: Event) => {
            event.preventDefault();
            requestClose();
          },
          onClose: () => {
            if (props.modelValue) requestClose();
            returnFocus?.focus();
          },
          onClick: (event: MouseEvent) => {
            if (event.target !== dialog.value) return;
            const bounds = dialog.value.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              requestClose();
          },
        }),
        [
          h('div', { class: 'f-dialog-header' }, [
            h('h2', { class: 'f-dialog-title' }, props.title),
            props.description
              ? h(
                  'p',
                  { class: 'f-dialog-description', id: descriptionId.value },
                  props.description,
                )
              : null,
            h(
              'button',
              {
                class: 'f-dialog-close',
                type: 'button',
                'aria-label': props.closeLabel,
                onClick: requestClose,
              },
              '×',
            ),
          ]),
          h('div', { class: 'f-dialog-body' }, slots.default?.()),
          slots.footer ? h('div', { class: 'f-dialog-footer' }, slots.footer()) : null,
        ],
      );
  },
});

export const Avatar = defineComponent({
  name: 'BTDESIGNAvatar',
  inheritAttrs: false,
  props: {
    src: String,
    name: String,
    alt: String,
    fallback: String,
    size: { type: String as PropType<Size>, default: 'md' },
  },
  setup(props, { attrs, slots }) {
    const failed = ref(false);
    watch(
      () => props.src,
      () => {
        failed.value = false;
      },
    );
    return () =>
      h(
        'span',
        mergeProps(attrs, {
          class: ['f-avatar', `f-avatar--${props.size}`],
          role: !props.src || failed.value ? 'img' : undefined,
          'aria-label':
            !props.src || failed.value
              ? props.name || props.alt || props.fallback || '头像'
              : undefined,
        }),
        props.src && !failed.value
          ? h('img', {
              src: props.src,
              alt: props.alt ?? props.name ?? '',
              onError: () => {
                failed.value = true;
              },
            })
          : (slots.default?.() ??
              props.fallback ??
              ((props.name ?? props.alt ?? '')
                .trim()
                .split(/\s+/)
                .map((part) => Array.from(part)[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() ||
                '?')),
      );
  },
});

export const Separator = defineComponent({
  name: 'BTDESIGNSeparator',
  inheritAttrs: false,
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        'hr',
        mergeProps(attrs, {
          class: ['f-separator', props.orientation === 'vertical' && 'f-separator--vertical'],
          role: 'separator',
          'aria-orientation': props.orientation,
        }),
      );
  },
});

export const Table = defineComponent({
  name: 'BTDESIGNTable',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        'div',
        {
          class: 'f-table-scroll',
          tabindex: 0,
          role: 'region',
          'aria-label': attrs['aria-label'] ?? '数据表格',
        },
        [h('table', mergeProps(attrs, { class: 'f-table' }), slots.default?.())],
      );
  },
});

export const Skeleton = defineComponent({
  name: 'BTDESIGNSkeleton',
  inheritAttrs: false,
  props: { width: [String, Number], height: [String, Number] },
  setup(props, { attrs }) {
    return () =>
      h(
        'span',
        mergeProps(
          {
            style: {
              width: typeof props.width === 'number' ? `${props.width}px` : props.width,
              height: typeof props.height === 'number' ? `${props.height}px` : props.height,
            },
          },
          attrs,
          { class: 'f-skeleton', 'aria-hidden': 'true' },
        ),
      );
  },
});

export const Progress = defineComponent({
  name: 'BTDESIGNProgress',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    label: String,
  },
  setup(props, { attrs }) {
    return () => {
      const max = Number.isFinite(props.max) && props.max > 0 ? props.max : 100;
      const value = Number.isFinite(props.value) ? Math.min(max, Math.max(0, props.value)) : 0;
      return h('div', { class: 'f-progress-wrap' }, [
        props.label
          ? h('div', { class: 'f-progress-label' }, [
              h('span', {}, props.label),
              h('span', {}, `${Math.round((value / max) * 100)}%`),
            ])
          : null,
        h(
          'div',
          mergeProps(attrs, {
            class: 'f-progress',
            role: 'progressbar',
            'aria-valuenow': value,
            'aria-valuemin': 0,
            'aria-valuemax': max,
            'aria-label': attrs['aria-label'] ?? props.label ?? '进度',
          }),
          h('div', { class: 'f-progress-fill', style: { width: `${(value / max) * 100}%` } }),
        ),
      ]);
    };
  },
});

const components = {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Badge,
  Card,
  Alert,
  Tabs,
  Dialog,
  Avatar,
  Separator,
  Table,
  Skeleton,
  Progress,
};
export const BTDESIGNPlugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components))
      app.component(`F${name}`, component);
  },
};

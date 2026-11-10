import { defineComponent, h, mergeProps, computed, getCurrentInstance } from 'vue';
import type { PropType } from 'vue';
import type { ChoiceOption, FileItem } from '@btdesign/engine';
import { safeHref, formatFileSize } from '@btdesign/engine';
import { useControlId, useFieldControl } from './field.js';
import { useValue, asArray, isDisabled } from './enterprise-shared.js';

export const Radio = defineComponent({
  name: 'BTDESIGNRadio',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Boolean], default: undefined },
    defaultValue: { type: [String, Boolean], default: undefined },
    value: { type: String, default: 'on' },
    label: String,
    name: String,
    disabled: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const field = useFieldControl();
    const state = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit('update:modelValue', v),
    );
    return () => {
      const bound = field({ ...attrs, disabled: props.disabled });
      return h('label', { class: 'f-choice' }, [
        h(
          'input',
          mergeProps(attrs, bound, {
            type: 'radio',
            name: props.name,
            value: props.value,
            class: 'f-radio',
            disabled: bound.disabled,
            checked:
              typeof state.value.value === 'boolean'
                ? state.value.value
                : state.value.value === props.value,
            onChange: (e: Event) => {
              if (!isDisabled(bound.disabled) && (e.target as HTMLInputElement).checked)
                state.set(props.value);
            },
          }),
        ),
        h('span', {}, slots.default?.() ?? props.label),
      ]);
    };
  },
});
const groupProps = {
  options: { type: Array as PropType<ChoiceOption[]>, required: true },
  modelValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
  defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
  multiple: Boolean,
  label: String,
  name: String,
  disabled: { type: Boolean, default: undefined },
} as const;
function group(name: string, kind: 'checkbox' | 'toggle' | 'segmented') {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: groupProps,
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      const id = useControlId('choice');
      const field = useFieldControl();
      const multi = () => kind === 'checkbox' || (kind === 'toggle' && props.multiple);
      const state = useValue(
        () => props.modelValue,
        props.defaultValue ?? (multi() ? [] : ''),
        (v) => emit('update:modelValue', v),
      );
      return () => {
        const bound = field({ ...attrs, disabled: props.disabled });
        const disabled = isDisabled(bound.disabled);
        const selected = asArray(state.value.value);
        return h(
          'div',
          mergeProps(attrs, bound, {
            class: [
              kind === 'checkbox'
                ? 'f-choice-group'
                : kind === 'segmented'
                  ? 'f-toggle-group f-segmented'
                  : 'f-toggle-group',
            ],
            role: multi() ? 'group' : 'radiogroup',
            'aria-label': props.label,
            'aria-disabled': disabled || undefined,
          }),
          props.options.map((option, index) =>
            h(
              'label',
              {
                class: [
                  kind === 'checkbox' ? 'f-choice-option' : 'f-toggle-option',
                  selected.includes(option.value) && 'is-selected',
                  (disabled || option.disabled) && 'is-disabled',
                ],
                key: option.value,
                'data-selected': selected.includes(option.value) || undefined,
                'data-disabled': disabled || option.disabled || undefined,
              },
              [
                h('input', {
                  class: kind === 'checkbox' ? 'f-choice-input f-checkbox' : 'f-toggle-input',
                  type: multi() ? 'checkbox' : 'radio',
                  name: props.name ?? (multi() ? undefined : id),
                  value: option.value,
                  disabled: disabled || option.disabled,
                  checked: selected.includes(option.value),
                  'aria-labelledby': `${id}-${index}-label`,
                  'aria-describedby': option.description ? `${id}-${index}-description` : undefined,
                  onChange: (event: Event) => {
                    if (disabled || option.disabled) return;
                    const checked = (event.target as HTMLInputElement).checked;
                    state.set(
                      multi()
                        ? checked
                          ? [...new Set([...selected, option.value])]
                          : selected.filter((v) => v !== option.value)
                        : option.value,
                    );
                  },
                }),
                h('span', { class: 'f-choice-copy' }, [
                  h('span', { class: 'f-choice-label', id: `${id}-${index}-label` }, option.label),
                  option.description
                    ? h(
                        'small',
                        { class: 'f-choice-description', id: `${id}-${index}-description` },
                        option.description,
                      )
                    : null,
                ]),
              ],
            ),
          ),
        );
      };
    },
  });
}
export const CheckboxGroup = group('BTDESIGNCheckboxGroup', 'checkbox');
export const ToggleGroup = group('BTDESIGNToggleGroup', 'toggle');
export const Segmented = group('BTDESIGNSegmented', 'segmented');
export const ButtonGroup = defineComponent({
  name: 'BTDESIGNButtonGroup',
  props: { label: String },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'div',
        mergeProps(attrs, { class: 'f-button-group', role: 'group', 'aria-label': props.label }),
        slots.default?.(),
      );
  },
});
function part(name: string, tag: string, css: string) {
  return defineComponent({
    name,
    setup(_, { attrs, slots }) {
      return () => h(tag, mergeProps(attrs, { class: css }), slots.default?.());
    },
  });
}
export const List = part('BTDESIGNList', 'ul', 'f-list');
export const ListItem = part('BTDESIGNListItem', 'li', 'f-list-item');
export const ListItemContent = part('BTDESIGNListItemContent', 'div', 'f-list-item-content');
export const ListItemActions = part('BTDESIGNListItemActions', 'div', 'f-list-item-actions');
export const FileList = defineComponent({
  name: 'BTDESIGNFileList',
  inheritAttrs: false,
  props: {
    files: { type: Array as PropType<FileItem[]>, required: true },
    label: { type: String, default: '文件列表' },
    disabled: Boolean,
    emptyText: { type: String, default: '暂无文件' },
  },
  emits: ['remove', 'retry'],
  setup(props, { attrs, emit }) {
    const instance = getCurrentInstance();
    return () =>
      h(
        'ul',
        mergeProps(attrs, { class: ['f-list', 'f-file-list'], 'aria-label': props.label }),
        props.files.length
          ? props.files.map((file) =>
              h('li', { class: 'f-list-item', key: file.id }, [
                h('div', { class: 'f-list-item-content' }, [
                  safeHref(file.url)
                    ? h('a', { href: safeHref(file.url), download: file.name }, file.name)
                    : h('strong', {}, file.name),
                  h('small', { class: 'f-file-meta' }, [
                    file.size !== undefined ? formatFileSize(file.size) : '',
                    file.status === 'uploading'
                      ? ' · 上传中'
                      : file.status === 'error'
                        ? ' · 上传失败'
                        : file.status === 'done'
                          ? ' · 已完成'
                          : '',
                  ]),
                  file.status === 'uploading'
                    ? h('progress', {
                        max: 100,
                        class: 'f-file-progress',
                        value: Number.isFinite(file.progress)
                          ? Math.max(0, Math.min(100, file.progress!))
                          : undefined,
                        'aria-label': `${file.name} 上传进度`,
                      })
                    : null,
                  file.error ? h('p', { class: 'f-field-error' }, file.error) : null,
                ]),
                h('div', { class: 'f-list-item-actions' }, [
                  file.status === 'error' && instance?.vnode.props?.onRetry
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: 'f-button f-button--ghost f-button--sm',
                          disabled: props.disabled,
                          'aria-label': `重试 ${file.name}`,
                          onClick: () => {
                            if (!props.disabled) emit('retry', file.id);
                          },
                        },
                        '重试',
                      )
                    : null,
                  instance?.vnode.props?.onRemove
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: 'f-button f-button--ghost f-button--sm',
                          disabled: props.disabled,
                          'aria-label': `移除 ${file.name}`,
                          onClick: () => {
                            if (!props.disabled) emit('remove', file.id);
                          },
                        },
                        '移除',
                      )
                    : null,
                ]),
              ]),
            )
          : [h('li', { class: 'f-list-empty' }, props.emptyText)],
      );
  },
});

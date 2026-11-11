import { computed, defineComponent, h, mergeProps, nextTick, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { filterTree, flattenTree, toggleTreeSelection, treeCheckState } from '@btdesign/engine';
import type { ChoiceOption, FlatTreeNode, TreeNode } from '@btdesign/engine';
import { useControlId, useFieldControl } from './field.js';
import { asArray, isDisabled, useDismiss, useValue } from './enterprise-shared.js';
const treeProps = {
  nodes: { type: Array as PropType<TreeNode[]>, required: true },
  modelValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
  defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
  multiple: Boolean,
  cascade: Boolean,
  disabled: { type: Boolean, default: undefined },
  searchable: Boolean,
  label: { type: String, default: '树形选择' },
  name: String,
} as const;
export const Tree = defineComponent({
  name: 'BTDESIGNTree',
  inheritAttrs: false,
  props: {
    ...treeProps,
    expandedKeys: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedKeys: { type: Array as PropType<string[]>, default: () => [] },
    size: { type: String as PropType<'mini' | 'small' | 'medium' | 'big'>, default: 'medium' },
    showLine: Boolean,
  },
  emits: ['update:modelValue', 'update:expandedKeys'],
  setup(props, { attrs, emit, slots }) {
    const root = ref<HTMLElement>();
    const state = useValue(
      () => props.modelValue,
      props.defaultValue ?? (props.multiple ? [] : ''),
      (v) => emit('update:modelValue', v),
    );
    const expanded = useValue(
      () => props.expandedKeys,
      props.defaultExpandedKeys,
      (v) => emit('update:expandedKeys', v),
    );
    const query = ref('');
    const focused = ref('');
    const field = useFieldControl();
    const visible = computed(() =>
      flattenTree(filterTree(props.nodes, query.value)).filter(
        (node) =>
          query.value || node.path.slice(0, -1).every((key) => expanded.value.value.includes(key)),
      ),
    );
    const focus = (key: string) => {
      focused.value = key;
      nextTick(() =>
        Array.from(root.value?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [])
          .find((el) => el.dataset.key === key)
          ?.focus(),
      );
    };
    const expand = (key: string) => {
      if (props.disabled) return;
      expanded.set(
        expanded.value.value.includes(key)
          ? expanded.value.value.filter((k) => k !== key)
          : [...expanded.value.value, key],
      );
    };
    const select = (key: string) => {
      if (props.disabled) return;
      const next = toggleTreeSelection(
        props.nodes,
        asArray(state.value.value),
        key,
        props.multiple,
        props.cascade,
      );
      state.set(props.multiple ? next : (next[0] ?? ''));
    };
    return () => {
      const bound = field({ ...attrs, disabled: props.disabled });
      const disabled = isDisabled(bound.disabled);
      const nodes = visible.value;
      const nodesByKey = new Map(nodes.map((node) => [node.key, node]));
      const lastSibling = new Map(nodes.map((node) => [node.parentKey, node.key]));
      const focusable = nodes.filter((node) => !node.disabled);
      const active = focusable.some((node) => node.key === focused.value)
        ? focused.value
        : focusable[0]?.key;
      return h('div', { class: ['f-tree-wrap', attrs.class], style: attrs.style }, [
        props.searchable
          ? h('input', {
              class: 'f-input f-tree-search',
              type: 'search',
              'aria-label': `搜索${props.label}`,
              placeholder: '搜索节点…',
              disabled,
              value: query.value,
              onInput: (e: Event) => (query.value = (e.target as HTMLInputElement).value),
            })
          : null,
        h(
          'div',
          mergeProps(attrs, bound, {
            class: 'f-tree',
            'data-size': props.size,
            'data-show-line': props.showLine || undefined,
            ref: root,
            role: 'tree',
            'aria-label': props.label,
            'aria-multiselectable': props.multiple || undefined,
            'aria-disabled': disabled || undefined,
          }),
          nodes.length
            ? nodes.map((node) => {
                const checked = treeCheckState(
                  props.nodes,
                  asArray(state.value.value),
                  node.key,
                  props.multiple && props.cascade,
                );
                const open = query.value ? true : expanded.value.value.includes(node.key);
                const siblings = nodes.filter(
                  (candidate) => candidate.parentKey === node.parentKey,
                );
                return h(
                  'div',
                  {
                    role: 'treeitem',
                    class: ['f-tree-item', checked === true && 'is-selected'],
                    key: node.key,
                    'data-key': node.key,
                    'data-disabled': disabled || node.disabled || undefined,
                    tabindex: !disabled && node.key === active ? 0 : -1,
                    'aria-label': node.label,
                    'aria-level': node.level,
                    'aria-posinset': siblings.findIndex((s) => s.key === node.key) + 1,
                    'aria-setsize': siblings.length,
                    'aria-expanded': node.leaf ? undefined : open,
                    'aria-checked': props.multiple ? checked : undefined,
                    'aria-selected': props.multiple ? undefined : checked === true,
                    'aria-disabled': disabled || node.disabled || undefined,
                    onFocus: () => (focused.value = node.key),
                    onClick: () => {
                      if (!disabled && !node.disabled) select(node.key);
                    },
                    onKeydown: (event: KeyboardEvent) => {
                      if (disabled || node.disabled) return;
                      const index = focusable.findIndex((n) => n.key === node.key);
                      switch (event.key) {
                        case 'ArrowDown':
                          event.preventDefault();
                          if (focusable[index + 1]) focus(focusable[index + 1].key);
                          break;
                        case 'ArrowUp':
                          event.preventDefault();
                          if (focusable[index - 1]) focus(focusable[index - 1].key);
                          break;
                        case 'Home':
                          event.preventDefault();
                          if (focusable[0]) focus(focusable[0].key);
                          break;
                        case 'End':
                          event.preventDefault();
                          if (focusable.length) focus(focusable[focusable.length - 1].key);
                          break;
                        case 'ArrowRight':
                          event.preventDefault();
                          if (!node.leaf && !open) expand(node.key);
                          else if (open && focusable[index + 1]?.parentKey === node.key)
                            focus(focusable[index + 1].key);
                          break;
                        case 'ArrowLeft':
                          event.preventDefault();
                          if (!node.leaf && open) expand(node.key);
                          else if (node.parentKey) focus(node.parentKey);
                          break;
                        case ' ':
                        case 'Enter':
                          event.preventDefault();
                          select(node.key);
                          break;
                      }
                    },
                  },
                  [
                    h(
                      'div',
                      {
                        class: 'f-tree-row',
                        style: { paddingInlineStart: `calc(${node.depth} * var(--f-tree-indent))` },
                      },
                      [
                        ...(props.showLine
                          ? node.path.slice(1).map((key, index) => {
                              const branch = nodesByKey.get(key);
                              if (!branch) return null;
                              const last = lastSibling.get(branch.parentKey) === key;
                              const current = key === node.key;
                              return current || !last
                                ? h('span', {
                                    key,
                                    class: 'f-tree-guide',
                                    'aria-hidden': 'true',
                                    'data-branch': current || undefined,
                                    'data-last': (current && last) || undefined,
                                    style: {
                                      insetInlineStart: `calc(${index} * var(--f-tree-indent, 20px) + 12px)`,
                                    },
                                  })
                                : null;
                            })
                          : []),
                        node.leaf
                          ? h('span', { class: 'f-tree-toggle', 'aria-hidden': 'true' })
                          : h(
                              'button',
                              {
                                type: 'button',
                                tabindex: -1,
                                class: 'f-tree-toggle',
                                disabled: disabled || node.disabled,
                                'aria-label': `${open ? '收起' : '展开'}${node.label}`,
                                onClick: (e: Event) => {
                                  e.stopPropagation();
                                  if (!disabled && !node.disabled) expand(node.key);
                                },
                              },
                              open ? '⌄' : '›',
                            ),
                        props.multiple
                          ? h(
                              'span',
                              {
                                class: 'f-tree-check',
                                'data-checked':
                                  checked === 'mixed' ? 'mixed' : checked ? 'true' : 'false',
                                'aria-hidden': 'true',
                              },
                              checked === 'mixed' ? '−' : checked ? '✓' : '',
                            )
                          : null,
                        slots.icon
                          ? h(
                              'span',
                              { class: 'f-tree-icon', 'aria-hidden': 'true' },
                              slots.icon({ node }),
                            )
                          : null,
                        h('span', { class: 'f-tree-label' }, [
                          node.label,
                          node.description
                            ? h('small', { class: 'f-tree-description' }, node.description)
                            : null,
                        ]),
                      ],
                    ),
                  ],
                );
              })
            : [],
        ),
        nodes.length ? null : h('div', { class: 'f-tree-empty', role: 'status' }, '无匹配节点'),
        props.name
          ? asArray(state.value.value).map((value) =>
              h('input', { type: 'hidden', name: props.name, value, disabled }),
            )
          : null,
      ]);
    };
  },
});
export const TreeSelect = defineComponent({
  name: 'BTDESIGNTreeSelect',
  inheritAttrs: false,
  props: {
    ...treeProps,
    placeholder: { type: String, default: '请选择' },
    showPath: Boolean,
    clearable: { type: Boolean, default: true },
    expandedKeys: { type: Array as PropType<string[]>, default: undefined },
    defaultExpandedKeys: { type: Array as PropType<string[]>, default: undefined },
    size: { type: String as PropType<'mini' | 'small' | 'medium' | 'big'>, default: undefined },
    showLine: Boolean,
  },
  emits: ['update:modelValue', 'update:expandedKeys'],
  setup(props, { attrs, emit, slots }) {
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const open = ref(false);
    const id = useControlId('tree-select');
    const field = useFieldControl();
    const state = useValue(
      () => props.modelValue,
      props.defaultValue ?? (props.multiple ? [] : ''),
      (v) => emit('update:modelValue', v),
    );
    const close = (restore = false) => {
      open.value = false;
      if (restore) nextTick(() => trigger.value?.focus());
    };
    useDismiss(root, open, () => close());
    watch(open, (value) => {
      if (value)
        nextTick(() =>
          root.value
            ?.querySelector<HTMLElement>(
              '.f-tree-search, .f-cascader-search, [role=treeitem], .f-cascader-item',
            )
            ?.focus(),
        );
    });
    return () => {
      const bound = field({ ...attrs, disabled: props.disabled });
      const disabled = isDisabled(bound.disabled);
      const flat = flattenTree(props.nodes);
      const selected = asArray(state.value.value);
      const title = (key: string) => {
        const node = flat.find((n) => n.key === key);
        return node
          ? props.showPath
            ? node.path.map((k) => flat.find((n) => n.key === k)?.label ?? k).join(' / ')
            : node.label
          : key;
      };
      const change = (next: string | string[]) => {
        if (disabled) return;
        state.set(next);
        if (!props.multiple) close(true);
      };
      return h(
        'div',
        {
          class: ['f-tree-select', attrs.class],
          style: attrs.style,
          ref: root,
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open.value) {
              event.preventDefault();
              close(true);
            }
          },
        },
        [
          h(
            'button',
            mergeProps(bound, {
              type: 'button',
              ref: trigger,
              class: 'f-select f-tree-select-trigger',
              disabled,
              'aria-label': props.label,
              'aria-haspopup': 'dialog',
              'aria-expanded': open.value,
              'aria-controls': open.value ? `${id}-popup` : undefined,
              onClick: () => {
                if (!disabled) open.value = !open.value;
              },
            }),
            selected.length ? selected.map(title).join('、') : props.placeholder,
          ),
          props.multiple && selected.length
            ? h(
                'div',
                { class: 'f-tree-select-tags' },
                selected.map((key) =>
                  h('span', { class: 'f-tree-select-tag', key }, [
                    title(key),
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: disabled || flat.find((n) => n.key === key)?.disabled,
                        'aria-label': `移除 ${title(key)}`,
                        onClick: () => {
                          if (!disabled && !flat.find((n) => n.key === key)?.disabled)
                            state.set(selected.filter((k) => k !== key));
                        },
                      },
                      '×',
                    ),
                  ]),
                ),
              )
            : null,
          props.clearable && selected.length
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'f-tree-select-clear f-button f-button--ghost f-button--sm',
                  disabled,
                  'aria-label': `清空${props.label}`,
                  onClick: () => {
                    if (!disabled)
                      state.set(
                        props.multiple
                          ? selected.filter((key) => flat.find((n) => n.key === key)?.disabled)
                          : '',
                      );
                  },
                },
                '清空',
              )
            : null,
          open.value
            ? h(
                'div',
                {
                  id: `${id}-popup`,
                  role: 'dialog',
                  'aria-label': props.label,
                  class: 'f-overlay f-tree-select-popup',
                },
                [
                  h(
                    Tree,
                    {
                      nodes: props.nodes,
                      modelValue: state.value.value,
                      multiple: props.multiple,
                      cascade: props.cascade,
                      searchable: props.searchable,
                      label: props.label,
                      disabled,
                      expandedKeys: props.expandedKeys,
                      defaultExpandedKeys:
                        props.defaultExpandedKeys ??
                        flat.filter((n) => n.depth === 0 && !n.leaf).map((n) => n.key),
                      size: props.size,
                      showLine: props.showLine,
                      'onUpdate:modelValue': change,
                      'onUpdate:expandedKeys': (keys: string[]) =>
                        emit('update:expandedKeys', keys),
                    },
                    slots.icon ? { icon: slots.icon } : undefined,
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'f-button f-button--ghost f-button--sm',
                      onClick: () => close(true),
                    },
                    '完成',
                  ),
                ],
              )
            : null,
          props.name
            ? selected.map((value) =>
                h('input', { type: 'hidden', name: props.name, value, disabled }),
              )
            : null,
        ],
      );
    };
  },
});
export const OrgPicker = defineComponent({
  name: 'BTDESIGNOrgPicker',
  inheritAttrs: false,
  props: {
    ...treeProps,
    label: { type: String, default: '组织架构' },
    placeholder: { type: String, default: '选择部门或成员' },
    searchable: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h(TreeSelect, {
        ...attrs,
        ...props,
        class: ['f-org-picker', attrs.class],
        showPath: true,
        'onUpdate:modelValue': (value: string | string[]) => emit('update:modelValue', value),
      });
  },
});
export const Cascader = defineComponent({
  name: 'BTDESIGNCascader',
  inheritAttrs: false,
  props: {
    ...treeProps,
    placeholder: { type: String, default: '请选择' },
    changeOnSelect: Boolean,
    label: { type: String, default: '级联选择' },
    searchable: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const root = ref<HTMLElement>();
    const trigger = ref<HTMLButtonElement>();
    const open = ref(false);
    const query = ref('');
    const path = ref<string[]>([]);
    const id = useControlId('cascader');
    const field = useFieldControl();
    const state = useValue(
      () => props.modelValue,
      props.defaultValue ?? (props.multiple ? [] : ''),
      (v) => emit('update:modelValue', v),
    );
    const close = (restore = false) => {
      open.value = false;
      if (restore) nextTick(() => trigger.value?.focus());
    };
    useDismiss(root, open, () => close());
    watch(
      () => field({ ...attrs, disabled: props.disabled }).disabled,
      (disabled) => {
        if (isDisabled(disabled)) close();
      },
    );
    watch(open, (value) => {
      if (value)
        nextTick(() =>
          root.value
            ?.querySelector<HTMLElement>(
              '.f-cascader-search, button[data-cascader-key]:not(:disabled)',
            )
            ?.focus(),
        );
    });
    return () => {
      const bound = field({ ...attrs, disabled: props.disabled });
      const disabled = isDisabled(bound.disabled);
      const flat = flattenTree(props.nodes);
      const byKey = new Map(flat.map((node) => [node.key, node]));
      const selected = asArray(state.value.value);
      const label = (key: string) =>
        byKey
          .get(key)
          ?.path.map((k) => byKey.get(k)?.label)
          .filter(Boolean)
          .join(' / ') ?? key;
      const matches = flat.filter(
        (node) =>
          (props.changeOnSelect || node.leaf) &&
          label(node.key).toLocaleLowerCase().includes(query.value.toLocaleLowerCase()),
      );
      const select = (key: string) => {
        const node = byKey.get(key);
        if (disabled || !node || node.disabled || node.selectable === false) return;
        if (!props.changeOnSelect && !node.leaf) return;
        const next = props.multiple
          ? selected.includes(key)
            ? selected.filter((k) => k !== key)
            : [...selected, key]
          : key;
        state.set(next);
        if (!props.multiple) close(true);
      };
      const columns: FlatTreeNode[][] = [flat.filter((node) => node.depth === 0)];
      for (const key of path.value) {
        if (!columns.at(-1)?.some((node) => node.key === key && !node.leaf)) break;
        const children = flat.filter((node) => node.parentKey === key);
        if (children?.length) columns.push(children);
        else break;
      }
      const focusKey = (key: string | undefined) => {
        if (!key) return;
        void nextTick(() =>
          Array.from(root.value?.querySelectorAll<HTMLElement>('[data-cascader-key]') ?? [])
            .find((element) => element.dataset.cascaderKey === key)
            ?.focus(),
        );
      };
      const item = (node: FlatTreeNode, level: number) => {
        const unavailable = disabled || node.disabled;
        const branch = !node.leaf;
        return h(
          'li',
          {
            class: 'f-cascader-item',
            key: node.key,
          },
          [
            props.multiple && (!branch || props.changeOnSelect)
              ? h('input', {
                  type: 'checkbox',
                  class: 'f-checkbox',
                  'aria-label': label(node.key),
                  disabled: unavailable || node.selectable === false,
                  checked: selected.includes(node.key),
                  onChange: () => select(node.key),
                })
              : null,
            h(
              'button',
              {
                type: 'button',
                disabled: unavailable || (!branch && node.selectable === false),
                class: 'f-cascader-option',
                'data-cascader-key': node.key,
                'aria-expanded': branch ? path.value[level] === node.key : undefined,
                'aria-current': !props.multiple && selected.includes(node.key) ? 'true' : undefined,
                'data-selected': selected.includes(node.key) || undefined,
                onClick: () => {
                  if (unavailable) return;
                  if (branch) path.value = [...path.value.slice(0, level), node.key];
                  if (node.leaf || (props.changeOnSelect && !props.multiple)) select(node.key);
                },
                onKeydown: (event: KeyboardEvent) => {
                  if (event.key === 'ArrowRight' && branch) {
                    event.preventDefault();
                    path.value = [...path.value.slice(0, level), node.key];
                    focusKey(
                      flat.find(
                        (entry) =>
                          entry.parentKey === node.key &&
                          !entry.disabled &&
                          (!entry.leaf || entry.selectable !== false),
                      )?.key,
                    );
                  } else if (event.key === 'ArrowLeft' && level > 0) {
                    event.preventDefault();
                    const parent = path.value[level - 1];
                    path.value = path.value.slice(0, level - 1);
                    focusKey(parent);
                  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    const current = event.currentTarget as HTMLElement;
                    const siblings = Array.from(
                      current
                        .closest('.f-cascader-column')
                        ?.querySelectorAll<HTMLButtonElement>(
                          'button[data-cascader-key]:not(:disabled)',
                        ) ?? [],
                    );
                    const index = siblings.indexOf(current as HTMLButtonElement);
                    siblings[
                      Math.max(
                        0,
                        Math.min(siblings.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)),
                      )
                    ]?.focus();
                  }
                },
              },
              [h('span', node.label), branch ? h('span', { 'aria-hidden': 'true' }, '›') : null],
            ),
          ],
        );
      };
      return h(
        'div',
        {
          ref: root,
          class: ['f-cascader', attrs.class],
          style: attrs.style,
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open.value) {
              event.preventDefault();
              close(true);
            }
          },
        },
        [
          h(
            'button',
            mergeProps(bound, {
              type: 'button',
              ref: trigger,
              class: 'f-select f-cascader-trigger',
              disabled,
              'aria-label': props.label,
              'aria-haspopup': 'dialog',
              'aria-expanded': open.value,
              'aria-controls': open.value ? `${id}-popup` : undefined,
              onClick: () => {
                if (!disabled) {
                  if (!open.value) {
                    query.value = '';
                    path.value = byKey.get(selected[0])?.path.slice(0, -1) ?? [];
                  }
                  open.value = !open.value;
                }
              },
            }),
            selected.length
              ? props.multiple
                ? `已选择 ${selected.length} 项`
                : label(selected[0])
              : props.placeholder,
          ),
          selected.length
            ? h('div', { class: 'f-tree-select-tags' }, [
                ...(props.multiple
                  ? selected.map((key) =>
                      h('span', { class: 'f-tree-select-tag', key }, [
                        label(key),
                        h(
                          'button',
                          {
                            type: 'button',
                            disabled: disabled || byKey.get(key)?.disabled,
                            'aria-label': `移除${label(key)}`,
                            onClick: () => state.set(selected.filter((item) => item !== key)),
                          },
                          '×',
                        ),
                      ]),
                    )
                  : []),
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'f-tree-select-clear f-button f-button--ghost f-button--sm',
                    disabled,
                    'aria-label': `清空${props.label}`,
                    onClick: () => {
                      if (!disabled)
                        state.set(
                          props.multiple ? selected.filter((key) => byKey.get(key)?.disabled) : '',
                        );
                    },
                  },
                  '清空',
                ),
              ])
            : null,
          open.value
            ? h(
                'div',
                {
                  id: `${id}-popup`,
                  role: 'dialog',
                  'aria-label': props.label,
                  class: 'f-overlay f-cascader-popup',
                },
                [
                  props.searchable
                    ? h('input', {
                        type: 'search',
                        class: 'f-input f-cascader-search',
                        'aria-label': `搜索${props.label}`,
                        placeholder: '搜索完整路径…',
                        value: query.value,
                        disabled,
                        onInput: (e: Event) => (query.value = (e.target as HTMLInputElement).value),
                      })
                    : null,
                  query.value
                    ? h(
                        'div',
                        { class: 'f-cascader-results' },
                        matches.length
                          ? matches.map((node) =>
                              h(
                                'button',
                                {
                                  key: node.key,
                                  type: 'button',
                                  class: 'f-cascader-option',
                                  disabled: disabled || node.disabled || node.selectable === false,
                                  'aria-pressed': props.multiple
                                    ? selected.includes(node.key)
                                    : undefined,
                                  'aria-current':
                                    !props.multiple && selected.includes(node.key)
                                      ? 'true'
                                      : undefined,
                                  'data-selected': selected.includes(node.key) || undefined,
                                  onClick: () => select(node.key),
                                },
                                `${label(node.key)}${selected.includes(node.key) ? ' ✓' : ''}`,
                              ),
                            )
                          : h('p', { class: 'f-tree-empty', role: 'status' }, '没有匹配的选项'),
                      )
                    : h(
                        'div',
                        { class: 'f-cascader-columns' },
                        flat.length
                          ? columns.map((nodes, index) =>
                              h(
                                'ul',
                                {
                                  class: 'f-cascader-column',
                                  'aria-label': `第 ${index + 1} 级`,
                                },
                                nodes.map((node) => item(node, index)),
                              ),
                            )
                          : h('p', { class: 'f-tree-empty', role: 'status' }, '暂无可选项'),
                      ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'f-button f-button--ghost f-button--sm',
                      onClick: () => close(true),
                    },
                    '完成',
                  ),
                ],
              )
            : null,
          props.name
            ? selected.map((value) =>
                h('input', { type: 'hidden', name: props.name, value, disabled }),
              )
            : null,
        ],
      );
    };
  },
});
export const Transfer = defineComponent({
  name: 'BTDESIGNTransfer',
  inheritAttrs: false,
  props: {
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    modelValue: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    disabled: Boolean,
    label: { type: String, default: '穿梭选择' },
    titles: {
      type: Array as unknown as PropType<[string, string]>,
      default: () => ['待选', '已选'],
    },
    name: String,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const state = useValue(
      () => props.modelValue,
      props.defaultValue,
      (v) => emit('update:modelValue', v),
    );
    const checked = ref<string[]>([]);
    const queries = ref(['', '']);
    const source = (side: number) =>
      props.options.filter((option) => state.value.value.includes(option.value) === (side === 1));
    const available = (side: number) =>
      source(side).filter((option) =>
        option.label.toLocaleLowerCase().includes(queries.value[side].toLocaleLowerCase()),
      );
    const move = (side: number) => {
      if (props.disabled) return;
      const keys = available(side)
        .filter((option) => !option.disabled && checked.value.includes(option.value))
        .map((option) => option.value);
      state.set(
        side === 0
          ? [...new Set([...state.value.value, ...keys])]
          : state.value.value.filter((value) => !keys.includes(value)),
      );
      checked.value = checked.value.filter((value) => !keys.includes(value));
    };
    return () =>
      h(
        'div',
        mergeProps(attrs, { class: 'f-transfer', role: 'group', 'aria-label': props.label }),
        [
          ...[0, 1].map((side) =>
            h('section', { class: 'f-transfer-panel', 'aria-label': `${props.titles[side]}列表` }, [
              h('header', { class: 'f-transfer-header' }, [
                h('strong', {}, props.titles[side]),
                h(
                  'span',
                  { 'aria-label': `${props.titles[side]}总数 ${source(side).length} 项` },
                  `总数 ${source(side).length} 项`,
                ),
              ]),
              h('input', {
                class: 'f-input f-transfer-search',
                type: 'search',
                placeholder: '搜索…',
                'aria-label': `搜索${props.titles[side]}`,
                disabled: props.disabled,
                value: queries.value[side],
                onInput: (e: Event) =>
                  (queries.value = queries.value.map((q, i) =>
                    i === side ? (e.target as HTMLInputElement).value : q,
                  )),
              }),
              h('label', { class: 'f-choice f-transfer-all' }, [
                h('input', {
                  type: 'checkbox',
                  class: 'f-checkbox',
                  'aria-label': `全选${props.titles[side]}搜索结果`,
                  disabled: props.disabled || !available(side).some((o) => !o.disabled),
                  checked:
                    available(side).filter((o) => !o.disabled).length > 0 &&
                    available(side)
                      .filter((o) => !o.disabled)
                      .every((o) => checked.value.includes(o.value)),
                  indeterminate:
                    available(side).some((o) => !o.disabled && checked.value.includes(o.value)) &&
                    !available(side)
                      .filter((o) => !o.disabled)
                      .every((o) => checked.value.includes(o.value)),
                  'aria-checked': available(side).some(
                    (o) => !o.disabled && checked.value.includes(o.value),
                  )
                    ? available(side)
                        .filter((o) => !o.disabled)
                        .every((o) => checked.value.includes(o.value))
                      ? 'true'
                      : 'mixed'
                    : 'false',
                  onChange: (e: Event) => {
                    const keys = available(side)
                      .filter((o) => !o.disabled)
                      .map((o) => o.value);
                    checked.value = (e.target as HTMLInputElement).checked
                      ? [...new Set([...checked.value, ...keys])]
                      : checked.value.filter((k) => !keys.includes(k));
                  },
                }),
                '选择当前结果',
              ]),
              h(
                'div',
                { class: 'f-transfer-options' },
                available(side).length
                  ? available(side).map((option) =>
                      h('label', { class: 'f-choice-option', key: option.value }, [
                        h('input', {
                          type: 'checkbox',
                          class: 'f-checkbox',
                          disabled: props.disabled || option.disabled,
                          checked: checked.value.includes(option.value),
                          onChange: (e: Event) => {
                            if (props.disabled || option.disabled) return;
                            checked.value = (e.target as HTMLInputElement).checked
                              ? [...checked.value, option.value]
                              : checked.value.filter((k) => k !== option.value);
                          },
                        }),
                        h('span', {}, [
                          option.label,
                          option.description ? h('small', {}, option.description) : null,
                        ]),
                      ]),
                    )
                  : h('p', { class: 'f-transfer-empty', role: 'status' }, '没有匹配的选项'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: 'f-button f-button--secondary f-transfer-move',
                  disabled:
                    props.disabled ||
                    !available(side).some((o) => !o.disabled && checked.value.includes(o.value)),
                  onClick: () => move(side),
                },
                side === 0 ? '移入 →' : '← 移回',
              ),
            ]),
          ),
          props.name
            ? state.value.value.map((value) =>
                h('input', { type: 'hidden', name: props.name, value, disabled: props.disabled }),
              )
            : null,
        ],
      );
  },
});

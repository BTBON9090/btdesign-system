import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import {
  filterTree,
  flattenTree,
  toggleTreeSelection,
  treeCheckState,
  type ChoiceOption,
  type FlatTreeNode,
  type TreeNode,
} from '@btdesign/engine';
import { Input, useFieldControl } from './fields.js';
import { checkedRef, cx, useControllable, usePopup } from './enterprise-utils.js';

export interface TreeProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  nodes: TreeNode[];
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  cascade?: boolean;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  searchable?: boolean;
  label?: string;
  disabled?: boolean;
  name?: string;
}
export function Tree({
  nodes,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  cascade = false,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,
  searchable = false,
  label = '树形选项',
  disabled,
  name,
  className,
  ...props
}: TreeProps) {
  const [current, update] = useControllable(
    value,
    defaultValue ?? (multiple ? [] : ''),
    onValueChange,
  );
  const [expanded, expand] = useControllable(expandedKeys, defaultExpandedKeys, onExpandedChange);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const all = flattenTree(nodes);
  const shown = query ? flattenTree(filterTree(nodes, query)) : all;
  const visible = shown.filter(
    (node) => query || node.path.slice(0, -1).every((key) => expanded.includes(key)),
  );
  const selected = Array.isArray(current) ? current : current ? [current] : [];
  const active = visible.some((node) => node.key === focused && !node.disabled)
    ? focused
    : visible.find((node) => !node.disabled)?.key;
  const toggle = (key: string) => {
    if (disabled) return;
    expand(expanded.includes(key) ? expanded.filter((item) => item !== key) : [...expanded, key]);
  };
  const choose = (node: FlatTreeNode) => {
    if (disabled || node.disabled || node.selectable === false) return;
    const next = toggleTreeSelection(nodes, selected, node.key, multiple, cascade);
    update(multiple ? next : (next[0] ?? ''));
  };
  const focus = (key: string | undefined) => {
    if (!key) return;
    setFocused(key);
    Array.from(root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [])
      .find((item) => item.dataset.key === key)
      ?.focus();
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>, node: FlatTreeNode) => {
    if (disabled) return;
    const enabled = visible.filter((item) => !item.disabled);
    const index = enabled.findIndex((item) => item.key === node.key);
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(
        event.key,
      )
    )
      event.preventDefault();
    if (event.key === 'ArrowDown') focus(enabled[Math.min(enabled.length - 1, index + 1)]?.key);
    if (event.key === 'ArrowUp') focus(enabled[Math.max(0, index - 1)]?.key);
    if (event.key === 'Home') focus(enabled[0]?.key);
    if (event.key === 'End') focus(enabled.at(-1)?.key);
    if (event.key === 'ArrowRight' && !node.leaf) {
      if (!expanded.includes(node.key) && !query) toggle(node.key);
      else focus(enabled.find((item) => item.parentKey === node.key)?.key);
    }
    if (event.key === 'ArrowLeft') {
      if (!node.leaf && expanded.includes(node.key) && !query) toggle(node.key);
      else focus(node.parentKey);
    }
    if (event.key === ' ' || event.key === 'Enter') choose(node);
    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey) {
      const next = [...enabled.slice(index + 1), ...enabled.slice(0, index + 1)].find((item) =>
        item.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()),
      );
      if (next) focus(next.key);
    }
  };
  return (
    <div className={cx('f-tree-wrap', className)}>
      {searchable && (
        <Input
          className="f-tree-search"
          type="search"
          aria-label={`搜索${label}`}
          placeholder="搜索名称…"
          value={query}
          disabled={disabled}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      )}
      <div
        {...props}
        ref={root}
        className="f-tree"
        role="tree"
        aria-label={label}
        aria-multiselectable={multiple || undefined}
        aria-disabled={disabled || undefined}
      >
        {visible.map((node) => {
          const checked = treeCheckState(nodes, selected, node.key, multiple && cascade);
          const siblings = shown.filter((item) => item.parentKey === node.parentKey);
          const blocked = disabled || node.disabled;
          return (
            <div
              key={node.key}
              data-key={node.key}
              role="treeitem"
              className="f-tree-item"
              aria-label={node.label}
              aria-level={node.level}
              aria-posinset={siblings.findIndex((item) => item.key === node.key) + 1}
              aria-setsize={siblings.length}
              aria-expanded={!node.leaf ? !!query || expanded.includes(node.key) : undefined}
              aria-selected={!multiple ? checked === true : undefined}
              aria-checked={multiple ? checked : undefined}
              aria-disabled={blocked || undefined}
              tabIndex={!disabled && active === node.key ? 0 : -1}
              onFocus={() => setFocused(node.key)}
              onKeyDown={(event) => keyboard(event, node)}
              onClick={() => choose(node)}
            >
              <div
                className="f-tree-row"
                style={{ paddingInlineStart: `calc(${node.depth} * var(--f-tree-indent, 20px))` }}
              >
                {!node.leaf ? (
                  <button
                    className="f-tree-toggle"
                    type="button"
                    tabIndex={-1}
                    disabled={blocked}
                    aria-label={`${expanded.includes(node.key) || query ? '收起' : '展开'}${node.label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle(node.key);
                    }}
                  >
                    {expanded.includes(node.key) || query ? '⌄' : '›'}
                  </button>
                ) : (
                  <span className="f-tree-toggle" aria-hidden="true" />
                )}
                {multiple && (
                  <span
                    className="f-tree-check"
                    data-checked={checked === 'mixed' ? 'mixed' : checked ? 'true' : 'false'}
                    aria-hidden="true"
                  >
                    {checked === 'mixed' ? '−' : checked ? '✓' : ''}
                  </span>
                )}
                <span className="f-tree-label">
                  {node.label}
                  {node.description && (
                    <span className="f-tree-description">{node.description}</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {!visible.length && (
        <p className="f-tree-empty" role="status">
          没有匹配的选项
        </p>
      )}
      {name &&
        selected.map((key) => (
          <input key={key} type="hidden" name={name} value={key} disabled={disabled} />
        ))}
    </div>
  );
}
export interface TreeSelectProps extends TreeProps {
  placeholder?: string;
  showPath?: boolean;
}
export function TreeSelect({
  nodes,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  cascade = false,
  label,
  disabled,
  name,
  placeholder = '请选择',
  showPath = false,
  className,
  id: idProp,
  ...props
}: TreeSelectProps) {
  const accessibleLabel = label ?? '树形选择';
  const generated = useId();
  const field = useFieldControl({ id: idProp, disabled, 'aria-label': label });
  const [current, update] = useControllable(
    value,
    defaultValue ?? (multiple ? [] : ''),
    onValueChange,
  );
  const popup = usePopup(!!field.disabled);
  const flat = flattenTree(nodes);
  const keys = Array.isArray(current) ? current : current ? [current] : [];
  const id = field.id ?? generated;
  const text = (key: string) => {
    const node = flat.find((item) => item.key === key);
    return showPath && node
      ? node.path
          .map((part) => flat.find((item) => item.key === part)?.label)
          .filter(Boolean)
          .join(' / ')
      : (node?.label ?? key);
  };
  useEffect(() => {
    if (popup.open)
      popup.panel.current
        ?.querySelector<HTMLElement>('input[type="search"], [role="treeitem"][tabindex="0"]')
        ?.focus();
  }, [popup.open]);
  const change = (next: string | string[]) => {
    if (field.disabled) return;
    update(next);
    if (!multiple) popup.close(true);
  };
  return (
    <div
      ref={popup.root}
      className={cx('f-tree-select', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && popup.open) {
          event.preventDefault();
          popup.close(true);
        }
      }}
    >
      <button
        type="button"
        id={id}
        ref={popup.trigger}
        className="f-tree-select-trigger f-input"
        aria-label={label ?? (field['aria-labelledby'] ? undefined : accessibleLabel)}
        aria-labelledby={field['aria-labelledby']}
        aria-haspopup="dialog"
        aria-expanded={popup.open}
        aria-controls={popup.open ? `${generated}-popup` : undefined}
        aria-describedby={field['aria-describedby']}
        aria-invalid={field['aria-invalid']}
        disabled={field.disabled}
        onClick={() => popup.setOpen(!popup.open)}
      >
        <span>
          {keys.length ? (multiple ? `已选择 ${keys.length} 项` : text(keys[0])) : placeholder}
        </span>
        <span aria-hidden="true">⌄</span>
      </button>
      {keys.length > 0 && (
        <div className="f-tree-select-tags">
          {multiple &&
            keys.map((key) => (
              <span key={key} className="f-tree-select-tag">
                {text(key)}
                <button
                  type="button"
                  disabled={field.disabled || flat.find((item) => item.key === key)?.disabled}
                  aria-label={`移除${text(key)}`}
                  onClick={() => change(keys.filter((item) => item !== key))}
                >
                  ×
                </button>
              </span>
            ))}
          <button
            type="button"
            className="f-tree-select-clear f-button f-button--ghost f-button--sm"
            disabled={field.disabled}
            onClick={() =>
              change(
                multiple
                  ? keys.filter((key) => flat.find((item) => item.key === key)?.disabled)
                  : '',
              )
            }
          >
            清空
          </button>
        </div>
      )}
      {popup.open && (
        <div
          ref={popup.panel}
          className="f-tree-select-popup f-overlay"
          id={`${generated}-popup`}
          role="dialog"
          aria-label={accessibleLabel}
        >
          <Tree
            {...props}
            nodes={nodes}
            value={current}
            onValueChange={change}
            multiple={multiple}
            cascade={cascade}
            label={accessibleLabel}
            disabled={field.disabled}
            searchable={props.searchable ?? true}
          />
        </div>
      )}
      {name &&
        keys.map((key) => (
          <input type="hidden" key={key} name={name} value={key} disabled={field.disabled} />
        ))}
    </div>
  );
}
export function OrgPicker({ label = '组织架构', ...props }: TreeSelectProps) {
  return <TreeSelect {...props} label={label} showPath />;
}
export interface CascaderProps extends Omit<
  TreeSelectProps,
  'cascade' | 'expandedKeys' | 'defaultExpandedKeys' | 'onExpandedChange'
> {
  changeOnSelect?: boolean;
}
export function Cascader({
  nodes,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  changeOnSelect = false,
  disabled,
  label,
  name,
  placeholder = '请选择',
  className,
  id: idProp,
}: CascaderProps) {
  const accessibleLabel = label ?? '级联选择';
  const generated = useId();
  const field = useFieldControl({ id: idProp, disabled, 'aria-label': label });
  const popup = usePopup(!!field.disabled);
  const [current, update] = useControllable(
    value,
    defaultValue ?? (multiple ? [] : ''),
    onValueChange,
  );
  const [path, setPath] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const flat = flattenTree(nodes);
  const selected = Array.isArray(current) ? current : current ? [current] : [];
  const text = (key: string) => {
    const node = flat.find((item) => item.key === key);
    return (
      node?.path.map((part) => flat.find((item) => item.key === part)?.label).join(' / ') ?? key
    );
  };
  const columns: TreeNode[][] = [nodes];
  path.forEach((key) => {
    const children = flat.find((item) => item.key === key)?.children;
    if (children?.length) columns.push(children);
  });
  const pick = (key: string) => {
    const node = flat.find((item) => item.key === key);
    if (
      field.disabled ||
      !node ||
      node.disabled ||
      node.selectable === false ||
      (!node.leaf && (!changeOnSelect || multiple))
    )
      return;
    const next = toggleTreeSelection(nodes, selected, key, multiple, false);
    update(multiple ? next : (next[0] ?? ''));
    if (!multiple) popup.close(true);
  };
  useEffect(() => {
    if (popup.open)
      popup.panel.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
  }, [popup.open]);
  return (
    <div
      ref={popup.root}
      className={cx('f-cascader', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          popup.close(true);
        }
      }}
    >
      <button
        id={field.id ?? generated}
        type="button"
        ref={popup.trigger}
        className="f-cascader-trigger f-input"
        disabled={field.disabled}
        aria-label={label ?? (field['aria-labelledby'] ? undefined : accessibleLabel)}
        aria-labelledby={field['aria-labelledby']}
        aria-describedby={field['aria-describedby']}
        aria-invalid={field['aria-invalid']}
        aria-haspopup="dialog"
        aria-expanded={popup.open}
        aria-controls={popup.open ? `${generated}-popup` : undefined}
        onClick={() => popup.setOpen(!popup.open)}
      >
        {selected.length
          ? multiple
            ? `已选择 ${selected.length} 项`
            : text(selected[0])
          : placeholder}
        <span aria-hidden="true">⌄</span>
      </button>
      {selected.length > 0 && (
        <div className="f-tree-select-tags">
          {multiple &&
            selected.map((key) => (
              <span className="f-tree-select-tag" key={key}>
                {text(key)}
                <button
                  type="button"
                  disabled={field.disabled || flat.find((item) => item.key === key)?.disabled}
                  aria-label={`移除${text(key)}`}
                  onClick={() => update(selected.filter((item) => item !== key))}
                >
                  ×
                </button>
              </span>
            ))}
          <button
            type="button"
            className="f-button f-button--ghost f-button--sm"
            disabled={field.disabled}
            onClick={() =>
              update(
                multiple
                  ? selected.filter((key) => flat.find((item) => item.key === key)?.disabled)
                  : '',
              )
            }
          >
            清空
          </button>
        </div>
      )}
      {popup.open && (
        <div
          className="f-cascader-popup f-overlay"
          ref={popup.panel}
          id={`${generated}-popup`}
          role="dialog"
          aria-label={accessibleLabel}
        >
          <Input
            type="search"
            aria-label={`搜索${accessibleLabel}`}
            placeholder="搜索完整路径…"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          {query ? (
            <div className="f-cascader-results">
              {flat
                .filter(
                  (node) =>
                    (node.leaf || (changeOnSelect && !multiple)) &&
                    text(node.key).toLocaleLowerCase().includes(query.toLocaleLowerCase()),
                )
                .map((node) => (
                  <button
                    key={node.key}
                    className="f-cascader-option"
                    type="button"
                    disabled={node.disabled || node.selectable === false}
                    aria-pressed={selected.includes(node.key)}
                    onClick={() => pick(node.key)}
                  >
                    {text(node.key)}
                    {selected.includes(node.key) && ' ✓'}
                  </button>
                ))}
            </div>
          ) : (
            <div className="f-cascader-columns">
              {columns.map((column, depth) => (
                <ul className="f-cascader-column" key={depth} aria-label={`第 ${depth + 1} 级`}>
                  {column.map((raw) => {
                    const node = flat.find((item) => item.key === raw.key)!;
                    if (!node) return null;
                    return (
                      <li className="f-cascader-item" key={node.key}>
                        {multiple && node.leaf && (
                          <input
                            className="f-checkbox"
                            type="checkbox"
                            aria-label={text(node.key)}
                            checked={selected.includes(node.key)}
                            disabled={node.disabled || node.selectable === false}
                            onChange={() => pick(node.key)}
                          />
                        )}
                        <button
                          type="button"
                          className="f-cascader-option"
                          disabled={node.disabled}
                          aria-expanded={!node.leaf ? path[depth] === node.key : undefined}
                          aria-pressed={
                            node.leaf || changeOnSelect ? selected.includes(node.key) : undefined
                          }
                          onClick={() => {
                            if (!node.leaf) setPath([...path.slice(0, depth), node.key]);
                            if (node.leaf || changeOnSelect) pick(node.key);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'ArrowRight' && !node.leaf) {
                              event.preventDefault();
                              setPath([...path.slice(0, depth), node.key]);
                            }
                            if (event.key === 'ArrowLeft') {
                              event.preventDefault();
                              setPath(path.slice(0, Math.max(0, depth - 1)));
                            }
                          }}
                        >
                          <span>{node.label}</span>
                          {!node.leaf && <span aria-hidden="true">›</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          )}
        </div>
      )}
      {name &&
        selected.map((key) => (
          <input key={key} type="hidden" name={name} value={key} disabled={field.disabled} />
        ))}
    </div>
  );
}
export interface TransferProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  options: ChoiceOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  label?: string;
  name?: string;
  titles?: [string, string];
}
export function Transfer({
  options,
  value,
  defaultValue = [],
  onValueChange,
  disabled,
  label = '穿梭选择',
  name,
  titles = ['待选', '已选'],
  className,
  ...props
}: TransferProps) {
  const [target, update] = useControllable(value, defaultValue, onValueChange);
  const [checked, setChecked] = useState<string[]>([]);
  const [queries, setQueries] = useState(['', '']);
  const sideOptions = (side: number) =>
    options.filter((option) => target.includes(option.value) === (side === 1));
  const chosen = (side: number) =>
    sideOptions(side)
      .filter((option) => !option.disabled && checked.includes(option.value))
      .map((option) => option.value);
  const move = (toTarget: boolean) => {
    if (disabled) return;
    const moving = chosen(toTarget ? 0 : 1);
    if (!moving.length) return;
    update(
      toTarget
        ? [...new Set([...target, ...moving])]
        : target.filter((key) => !moving.includes(key)),
    );
    setChecked((previous) => previous.filter((key) => !moving.includes(key)));
  };
  return (
    <div {...props} className={cx('f-transfer', className)} role="group" aria-label={label}>
      {[0, 1].map((side) => {
        const source = sideOptions(side);
        const visible = source.filter((option) =>
          option.label.toLocaleLowerCase().includes(queries[side].toLocaleLowerCase()),
        );
        const available = visible.filter((option) => !option.disabled);
        const count = available.filter((option) => checked.includes(option.value)).length;
        const all = count > 0 && count === available.length;
        const state = all ? true : count ? 'mixed' : false;
        return (
          <div className="f-transfer-panel" key={side}>
            <div className="f-transfer-header">
              <label>
                <input
                  className="f-checkbox"
                  type="checkbox"
                  ref={checkedRef(state)}
                  checked={all}
                  disabled={disabled || !available.length}
                  aria-label={`全选${titles[side]}搜索结果`}
                  aria-checked={state}
                  onChange={(event) => {
                    const next = event.currentTarget.checked;
                    setChecked((previous) =>
                      next
                        ? [...new Set([...previous, ...available.map((option) => option.value)])]
                        : previous.filter(
                            (key) => !available.some((option) => option.value === key),
                          ),
                    );
                  }}
                />
                {titles[side]}
              </label>
              <span>{source.length}</span>
            </div>
            <Input
              type="search"
              aria-label={`搜索${titles[side]}`}
              placeholder="搜索…"
              disabled={disabled}
              value={queries[side]}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setQueries((previous) =>
                  previous.map((query, index) => (index === side ? next : query)),
                );
              }}
            />
            <div className="f-transfer-options">
              {visible.map((option) => (
                <label className="f-choice-option" key={option.value}>
                  <input
                    className="f-checkbox"
                    type="checkbox"
                    checked={checked.includes(option.value)}
                    disabled={disabled || option.disabled}
                    onChange={(event) => {
                      const next = event.currentTarget.checked;
                      setChecked((previous) =>
                        next
                          ? [...new Set([...previous, option.value])]
                          : previous.filter((key) => key !== option.value),
                      );
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
              {!visible.length && <p className="f-tree-empty">没有匹配的选项</p>}
            </div>
            <button
              type="button"
              className="f-transfer-move f-button f-button--secondary f-button--sm"
              disabled={disabled || chosen(side).length === 0}
              onClick={() => move(side === 0)}
            >
              {side === 0 ? '移入已选 →' : '← 移回待选'}
            </button>
          </div>
        );
      })}
      {name &&
        target.map((key) => (
          <input key={key} type="hidden" name={name} value={key} disabled={disabled} />
        ))}
    </div>
  );
}

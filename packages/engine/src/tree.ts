import type { FlatTreeNode, TreeNode } from './types.js';

/** Canonical preorder: first key wins, cycles/duplicate subtrees are skipped. */
export function flattenTree(nodes: readonly TreeNode[]): FlatTreeNode[] {
  const output: FlatTreeNode[] = [];
  const seen = new Set<string>();
  const stack = [...nodes]
    .reverse()
    .map((node) => ({ node, path: [] as string[], disabled: false }));
  while (stack.length) {
    const { node, path, disabled } = stack.pop()!;
    if (!node || typeof node.key !== 'string' || !node.key || seen.has(node.key)) continue;
    seen.add(node.key);
    const inheritedDisabled = disabled || Boolean(node.disabled);
    const nextPath = [...path, node.key];
    output.push({
      ...node,
      depth: path.length,
      level: path.length + 1,
      path: nextPath,
      parentKey: path.at(-1),
      disabled: inheritedDisabled,
      leaf: true,
    });
    const children = Array.isArray(node.children) ? node.children : [];
    for (const child of [...children].reverse())
      stack.push({ node: child, path: nextPath, disabled: inheritedDisabled });
  }
  const parents = new Set(output.map((node) => node.parentKey));
  for (const node of output) node.leaf = !parents.has(node.key);
  return output;
}

export function filterTree(nodes: readonly TreeNode[], query: string): TreeNode[] {
  const flat = flattenTree(nodes);
  const needle = query.trim().toLocaleLowerCase();
  const ownMatches = new Set(
    flat
      .filter(
        (node) =>
          !needle || `${node.label} ${node.description ?? ''}`.toLocaleLowerCase().includes(needle),
      )
      .map((node) => node.key),
  );
  const visible = new Set<string>();
  for (const node of flat) {
    if (node.path.some((key) => ownMatches.has(key))) for (const key of node.path) visible.add(key);
  }
  const mapped = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  for (const node of flat) {
    if (!visible.has(node.key)) continue;
    const item: TreeNode = {
      key: node.key,
      label: node.label,
      disabled: node.disabled,
      selectable: node.selectable,
      description: node.description,
    };
    mapped.set(item.key, item);
    const parent = node.parentKey ? mapped.get(node.parentKey) : undefined;
    if (parent) (parent.children ??= []).push(item);
    else roots.push(item);
  }
  return roots;
}

function leaves(flat: FlatTreeNode[], key?: string) {
  return flat
    .filter(
      (node) =>
        node.leaf &&
        !node.disabled &&
        node.selectable !== false &&
        (!key || node.path.includes(key)),
    )
    .map((node) => node.key);
}
export function selectableLeafKeys(nodes: readonly TreeNode[], key?: string): string[] {
  return leaves(flattenTree(nodes), key);
}

function selectedKeys(flat: FlatTreeNode[], selected: readonly string[], cascade: boolean) {
  const byKey = new Map(flat.map((node) => [node.key, node]));
  const keys = new Set<string>();
  for (const key of selected) {
    const node = byKey.get(key);
    if (!node) continue;
    if (cascade && !node.leaf && !node.disabled) {
      for (const leaf of leaves(flat, key)) keys.add(leaf);
    } else keys.add(key);
  }
  return [...keys];
}

export function toggleTreeSelection(
  nodes: readonly TreeNode[],
  selected: readonly string[],
  key: string,
  multiple = false,
  cascade = false,
): string[] {
  const flat = flattenTree(nodes);
  const node = flat.find((item) => item.key === key);
  const current = selectedKeys(flat, selected, multiple && cascade);
  if (!node || node.disabled || node.selectable === false) return current;
  if (!multiple) return [key];
  const candidates = cascade ? leaves(flat, key) : [key];
  if (!candidates.length) return current;
  const checked = candidates.every((candidate) => current.includes(candidate));
  const next = new Set(current);
  for (const candidate of candidates) checked ? next.delete(candidate) : next.add(candidate);
  return [...next];
}

export function treeCheckState(
  nodes: readonly TreeNode[],
  selected: readonly string[],
  key: string,
  cascade = false,
): boolean | 'mixed' {
  const flat = flattenTree(nodes);
  const node = flat.find((item) => item.key === key);
  if (!node) return false;
  const current = new Set(selectedKeys(flat, selected, cascade));
  if (!cascade || node.leaf || node.disabled) return current.has(key);
  const candidates = leaves(flat, key);
  if (!candidates.length) return false;
  const count = candidates.filter((candidate) => current.has(candidate)).length;
  return count === 0 ? false : count === candidates.length ? true : 'mixed';
}

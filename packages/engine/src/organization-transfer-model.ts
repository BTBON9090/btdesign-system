import {
  departmentRuleCoverage,
  organizationIdentityKey,
  personRuleCoverage,
  selectedSnapshotPeople,
  snapshotDepartmentMembers,
  type OrganizationDirectory,
  type OrganizationDepartment,
  type OrganizationIdentity,
  type OrganizationSelection,
  type SnapshotResult,
} from './organization.js';

/** A selection is data only; rules are never resolved against a remote directory here. */
export const emptyOrganizationSelection = (): OrganizationSelection => ({
  departmentRules: [],
  individuals: [],
  snapshots: [],
});
export function safeOrganizationKey(value: OrganizationIdentity): string | undefined {
  try {
    return organizationIdentityKey(value);
  } catch {
    return undefined;
  }
}
const same = (a: OrganizationIdentity, b: OrganizationIdentity) => {
  const key = safeOrganizationKey(a);
  return key !== undefined && key === safeOrganizationKey(b);
};
export function hasIdentity(
  items: readonly OrganizationIdentity[],
  identity: OrganizationIdentity,
): boolean {
  return items.some((item) => same(item, identity));
}
function uniqueEntry<T extends { identity: OrganizationIdentity }>(
  items: readonly T[],
  identity: OrganizationIdentity,
): T | undefined {
  const found = items.filter((item) => same(item.identity, identity));
  return found.length === 1 ? found[0] : undefined;
}
/** A missing or ambiguous directory record has unknown permission. */
export function knownPersonPermission(
  directory: OrganizationDirectory,
  identity: OrganizationIdentity,
) {
  return uniqueEntry(directory.people, identity)?.permission ?? 'unknown';
}
export type OrganizationControlReason = 'available' | 'denied' | 'unknown' | 'covered';
export interface OrganizationControlState {
  selected: boolean;
  disabled: boolean;
  reason: OrganizationControlReason;
}
/** A directly selected rule can be removed only if no other rule covers it and its ancestry is known. */
export function departmentRuleControl(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  department: OrganizationIdentity,
): OrganizationControlState {
  const selected = hasIdentity(selection.departmentRules, department);
  const entry = uniqueEntry(directory.departments, department);
  const other = selection.departmentRules.filter((item) => !same(item, department));
  const coverage = departmentRuleCoverage(directory, other, department);
  if (coverage === 'covered') return { selected: true, disabled: true, reason: 'covered' };
  if (coverage === 'unknown') return { selected, disabled: true, reason: 'unknown' };
  if (selected)
    return {
      selected: true,
      disabled: false,
      reason:
        !entry || entry.permission === 'unknown'
          ? 'unknown'
          : entry.permission === 'deny'
            ? 'denied'
            : 'available',
    };
  if (!entry || entry.permission === 'unknown')
    return { selected: false, disabled: true, reason: 'unknown' };
  if (entry.permission !== 'allow') return { selected: false, disabled: true, reason: 'denied' };
  return { selected: false, disabled: false, reason: 'available' };
}
export function toggleDepartmentRule(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  department: OrganizationIdentity,
): OrganizationSelection | undefined {
  const state = departmentRuleControl(directory, selection, department);
  if (state.disabled) return;
  return {
    ...selection,
    departmentRules: state.selected
      ? selection.departmentRules.filter((item) => !same(item, department))
      : [...selection.departmentRules, department],
  };
}
/** Inherited coverage and uncertain ancestry are never presented as independently removable. */
export function personControl(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  person: OrganizationIdentity,
): OrganizationControlState {
  const selected = hasIdentity(selectedSnapshotPeople(selection), person);
  const entry = uniqueEntry(directory.people, person);
  const coverage = personRuleCoverage(directory, selection.departmentRules, person);
  // A department rule never grants permission to an individual member.
  if (!entry || entry.permission === 'unknown')
    return { selected: false, disabled: true, reason: 'unknown' };
  if (entry.permission === 'deny') return { selected: false, disabled: true, reason: 'denied' };
  if (coverage === 'covered') return { selected: true, disabled: true, reason: 'covered' };
  if (coverage === 'unknown') return { selected, disabled: true, reason: 'unknown' };
  if (selected) return { selected: true, disabled: false, reason: 'available' };
  return { selected: false, disabled: false, reason: 'available' };
}
export function togglePerson(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  person: OrganizationIdentity,
): OrganizationSelection | undefined {
  const state = personControl(directory, selection, person);
  if (state.disabled) return;
  if (!state.selected) return { ...selection, individuals: [...selection.individuals, person] };
  return {
    ...selection,
    individuals: selection.individuals.filter((item) => !same(item, person)),
    snapshots: selection.snapshots
      .map((snapshot) => ({
        ...snapshot,
        people: snapshot.people.filter((item) => !same(item, person)),
      }))
      .filter((snapshot) => snapshot.people.length > 0 || !snapshot.complete),
  };
}
/** Remove stale explicit/snapshot membership only; this never changes a department rule. */
export function removeUnavailablePerson(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  person: OrganizationIdentity,
): OrganizationSelection | undefined {
  if (
    knownPersonPermission(directory, person) === 'allow' ||
    !hasIdentity(selectedSnapshotPeople(selection), person)
  )
    return;
  return {
    ...selection,
    individuals: selection.individuals.filter((item) => !same(item, person)),
    snapshots: selection.snapshots
      .map((snapshot) => ({
        ...snapshot,
        people: snapshot.people.filter((item) => !same(item, person)),
      }))
      .filter((snapshot) => snapshot.people.length > 0 || !snapshot.complete),
  };
}
export interface SnapshotControl {
  selected: boolean;
  disabled: boolean;
  result: SnapshotResult;
}
/** An incomplete directory cannot be represented as an all-members snapshot. */
export function snapshotControl(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  department: OrganizationIdentity,
): SnapshotControl {
  const selected = selection.snapshots.some((snapshot) => same(snapshot.department, department));
  const result = snapshotDepartmentMembers(directory, department);
  return {
    selected,
    disabled: !selected && (result.status !== 'complete' || !result.snapshot?.people.length),
    result,
  };
}
export function toggleDepartmentSnapshot(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  department: OrganizationIdentity,
): OrganizationSelection | undefined {
  const state = snapshotControl(directory, selection, department);
  if (state.disabled) return;
  if (state.selected)
    return {
      ...selection,
      snapshots: selection.snapshots.filter((item) => !same(item.department, department)),
    };
  if (!state.result.snapshot) return;
  return {
    ...selection,
    snapshots: [...selection.snapshots, state.result.snapshot],
  };
}
/** Remove exactly the displayed snapshot, even when stale directory data lacks its department. */
export function removeSnapshotAt(
  selection: OrganizationSelection,
  index: number,
): OrganizationSelection {
  if (!Number.isInteger(index) || index < 0 || index >= selection.snapshots.length)
    return selection;
  return {
    ...selection,
    snapshots: selection.snapshots.filter((_, position) => position !== index),
  };
}
/** Known included people only; unresolved future membership is intentionally not represented as a count. */
export function knownSelectedPeople(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
): OrganizationIdentity[] {
  const combined = [
    ...selectedSnapshotPeople(selection),
    ...directory.people
      .filter(
        (person) =>
          personRuleCoverage(directory, selection.departmentRules, person.identity) === 'covered',
      )
      .map((person) => person.identity),
  ];
  const keys = new Set<string>();
  return combined.filter((identity) => {
    const key = safeOrganizationKey(identity);
    if (!key || keys.has(key) || knownPersonPermission(directory, identity) !== 'allow')
      return false;
    keys.add(key);
    return true;
  });
}

export interface KnownDepartmentPath {
  nodes: OrganizationIdentity[];
  complete: boolean;
}
/** Known ancestor names may be rendered as a path; missing or cyclic parent links are explicit. */
export function knownDepartmentPath(
  directory: OrganizationDirectory,
  identity: OrganizationIdentity,
): KnownDepartmentPath {
  const nodes: OrganizationIdentity[] = [];
  const seen = new Set<string>();
  let current: OrganizationIdentity | null | undefined = identity;
  while (current) {
    const key = safeOrganizationKey(current);
    if (!key || seen.has(key)) return { nodes: nodes.reverse(), complete: false };
    seen.add(key);
    const entry: OrganizationDepartment | undefined = uniqueEntry(directory.departments, current);
    if (!entry) return { nodes: nodes.reverse(), complete: false };
    nodes.push(entry.identity);
    if (entry.parent === undefined) return { nodes: nodes.reverse(), complete: false };
    current = entry.parent;
  }
  return { nodes: nodes.reverse(), complete: true };
}
export interface KnownPersonPaths {
  paths: OrganizationIdentity[][];
  complete: boolean;
}
/** List only caller-supplied memberships and mark incomplete paths as unresolved. */
export function knownPersonPaths(
  directory: OrganizationDirectory,
  identity: OrganizationIdentity,
): KnownPersonPaths {
  const person = uniqueEntry(directory.people, identity);
  if (!person) return { paths: [], complete: false };
  let complete = person.membershipsComplete;
  const paths: OrganizationIdentity[][] = [],
    seen = new Set<string>();
  for (const membership of directory.memberships) {
    if (!same(membership.person, identity)) continue;
    const key = safeOrganizationKey(membership.department);
    if (!key) {
      complete = false;
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    const result = knownDepartmentPath(directory, membership.department);
    if (!result.complete) complete = false;
    if (result.nodes.length) paths.push(result.nodes);
  }
  return { paths, complete };
}

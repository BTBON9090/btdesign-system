/** Stable IDs are namespaced so identical IDs from separate directories never collide. */
export interface OrganizationIdentity {
  namespace: string;
  id: string;
}
export type OrganizationPermission = 'allow' | 'deny' | 'unknown';
export interface OrganizationDepartment {
  identity: OrganizationIdentity;
  /** null is a known root; undefined means the parent is not known. */
  parent?: OrganizationIdentity | null;
  /** Permission to select this department as a persistent rule, not permission to select its members. */
  permission: OrganizationPermission;
  childrenComplete: boolean;
  membersComplete: boolean;
}
export interface OrganizationPerson {
  identity: OrganizationIdentity;
  permission: OrganizationPermission;
  /** Whether all department memberships for this person are included in the directory. */
  membershipsComplete: boolean;
}
export interface OrganizationMembership {
  department: OrganizationIdentity;
  person: OrganizationIdentity;
}
/** A caller-provided local view, never an implicit remote lookup. */
export interface OrganizationDirectory {
  departments: OrganizationDepartment[];
  people: OrganizationPerson[];
  memberships: OrganizationMembership[];
}
export interface OrganizationSnapshot {
  department: OrganizationIdentity;
  /** Membership is fixed at capture time, including known descendants; it does not grow later. */
  people: OrganizationIdentity[];
  complete: boolean;
}
export interface OrganizationSelection {
  /** Long-lived rules; a consumer must resolve future membership against its real directory. */
  departmentRules: OrganizationIdentity[];
  individuals: OrganizationIdentity[];
  snapshots: OrganizationSnapshot[];
}
export type Coverage = 'covered' | 'not-covered' | 'unknown';
export type OrganizationIssueCode =
  | 'invalid-identity'
  | 'duplicate-identity'
  | 'missing-department'
  | 'missing-person'
  | 'unknown-parent'
  | 'cycle'
  | 'incomplete-children'
  | 'incomplete-members'
  | 'denied'
  | 'unknown-permission'
  | 'incomplete-snapshot';
export interface OrganizationIssue {
  code: OrganizationIssueCode;
  identity: OrganizationIdentity;
}
export interface SnapshotResult {
  status: 'complete' | 'partial' | 'unavailable';
  snapshot?: OrganizationSnapshot;
  issues: OrganizationIssue[];
  /** Known members omitted because selecting them is explicitly forbidden. */
  deniedPeople: OrganizationIdentity[];
}
const valid = (
  identity: OrganizationIdentity | null | undefined,
): identity is OrganizationIdentity =>
  !!identity &&
  typeof identity.namespace === 'string' &&
  identity.namespace.trim().length > 0 &&
  typeof identity.id === 'string' &&
  identity.id.trim().length > 0;
/** Collision-free serialized identity; throws on malformed input rather than normalizing IDs. */
export function organizationIdentityKey(identity: OrganizationIdentity): string {
  if (!valid(identity)) throw new TypeError('Organization identity requires a namespace and id');
  return JSON.stringify([identity.namespace, identity.id]);
}
function indexByIdentity<T extends { identity: OrganizationIdentity }>(items: T[]) {
  const byId = new Map<string, T>();
  const duplicate = new Set<string>();
  for (const item of items) {
    if (!valid(item.identity)) continue;
    const key = organizationIdentityKey(item.identity);
    if (byId.has(key)) duplicate.add(key);
    else byId.set(key, item);
  }
  return { byId, duplicate };
}
const unique = (items: OrganizationIdentity[]) => {
  const seen = new Set<string>();
  return items.filter((identity) => {
    if (!valid(identity)) return false;
    const key = organizationIdentityKey(identity);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
/** Exact known identity coverage, or ancestor coverage if the entire parent path is known. */
export function departmentRuleCoverage(
  directory: OrganizationDirectory,
  rules: OrganizationIdentity[],
  department: OrganizationIdentity,
): Coverage {
  if (!valid(department) || rules.some((rule) => !valid(rule))) return 'unknown';
  if (!rules.length) return 'not-covered';
  const ruleKeys = new Set(rules.map(organizationIdentityKey));
  const { byId, duplicate } = indexByIdentity(directory.departments);
  const seen = new Set<string>();
  let current: OrganizationIdentity | null | undefined = department;
  while (current) {
    const key = organizationIdentityKey(current);
    if (ruleKeys.has(key)) return 'covered';
    if (seen.has(key) || duplicate.has(key)) return 'unknown';
    seen.add(key);
    const entry = byId.get(key);
    if (!entry || entry.parent === undefined || (entry.parent !== null && !valid(entry.parent)))
      return 'unknown';
    current = entry.parent;
  }
  return 'not-covered';
}
/** Covered if any known membership is covered; negative results require complete memberships. */
export function personRuleCoverage(
  directory: OrganizationDirectory,
  rules: OrganizationIdentity[],
  person: OrganizationIdentity,
): Coverage {
  if (!valid(person) || rules.some((rule) => !valid(rule))) return 'unknown';
  if (!rules.length) return 'not-covered';
  const people = indexByIdentity(directory.people);
  const key = organizationIdentityKey(person);
  if (people.duplicate.has(key)) return 'unknown';
  const entry = people.byId.get(key);
  if (!entry) return 'unknown';
  let uncertain = !entry.membershipsComplete;
  for (const membership of directory.memberships) {
    if (!valid(membership.person) || organizationIdentityKey(membership.person) !== key) continue;
    if (!valid(membership.department)) {
      uncertain = true;
      continue;
    }
    const result = departmentRuleCoverage(directory, rules, membership.department);
    if (result === 'covered') return 'covered';
    if (result === 'unknown') uncertain = true;
  }
  return uncertain ? 'unknown' : 'not-covered';
}
/** Capture current known eligible people, including descendants, without predicting future members. */
export function snapshotDepartmentMembers(
  directory: OrganizationDirectory,
  department: OrganizationIdentity,
): SnapshotResult {
  if (!valid(department))
    return {
      status: 'unavailable',
      issues: [{ code: 'invalid-identity', identity: department }],
      deniedPeople: [],
    };
  const departments = indexByIdentity(directory.departments);
  const people = indexByIdentity(directory.people);
  const root = organizationIdentityKey(department);
  if (!departments.byId.has(root) || departments.duplicate.has(root))
    return {
      status: 'unavailable',
      issues: [
        {
          code: departments.duplicate.has(root) ? 'duplicate-identity' : 'missing-department',
          identity: department,
        },
      ],
      deniedPeople: [],
    };
  const children = new Map<string, OrganizationDepartment[]>();
  for (const entry of directory.departments) {
    if (!valid(entry.identity) || !valid(entry.parent)) continue;
    const key = organizationIdentityKey(entry.parent);
    const list = children.get(key) ?? [];
    list.push(entry);
    children.set(key, list);
  }
  const issues: OrganizationIssue[] = [];
  const queue = [department];
  const visited = new Set<string>();
  const included: OrganizationIdentity[] = [];
  const denied: OrganizationIdentity[] = [];
  while (queue.length) {
    const current = queue.shift()!;
    const key = organizationIdentityKey(current);
    if (visited.has(key)) {
      issues.push({ code: 'cycle', identity: current });
      continue;
    }
    visited.add(key);
    const node = departments.byId.get(key);
    if (!node || departments.duplicate.has(key)) {
      issues.push({ code: node ? 'duplicate-identity' : 'missing-department', identity: current });
      continue;
    }
    if (!node.childrenComplete) issues.push({ code: 'incomplete-children', identity: current });
    if (!node.membersComplete) issues.push({ code: 'incomplete-members', identity: current });
    for (const membership of directory.memberships) {
      if (!valid(membership.department) || organizationIdentityKey(membership.department) !== key)
        continue;
      if (!valid(membership.person)) {
        issues.push({ code: 'invalid-identity', identity: membership.person });
        continue;
      }
      const personKey = organizationIdentityKey(membership.person);
      const person = people.byId.get(personKey);
      if (people.duplicate.has(personKey))
        issues.push({ code: 'duplicate-identity', identity: membership.person });
      else if (!person) issues.push({ code: 'missing-person', identity: membership.person });
      else if (person.permission === 'deny') denied.push(person.identity);
      else if (person.permission !== 'allow')
        issues.push({ code: 'unknown-permission', identity: person.identity });
      else included.push(person.identity);
    }
    for (const child of children.get(key) ?? []) queue.push(child.identity);
  }
  const complete = issues.length === 0;
  return {
    status: complete ? 'complete' : 'partial',
    snapshot: { department, people: unique(included), complete },
    issues,
    deniedPeople: unique(denied),
  };
}
/** Union explicit people and snapshot members by namespaced identity. Department rules are not expanded. */
export function selectedSnapshotPeople(selection: OrganizationSelection): OrganizationIdentity[] {
  return unique([
    ...selection.individuals,
    ...selection.snapshots.flatMap((snapshot) => snapshot.people),
  ]);
}
export interface OrganizationConfirmation {
  status: 'ready' | 'empty' | 'invalid' | 'unknown';
  issues: OrganizationIssue[];
  /** Long-lived department rules still need real server-side resolution and authorization. */
  requiresRuleResolution: boolean;
}
/** Local validation only; never replaces authorization or resolves dynamic rules. */
export function validateOrganizationSelection(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
): OrganizationConfirmation {
  if (
    !selection.departmentRules.length &&
    !selection.individuals.length &&
    !selection.snapshots.some((item) => item.people.length || !item.complete)
  )
    return { status: 'empty', issues: [], requiresRuleResolution: false };
  const departments = indexByIdentity(directory.departments),
    people = indexByIdentity(directory.people);
  const issues: OrganizationIssue[] = [];
  const check = (
    identity: OrganizationIdentity,
    index: ReturnType<typeof indexByIdentity<OrganizationDepartment | OrganizationPerson>>,
    missing: 'missing-person' | 'missing-department',
  ) => {
    if (!valid(identity)) {
      issues.push({ code: 'invalid-identity', identity });
      return;
    }
    const key = organizationIdentityKey(identity);
    if (index.duplicate.has(key)) {
      issues.push({ code: 'duplicate-identity', identity });
      return;
    }
    const entry = index.byId.get(key);
    if (!entry) issues.push({ code: missing, identity });
    else if (entry.permission === 'deny') issues.push({ code: 'denied', identity });
    else if (entry.permission !== 'allow') issues.push({ code: 'unknown-permission', identity });
  };
  for (const rule of selection.departmentRules) check(rule, departments, 'missing-department');
  for (const snapshot of selection.snapshots) {
    if (!valid(snapshot.department))
      issues.push({ code: 'invalid-identity', identity: snapshot.department });
    if (!snapshot.complete)
      issues.push({ code: 'incomplete-snapshot', identity: snapshot.department });
  }
  for (const person of [
    ...selection.individuals,
    ...selection.snapshots.flatMap((snapshot) => snapshot.people),
  ])
    check(person, people, 'missing-person');
  return {
    status: issues.some((issue) => issue.code === 'denied' || issue.code === 'invalid-identity')
      ? 'invalid'
      : issues.length
        ? 'unknown'
        : 'ready',
    issues,
    requiresRuleResolution: selection.departmentRules.length > 0,
  };
}

export type PersonRemovalState = 'removable' | 'covered' | 'unknown' | 'not-selected';
/** Inherited members cannot be individually removed while the covering rule is active. */
export function personRemovalState(
  directory: OrganizationDirectory,
  selection: OrganizationSelection,
  person: OrganizationIdentity,
): PersonRemovalState {
  if (!valid(person)) return 'unknown';
  const coverage = personRuleCoverage(directory, selection.departmentRules, person);
  if (coverage === 'covered') return 'covered';
  if (coverage === 'unknown') return 'unknown';
  const key = organizationIdentityKey(person);
  return selectedSnapshotPeople(selection).some((entry) => organizationIdentityKey(entry) === key)
    ? 'removable'
    : 'not-selected';
}

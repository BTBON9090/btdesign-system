import test from 'node:test';
import assert from 'node:assert/strict';
import {
  organizationIdentityKey,
  departmentRuleCoverage,
  personRuleCoverage,
  personRemovalState,
  snapshotDepartmentMembers,
  selectedSnapshotPeople,
  validateOrganizationSelection,
} from '../dist/organization.js';
const id = (namespace, id) => ({ namespace, id });
const root = id('hr', 'root'),
  child = id('hr', 'child'),
  stranger = id('hr', 'else');
const alice = id('local', '42'),
  aliceOther = id('remote', '42'),
  bob = id('local', 'bob');
const dept = (identity, parent = null, other = {}) => ({
  identity,
  parent,
  permission: 'allow',
  childrenComplete: true,
  membersComplete: true,
  ...other,
});
const person = (identity, other = {}) => ({
  identity,
  permission: 'allow',
  membershipsComplete: true,
  ...other,
});
const directory = () => ({
  departments: [dept(root), dept(child, root), dept(stranger)],
  people: [person(alice), person(aliceOther), person(bob, { permission: 'deny' })],
  memberships: [
    { department: root, person: alice },
    { department: child, person: alice },
    { department: child, person: aliceOther },
    { department: child, person: bob },
  ],
});
const empty = () => ({ departmentRules: [], individuals: [], snapshots: [] });

test('namespace keys preserve distinct IDs and reject malformed identities', () => {
  assert.notEqual(organizationIdentityKey(alice), organizationIdentityKey(aliceOther));
  assert.notEqual(organizationIdentityKey(id('a,b', 'c')), organizationIdentityKey(id('a', 'b,c')));
  assert.throws(() => organizationIdentityKey(id('', '42')), TypeError);
});
test('snapshot includes known descendants, deduplicates members and excludes denied people', () => {
  const result = snapshotDepartmentMembers(directory(), root);
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.snapshot, {
    department: root,
    people: [alice, aliceOther],
    complete: true,
  });
  assert.deepEqual(result.deniedPeople, [bob]);
  const selected = { ...empty(), individuals: [alice], snapshots: [result.snapshot] };
  assert.deepEqual(selectedSnapshotPeople(selected), [alice, aliceOther]);
});
test('snapshot reports incomplete children, missing data and unknown permission rather than inventing results', () => {
  const d = directory();
  d.departments[1].childrenComplete = false;
  d.people[1].permission = 'unknown';
  d.memberships.push({ department: root, person: id('local', 'missing') });
  const result = snapshotDepartmentMembers(d, root);
  assert.equal(result.status, 'partial');
  assert.equal(result.snapshot.complete, false);
  assert.deepEqual(result.snapshot.people, [alice]);
  assert.deepEqual(
    new Set(result.issues.map((x) => x.code)),
    new Set(['incomplete-children', 'unknown-permission', 'missing-person']),
  );
  assert.equal(
    validateOrganizationSelection(d, { ...empty(), snapshots: [result.snapshot] }).status,
    'unknown',
  );
  assert.equal(snapshotDepartmentMembers(d, id('hr', 'missing')).status, 'unavailable');
});
test('rules cover descendants and current memberships without expanding future membership', () => {
  const d = directory();
  assert.equal(departmentRuleCoverage(d, [root], child), 'covered');
  assert.equal(departmentRuleCoverage(d, [child], root), 'not-covered');
  assert.equal(personRuleCoverage(d, [root], alice), 'covered');
  assert.equal(personRuleCoverage(d, [root], aliceOther), 'covered');
  assert.equal(personRuleCoverage(d, [stranger], alice), 'not-covered');
  d.people[0].membershipsComplete = false;
  assert.equal(personRuleCoverage(d, [stranger], alice), 'unknown');
});
test('ancestor chains with missing links, duplicate departments or cycles stay unknown', () => {
  const d = directory();
  d.departments[1].parent = id('hr', 'missing');
  assert.equal(departmentRuleCoverage(d, [root], child), 'unknown');
  d.departments[1].parent = child;
  assert.equal(departmentRuleCoverage(d, [root], child), 'unknown');
  d.departments.push(dept(child, root));
  assert.equal(departmentRuleCoverage(d, [root], child), 'unknown');
});
test('inherited members cannot be removed separately; unknown coverage does not permit removal', () => {
  const d = directory(),
    selection = { departmentRules: [root], individuals: [alice], snapshots: [] };
  assert.equal(personRemovalState(d, selection, alice), 'covered');
  assert.equal(personRemovalState(d, { ...selection, departmentRules: [] }, alice), 'removable');
  d.people[0].membershipsComplete = false;
  assert.equal(
    personRemovalState(d, { ...selection, departmentRules: [stranger] }, alice),
    'unknown',
  );
  assert.equal(personRemovalState(d, empty(), alice), 'not-selected');
});
test('department-only selection is confirmable; denied and unknown permissions are not', () => {
  const d = directory();
  assert.equal(validateOrganizationSelection(d, empty()).status, 'empty');
  const ruleOnly = validateOrganizationSelection(d, { ...empty(), departmentRules: [root] });
  assert.equal(ruleOnly.status, 'ready');
  assert.equal(ruleOnly.requiresRuleResolution, true);
  assert.equal(
    validateOrganizationSelection(d, { ...empty(), individuals: [bob] }).status,
    'invalid',
  );
  d.departments[0].permission = 'unknown';
  assert.equal(
    validateOrganizationSelection(d, { ...empty(), departmentRules: [root] }).status,
    'unknown',
  );
});
test('a snapshot stays fixed after a new member is added while the department rule covers the new member', () => {
  const d = directory(),
    snapshot = snapshotDepartmentMembers(d, root).snapshot,
    future = id('local', 'new');
  d.people.push(person(future));
  d.memberships.push({ department: child, person: future });
  assert.equal(
    selectedSnapshotPeople({ ...empty(), snapshots: [snapshot] }).some(
      (p) => organizationIdentityKey(p) === organizationIdentityKey(future),
    ),
    false,
  );
  assert.equal(personRuleCoverage(d, [root], future), 'covered');
});

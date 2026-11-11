import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyOrganizationSelection,
  departmentRuleControl,
  personControl,
  toggleDepartmentRule,
  togglePerson,
  toggleDepartmentSnapshot,
  snapshotControl,
  knownSelectedPeople,
  knownDepartmentPath,
  knownPersonPaths,
  removeUnavailablePerson,
} from '../dist/organization-transfer-model.js';
import { validateOrganizationSelection } from '../dist/organization.js';
const id = (namespace, id) => ({ namespace, id });
const root = id('one', 'root'),
  child = id('one', 'child'),
  ann = id('one', 'person'),
  other = id('two', 'person'),
  blocked = id('one', 'blocked'),
  unknown = id('one', 'unknown');
const directory = () => ({
  departments: [
    {
      identity: root,
      parent: null,
      permission: 'allow',
      childrenComplete: true,
      membersComplete: true,
    },
    {
      identity: child,
      parent: root,
      permission: 'allow',
      childrenComplete: true,
      membersComplete: true,
    },
  ],
  people: [
    { identity: ann, permission: 'allow', membershipsComplete: true },
    { identity: other, permission: 'allow', membershipsComplete: true },
    { identity: blocked, permission: 'deny', membershipsComplete: true },
    { identity: unknown, permission: 'unknown', membershipsComplete: true },
  ],
  memberships: [
    { department: child, person: ann },
    { department: child, person: other },
    { department: child, person: blocked },
  ],
});
test('department rule survives future members while snapshot captures only current permitted people', () => {
  const d = directory();
  const empty = emptyOrganizationSelection();
  const ruled = toggleDepartmentRule(d, empty, root);
  assert.equal(validateOrganizationSelection(d, ruled).status, 'ready');
  assert.equal(validateOrganizationSelection(d, ruled).requiresRuleResolution, true);
  const snap = toggleDepartmentSnapshot(d, empty, root);
  assert.deepEqual(snap.snapshots[0].people, [ann, other]);
  assert.deepEqual(snapshotControl(d, empty, root).result.deniedPeople, [blocked]);
  const later = id('one', 'later');
  d.people.push({
    identity: later,
    permission: 'allow',
    membershipsComplete: true,
  });
  d.memberships.push({ department: child, person: later });
  assert.equal(personControl(d, ruled, later).reason, 'covered');
  assert.equal(personControl(d, snap, later).selected, false);
  assert.deepEqual(snap.snapshots[0].people, [ann, other]);
});
test('covered and unknown people cannot be selected or removed independently', () => {
  const d = directory();
  const rules = toggleDepartmentRule(d, emptyOrganizationSelection(), root);
  assert.equal(personControl(d, rules, ann).reason, 'covered');
  assert.equal(togglePerson(d, rules, ann), undefined);
  assert.equal(departmentRuleControl(d, rules, child).reason, 'covered');
  assert.equal(personControl(d, emptyOrganizationSelection(), blocked).reason, 'denied');
  assert.equal(personControl(d, emptyOrganizationSelection(), unknown).reason, 'unknown');
});
test('partial data blocks snapshot, identity dedup respects namespace, removal updates overlapping snapshots', () => {
  const d = directory();
  d.departments[1].membersComplete = false;
  assert.equal(snapshotControl(d, emptyOrganizationSelection(), root).disabled, true);
  assert.equal(toggleDepartmentSnapshot(d, emptyOrganizationSelection(), root), undefined);
  d.departments[1].membersComplete = true;
  const base = togglePerson(d, emptyOrganizationSelection(), ann);
  const both = toggleDepartmentSnapshot(d, base, root);
  assert.deepEqual(knownSelectedPeople(d, both), [ann, other]);
  const removed = togglePerson(d, both, ann);
  assert.deepEqual(removed.individuals, []);
  assert.deepEqual(removed.snapshots[0].people, [other]);
});

test('paths retain multiple memberships and explicitly flag missing ancestry', () => {
  const d = directory();
  d.memberships.push({ department: root, person: ann });
  assert.deepEqual(knownPersonPaths(d, ann).paths, [[root, child], [root]]);
  d.departments[1].parent = undefined;
  assert.deepEqual(knownDepartmentPath(d, child), {
    nodes: [child],
    complete: false,
  });
  assert.equal(knownPersonPaths(d, ann).complete, false);
});

test('rule coverage never grants denied or unknown people selection', () => {
  const d = directory();
  d.memberships.push({ department: child, person: unknown });
  const rules = toggleDepartmentRule(d, emptyOrganizationSelection(), root);
  assert.deepEqual(personControl(d, rules, ann), {
    selected: true,
    disabled: true,
    reason: 'covered',
  });
  assert.deepEqual(personControl(d, rules, blocked), {
    selected: false,
    disabled: true,
    reason: 'denied',
  });
  assert.deepEqual(personControl(d, rules, unknown), {
    selected: false,
    disabled: true,
    reason: 'unknown',
  });
  assert.deepEqual(knownSelectedPeople(d, rules), [ann, other]);
  assert.equal(validateOrganizationSelection(d, rules).status, 'ready');
  assert.equal(validateOrganizationSelection(d, rules).requiresRuleResolution, true);
});
test('revoked explicit membership is excluded from counts and can be removed without changing the department rule', () => {
  const d = directory();
  const selected = {
    ...togglePerson(d, emptyOrganizationSelection(), ann),
    departmentRules: [root],
  };
  d.people[0].permission = 'deny';
  assert.deepEqual(personControl(d, selected, ann), {
    selected: false,
    disabled: true,
    reason: 'denied',
  });
  assert.equal(
    knownSelectedPeople(d, selected).some(
      (item) => item.namespace === ann.namespace && item.id === ann.id,
    ),
    false,
  );
  assert.equal(validateOrganizationSelection(d, selected).status, 'invalid');
  const removed = removeUnavailablePerson(d, selected, ann);
  assert.deepEqual(removed.individuals, []);
  assert.deepEqual(removed.departmentRules, [root]);
  assert.equal(validateOrganizationSelection(d, removed).status, 'ready');
});

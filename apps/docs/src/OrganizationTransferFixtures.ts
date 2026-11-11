import type { OrganizationDirectory, OrganizationIdentity } from '@btdesign/engine';
const id = (namespace: string, value: string): OrganizationIdentity => ({
  namespace,
  id: value,
});
export const root = id('hr', 'root'),
  team = id('hr', 'team'),
  remote = id('partner', 'remote'),
  incomplete = id('hr', 'unloaded');
export const alice = id('hr', 'u1'),
  alex = id('partner', 'u1'),
  denied = id('hr', 'denied'),
  uncertain = id('partner', 'unknown'),
  later = id('hr', 'later');
export function makeDirectory(): OrganizationDirectory {
  return {
    departments: [
      {
        identity: root,
        parent: null,
        permission: 'allow',
        childrenComplete: true,
        membersComplete: true,
      },
      {
        identity: team,
        parent: root,
        permission: 'allow',
        childrenComplete: true,
        membersComplete: true,
      },
      {
        identity: remote,
        parent: null,
        permission: 'unknown',
        childrenComplete: true,
        membersComplete: true,
      },
      {
        identity: incomplete,
        parent: null,
        permission: 'allow',
        childrenComplete: true,
        membersComplete: false,
      },
    ],
    people: [
      { identity: alice, permission: 'allow', membershipsComplete: true },
      { identity: alex, permission: 'allow', membershipsComplete: true },
      { identity: denied, permission: 'deny', membershipsComplete: true },
      { identity: uncertain, permission: 'unknown', membershipsComplete: true },
    ],
    memberships: [
      { department: team, person: alice },
      { department: root, person: alice },
      { department: team, person: alex },
      { department: team, person: denied },
      { department: remote, person: uncertain },
    ],
  };
}
export const labels: Record<string, string> = {
  'hr/root': '产品中心',
  'hr/team': '设计部',
  'partner/remote': '待确认组织',
  'hr/unloaded': '资料未加载完整',
  'hr/u1': '林晓',
  'partner/u1': 'Alex',
  'hr/denied': '受限成员',
  'partner/unknown': '权限待确认',
  'hr/later': '新成员',
};
export const getName = (identity: OrganizationIdentity) =>
  labels[`${identity.namespace}/${identity.id}`] ?? identity.id;

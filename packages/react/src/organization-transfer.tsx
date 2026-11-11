import { useId, useState } from 'react';
import {
  departmentRuleControl,
  emptyOrganizationSelection,
  knownDepartmentPath,
  knownPersonPaths,
  knownPersonPermission,
  knownSelectedPeople,
  personControl,
  removeSnapshotAt,
  removeUnavailablePerson,
  selectedSnapshotPeople,
  safeOrganizationKey,
  snapshotControl,
  toggleDepartmentRule,
  toggleDepartmentSnapshot,
  togglePerson,
  validateOrganizationSelection,
  departmentRuleCoverage,
  type OrganizationConfirmation,
  type OrganizationControlState,
  type OrganizationDirectory,
  type OrganizationIdentity,
  type OrganizationSelection,
} from '@btdesign/engine';

export interface OrganizationTransferProps {
  directory: OrganizationDirectory;
  value: OrganizationSelection;
  onValueChange: (value: OrganizationSelection) => void;
  onConfirm: (value: OrganizationSelection, result: OrganizationConfirmation) => void;
  getDepartmentLabel?: (identity: OrganizationIdentity) => string;
  getPersonLabel?: (identity: OrganizationIdentity) => string;
  label?: string;
  disabled?: boolean;
}
const text = (identity: OrganizationIdentity) => identity?.id || '无效标识';
const reasonText = {
  available: '',
  denied: '无权限选择',
  unknown: '权限或组织关系未确认',
  covered: '由上级部门规则覆盖，不能单独取消',
} as const;
const controlReason = (state: OrganizationControlState) =>
  reasonText[state.reason] +
  (state.selected && !state.disabled && state.reason !== 'available' ? '；已选项仅可移除' : '');

/** Controlled local view. The application owns directory loading, rule resolution and final authorization. */
export function OrganizationTransfer({
  directory,
  value,
  onValueChange,
  onConfirm,
  getDepartmentLabel = text,
  getPersonLabel = text,
  label = '选择组织和成员',
  disabled = false,
}: OrganizationTransferProps) {
  const titleId = useId();
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'departments' | 'people'>('departments');
  const [scope, setScope] = useState<OrganizationIdentity | null>(null);
  const selected = knownSelectedPeople(directory, value);
  const unavailable = selectedSnapshotPeople(value).filter(
    (identity) => knownPersonPermission(directory, identity) !== 'allow',
  );
  const confirmation = validateOrganizationSelection(directory, value);
  const criterion = query.trim().toLocaleLowerCase();
  const match = (s: string) => !criterion || s.toLocaleLowerCase().includes(criterion);
  const departmentLabel = (identity: OrganizationIdentity) =>
    getDepartmentLabel(identity) || text(identity);
  const personLabel = (identity: OrganizationIdentity) =>
    getPersonLabel(identity) || text(identity);
  const ident = (identity: OrganizationIdentity) =>
    `${identity?.namespace ?? '?'} / ${identity?.id ?? '?'}`;
  const pathLabel = (identity: OrganizationIdentity) => {
    const result = knownDepartmentPath(directory, identity);
    return `${result.nodes.map(departmentLabel).join(' / ')}${result.complete ? '' : '（组织路径未完整提供）'}`;
  };
  const membershipsLabel = (identity: OrganizationIdentity) => {
    const result = knownPersonPaths(directory, identity);
    const paths = result.paths.map((path) => path.map(departmentLabel).join(' / ')).join('；');
    return `${paths}${result.complete ? '' : '（组织关系未完整提供）'}`;
  };
  const belongsToScope = (person: OrganizationIdentity) =>
    !scope ||
    (!!safeOrganizationKey(person) &&
      directory.memberships.some(
        (item) =>
          safeOrganizationKey(item.person) === safeOrganizationKey(person) &&
          departmentRuleCoverage(directory, [scope], item.department) === 'covered',
      ));
  const visibleDepartments = directory.departments.filter((item) =>
    match(`${departmentLabel(item.identity)} ${ident(item.identity)}`),
  );
  const visiblePeople = directory.people.filter(
    (person) =>
      belongsToScope(person.identity) &&
      match(`${personLabel(person.identity)} ${ident(person.identity)}`),
  );
  const scopeSnapshot = scope ? snapshotControl(directory, value, scope).result : undefined;
  const update = (next: OrganizationSelection | undefined) => {
    if (!disabled && next) onValueChange(next);
  };
  const canConfirm = !disabled && confirmation.status === 'ready';
  const status =
    confirmation.status === 'empty'
      ? '请选择部门或成员。'
      : confirmation.status === 'unknown'
        ? '部分权限、组织数据或成员快照未确认，暂不能确定。'
        : confirmation.status === 'invalid'
          ? '所选内容包含无效或无权限的项目，请调整。'
          : confirmation.requiresRuleResolution
            ? '部门规则需由应用按实际组织关系解析。'
            : '';
  return (
    <section className="f-org-transfer" aria-labelledby={titleId}>
      <header className="f-org-transfer-header">
        <h2 id={titleId}>{label}</h2>
        <p>选择部门会保留持续规则；选择当前成员会保存当时的成员快照。</p>
      </header>
      <div className="f-org-transfer-body">
        <div className="f-org-transfer-source">
          <div className="f-org-transfer-search">
            <label>
              搜索类型
              <select
                className="f-select"
                value={searchBy}
                disabled={disabled}
                onChange={(event) =>
                  setSearchBy(event.currentTarget.value as 'departments' | 'people')
                }
              >
                <option value="departments">部门</option>
                <option value="people">成员</option>
              </select>
            </label>
            <label>
              搜索
              <input
                className="f-input"
                type="search"
                value={query}
                disabled={disabled}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={searchBy === 'departments' ? '搜索部门' : '搜索成员'}
              />
            </label>
          </div>
          <div className="f-org-transfer-list" aria-label="待选内容">
            {searchBy === 'departments' ? (
              <>
                <h3>部门</h3>
                {visibleDepartments.length === 0 && <p role="status">没有匹配的部门。</p>}
                {visibleDepartments.map((department, index) => {
                  const name = departmentLabel(department.identity),
                    state = departmentRuleControl(directory, value, department.identity),
                    snapshot = snapshotControl(directory, value, department.identity);
                  const note =
                    snapshot.result.status !== 'complete'
                      ? '成员或下级组织数据不完整，无法全选当前成员。'
                      : !snapshot.result.snapshot?.people.length
                        ? '暂无可选成员。'
                        : snapshot.result.deniedPeople.length
                          ? `不包含 ${snapshot.result.deniedPeople.length} 位无权限成员。`
                          : '';
                  return (
                    <div
                      className="f-org-transfer-row"
                      key={`${safeOrganizationKey(department.identity) ?? 'invalid'}-${index}`}
                    >
                      <div>
                        <strong>{name}</strong>
                        <small>
                          {pathLabel(department.identity)} · {ident(department.identity)}
                        </small>
                      </div>
                      <div className="f-org-transfer-actions">
                        <label>
                          <input
                            type="checkbox"
                            className="f-checkbox"
                            checked={state.selected}
                            disabled={disabled || state.disabled}
                            onChange={() =>
                              update(toggleDepartmentRule(directory, value, department.identity))
                            }
                            aria-label={`持续选择部门 ${name} ${ident(department.identity)}`}
                          />
                          持续选择部门
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            className="f-checkbox"
                            checked={snapshot.selected}
                            disabled={disabled || snapshot.disabled}
                            onChange={() =>
                              update(
                                toggleDepartmentSnapshot(directory, value, department.identity),
                              )
                            }
                            aria-label={`选择当前成员 ${name} ${ident(department.identity)}`}
                          />
                          当前成员（含下级）
                        </label>
                        <button
                          type="button"
                          className="f-button f-button--ghost f-button--sm"
                          disabled={disabled}
                          onClick={() => {
                            setScope(department.identity);
                            setSearchBy('people');
                            setQuery('');
                          }}
                        >
                          查看成员
                        </button>
                      </div>
                      {state.reason !== 'available' && <small>{controlReason(state)}</small>}
                      {note && <small>{note}</small>}
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <div className="f-org-transfer-scope">
                  <h3>{scope ? `${departmentLabel(scope)} · 成员` : '全部成员'}</h3>
                  {scope && (
                    <button
                      type="button"
                      className="f-button f-button--ghost f-button--sm"
                      onClick={() => setScope(null)}
                      disabled={disabled}
                    >
                      查看全部
                    </button>
                  )}
                </div>
                {scopeSnapshot && scopeSnapshot.status !== 'complete' && (
                  <p role="status">成员或下级组织数据不完整，列表可能不完整。</p>
                )}
                {visiblePeople.length === 0 && <p role="status">没有匹配的成员。</p>}
                {visiblePeople.map((person, index) => {
                  const name = personLabel(person.identity),
                    state = personControl(directory, value, person.identity);
                  return (
                    <label
                      className="f-org-transfer-row"
                      key={`${safeOrganizationKey(person.identity) ?? 'invalid'}-${index}`}
                    >
                      <span>
                        <input
                          type="checkbox"
                          className="f-checkbox"
                          checked={state.selected}
                          disabled={disabled || state.disabled}
                          onChange={() => update(togglePerson(directory, value, person.identity))}
                          aria-label={`选择成员 ${name} ${ident(person.identity)}`}
                        />{' '}
                        {name}
                      </span>
                      <small>{membershipsLabel(person.identity) || ident(person.identity)}</small>
                      {state.reason !== 'available' && <small>{controlReason(state)}</small>}
                    </label>
                  );
                })}
              </>
            )}
          </div>
        </div>
        <aside className="f-org-transfer-selected" aria-label="已选内容">
          <div className="f-org-transfer-selected-header">
            <h3>已选</h3>
            <button
              type="button"
              className="f-button f-button--ghost f-button--sm"
              disabled={disabled || confirmation.status === 'empty'}
              onClick={() => update(emptyOrganizationSelection())}
            >
              清空
            </button>
          </div>
          <p>
            部门规则 {value.departmentRules.length} 项 · 已知覆盖或单选成员 {selected.length} 人
          </p>
          <ul>
            {unavailable.map((identity, index) => (
              <li key={`unavailable-${safeOrganizationKey(identity) ?? 'invalid'}-${index}`}>
                <span>
                  待移除的失效成员：{personLabel(identity)}{' '}
                  <small>
                    {knownPersonPermission(directory, identity) === 'deny'
                      ? '无权限选择'
                      : '权限未确认'}
                  </small>
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`移除失效成员 ${personLabel(identity)} ${ident(identity)}`}
                  onClick={() => update(removeUnavailablePerson(directory, value, identity))}
                >
                  移除
                </button>
              </li>
            ))}
            {value.departmentRules.map((identity, index) => {
              const name = departmentLabel(identity),
                state = departmentRuleControl(directory, value, identity);
              return (
                <li key={`rule-${safeOrganizationKey(identity) ?? 'invalid'}-${index}`}>
                  <span>部门规则：{pathLabel(identity) || name}</span>
                  <button
                    type="button"
                    disabled={disabled || state.disabled}
                    aria-label={`移除部门规则 ${name} ${ident(identity)}`}
                    onClick={() => update(toggleDepartmentRule(directory, value, identity))}
                  >
                    移除
                  </button>
                  {state.reason !== 'available' && <small>{controlReason(state)}</small>}
                </li>
              );
            })}
            {value.snapshots.map((snapshot, index) => {
              const identity = snapshot.department;
              const name = departmentLabel(identity);
              return (
                <li key={`snapshot-${safeOrganizationKey(identity) ?? 'invalid'}-${index}`}>
                  <span>
                    当前成员快照：{pathLabel(identity) || name}
                    {!snapshot.complete && '（未完整）'}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`移除成员快照 ${name} ${ident(identity)}`}
                    onClick={() => update(removeSnapshotAt(value, index))}
                  >
                    移除
                  </button>
                </li>
              );
            })}
            {selected.map((identity, index) => {
              const name = personLabel(identity),
                state = personControl(directory, value, identity);
              return (
                <li key={`person-${safeOrganizationKey(identity) ?? 'invalid'}-${index}`}>
                  <span>
                    {name} <small>{membershipsLabel(identity) || ident(identity)}</small>
                  </span>
                  <button
                    type="button"
                    disabled={disabled || state.disabled}
                    aria-label={`移除成员 ${name} ${ident(identity)}`}
                    onClick={() => update(togglePerson(directory, value, identity))}
                  >
                    移除
                  </button>
                  {state.reason !== 'available' && <small>{controlReason(state)}</small>}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
      <footer className="f-org-transfer-footer">
        {status && <p role="status">{status}</p>}
        <button
          type="button"
          className="f-button f-button--primary"
          disabled={!canConfirm}
          onClick={() => {
            if (canConfirm) onConfirm(value, confirmation);
          }}
        >
          确定
        </button>
      </footer>
    </section>
  );
}

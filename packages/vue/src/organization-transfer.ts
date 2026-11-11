import { defineComponent, h, ref, type PropType } from 'vue';
import {
  departmentRuleControl,
  departmentRuleCoverage,
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
  type OrganizationDirectory,
  type OrganizationControlState,
  type OrganizationIdentity,
  type OrganizationSelection,
} from '@btdesign/engine';
const text = (identity: OrganizationIdentity) => identity?.id || '无效标识';
const reasons = {
  available: '',
  denied: '无权限选择',
  unknown: '权限或组织关系未确认',
  covered: '由上级部门规则覆盖，不能单独取消',
} as const;
const controlReason = (state: OrganizationControlState) =>
  reasons[state.reason] +
  (state.selected && !state.disabled && state.reason !== 'available' ? '；已选项仅可移除' : '');
/** Controlled local view. The application owns directory loading, rule resolution and final authorization. */
export const OrganizationTransfer = defineComponent({
  name: 'BTDESIGNOrganizationTransfer',
  props: {
    directory: {
      type: Object as PropType<OrganizationDirectory>,
      required: true,
    },
    modelValue: {
      type: Object as PropType<OrganizationSelection>,
      required: true,
    },
    getDepartmentLabel: {
      type: Function as PropType<(identity: OrganizationIdentity) => string>,
      default: text,
    },
    getPersonLabel: {
      type: Function as PropType<(identity: OrganizationIdentity) => string>,
      default: text,
    },
    label: { type: String, default: '选择组织和成员' },
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const searchBy = ref<'departments' | 'people'>('departments'),
      query = ref(''),
      scope = ref<OrganizationIdentity | null>(null);
    const ident = (identity: OrganizationIdentity) =>
      `${identity?.namespace ?? '?'} / ${identity?.id ?? '?'}`;
    const departmentLabel = (identity: OrganizationIdentity) =>
      props.getDepartmentLabel(identity) || text(identity);
    const personLabel = (identity: OrganizationIdentity) =>
      props.getPersonLabel(identity) || text(identity);
    const update = (next: OrganizationSelection | undefined) => {
      if (!props.disabled && next) emit('update:modelValue', next);
    };
    return () => {
      const value = props.modelValue,
        directory = props.directory,
        criterion = query.value.trim().toLocaleLowerCase();
      const pathLabel = (identity: OrganizationIdentity) => {
        const result = knownDepartmentPath(directory, identity);
        return `${result.nodes.map(departmentLabel).join(' / ')}${result.complete ? '' : '（组织路径未完整提供）'}`;
      };
      const membershipsLabel = (identity: OrganizationIdentity) => {
        const result = knownPersonPaths(directory, identity);
        const paths = result.paths.map((path) => path.map(departmentLabel).join(' / ')).join('；');
        return `${paths}${result.complete ? '' : '（组织关系未完整提供）'}`;
      };
      const match = (s: string) => !criterion || s.toLocaleLowerCase().includes(criterion);
      const unavailable = selectedSnapshotPeople(value).filter(
        (identity) => knownPersonPermission(directory, identity) !== 'allow',
      );
      const selected = knownSelectedPeople(directory, value),
        confirmation = validateOrganizationSelection(directory, value);
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
      const canConfirm = !props.disabled && confirmation.status === 'ready';
      const visibleDepartments = directory.departments.filter((item) =>
        match(`${departmentLabel(item.identity)} ${ident(item.identity)}`),
      );
      const belongs = (identity: OrganizationIdentity) =>
        !scope.value ||
        (!!safeOrganizationKey(identity) &&
          directory.memberships.some(
            (item) =>
              safeOrganizationKey(item.person) === safeOrganizationKey(identity) &&
              departmentRuleCoverage(directory, [scope.value!], item.department) === 'covered',
          ));
      const visiblePeople = directory.people.filter(
        (person) =>
          belongs(person.identity) &&
          match(`${personLabel(person.identity)} ${ident(person.identity)}`),
      );
      const scopeResult = scope.value
        ? snapshotControl(directory, value, scope.value).result
        : undefined;
      return h('section', { class: 'f-org-transfer', 'aria-label': props.label }, [
        h('header', { class: 'f-org-transfer-header' }, [
          h('h2', props.label),
          h('p', '选择部门会保留持续规则；选择当前成员会保存当时的成员快照。'),
        ]),
        h('div', { class: 'f-org-transfer-body' }, [
          h('div', { class: 'f-org-transfer-source' }, [
            h('div', { class: 'f-org-transfer-search' }, [
              h('label', [
                '搜索类型',
                h(
                  'select',
                  {
                    class: 'f-select',
                    value: searchBy.value,
                    disabled: props.disabled,
                    onChange: (event: Event) =>
                      (searchBy.value = (event.target as HTMLSelectElement).value as
                        'departments' | 'people'),
                  },
                  [
                    h('option', { value: 'departments' }, '部门'),
                    h('option', { value: 'people' }, '成员'),
                  ],
                ),
              ]),
              h('label', [
                '搜索',
                h('input', {
                  class: 'f-input',
                  type: 'search',
                  value: query.value,
                  disabled: props.disabled,
                  placeholder: searchBy.value === 'departments' ? '搜索部门' : '搜索成员',
                  onInput: (event: Event) =>
                    (query.value = (event.target as HTMLInputElement).value),
                }),
              ]),
            ]),
            h(
              'div',
              { class: 'f-org-transfer-list', 'aria-label': '待选内容' },
              searchBy.value === 'departments'
                ? [
                    h('h3', '部门'),
                    visibleDepartments.length
                      ? visibleDepartments.map((department, index) => {
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
                          return h(
                            'div',
                            {
                              class: 'f-org-transfer-row',
                              key: `${safeOrganizationKey(department.identity) ?? 'invalid'}-${index}`,
                            },
                            [
                              h('div', [
                                h('strong', name),
                                h(
                                  'small',
                                  `${pathLabel(department.identity)} · ${ident(department.identity)}`,
                                ),
                              ]),
                              h('div', { class: 'f-org-transfer-actions' }, [
                                h('label', [
                                  h('input', {
                                    type: 'checkbox',
                                    class: 'f-checkbox',
                                    checked: state.selected,
                                    disabled: props.disabled || state.disabled,
                                    'aria-label': `持续选择部门 ${name} ${ident(department.identity)}`,
                                    onChange: (event: Event) => {
                                      (event.target as HTMLInputElement).checked = state.selected;
                                      update(
                                        toggleDepartmentRule(directory, value, department.identity),
                                      );
                                    },
                                  }),
                                  '持续选择部门',
                                ]),
                                h('label', [
                                  h('input', {
                                    type: 'checkbox',
                                    class: 'f-checkbox',
                                    checked: snapshot.selected,
                                    disabled: props.disabled || snapshot.disabled,
                                    'aria-label': `选择当前成员 ${name} ${ident(department.identity)}`,
                                    onChange: (event: Event) => {
                                      (event.target as HTMLInputElement).checked =
                                        snapshot.selected;
                                      update(
                                        toggleDepartmentSnapshot(
                                          directory,
                                          value,
                                          department.identity,
                                        ),
                                      );
                                    },
                                  }),
                                  '当前成员（含下级）',
                                ]),
                                h(
                                  'button',
                                  {
                                    type: 'button',
                                    class: 'f-button f-button--ghost f-button--sm',
                                    disabled: props.disabled,
                                    onClick: () => {
                                      scope.value = department.identity;
                                      searchBy.value = 'people';
                                      query.value = '';
                                    },
                                  },
                                  '查看成员',
                                ),
                              ]),
                              state.reason !== 'available'
                                ? h('small', controlReason(state))
                                : null,
                              note ? h('small', note) : null,
                            ],
                          );
                        })
                      : h('p', { role: 'status' }, '没有匹配的部门。'),
                  ]
                : [
                    h('div', { class: 'f-org-transfer-scope' }, [
                      h('h3', scope.value ? `${departmentLabel(scope.value)} · 成员` : '全部成员'),
                      scope.value
                        ? h(
                            'button',
                            {
                              type: 'button',
                              class: 'f-button f-button--ghost f-button--sm',
                              disabled: props.disabled,
                              onClick: () => (scope.value = null),
                            },
                            '查看全部',
                          )
                        : null,
                    ]),
                    scopeResult && scopeResult.status !== 'complete'
                      ? h('p', { role: 'status' }, '成员或下级组织数据不完整，列表可能不完整。')
                      : null,
                    visiblePeople.length
                      ? visiblePeople.map((person, index) => {
                          const name = personLabel(person.identity),
                            state = personControl(directory, value, person.identity);
                          return h(
                            'label',
                            {
                              class: 'f-org-transfer-row',
                              key: `${safeOrganizationKey(person.identity) ?? 'invalid'}-${index}`,
                            },
                            [
                              h('span', [
                                h('input', {
                                  type: 'checkbox',
                                  class: 'f-checkbox',
                                  checked: state.selected,
                                  disabled: props.disabled || state.disabled,
                                  'aria-label': `选择成员 ${name} ${ident(person.identity)}`,
                                  onChange: (event: Event) => {
                                    (event.target as HTMLInputElement).checked = state.selected;
                                    update(togglePerson(directory, value, person.identity));
                                  },
                                }),
                                ` ${name}`,
                              ]),
                              h(
                                'small',
                                membershipsLabel(person.identity) || ident(person.identity),
                              ),
                              state.reason !== 'available'
                                ? h('small', controlReason(state))
                                : null,
                            ],
                          );
                        })
                      : h('p', { role: 'status' }, '没有匹配的成员。'),
                  ],
            ),
          ]),
          h('aside', { class: 'f-org-transfer-selected', 'aria-label': '已选内容' }, [
            h('div', { class: 'f-org-transfer-selected-header' }, [
              h('h3', '已选'),
              h(
                'button',
                {
                  type: 'button',
                  class: 'f-button f-button--ghost f-button--sm',
                  disabled: props.disabled || confirmation.status === 'empty',
                  onClick: () => update(emptyOrganizationSelection()),
                },
                '清空',
              ),
            ]),
            h(
              'p',
              `部门规则 ${value.departmentRules.length} 项 · 已知覆盖或单选成员 ${selected.length} 人`,
            ),
            h('ul', [
              ...unavailable.map((identity, index) =>
                h(
                  'li',
                  { key: `unavailable-${safeOrganizationKey(identity) ?? 'invalid'}-${index}` },
                  [
                    h('span', [
                      `待移除的失效成员：${personLabel(identity)} `,
                      h(
                        'small',
                        knownPersonPermission(directory, identity) === 'deny'
                          ? '无权限选择'
                          : '权限未确认',
                      ),
                    ]),
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: props.disabled,
                        'aria-label': `移除失效成员 ${personLabel(identity)} ${ident(identity)}`,
                        onClick: () => update(removeUnavailablePerson(directory, value, identity)),
                      },
                      '移除',
                    ),
                  ],
                ),
              ),
              ...value.departmentRules.map((identity, index) => {
                const name = departmentLabel(identity),
                  state = departmentRuleControl(directory, value, identity);
                return h(
                  'li',
                  {
                    key: `rule-${safeOrganizationKey(identity) ?? 'invalid'}-${index}`,
                  },
                  [
                    h('span', `部门规则：${pathLabel(identity) || name}`),
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: props.disabled || state.disabled,
                        'aria-label': `移除部门规则 ${name} ${ident(identity)}`,
                        onClick: () => update(toggleDepartmentRule(directory, value, identity)),
                      },
                      '移除',
                    ),
                    state.reason !== 'available' ? h('small', controlReason(state)) : null,
                  ],
                );
              }),
              ...value.snapshots.map((snapshot, index) => {
                const identity = snapshot.department,
                  name = departmentLabel(identity);
                return h(
                  'li',
                  {
                    key: `snapshot-${safeOrganizationKey(identity) ?? 'invalid'}-${index}`,
                  },
                  [
                    h(
                      'span',
                      `当前成员快照：${pathLabel(identity) || name}${snapshot.complete ? '' : '（未完整）'}`,
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: props.disabled,
                        'aria-label': `移除成员快照 ${name} ${ident(identity)}`,
                        onClick: () => update(removeSnapshotAt(value, index)),
                      },
                      '移除',
                    ),
                  ],
                );
              }),
              ...selected.map((identity, index) => {
                const name = personLabel(identity),
                  state = personControl(directory, value, identity);
                return h(
                  'li',
                  {
                    key: `person-${safeOrganizationKey(identity) ?? 'invalid'}-${index}`,
                  },
                  [
                    h('span', [
                      name,
                      ' ',
                      h('small', membershipsLabel(identity) || ident(identity)),
                    ]),
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: props.disabled || state.disabled,
                        'aria-label': `移除成员 ${name} ${ident(identity)}`,
                        onClick: () => update(togglePerson(directory, value, identity)),
                      },
                      '移除',
                    ),
                    state.reason !== 'available' ? h('small', controlReason(state)) : null,
                  ],
                );
              }),
            ]),
          ]),
        ]),
        h('footer', { class: 'f-org-transfer-footer' }, [
          status ? h('p', { role: 'status' }, status) : null,
          h(
            'button',
            {
              type: 'button',
              class: 'f-button f-button--primary',
              disabled: !canConfirm,
              onClick: () => {
                if (canConfirm) emit('confirm', value, confirmation);
              },
            },
            '确定',
          ),
        ]),
      ]);
    };
  },
});

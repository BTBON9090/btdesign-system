import type { DemoOptions } from './catalog';
import type { EnterpriseId } from './enterprise-catalog';
import type { FileItem } from '@btdesign/engine';
import { dropdownPreviewItems } from './dropdown-preview';
import { dateRangePresets } from './date-range-fixtures';
import { listVuePreview } from './ListVuePreview';
import { listPreviewOptions } from './ListExample';
import {
  enterpriseColumns,
  enterpriseFiles,
  enterpriseNav,
  enterpriseOptions,
  enterpriseRows,
  enterpriseTree,
} from './enterprise-fixtures';

function updateCell(
  rows: Record<string, unknown>[],
  key: string,
  column: string,
  value: unknown,
): Record<string, unknown>[] {
  return rows.map((row) => ({
    ...row,
    ...(row.id === key ? { [column]: value } : {}),
    ...(Array.isArray(row.children)
      ? { children: updateCell(row.children, key, column, value) }
      : {}),
  }));
}
export function createEnterpriseVueDemo(
  vue: typeof import('vue'),
  ui: typeof import('@btdesign/vue'),
  kind: EnterpriseId,
  o: DemoOptions,
  onAction: (message: string) => void,
) {
  const { defineComponent, h, ref } = vue;
  const dateOptions = o as DemoOptions & {
    dateRangeCalendar?: boolean;
    dateRangePresets?: boolean;
  };
  return defineComponent({
    name: 'EnterpriseVueExample',
    setup() {
      const disabled = o.state === 'disabled';
      const value = ref<string | string[]>(o.multiple ? ['design'] : 'design');
      const selected = ref(['design']);
      const access = ref('team');
      const date = ref('2026-11-10');
      const range = ref<[string, string]>(['2026-11-10', '2026-11-18']);
      const files = ref<FileItem[]>(enterpriseFiles.map((file) => ({ ...file })));
      const active = ref('overview');
      const rows = ref(enterpriseRows);
      const message = ref('');
      const onValue = (next: string | string[]) => (value.value = next);
      const narrow = (child: import('vue').VNodeChild) =>
        h('div', { class: 'enterprise-narrow' }, [child]);
      const result = (text: string) => h('p', { class: 'enterprise-demo-result' }, text);
      return () => {
        const choice = { options: enterpriseOptions, disabled };
        const tree = {
          nodes: enterpriseTree,
          modelValue: value.value,
          'onUpdate:modelValue': onValue,
          multiple: o.multiple ?? false,
          cascade: o.cascade ?? false,
          disabled,
          label: '选择组织',
        };
        switch (kind) {
          case 'form':
            return h(
              ui.Form,
              {
                class: 'enterprise-form-demo',
                initialValues: { email: '', team: 'design', agreement: false },
                disabled,
                onSubmit: (values: Record<string, unknown>) => {
                  message.value = `已校验：${String(values.email)} · ${String(values.team)}。示例未发送服务器。`;
                  onAction('表单校验通过，示例数据未发送服务器');
                },
                onInvalid: () => (message.value = '请根据字段提示完善信息。'),
              },
              () => [
                h(
                  ui.FormSection,
                  { title: '邀请新成员', description: '先填写基本资料，再选择协作范围。' },
                  () => [
                    h(ui.FormField, {
                      name: 'email',
                      label: '工作邮箱',
                      type: 'email',
                      placeholder: 'name@company.com',
                      required: true,
                      rules: [{ type: 'email', message: '请输入有效的邮箱地址' }],
                    }),
                    h(ui.FormField, {
                      name: 'team',
                      label: '所属团队',
                      type: 'select',
                      options: enterpriseOptions,
                    }),
                    h(ui.FormField, {
                      name: 'agreement',
                      label: '允许查看团队项目',
                      type: 'checkbox',
                    }),
                  ],
                ),
                h(ui.FormActions, {}, () => [
                  h(ui.Button, { type: 'submit' }, () => '保存成员'),
                  h(
                    ui.Button,
                    { type: 'reset', variant: 'secondary', onClick: () => (message.value = '') },
                    () => '重置',
                  ),
                ]),
                h(
                  'p',
                  { class: 'enterprise-demo-result', role: 'status' },
                  message.value || '数据只用于本页交互示例。',
                ),
              ],
            );
          case 'calendar':
            return h(ui.Calendar, {
              label: '交付日期',
              modelValue: date.value,
              'onUpdate:modelValue': (next: string) => (date.value = next),
              min: '2026-01-01',
              max: '2027-12-31',
              disabled,
            });
          case 'date-picker':
            return narrow([
              h(ui.DatePicker, {
                label: '交付日期',
                modelValue: date.value,
                'onUpdate:modelValue': (next: string) => (date.value = next),
                min: '2026-01-01',
                max: '2027-12-31',
                disabled,
                readonly: o.dateReadOnly,
                clearable: o.dateClearable !== false,
              }),
              result(`当前日期：${date.value || '未选择'}`),
            ]);
          case 'date-range-picker':
            return h('div', { class: 'enterprise-wide' }, [
              h(ui.DateRangePicker, {
                label: '项目周期',
                modelValue: range.value,
                'onUpdate:modelValue': (next: [string, string]) => (range.value = next),
                disabled,
                readonly: o.dateReadOnly,
                showCalendar: dateOptions.dateRangeCalendar,
                presets: dateOptions.dateRangePresets ? dateRangePresets : undefined,
              }),
              result(`${range.value[0] || '开始日期'} → ${range.value[1] || '结束日期'}`),
            ]);
          case 'radio':
            return h(
              'div',
              { class: 'demo-stack' },
              ['team', 'private'].map((key) =>
                h(ui.Radio, {
                  name: 'enterprise-access',
                  value: key,
                  label: key === 'team' ? '团队可见' : '仅自己可见',
                  modelValue: access.value,
                  'onUpdate:modelValue': (next: string) => (access.value = next),
                  disabled,
                }),
              ),
            );
          case 'checkbox-group':
            return h(ui.CheckboxGroup, {
              ...choice,
              orientation: o.orientation,
              label: '协作团队',
              modelValue: selected.value,
              'onUpdate:modelValue': (next: string[]) => (selected.value = next),
            });
          case 'toggle-group':
            return h(ui.ToggleGroup, {
              ...choice,
              label: '查看范围',
              modelValue: value.value,
              'onUpdate:modelValue': onValue,
              multiple: o.multiple,
            });
          case 'segmented':
            return h(ui.Segmented, {
              ...choice,
              label: '查看范围',
              modelValue: typeof value.value === 'string' ? value.value : 'design',
              'onUpdate:modelValue': onValue,
            });
          case 'button-group': {
            const buttons = Array.from({ length: o.buttonGroupCount ?? 3 }, (_, i) => i + 1);
            if (o.buttonGroupReverse) buttons.reverse();
            return h(ui.ButtonGroup, { label: '项目操作' }, () =>
              buttons.map((n) =>
                h(
                  ui.Button,
                  {
                    key: n,
                    variant: n === 1 ? 'primary' : 'secondary',
                    disabled,
                    onClick: () => onAction(`已触发操作 ${n}`),
                  },
                  () => `操作 ${n}`,
                ),
              ),
            );
          }
          case 'list':
            return listVuePreview(vue, ui, listPreviewOptions(o));
          case 'file-list':
            return h(ui.FileList, {
              files: files.value,
              disabled,
              onRemove: (id: string) =>
                (files.value = files.value.filter((file) => file.id !== id)),
              onRetry: (id: string) => {
                files.value = files.value.map((file) =>
                  file.id === id ? { ...file, status: 'ready', error: undefined } : file,
                );
                onAction('文件已回到待上传状态；实际上传由业务服务处理');
              },
            });
          case 'tree':
            return narrow(
              h(ui.Tree, {
                ...tree,
                searchable: true,
                defaultExpandedKeys: ['company', 'experience'],
              }),
            );
          case 'tree-select':
            return narrow(h(ui.TreeSelect, { ...tree, placeholder: '选择部门' }));
          case 'org-picker':
            return narrow(h(ui.OrgPicker, { ...tree, placeholder: '选择协作组织' }));
          case 'cascader':
            return narrow(
              h(ui.Cascader, {
                nodes: enterpriseTree,
                label: '选择组织',
                modelValue: value.value,
                'onUpdate:modelValue': onValue,
                multiple: o.multiple,
                searchable: o.cascaderSearchable ?? true,
                changeOnSelect: o.cascaderChangeOnSelect ?? false,
                disabled,
              }),
            );
          case 'transfer':
            return h(ui.Transfer, {
              ...choice,
              label: '配置协作团队',
              modelValue: selected.value,
              'onUpdate:modelValue': (next: string[]) => (selected.value = next),
              titles: ['可用团队', '已选团队'],
            });
          case 'sidebar-nav':
            return h('div', { class: 'enterprise-nav-preview' }, [
              h(ui.SidebarNav, {
                label: '工作空间导航',
                items: enterpriseNav,
                activeKey: active.value,
                onSelect: (key: string) => (active.value = key),
                disabled,
              }),
              result(`当前入口：${active.value}`),
            ]);
          case 'top-nav':
            return h('div', { class: 'enterprise-wide' }, [
              h(ui.TopNav, {
                label: '工作空间导航',
                items: enterpriseNav,
                activeKey: active.value,
                onSelect: (key: string) => (active.value = key),
                disabled,
              }),
              result(`当前入口：${active.value}`),
            ]);
          case 'dropdown-menu':
            return h(ui.DropdownMenu, {
              label: '项目操作',
              items: dropdownPreviewItems(o),
              disabled,
              onSelect: (key: string) => onAction(`已触发 ${key} 操作示例`),
            });
          case 'data-table':
            return h('div', { class: 'enterprise-table-demo' }, [
              h(ui.DataTable, {
                caption: '项目交付清单',
                expandColumn: o.tableExpandColumn ?? 'inline',
                columns: enterpriseColumns,
                data: rows.value,
                searchable: true,
                selectable: true,
                pageSize: 3,
                loading: o.state === 'loading',
                disabled,
                onCellChange: ({
                  key,
                  column,
                  value,
                }: {
                  key: string;
                  column: string;
                  value: unknown;
                }) => {
                  rows.value = updateCell(rows.value, key, column, value);
                  onAction('单元格已更新，仅保存在示例中');
                },
              }),
              result('示例数据 · 可搜索、筛选、排序、展开子项目、选择行和编辑项目名称'),
            ]);
        }
      };
    },
  });
}

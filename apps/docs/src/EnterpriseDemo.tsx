import { useState } from 'react';
import * as ui from '@btdesign/react';
import type { FileItem } from '@btdesign/engine';
import type { DemoOptions } from './catalog';
import type { EnterpriseId } from './enterprise-catalog';
import {
  enterpriseColumns,
  enterpriseFiles,
  enterpriseNav,
  enterpriseOptions,
  enterpriseRows,
  enterpriseTree,
} from './enterprise-fixtures';

export function updateDemoCell(
  rows: Record<string, unknown>[],
  key: string,
  column: string,
  value: unknown,
): Record<string, unknown>[] {
  return rows.map((row) => ({
    ...row,
    ...(row.id === key ? { [column]: value } : {}),
    ...(Array.isArray(row.children)
      ? { children: updateDemoCell(row.children, key, column, value) }
      : {}),
  }));
}
export function EnterpriseDemo({
  kind,
  options: o,
  onAction,
}: {
  kind: EnterpriseId;
  options: DemoOptions;
  onAction: (message: string) => void;
}) {
  const disabled = o.state === 'disabled';
  const [value, setValue] = useState<string | string[]>(o.multiple ? ['design'] : 'design');
  const [checked, setChecked] = useState('team');
  const [selected, setSelected] = useState<string[]>(['design']);
  const [date, setDate] = useState('2026-11-10');
  const [range, setRange] = useState<[string, string]>(['2026-11-10', '2026-11-18']);
  const [files, setFiles] = useState<FileItem[]>(enterpriseFiles);
  const [active, setActive] = useState('overview');
  const [rows, setRows] = useState(enterpriseRows);
  const [message, setMessage] = useState('');
  const choice = { options: enterpriseOptions, disabled };
  const tree = {
    nodes: enterpriseTree,
    value,
    onValueChange: setValue,
    multiple: o.multiple ?? false,
    cascade: o.cascade ?? false,
    disabled,
    label: '选择组织',
  };
  switch (kind) {
    case 'form':
      return (
        <ui.Form
          className="enterprise-form-demo"
          initialValues={{ email: '', team: 'design', agreement: false }}
          disabled={disabled}
          onSubmit={(values) => {
            setMessage(
              `已校验：${String(values.email)} · ${String(values.team)}。示例未发送服务器。`,
            );
            onAction('表单校验通过，示例数据未发送服务器');
          }}
          onInvalid={() => setMessage('请根据字段提示完善信息。')}
        >
          <ui.FormSection title="邀请新成员" description="先填写基本资料，再选择协作范围。">
            <ui.FormField
              name="email"
              label="工作邮箱"
              type="email"
              placeholder="name@company.com"
              required
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            />
            <ui.FormField name="team" label="所属团队" type="select" options={enterpriseOptions} />
            <ui.FormField name="agreement" label="允许查看团队项目" type="checkbox" />
          </ui.FormSection>
          <ui.FormActions>
            <ui.Button type="submit">保存成员</ui.Button>
            <ui.Button variant="secondary" type="reset" onClick={() => setMessage('')}>
              重置
            </ui.Button>
          </ui.FormActions>
          <p className="enterprise-demo-result" role="status">
            {message || '数据只用于本页交互示例。'}
          </p>
        </ui.Form>
      );
    case 'calendar':
      return (
        <ui.Calendar
          label="交付日期"
          value={date}
          onValueChange={setDate}
          min="2026-01-01"
          max="2027-12-31"
          disabled={disabled}
        />
      );
    case 'date-picker':
      return (
        <div className="enterprise-narrow">
          <ui.DatePicker
            label="交付日期"
            value={date}
            onValueChange={setDate}
            min="2026-01-01"
            max="2027-12-31"
            disabled={disabled}
          />
          <output className="enterprise-demo-result">当前日期：{date || '未选择'}</output>
        </div>
      );
    case 'date-range-picker':
      return (
        <div className="enterprise-wide">
          <ui.DateRangePicker
            label="项目周期"
            value={range}
            onValueChange={setRange}
            disabled={disabled}
          />
          <output className="enterprise-demo-result">
            {range[0] || '开始日期'} → {range[1] || '结束日期'}
          </output>
        </div>
      );
    case 'radio':
      return (
        <div className="demo-stack">
          <ui.Radio
            name="enterprise-access"
            label="团队可见"
            value="team"
            checked={checked === 'team'}
            onCheckedChange={() => setChecked('team')}
            disabled={disabled}
          />
          <ui.Radio
            name="enterprise-access"
            label="仅自己可见"
            value="private"
            checked={checked === 'private'}
            onCheckedChange={() => setChecked('private')}
            disabled={disabled}
          />
        </div>
      );
    case 'checkbox-group':
      return (
        <ui.CheckboxGroup
          label="协作团队"
          {...choice}
          value={selected}
          onValueChange={setSelected}
        />
      );
    case 'toggle-group':
      return (
        <ui.ToggleGroup
          label="查看范围"
          {...choice}
          value={value}
          onValueChange={setValue}
          multiple={o.multiple}
        />
      );
    case 'segmented':
      return (
        <ui.Segmented
          label="查看范围"
          {...choice}
          value={typeof value === 'string' ? value : 'design'}
          onValueChange={setValue}
        />
      );
    case 'button-group':
      return (
        <ui.ButtonGroup label="项目操作">
          <ui.Button disabled={disabled} onClick={() => onAction('已触发新建项目示例')}>
            新建项目
          </ui.Button>
          <ui.Button
            variant="secondary"
            disabled={disabled}
            onClick={() => onAction('已触发导入项目示例')}
          >
            导入
          </ui.Button>
          <ui.Button
            variant="ghost"
            disabled={disabled}
            onClick={() => onAction('已触发更多操作示例')}
          >
            更多
          </ui.Button>
        </ui.ButtonGroup>
      );
    case 'list':
      return (
        <ui.List className="enterprise-wide">
          {['品牌体系升级', '客户服务门户', '品牌资产中心'].map((name, index) => (
            <ui.ListItem key={name}>
              <ui.ListItemContent>
                <strong>{name}</strong>
                <p>{index === 2 ? '待启动' : '进行中'} · 设计与研发共同维护</p>
              </ui.ListItemContent>
              <ui.ListItemActions>
                <ui.Button variant="ghost" onClick={() => onAction(`正在查看 ${name} 的示例`)}>
                  查看
                </ui.Button>
              </ui.ListItemActions>
            </ui.ListItem>
          ))}
        </ui.List>
      );
    case 'file-list':
      return (
        <ui.FileList
          files={files}
          disabled={disabled}
          onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
          onRetry={(id) => {
            setFiles((current) =>
              current.map((file) =>
                file.id === id ? { ...file, status: 'ready', error: undefined } : file,
              ),
            );
            onAction('文件已回到待上传状态；实际上传由业务服务处理');
          }}
        />
      );
    case 'tree':
      return (
        <div className="enterprise-narrow">
          <ui.Tree {...tree} searchable defaultExpandedKeys={['company', 'experience']} />
        </div>
      );
    case 'tree-select':
      return (
        <div className="enterprise-narrow">
          <ui.TreeSelect {...tree} placeholder="选择部门" />
        </div>
      );
    case 'org-picker':
      return (
        <div className="enterprise-narrow">
          <ui.OrgPicker {...tree} placeholder="选择协作组织" />
        </div>
      );
    case 'cascader':
      return (
        <div className="enterprise-narrow">
          <ui.Cascader
            nodes={enterpriseTree}
            label="选择组织"
            value={value}
            onValueChange={setValue}
            multiple={o.multiple}
            disabled={disabled}
          />
        </div>
      );
    case 'transfer':
      return (
        <ui.Transfer
          label="配置协作团队"
          {...choice}
          value={selected}
          onValueChange={setSelected}
          titles={['可用团队', '已选团队']}
        />
      );
    case 'sidebar-nav':
      return (
        <div className="enterprise-nav-preview">
          <ui.SidebarNav
            label="工作空间导航"
            items={enterpriseNav}
            activeKey={active}
            onSelect={setActive}
            disabled={disabled}
          />
          <p className="enterprise-demo-result">当前入口：{active}</p>
        </div>
      );
    case 'top-nav':
      return (
        <div className="enterprise-wide">
          <ui.TopNav
            label="工作空间导航"
            items={enterpriseNav}
            activeKey={active}
            onSelect={setActive}
            disabled={disabled}
          />
          <p className="enterprise-demo-result">当前入口：{active}</p>
        </div>
      );
    case 'dropdown-menu':
      return (
        <ui.DropdownMenu
          label="项目操作"
          items={[
            { key: 'edit', label: '编辑项目' },
            { key: 'copy', label: '创建副本' },
            { key: 'archive', label: '归档项目', disabled: true },
          ]}
          disabled={disabled}
          onSelect={(key) => onAction(`已触发 ${key} 操作示例`)}
        />
      );
    case 'data-table':
      return (
        <div className="enterprise-table-demo">
          <ui.DataTable
            caption="项目交付清单"
            columns={enterpriseColumns}
            data={rows}
            searchable
            selectable
            pageSize={3}
            loading={o.state === 'loading'}
            disabled={disabled}
            onCellChange={({ key, column, value }) => {
              setRows((current) => updateDemoCell(current, key, column, value));
              onAction('单元格已更新，仅保存在示例中');
            }}
          />
          <p className="enterprise-demo-result">
            示例数据 · 可搜索、筛选、排序、展开子项目、选择行和编辑项目名称
          </p>
        </div>
      );
  }
}

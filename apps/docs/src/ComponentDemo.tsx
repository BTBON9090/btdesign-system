import { useState } from 'react';
import { ArrowRight, Plus, Mail, Check, Folder, MoreHorizontal } from 'lucide-react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Field,
  InputGroup,
  InputAddon,
  RadioGroup,
  NumberInput,
  Breadcrumb,
  Pagination,
  EmptyState,
  Spinner,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  Dialog,
  Input,
  Progress,
  Select,
  Separator,
  Skeleton,
  Switch,
  Table,
  Tabs,
  Textarea,
} from '@btdesign/react';
import { catalog, defaultDemoOptions, type DemoOptions, type ComponentId } from './catalog';
export function ComponentDemo({
  kind,
  onAction = () => {},
  options,
}: {
  options?: DemoOptions;
  kind: ComponentId;
  onAction?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  if (
    options ||
    [
      'field',
      'input-group',
      'radio-group',
      'number-input',
      'breadcrumb',
      'pagination',
      'empty-state',
      'spinner',
    ].includes(kind)
  )
    return (
      <ConfiguredDemo kind={kind} options={options ?? defaultDemoOptions} onAction={onAction} />
    );
  switch (kind) {
    case 'button':
      return (
        <div className="demo-stack">
          <div className="demo-row">
            <Button onClick={() => onAction('已执行创建项目示例')}>
              <Plus size={15} />
              创建项目
            </Button>
            <Button variant="secondary" onClick={() => onAction('已取消示例操作')}>
              取消
            </Button>
            <Button variant="ghost" onClick={() => onAction('已执行了解更多示例')}>
              了解更多
              <ArrowRight size={15} />
            </Button>
            <Button
              variant="danger"
              onClick={() => onAction('已执行危险按钮示例，没有删除任何数据')}
            >
              删除
            </Button>
          </div>
          <div className="demo-row">
            <Button size="sm">小尺寸</Button>
            <Button>默认尺寸</Button>
            <Button size="lg">大尺寸</Button>
            <Button disabled>禁用状态</Button>
            <Button loading>保存中</Button>
          </div>
        </div>
      );
    case 'input':
      return (
        <div className="demo-form">
          <label className="demo-field">
            邮箱
            <Input type="email" placeholder="you@company.com" />
          </label>
          <label className="demo-field">
            项目名称
            <Input defaultValue="BTDESIGN System" />
          </label>
          <label className="demo-field">
            不可编辑
            <Input disabled placeholder="仅管理员可以修改" />
          </label>
        </div>
      );
    case 'textarea':
      return (
        <label className="demo-field demo-form">
          项目描述
          <Textarea placeholder="介绍一下你的项目，以及你希望解决的问题…" rows={4} />
          <small>好的描述能让协作更顺畅。</small>
        </label>
      );
    case 'select':
      return (
        <label className="demo-field demo-form">
          团队角色
          <Select defaultValue="designer">
            <option value="designer">设计师</option>
            <option value="developer">开发者</option>
            <option value="manager">产品经理</option>
          </Select>
        </label>
      );
    case 'checkbox':
      return (
        <div className="demo-stack">
          <Checkbox label="接收产品更新" checked={checked} onCheckedChange={setChecked} />
          <Checkbox label="接收每周设计灵感" />
          <Checkbox label="组织管理员已锁定此选项" disabled checked />
        </div>
      );
    case 'switch':
      return (
        <div className="demo-stack">
          <Switch label="邮件通知" checked={checked} onCheckedChange={setChecked} />
          <Switch label="桌面通知" />
          <Switch label="由组织管理" disabled defaultChecked />
        </div>
      );
    case 'badge':
      return (
        <div className="demo-row">
          <Badge>草稿</Badge>
          <Badge variant="success">已发布</Badge>
          <Badge variant="warning">审核中</Badge>
          <Badge variant="danger">未通过</Badge>
          <Badge variant="info">协作中</Badge>
        </div>
      );
    case 'card':
      return (
        <Card className="example-card">
          <CardHeader>
            <CardTitle>团队工作空间</CardTitle>
            <CardDescription>让设计与开发保持同步。</CardDescription>
          </CardHeader>
          <CardContent>共同维护品牌规则与组件。</CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => onAction('工作空间卡片示例已响应')}>
              进入工作空间
              <ArrowRight size={14} />
            </Button>
          </CardFooter>
        </Card>
      );
    case 'alert':
      return (
        <div className="demo-stack full-width">
          <Alert title="保存成功" variant="success">
            团队中的所有成员现在都可以使用新配置。
          </Alert>
          <Alert title="发布前检查" variant="warning">
            请确认主题在浅色与深色模式下的表现。
          </Alert>
          <Alert title="连接失败" variant="danger">
            网络暂时不可用，请稍后重试。
          </Alert>
        </div>
      );
    case 'tabs':
      return (
        <Tabs
          className="full-width"
          items={[
            {
              value: 'design',
              label: '设计规范',
              content: <p>用统一的语义变量表达品牌，保持跨页面的一致性。</p>,
            },
            {
              value: 'develop',
              label: '开发资源',
              content: <p>React 和 Vue 3 共用同一套 CSS 变量与设计约定。</p>,
            },
            {
              value: 'history',
              label: '更新记录',
              content: <p>v0.2.0 — {catalog.length} 个组件族与可组合子部件。</p>,
            },
          ]}
        />
      );
    case 'dialog':
      return (
        <>
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            新建项目
          </Button>
          <Dialog
            open={open}
            onOpenChange={setOpen}
            title="新建项目"
            description="为团队开启一个新的工作空间。"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
                onAction('示例项目已创建');
              }}
            >
              <label className="demo-field">
                项目名称
                <Input required placeholder="输入项目名称" autoFocus />
              </label>
              <div className="dialog-actions">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button type="submit">创建项目</Button>
              </div>
            </form>
          </Dialog>
        </>
      );
    case 'avatar':
      return (
        <div className="demo-row">
          <Avatar name="林晓" size="sm" />
          <Avatar name="Alex Chen" />
          <Avatar name="Yuki Tanaka" size="lg" />
          <Avatar name="王宁" />
        </div>
      );
    case 'separator':
      return (
        <div className="demo-stack full-width">
          <span>项目设置</span>
          <Separator />
          <span>团队成员</span>
        </div>
      );
    case 'table':
      return <MembersTable />;
    case 'skeleton':
      return (
        <div role="status" aria-label="正在加载内容" className="demo-stack demo-form">
          <Skeleton width={44} height={44} style={{ borderRadius: '50%' }} />
          <Skeleton width="100%" height={18} />
          <Skeleton width="70%" height={18} />
          <span className="sr-only">正在加载</span>
        </div>
      );
    case 'progress':
      return (
        <div className="demo-stack demo-form">
          <Progress value={64} label="文件上传" />
          <Progress value={100} label="主题生成" />
        </div>
      );
  }
}
export function MembersTable({ compact = false }: { compact?: boolean }) {
  return (
    <Table>
      <TableCaption className="sr-only">团队成员示例数据</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>成员</TableHead>
          <TableHead>角色</TableHead>
          <TableHead>状态</TableHead>
          {!compact && <TableHead>加入时间</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          ['林晓', 'lin@forma.design', '设计师', '已加入', '2026-11-01'],
          ['Alex Chen', 'alex@forma.design', '开发者', '已加入', '2026-11-02'],
          ['王宁', 'wang@forma.design', '产品经理', '待确认', '2026-11-08'],
        ]
          .slice(0, compact ? 2 : 3)
          .map(([name, email, role, status, date]) => (
            <TableRow key={name}>
              <TableCell>
                <div className="member">
                  <Avatar name={name} size="sm" />
                  <div>
                    <strong>{name}</strong>
                    <small>{email}</small>
                  </div>
                </div>
              </TableCell>
              <TableCell>{role}</TableCell>
              <TableCell>
                <Badge variant={status === '已加入' ? 'success' : 'warning'}>{status}</Badge>
              </TableCell>
              {!compact && <TableCell>{date}</TableCell>}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
export function WorkspaceDemo({
  onAction,
  view = 'workspace',
}: {
  onAction: (s: string) => void;
  view?: string;
}) {
  const [invite, setInvite] = useState(false);
  const [saved, setSaved] = useState(false);
  if (view === 'login')
    return (
      <form
        className="login-demo"
        onSubmit={(e) => {
          e.preventDefault();
          onAction('登录表单验证通过。这是组件组合示例。');
        }}
      >
        <span className="login-symbol">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </span>
        <h2>欢迎回来</h2>
        <p>登录你的团队工作空间</p>
        <label className="demo-field">
          工作邮箱
          <Input type="email" required placeholder="you@company.com" />
        </label>
        <label className="demo-field">
          密码
          <Input type="password" minLength={8} required placeholder="至少 8 位字符" />
        </label>
        <Checkbox label="记住登录状态" />
        <Button type="submit" className="full-width">
          登录工作空间
          <ArrowRight size={15} />
        </Button>
        <small>示例表单，不会提交账号信息。</small>
      </form>
    );
  return (
    <div className="workspace-demo">
      <div className="workspace-heading">
        <div>
          <span className="workspace-crumb">工作空间 / 团队设置</span>
          <h2>让协作自然发生。</h2>
          <p>管理你的团队，保持每个人步调一致。</p>
        </div>
        <Button size="sm" onClick={() => setInvite(true)}>
          <Plus size={15} />
          邀请成员
        </Button>
      </div>
      <div className="workspace-tabs">
        <strong>团队成员</strong>
        <span>工作空间</span>
        <Badge>示例</Badge>
      </div>
      <MembersTable />
      <form
        className="workspace-settings"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
          onAction('预览中的团队设置已保存');
        }}
      >
        <div>
          <h3>工作空间设置</h3>
          <p>属于你和团队的共同空间。</p>
        </div>
        <div className="demo-stack">
          <div className="form-two">
            <label className="demo-field">
              工作空间名称
              <Input defaultValue="BTDESIGN Team" required />
            </label>
            <label className="demo-field">
              团队类型
              <Select defaultValue="design">
                <option value="design">产品与设计</option>
                <option>研发团队</option>
                <option>品牌工作室</option>
              </Select>
            </label>
          </div>
          <div className="setting-line">
            <div>
              <strong>成员活动通知</strong>
              <p>在成员加入工作空间时收到邮件。</p>
            </div>
            <Switch aria-label="成员活动通知" defaultChecked />
          </div>
          <div className="save-line">
            <span>
              {saved ? (
                <>
                  <Check size={13} />
                  已保存到本次预览
                </>
              ) : (
                '更改仅用于当前预览'
              )}
            </span>
            <Button type="submit" size="sm">
              保存更改
            </Button>
          </div>
        </div>
      </form>
      <Dialog
        open={invite}
        onOpenChange={setInvite}
        title="邀请团队成员"
        description="这是组件交互示例，不会发送真实邮件。"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setInvite(false);
            onAction('邀请表单验证通过，没有发送邮件');
          }}
        >
          <label className="demo-field">
            成员邮箱
            <Input type="email" required placeholder="colleague@company.com" autoFocus />
          </label>
          <div className="dialog-actions">
            <Button type="submit">
              <Mail size={14} />
              确认邀请
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function ConfiguredDemo({
  kind,
  options: o,
  onAction,
}: {
  kind: ComponentId;
  options: DemoOptions;
  onAction: (s: string) => void;
}) {
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState('team');
  const [quantity, setQuantity] = useState<number | ''>(4);
  const [page, setPage] = useState(1);
  const disabled = o.state === 'disabled';
  const invalid = o.state === 'invalid';
  const control = { controlSize: o.size, disabled, invalid };
  const error = invalid ? '请检查输入内容后重试。' : undefined;
  switch (kind) {
    case 'button':
      return (
        <Button
          size={o.size}
          variant={o.variant as 'primary' | 'secondary' | 'ghost' | 'danger'}
          disabled={disabled}
          loading={o.state === 'loading'}
          onClick={() => onAction('按钮示例已响应')}
        >
          保存更改
        </Button>
      );
    case 'input':
      return (
        <Field className="demo-form" label="工作邮箱" error={error}>
          <Input {...control} type="email" placeholder="you@company.com" />
        </Field>
      );
    case 'textarea':
      return (
        <Field className="demo-form" label="项目描述" error={error}>
          <Textarea {...control} rows={4} placeholder="介绍一下你的项目…" />
        </Field>
      );
    case 'select':
      return (
        <Field className="demo-form" label="团队角色" error={error}>
          <Select {...control} defaultValue="designer">
            <option value="designer">设计师</option>
            <option value="developer">开发工程师</option>
          </Select>
        </Field>
      );
    case 'checkbox':
      return (
        <Checkbox
          label="接收产品更新"
          checked={checked}
          onCheckedChange={setChecked}
          disabled={disabled}
        />
      );
    case 'switch':
      return (
        <Switch
          label="邮件通知"
          checked={checked}
          onCheckedChange={setChecked}
          disabled={disabled}
        />
      );
    case 'badge':
      return (
        <Badge variant={o.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
          项目状态
        </Badge>
      );
    case 'alert':
      return (
        <Alert
          variant={o.variant as 'success' | 'warning' | 'danger' | 'info'}
          title="团队配置"
          className="full-width"
        >
          这里显示与当前任务相关的信息。
        </Alert>
      );
    case 'avatar':
      return <Avatar name="林晓" size={o.size} />;
    case 'separator':
      return (
        <div className="demo-row" style={{ width: '100%', minHeight: 64 }}>
          <span>项目设置</span>
          <Separator orientation={o.orientation} />
          <span>团队成员</span>
        </div>
      );
    case 'progress':
      return (
        <div className="demo-form">
          <Progress value={o.progress} label="文件上传示例" />
        </div>
      );
    case 'field':
      return (
        <Field
          className="demo-form"
          label="工作邮箱"
          description="用于接收团队邀请"
          error={error}
          required
          disabled={disabled}
        >
          <Input controlSize={o.size} type="email" placeholder="you@company.com" />
        </Field>
      );
    case 'input-group':
      return (
        <Field className="demo-form" label="工作空间地址" error={error}>
          <InputGroup>
            <InputAddon>https://</InputAddon>
            <Input {...control} placeholder="my-team" />
            <InputAddon>.example.com</InputAddon>
          </InputGroup>
        </Field>
      );
    case 'radio-group':
      return (
        <RadioGroup
          name="access-demo"
          label="访问权限"
          orientation={o.orientation}
          value={choice}
          onValueChange={setChoice}
          disabled={disabled}
          options={[
            { value: 'team', label: '团队可见', description: '仅组织成员可以访问' },
            { value: 'private', label: '仅自己', description: '邀请后再开放访问' },
            { value: 'public', label: '公开访问', disabled: true },
          ]}
        />
      );
    case 'number-input':
      return (
        <Field
          className="demo-form"
          label="成员席位"
          description="可以设置 1 至 20 个席位"
          error={error}
        >
          <NumberInput
            {...control}
            value={quantity}
            onValueChange={setQuantity}
            min={1}
            max={20}
            step={1}
          />
        </Field>
      );
    case 'breadcrumb':
      return (
        <Breadcrumb
          items={[
            { label: '组件总览', href: '#/components' },
            { label: '导航' },
            { label: '面包屑' },
          ]}
        />
      );
    case 'pagination':
      return (
        <div className="demo-stack">
          <Pagination
            page={page}
            total={128}
            pageSize={10}
            onPageChange={setPage}
            disabled={disabled}
          />
          <p className="demo-muted" role="status">
            第 {page} 页 · 共 128 条示例数据
          </p>
        </div>
      );
    case 'empty-state':
      return (
        <EmptyState
          title="还没有项目"
          description="创建第一个项目，开始与团队协作。"
          action={
            <Button
              onClick={() => {
                window.location.hash = '/lab';
              }}
            >
              创建项目
            </Button>
          }
        />
      );
    case 'spinner':
      return <Spinner label="正在加载项目" size={o.size} />;
    default:
      return <ComponentDemo kind={kind} onAction={onAction} />;
  }
}

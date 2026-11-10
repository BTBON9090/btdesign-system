import { useState } from 'react';
import { ArrowRight, Plus, Mail, Check, Folder, MoreHorizontal } from 'lucide-react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
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
import type { ComponentId } from './catalog';
export function ComponentDemo({
  kind,
  onAction = () => {},
}: {
  kind: ComponentId;
  onAction?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(true);
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
          <span className="surface-icon">
            <Folder size={22} />
          </span>
          <h3>团队工作空间</h3>
          <p>把规范、组件和好想法放在一起。</p>
          <Button variant="secondary" onClick={() => onAction('工作空间卡片示例已响应')}>
            进入工作空间
            <ArrowRight size={14} />
          </Button>
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
              content: <p>v0.1.0 — 16 个基础组件与主题实验室。</p>,
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
      <caption className="sr-only">团队成员示例数据</caption>
      <thead>
        <tr>
          <th>成员</th>
          <th>角色</th>
          <th>状态</th>
          {!compact && <th>加入时间</th>}
        </tr>
      </thead>
      <tbody>
        {[
          ['林晓', 'lin@forma.design', '设计师', '已加入', '2026-11-01'],
          ['Alex Chen', 'alex@forma.design', '开发者', '已加入', '2026-11-02'],
          ['王宁', 'wang@forma.design', '产品经理', '待确认', '2026-11-08'],
        ]
          .slice(0, compact ? 2 : 3)
          .map(([name, email, role, status, date]) => (
            <tr key={name}>
              <td>
                <div className="member">
                  <Avatar name={name} size="sm" />
                  <div>
                    <strong>{name}</strong>
                    <small>{email}</small>
                  </div>
                </div>
              </td>
              <td>{role}</td>
              <td>
                <Badge variant={status === '已加入' ? 'success' : 'warning'}>{status}</Badge>
              </td>
              {!compact && <td>{date}</td>}
            </tr>
          ))}
      </tbody>
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

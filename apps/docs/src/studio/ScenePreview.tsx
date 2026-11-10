import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { App as VueApp, ShallowRef, VNodeChild } from 'vue';
import type { ProjectSpec } from '@btdesign/core';
import { createTheme, type ThemeMode } from '@btdesign/tokens';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Input,
  Field,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  Switch,
  Table,
} from '@btdesign/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FolderOpen,
  Grid2X2,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import './ScenePreview.css';

export type SceneSelection = 'page' | 'button' | 'input' | 'card' | 'table';
export interface ScenePreviewProps {
  project: ProjectSpec;
  mode: ThemeMode;
  inspect: boolean;
  selected: SceneSelection | null;
  onSelect: (kind: SceneSelection) => void;
  notify: (message: string) => void;
}
const inspectKinds: SceneSelection[] = ['page', 'button', 'input', 'card', 'table'];
const seedMembers = [
  { name: '林晓', email: 'lin@example.com', role: '设计师', status: '已加入', color: 'rose' },
  {
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: '开发者',
    status: '已加入',
    color: 'blue',
  },
  { name: '王宁', email: 'wang@example.com', role: '产品经理', status: '待确认', color: 'sage' },
];
type ProjectCard = {
  id: string;
  title: string;
  description: string;
  status: '进行中' | '待评审' | '已完成';
  label: string;
};
const initialCards: ProjectCard[] = [
  {
    id: 'brand',
    title: '品牌工作空间',
    description: '让设计规范与团队协作保持同步。',
    status: '进行中',
    label: '品牌设计',
  },
  {
    id: 'platform',
    title: '客户服务系统',
    description: '梳理任务、信息与服务过程。',
    status: '待评审',
    label: '产品设计',
  },
  {
    id: 'system',
    title: '组件体验优化',
    description: '从真实使用场景中打磨每个细节。',
    status: '已完成',
    label: '设计工程',
  },
];
function Mark({
  children,
  kind,
  className = '',
}: {
  children: ReactNode;
  kind: SceneSelection;
  className?: string;
}) {
  return (
    <div className={className} data-bt-kind={kind}>
      {children}
    </div>
  );
}
function SceneTop({ name, scene }: { name: string; scene: ProjectSpec['scene'] }) {
  return (
    <div className="sp-topbar">
      <div className="sp-app-brand">
        <span className="sp-app-symbol" aria-hidden="true">
          B
        </span>
        <strong>{name}</strong>
        <span className="sp-workspace-pill">工作空间</span>
      </div>
      <div className="sp-toplinks">
        <span className={scene === 'workspace' ? 'is-current' : ''}>团队</span>
        <span className={scene === 'projects' ? 'is-current' : ''}>项目</span>
      </div>
      <Avatar name="林晓" size="sm" />
    </div>
  );
}
function ReactScene({
  project,
  notify,
}: {
  project: ProjectSpec;
  notify: (message: string) => void;
}) {
  const [members, setMembers] = useState(seedMembers);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [invite, setInvite] = useState(false);
  const [name, setName] = useState(project.name);
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cards, setCards] = useState(initialCards);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const card = cards.find((item) => item.id === activeCard);
  useEffect(() => {
    setName(project.name);
    setSaved(false);
  }, [project.name]);
  if (project.scene === 'login')
    return (
      <div className="sp-login-layout" data-bt-kind="page">
        <aside className="sp-login-aside">
          <span className="sp-login-wordmark">{project.name}</span>
          <div>
            <span className="sp-overline">YOUR SPACE TO CREATE</span>
            <h3>
              在同一处，
              <br />
              让好想法发生。
            </h3>
            <p>连接想法、设计与每一次有价值的协作。</p>
            <div className="sp-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
              <b>✳</b>
            </div>
          </div>
          <span className="sp-login-aside-foot">让每一次开始，都更从容。</span>
        </aside>
        <div className="sp-login-form-wrap">
          <form
            className="sp-login-form"
            onSubmit={(event) => {
              event.preventDefault();
              notify('表单校验通过。当前预览未连接登录服务。');
            }}
          >
            <div className="sp-login-emblem" aria-hidden="true">
              B
            </div>
            <h1>{project.content.title}</h1>
            <p>{project.content.description}</p>
            <Mark kind="input">
              <Field className="sp-field" label="工作邮箱">
                <Input
                  type="email"
                  required
                  placeholder="you@company.com"
                  autoComplete="username"
                />
              </Field>
            </Mark>
            <Mark kind="input">
              <Field className="sp-field" label="密码">
                <Input
                  type="password"
                  required
                  minLength={8}
                  placeholder="至少 8 位字符"
                  autoComplete="current-password"
                />
              </Field>
            </Mark>
            <div className="sp-login-options">
              <Checkbox data-bt-kind="input" label="保持登录" />
              <button
                className="sp-text-button"
                data-bt-kind="button"
                type="button"
                onClick={() => notify('密码找回入口示例，尚未连接账户服务。')}
              >
                忘记密码？
              </button>
            </div>
            <Button data-bt-kind="button" type="submit" className="sp-wide">
              {project.content.actionLabel}
              <ArrowRight size={15} />
            </Button>
            <span className="sp-form-foot">交互预览，不会提交账号信息</span>
          </form>
        </div>
      </div>
    );
  return (
    <div className="sp-product" data-bt-kind="page">
      <SceneTop name={project.name} scene={project.scene} />
      <div className="sp-product-main">
        <div className="sp-breadcrumb">
          工作空间<span>/</span>
          {project.scene === 'projects' ? '项目' : '团队设置'}
        </div>
        <header className="sp-page-heading">
          <div>
            <h1>{project.content.title}</h1>
            <p>{project.content.description}</p>
          </div>
          <Button
            data-bt-kind="button"
            onClick={() => (project.scene === 'projects' ? setCreateOpen(true) : setInvite(true))}
          >
            <Plus size={14} />
            {project.content.actionLabel}
          </Button>
        </header>
        {project.scene === 'workspace' ? (
          <>
            <div className="sp-section-toolbar">
              <div className="sp-section-title">
                <Users size={16} />
                <h3>团队成员</h3>
                <span className="sp-count">{members.length}</span>
              </div>
              <div className="sp-filters">
                <Mark kind="input">
                  <label className="sp-search">
                    <Search size={14} />
                    <Input
                      aria-label="搜索团队成员"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="搜索成员…"
                    />
                  </label>
                </Mark>
                <Select
                  data-bt-kind="input"
                  aria-label="筛选团队角色"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="all">所有角色</option>
                  <option>设计师</option>
                  <option>开发工程师</option>
                  <option>产品经理</option>
                </Select>
              </div>
            </div>
            <Mark kind="table" className="sp-members">
              <Table>
                <caption className="sr-only">团队成员示例数据</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">成员</TableHead>
                    <TableHead scope="col">角色</TableHead>
                    <TableHead scope="col">状态</TableHead>
                    <TableHead scope="col">加入时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members
                    .filter(
                      (m) =>
                        (role === 'all' || m.role === role) &&
                        (m.name + m.email).toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((member) => (
                      <TableRow key={member.email}>
                        <TableCell>
                          <div className={`sp-member sp-avatar-${member.color}`}>
                            <Avatar name={member.name} size="sm" />
                            <div>
                              <strong>{member.name}</strong>
                              <small>{member.email}</small>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === '已加入' ? 'success' : 'warning'}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>11 月 {members.indexOf(member) + 1} 日</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {!members.some(
                (m) =>
                  (role === 'all' || m.role === role) &&
                  (m.name + m.email).toLowerCase().includes(query.toLowerCase()),
              ) && <div className="sp-empty">没有匹配的成员。试试其他姓名或角色。</div>}
            </Mark>
            <Card data-bt-kind="card" className="sp-settings-card">
              <div className="sp-settings-intro">
                <span className="sp-settings-icon">
                  <Grid2X2 size={17} />
                </span>
                <h3>工作空间偏好</h3>
                <p>让团队以熟悉的方式协作。</p>
              </div>
              <form
                className="sp-settings-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSaved(true);
                  notify('设置已保存到当前交互预览。');
                }}
              >
                <div className="sp-form-grid">
                  <Mark kind="input">
                    <Field className="sp-field" label="空间名称">
                      <Input
                        value={name}
                        required
                        onChange={(event) => {
                          setName(event.target.value);
                          setSaved(false);
                        }}
                      />
                    </Field>
                  </Mark>
                  <Mark kind="input">
                    <Field className="sp-field" label="团队类型">
                      <Select defaultValue="design" onChange={() => setSaved(false)}>
                        <option value="design">产品与设计</option>
                        <option>研发团队</option>
                        <option>品牌工作室</option>
                      </Select>
                    </Field>
                  </Mark>
                </div>
                <div className="sp-toggle-row">
                  <div>
                    <strong>成员活动通知</strong>
                    <p>有新成员加入时，接收邮件提醒。</p>
                  </div>
                  <Switch
                    aria-label="成员活动通知"
                    data-bt-kind="input"
                    checked={notification}
                    onCheckedChange={(value) => {
                      setNotification(value);
                      setSaved(false);
                    }}
                  />
                </div>
                <div className="sp-save-row">
                  <span role="status">
                    {saved ? (
                      <>
                        <Check size={12} />
                        已保存到本次预览
                      </>
                    ) : (
                      '更改仅用于本次预览'
                    )}
                  </span>
                  <Button data-bt-kind="button" type="submit" size="sm">
                    保存更改
                  </Button>
                </div>
              </form>
            </Card>
          </>
        ) : (
          <>
            <div className="sp-project-toolbar">
              <div className="sp-project-filters" aria-label="项目筛选">
                {[
                  ['all', '全部项目'],
                  ['进行中', '进行中'],
                  ['待评审', '待评审'],
                  ['已完成', '已完成'],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    data-bt-kind="button"
                    className={filter === value ? 'is-active' : ''}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="sp-view-label">
                <Grid2X2 size={13} />
                网格视图
              </span>
            </div>
            <div className="sp-project-grid">
              {cards
                .filter((item) => filter === 'all' || item.status === filter)
                .map((item, index) => (
                  <Card data-bt-kind="card" key={item.id} className="sp-project-card">
                    <div className="sp-project-card-top">
                      <span className={`sp-project-icon sp-project-icon-${index % 3}`}>
                        <FolderOpen size={20} />
                      </span>
                      <Badge
                        variant={
                          item.status === '已完成'
                            ? 'success'
                            : item.status === '待评审'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <span className="sp-project-label">{item.label}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="sp-project-card-bottom">
                      <div className="sp-avatar-stack">
                        <Avatar name="林晓" size="sm" />
                        <Avatar name="Alex Chen" size="sm" />
                      </div>
                      <Button
                        data-bt-kind="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveCard(item.id)}
                      >
                        查看项目
                        <ArrowUpRight size={13} />
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
            {!cards.some((item) => filter === 'all' || item.status === filter) && (
              <div className="sp-project-empty" role="status">
                这个分类暂时没有项目。切换分类，或创建一个新项目。
              </div>
            )}
            <div className="sp-project-note">
              <span className="sp-mini-dot" />
              从一个清晰的目标，开始下一次协作。
            </div>
          </>
        )}
        <footer className="sp-product-foot">
          <span className="sp-mini-dot" />
          交互示例<span>数据仅保存在本次预览</span>
        </footer>
      </div>
      <Dialog
        open={invite}
        onOpenChange={setInvite}
        title="邀请团队成员"
        description="当前为交互预览，不会发送真实邮件。"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const email = String(new FormData(event.currentTarget).get('invite-email')).trim();
            setMembers((current) => [
              ...current,
              { name: email.split('@')[0], email, role: '协作者', status: '待确认', color: 'sand' },
            ]);
            setInvite(false);
            event.currentTarget.reset();
            notify('示例成员已添加，没有发送邮件。');
          }}
        >
          <Field className="sp-field" label="成员邮箱">
            <Input
              name="invite-email"
              type="email"
              required
              placeholder="colleague@company.com"
              autoFocus
            />
          </Field>
          <div className="sp-dialog-actions">
            <Button variant="secondary" onClick={() => setInvite(false)}>
              取消
            </Button>
            <Button type="submit">确认邀请</Button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="新建项目"
        description="新项目只会保留在当前预览。"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setCards((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                title: String(data.get('project-name')).trim(),
                description:
                  String(data.get('project-description')).trim() ||
                  '与团队一起，把新想法付诸实践。',
                status: '进行中',
                label: '新项目',
              },
            ]);
            setFilter('all');
            setCreateOpen(false);
            notify('已在本次预览中创建项目。');
          }}
        >
          <Field className="sp-field" label="项目名称">
            <Input
              name="project-name"
              required
              maxLength={50}
              placeholder="为项目起个名字"
              autoFocus
            />
          </Field>
          <Field className="sp-field sp-field-spaced" label="项目描述">
            <Input name="project-description" maxLength={140} placeholder="这次希望完成什么？" />
          </Field>
          <div className="sp-dialog-actions">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button type="submit">创建项目</Button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={Boolean(card)}
        onOpenChange={(open) => {
          if (!open) setActiveCard(null);
        }}
        title={card?.title || '项目详情'}
        description={card?.description}
      >
        <p className="sp-detail-copy">项目状态：{card?.status}</p>
        <div className="sp-dialog-actions">
          <Button variant="secondary" onClick={() => setActiveCard(null)}>
            返回
          </Button>
          <Button
            onClick={() => {
              setCards((current) =>
                current.map((item) =>
                  item.id === activeCard
                    ? { ...item, status: item.status === '已完成' ? '进行中' : '已完成' }
                    : item,
                ),
              );
              setActiveCard(null);
              notify('项目状态已更新到本次预览。');
            }}
          >
            {card?.status === '已完成' ? '重新开启' : '标记完成'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function VueScene({
  project,
  notify,
}: {
  project: ProjectSpec;
  notify: (message: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef(project);
  const action = useRef(notify);
  current.current = project;
  action.current = notify;
  const reactiveProject = useRef<ShallowRef<ProjectSpec> | undefined>(undefined);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (reactiveProject.current) reactiveProject.current.value = project;
  }, [project]);
  useEffect(() => {
    let cancelled = false;
    let app: VueApp | undefined;
    setState('loading');
    void Promise.all([import('vue'), import('@btdesign/vue')])
      .then(([vue, ui]) => {
        if (cancelled || !host.current) return;
        const { createApp, defineComponent, h, ref, shallowRef } = vue;
        const projectRef = shallowRef(current.current);
        reactiveProject.current = projectRef;
        const emit = (message: string) => action.current(message);
        const mark = (kind: SceneSelection, child: VNodeChild, cls = '') =>
          h('div', { 'data-bt-kind': kind, class: cls }, [child]);
        const field = (label: string, child: VNodeChild) =>
          h(ui.Field, { class: 'sp-field', label }, { default: () => child });
        // Lucide geometry from the icon library; the Vue island renders native SVG nodes.
        const icon = (
          name: 'users' | 'search' | 'grid' | 'folder' | 'arrowUp' | 'arrow' | 'plus',
          size = 16,
        ) => {
          const paths: Record<string, string> = {
            users:
              'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87',
            search: 'm21 21l-4.34-4.34',
            grid: 'M12 3v18m-9-9h18',
            folder:
              'm6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2',
            arrowUp: 'M7 7h10v10M7 17L17 7',
            arrow: 'M5 12h14m-7-7l7 7l-7 7',
            plus: 'M5 12h14m-7-7v14',
          };
          return h(
            'svg',
            {
              width: size,
              height: size,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 2,
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'aria-hidden': 'true',
            },
            [
              h('path', { d: paths[name] }),
              name === 'users' ? h('circle', { cx: 9, cy: 7, r: 4 }) : null,
              name === 'search' ? h('circle', { cx: 11, cy: 11, r: 8 }) : null,
              name === 'grid' ? h('rect', { width: 18, height: 18, x: 3, y: 3, rx: 2 }) : null,
            ],
          );
        };
        const symbol = (text: string) =>
          h('span', { class: 'sp-app-symbol', 'aria-hidden': 'true' }, text);
        app = createApp(
          defineComponent({
            name: 'BTDESIGNStudioPreview',
            setup() {
              const members = vue.reactive(seedMembers.map((member) => ({ ...member })));
              const query = ref(''),
                role = ref('all'),
                invite = ref(false),
                notifications = ref(true),
                teamType = ref('design'),
                name = ref(projectRef.value.name),
                saved = ref(false),
                filter = ref('all');
              const cards = ref<ProjectCard[]>(initialCards.map((item) => ({ ...item })));
              const activeId = ref<string | null>(null),
                createOpen = ref(false),
                draftTitle = ref(''),
                draftDescription = ref('');
              const email = ref(''),
                password = ref(''),
                remember = ref(false),
                inviteEmail = ref('');
              vue.watch(
                () => projectRef.value.name,
                (next) => {
                  name.value = next;
                  saved.value = false;
                },
              );
              const actionButton = (text: VNodeChild, onClick: () => void, secondary = false) =>
                h(
                  ui.Button,
                  {
                    'data-bt-kind': 'button',
                    variant: secondary ? 'secondary' : 'primary',
                    onClick,
                  },
                  () => text,
                );
              const topbar = () =>
                h('div', { class: 'sp-topbar' }, [
                  h('div', { class: 'sp-app-brand' }, [
                    symbol('B'),
                    h('strong', {}, projectRef.value.name),
                    h('span', { class: 'sp-workspace-pill' }, '工作空间'),
                  ]),
                  h('div', { class: 'sp-toplinks' }, [
                    h(
                      'span',
                      { class: projectRef.value.scene === 'workspace' ? 'is-current' : '' },
                      '团队',
                    ),
                    h(
                      'span',
                      { class: projectRef.value.scene === 'projects' ? 'is-current' : '' },
                      '项目',
                    ),
                  ]),
                  h(ui.Avatar, { name: '林晓', size: 'sm' }),
                ]);
              const table = () =>
                mark(
                  'table',
                  [
                    h(ui.Table, {}, () => [
                      h('caption', { class: 'sr-only' }, '团队成员示例数据'),
                      h(
                        'thead',
                        {},
                        h(
                          'tr',
                          {},
                          ['成员', '角色', '状态', '加入时间'].map((label) =>
                            h('th', { scope: 'col' }, label),
                          ),
                        ),
                      ),
                      h(
                        'tbody',
                        {},
                        members
                          .filter(
                            (member) =>
                              (role.value === 'all' || member.role === role.value) &&
                              (member.name + member.email)
                                .toLowerCase()
                                .includes(query.value.toLowerCase()),
                          )
                          .map((member) =>
                            h('tr', { key: member.email }, [
                              h(
                                'td',
                                {},
                                h('div', { class: `sp-member sp-avatar-${member.color}` }, [
                                  h(ui.Avatar, { name: member.name, size: 'sm' }),
                                  h('div', {}, [
                                    h('strong', {}, member.name),
                                    h('small', {}, member.email),
                                  ]),
                                ]),
                              ),
                              h('td', {}, member.role),
                              h(
                                'td',
                                {},
                                h(
                                  ui.Badge,
                                  { variant: member.status === '已加入' ? 'success' : 'warning' },
                                  () => member.status,
                                ),
                              ),
                              h('td', {}, `11 月 ${members.indexOf(member) + 1} 日`),
                            ]),
                          ),
                      ),
                    ]),
                    !members.some(
                      (member) =>
                        (role.value === 'all' || member.role === role.value) &&
                        (member.name + member.email)
                          .toLowerCase()
                          .includes(query.value.toLowerCase()),
                    )
                      ? h('div', { class: 'sp-empty' }, '没有匹配的成员。试试其他姓名或角色。')
                      : null,
                  ],
                  'sp-members',
                );
              const workspace = () => [
                h('div', { class: 'sp-section-toolbar' }, [
                  h('div', { class: 'sp-section-title' }, [
                    icon('users'),
                    h('h3', {}, '团队成员'),
                    h('span', { class: 'sp-count' }, members.length),
                  ]),
                  h('div', { class: 'sp-filters' }, [
                    mark(
                      'input',
                      h('label', { class: 'sp-search' }, [
                        icon('search', 14),
                        h(ui.Input, {
                          'aria-label': '搜索团队成员',
                          placeholder: '搜索成员…',
                          modelValue: query.value,
                          'onUpdate:modelValue': (value: string) => (query.value = value),
                        }),
                      ]),
                    ),
                    h(
                      ui.Select,
                      {
                        'data-bt-kind': 'input',
                        'aria-label': '筛选团队角色',
                        modelValue: role.value,
                        'onUpdate:modelValue': (value: string) => (role.value = value),
                      },
                      () => [
                        h('option', { value: 'all' }, '所有角色'),
                        ...['设计师', '开发者', '产品经理'].map((label) => h('option', {}, label)),
                      ],
                    ),
                  ]),
                ]),
                table(),
                h(ui.Card, { 'data-bt-kind': 'card', class: 'sp-settings-card' }, () => [
                  h('div', { class: 'sp-settings-intro' }, [
                    h('span', { class: 'sp-settings-icon', 'aria-hidden': 'true' }, [icon('grid')]),
                    h('h3', {}, '工作空间偏好'),
                    h('p', {}, '让团队以熟悉的方式协作。'),
                  ]),
                  h(
                    'form',
                    {
                      class: 'sp-settings-form',
                      onSubmit: (event: Event) => {
                        event.preventDefault();
                        saved.value = true;
                        emit('设置已保存到当前交互预览。');
                      },
                    },
                    [
                      h('div', { class: 'sp-form-grid' }, [
                        mark(
                          'input',
                          field(
                            '空间名称',
                            h(ui.Input, {
                              modelValue: name.value,
                              required: true,
                              'onUpdate:modelValue': (value: string) => {
                                name.value = value;
                                saved.value = false;
                              },
                            }),
                          ),
                        ),
                        mark(
                          'input',
                          field(
                            '团队类型',
                            h(
                              ui.Select,
                              {
                                modelValue: teamType.value,
                                'onUpdate:modelValue': (value: string) => {
                                  teamType.value = value;
                                  saved.value = false;
                                },
                              },
                              () => [
                                h('option', { value: 'design' }, '产品与设计'),
                                h('option', {}, '研发团队'),
                                h('option', {}, '品牌工作室'),
                              ],
                            ),
                          ),
                        ),
                      ]),
                      h('div', { class: 'sp-toggle-row' }, [
                        h('div', {}, [
                          h('strong', {}, '成员活动通知'),
                          h('p', {}, '有新成员加入时，接收邮件提醒。'),
                        ]),
                        h(ui.Switch, {
                          'aria-label': '成员活动通知',
                          'data-bt-kind': 'input',
                          modelValue: notifications.value,
                          'onUpdate:modelValue': (value: boolean) => {
                            notifications.value = value;
                            saved.value = false;
                          },
                        }),
                      ]),
                      h('div', { class: 'sp-save-row' }, [
                        h(
                          'span',
                          { role: 'status' },
                          saved.value ? '✓ 已保存到本次预览' : '更改仅用于本次预览',
                        ),
                        h(
                          ui.Button,
                          { 'data-bt-kind': 'button', type: 'submit', size: 'sm' },
                          () => '保存更改',
                        ),
                      ]),
                    ],
                  ),
                ]),
              ];
              const projectCards = () => [
                h('div', { class: 'sp-project-toolbar' }, [
                  h(
                    'div',
                    { class: 'sp-project-filters', 'aria-label': '项目筛选' },
                    [
                      ['all', '全部项目'],
                      ['进行中', '进行中'],
                      ['待评审', '待评审'],
                      ['已完成', '已完成'],
                    ].map(([value, label]) =>
                      h(
                        'button',
                        {
                          type: 'button',
                          class: filter.value === value ? 'is-active' : '',
                          'aria-pressed': filter.value === value,
                          'data-bt-kind': 'button',
                          onClick: () => (filter.value = value),
                        },
                        label,
                      ),
                    ),
                  ),
                  h('span', { class: 'sp-view-label' }, [icon('grid', 14), '网格视图']),
                ]),
                h(
                  'div',
                  { class: 'sp-project-grid' },
                  cards.value
                    .filter((item) => filter.value === 'all' || item.status === filter.value)
                    .map((item, index) =>
                      h(
                        ui.Card,
                        { key: item.id, 'data-bt-kind': 'card', class: 'sp-project-card' },
                        () => [
                          h('div', { class: 'sp-project-card-top' }, [
                            h(
                              'span',
                              {
                                class: `sp-project-icon sp-project-icon-${index % 3}`,
                                'aria-hidden': 'true',
                              },
                              [icon('folder', 20)],
                            ),
                            h(
                              ui.Badge,
                              {
                                variant:
                                  item.status === '已完成'
                                    ? 'success'
                                    : item.status === '待评审'
                                      ? 'warning'
                                      : 'default',
                              },
                              () => item.status,
                            ),
                          ]),
                          h('span', { class: 'sp-project-label' }, item.label),
                          h('h3', {}, item.title),
                          h('p', {}, item.description),
                          h('div', { class: 'sp-project-card-bottom' }, [
                            h('div', { class: 'sp-avatar-stack' }, [
                              h(ui.Avatar, { name: '林晓', size: 'sm' }),
                              h(ui.Avatar, { name: 'Alex Chen', size: 'sm' }),
                            ]),
                            h(
                              ui.Button,
                              {
                                'data-bt-kind': 'button',
                                variant: 'ghost',
                                size: 'sm',
                                onClick: () => (activeId.value = item.id),
                              },
                              () => ['查看项目', icon('arrowUp', 14)],
                            ),
                          ]),
                        ],
                      ),
                    ),
                ),
                !cards.value.some((item) => filter.value === 'all' || item.status === filter.value)
                  ? h(
                      'div',
                      { class: 'sp-project-empty', role: 'status' },
                      '这个分类暂时没有项目。切换分类，或创建一个新项目。',
                    )
                  : null,
                h('div', { class: 'sp-project-note' }, [
                  h('span', { class: 'sp-mini-dot' }),
                  '从一个清晰的目标，开始下一次协作。',
                ]),
              ];
              const login = () =>
                h('div', { class: 'sp-login-layout', 'data-bt-kind': 'page' }, [
                  h('aside', { class: 'sp-login-aside' }, [
                    h('span', { class: 'sp-login-wordmark' }, projectRef.value.name),
                    h('div', {}, [
                      h('span', { class: 'sp-overline' }, 'YOUR SPACE TO CREATE'),
                      h('h3', {}, ['在同一处，', h('br'), '让好想法发生。']),
                      h('p', {}, '连接想法、设计与每一次有价值的协作。'),
                      h('div', { class: 'sp-orbit', 'aria-hidden': 'true' }, [
                        h('i'),
                        h('i'),
                        h('i'),
                        h('b', {}, '✳'),
                      ]),
                    ]),
                    h('span', { class: 'sp-login-aside-foot' }, '让每一次开始，都更从容。'),
                  ]),
                  h(
                    'div',
                    { class: 'sp-login-form-wrap' },
                    h(
                      'form',
                      {
                        class: 'sp-login-form',
                        onSubmit: (event: Event) => {
                          event.preventDefault();
                          emit('表单校验通过。当前预览未连接登录服务。');
                        },
                      },
                      [
                        h('div', { class: 'sp-login-emblem', 'aria-hidden': 'true' }, 'B'),
                        h('h1', {}, projectRef.value.content.title),
                        h('p', {}, projectRef.value.content.description),
                        mark(
                          'input',
                          field(
                            '工作邮箱',
                            h(ui.Input, {
                              type: 'email',
                              required: true,
                              placeholder: 'you@company.com',
                              autocomplete: 'username',
                              modelValue: email.value,
                              'onUpdate:modelValue': (value: string) => (email.value = value),
                            }),
                          ),
                        ),
                        mark(
                          'input',
                          field(
                            '密码',
                            h(ui.Input, {
                              type: 'password',
                              required: true,
                              minlength: 8,
                              placeholder: '至少 8 位字符',
                              autocomplete: 'current-password',
                              modelValue: password.value,
                              'onUpdate:modelValue': (value: string) => (password.value = value),
                            }),
                          ),
                        ),
                        h('div', { class: 'sp-login-options' }, [
                          h(ui.Checkbox, {
                            label: '保持登录',
                            'data-bt-kind': 'input',
                            modelValue: remember.value,
                            'onUpdate:modelValue': (value: boolean) => (remember.value = value),
                          }),
                          h(
                            'button',
                            {
                              class: 'sp-text-button',
                              'data-bt-kind': 'button',
                              type: 'button',
                              onClick: () => emit('密码找回入口示例，尚未连接账户服务。'),
                            },
                            '忘记密码？',
                          ),
                        ]),
                        h(
                          ui.Button,
                          { type: 'submit', class: 'sp-wide', 'data-bt-kind': 'button' },
                          () => [projectRef.value.content.actionLabel, icon('arrow', 15)],
                        ),
                        h('span', { class: 'sp-form-foot' }, '交互预览，不会提交账号信息'),
                      ],
                    ),
                  ),
                ]);
              return () => {
                const currentProject = projectRef.value;
                if (currentProject.scene === 'login') return login();
                const active = cards.value.find((item) => item.id === activeId.value);
                return h('div', { class: 'sp-product', 'data-bt-kind': 'page' }, [
                  topbar(),
                  h('div', { class: 'sp-product-main' }, [
                    h('div', { class: 'sp-breadcrumb' }, [
                      '工作空间',
                      h('span', {}, '/'),
                      currentProject.scene === 'projects' ? '项目' : '团队设置',
                    ]),
                    h('header', { class: 'sp-page-heading' }, [
                      h('div', {}, [
                        h('h1', {}, currentProject.content.title),
                        h('p', {}, currentProject.content.description),
                      ]),
                      actionButton([icon('plus', 14), currentProject.content.actionLabel], () => {
                        if (currentProject.scene === 'projects') createOpen.value = true;
                        else invite.value = true;
                      }),
                    ]),
                    ...(currentProject.scene === 'workspace' ? workspace() : projectCards()),
                    h('footer', { class: 'sp-product-foot' }, [
                      h('span', { class: 'sp-mini-dot' }),
                      '交互示例',
                      h('span', {}, '数据仅保存在本次预览'),
                    ]),
                  ]),
                  h(
                    ui.Dialog,
                    {
                      modelValue: invite.value,
                      'onUpdate:modelValue': (value: boolean) => (invite.value = value),
                      title: '邀请团队成员',
                      description: '当前为交互预览，不会发送真实邮件。',
                    },
                    () =>
                      h(
                        'form',
                        {
                          onSubmit: (event: Event) => {
                            event.preventDefault();
                            members.push({
                              name: inviteEmail.value.split('@')[0],
                              email: inviteEmail.value,
                              role: '协作者',
                              status: '待确认',
                              color: 'sand',
                            });
                            inviteEmail.value = '';
                            invite.value = false;
                            emit('示例成员已添加，没有发送邮件。');
                          },
                        },
                        [
                          field(
                            '成员邮箱',
                            h(ui.Input, {
                              type: 'email',
                              required: true,
                              autofocus: true,
                              placeholder: 'colleague@company.com',
                              modelValue: inviteEmail.value,
                              'onUpdate:modelValue': (value: string) => (inviteEmail.value = value),
                            }),
                          ),
                          h('div', { class: 'sp-dialog-actions' }, [
                            actionButton('取消', () => (invite.value = false), true),
                            h(ui.Button, { type: 'submit' }, () => '确认邀请'),
                          ]),
                        ],
                      ),
                  ),
                  h(
                    ui.Dialog,
                    {
                      modelValue: createOpen.value,
                      'onUpdate:modelValue': (value: boolean) => (createOpen.value = value),
                      title: '新建项目',
                      description: '新项目只会保留在当前预览。',
                    },
                    () =>
                      h(
                        'form',
                        {
                          onSubmit: (event: Event) => {
                            event.preventDefault();
                            cards.value = [
                              ...cards.value,
                              {
                                id: crypto.randomUUID(),
                                title: draftTitle.value.trim(),
                                description:
                                  draftDescription.value.trim() || '与团队一起，把新想法付诸实践。',
                                status: '进行中',
                                label: '新项目',
                              },
                            ];
                            filter.value = 'all';
                            createOpen.value = false;
                            draftTitle.value = '';
                            draftDescription.value = '';
                            emit('已在本次预览中创建项目。');
                          },
                        },
                        [
                          field(
                            '项目名称',
                            h(ui.Input, {
                              required: true,
                              maxlength: 50,
                              autofocus: true,
                              placeholder: '为项目起个名字',
                              modelValue: draftTitle.value,
                              'onUpdate:modelValue': (value: string) => (draftTitle.value = value),
                            }),
                          ),
                          h(
                            'div',
                            { class: 'sp-field-spaced' },
                            field(
                              '项目描述',
                              h(ui.Input, {
                                maxlength: 140,
                                placeholder: '这次希望完成什么？',
                                modelValue: draftDescription.value,
                                'onUpdate:modelValue': (value: string) =>
                                  (draftDescription.value = value),
                              }),
                            ),
                          ),
                          h('div', { class: 'sp-dialog-actions' }, [
                            actionButton('取消', () => (createOpen.value = false), true),
                            h(ui.Button, { type: 'submit' }, () => '创建项目'),
                          ]),
                        ],
                      ),
                  ),
                  h(
                    ui.Dialog,
                    {
                      modelValue: Boolean(active),
                      'onUpdate:modelValue': (value: boolean) => {
                        if (!value) activeId.value = null;
                      },
                      title: active?.title || '项目详情',
                      description: active?.description,
                    },
                    () => [
                      h('p', { class: 'sp-detail-copy' }, `项目状态：${active?.status || ''}`),
                      h('div', { class: 'sp-dialog-actions' }, [
                        actionButton('返回', () => (activeId.value = null), true),
                        actionButton(active?.status === '已完成' ? '重新开启' : '标记完成', () => {
                          cards.value = cards.value.map((item) =>
                            item.id === activeId.value
                              ? { ...item, status: item.status === '已完成' ? '进行中' : '已完成' }
                              : item,
                          );
                          activeId.value = null;
                          emit('项目状态已更新到本次预览。');
                        }),
                      ]),
                    ],
                  ),
                ]);
              };
            },
          }),
        );
        app.mount(host.current);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
      reactiveProject.current = undefined;
      app?.unmount();
    };
  }, [attempt]);
  return (
    <div className="sp-vue-root">
      <div ref={host} aria-busy={state === 'loading'} />
      {state === 'loading' && (
        <p className="sp-state-note" role="status">
          正在加载 Vue 预览…
        </p>
      )}
      {state === 'error' && (
        <div className="sp-state-note" role="alert">
          <p>Vue 预览加载失败。</p>
          <Button variant="secondary" size="sm" onClick={() => setAttempt((value) => value + 1)}>
            重新加载
          </Button>
        </div>
      )}
    </div>
  );
}

export function ScenePreview({
  project,
  mode,
  inspect,
  selected,
  onSelect,
  notify,
}: ScenePreviewProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>('[data-bt-kind]');
    elements?.forEach((element) => {
      element.dataset.btSelected = String(element.dataset.btKind === selected);
    });
  }, [selected, project, inspect]);
  return (
    <div
      ref={root}
      className={`sp-scene ${inspect ? 'sp-inspecting' : ''}`}
      data-theme={mode}
      data-selected-kind={selected || undefined}
      style={createTheme(project.theme, mode) as CSSProperties}
      onClickCapture={(event) => {
        if (!inspect) return;
        const target =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>('[data-bt-kind]')
            : null;
        const kind = target?.dataset.btKind as SceneSelection | undefined;
        if (kind && inspectKinds.includes(kind)) {
          event.preventDefault();
          event.stopPropagation();
          onSelect(kind);
        }
      }}
      onKeyDownCapture={(event) => {
        if (!inspect || !['Enter', ' '].includes(event.key)) return;
        const target =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>('[data-bt-kind]')
            : null;
        const kind = target?.dataset.btKind as SceneSelection | undefined;
        if (kind && inspectKinds.includes(kind)) {
          event.preventDefault();
          event.stopPropagation();
          onSelect(kind);
        }
      }}
    >
      {project.framework === 'vue' ? (
        <VueScene key={project.scene} project={project} notify={notify} />
      ) : (
        <ReactScene key={project.scene} project={project} notify={notify} />
      )}
    </div>
  );
}

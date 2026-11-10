import { useEffect, useRef, useState } from 'react';
import type { App, VNodeChild } from 'vue';
import { defaultDemoOptions, type DemoOptions } from './catalog';

export interface VueDemoProps {
  kind: string;
  options?: DemoOptions;
  onAction?: (message: string) => void;
}

/** Each example mounts the actual Vue package in an isolated, disposable Vue app. */
export function VueDemo({ kind, onAction, options }: VueDemoProps) {
  const host = useRef<HTMLDivElement>(null);
  const action = useRef(onAction);
  action.current = onAction;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let app: App | undefined;
    setStatus('loading');

    void Promise.all([import('vue'), import('@btdesign/vue')])
      .then(([vue, ui]) => {
        if (cancelled || !host.current) return;
        const { createApp, defineComponent, h, ref } = vue;
        const emitAction = (message: string) => action.current?.(message);
        app = createApp(
          defineComponent({
            name: 'BTDESIGNVueDemo',
            setup() {
              const email = ref('linxiao@company.com');
              const loginEmail = ref('');
              const password = ref('');
              const remember = ref(false);
              const workspaceName = ref('BTDESIGN Team');
              const teamType = ref('design');
              const inviteOpen = ref(false);
              const inviteEmail = ref('');
              const description = ref('让设计与开发共享一套清晰的语言。');
              const role = ref('designer');
              const notifications = ref(true);
              const newsletter = ref(false);
              const tab = ref('design');
              const dialogOpen = ref(false);
              const projectName = ref('品牌工作台');
              const progress = ref(64);
              const saved = ref(false);
              const quantity = ref<number | ''>(4);
              const page = ref(1);
              const access = ref('team');

              const row = (children: VNodeChild[]) => h('div', { class: 'demo-row' }, children);
              const stack = (children: VNodeChild[]) => h('div', { class: 'demo-stack' }, children);
              const field = (label: string, control: VNodeChild) =>
                h('label', { class: 'demo-field' }, [h('span', {}, label), control]);
              const selectOptions = () => [
                h('option', { value: 'designer' }, '设计师'),
                h('option', { value: 'developer' }, '开发者'),
                h('option', { value: 'manager' }, '项目负责人'),
              ];
              const roleSelect = () =>
                h(
                  ui.Select,
                  {
                    modelValue: role.value,
                    'onUpdate:modelValue': (value: string) => {
                      role.value = value;
                      saved.value = false;
                    },
                  },
                  selectOptions,
                );
              const save = (event: Event) => {
                event.preventDefault();
                saved.value = true;
                emitAction('团队设置已保存到当前预览');
              };
              const membersTable = () =>
                h(ui.Table, { 'aria-label': '团队成员示例' }, () => [
                  h(ui.TableCaption, {}, () => '团队成员示例数据'),
                  h(ui.TableHeader, {}, () =>
                    h(ui.TableRow, {}, () =>
                      ['成员', '角色', '状态', '加入时间'].map((label) =>
                        h(ui.TableHead, { scope: 'col' }, () => label),
                      ),
                    ),
                  ),
                  h(ui.TableBody, {}, () =>
                    [
                      ['林晓', '设计师', '已加入', '2026-11-01'],
                      ['Alex Chen', '开发者', '已加入', '2026-11-02'],
                      ['王宁', '产品经理', '待确认', '2026-11-08'],
                    ].map(([name, role, status, date]) =>
                      h(ui.TableRow, { key: name }, () => [
                        h(ui.TableCell, {}, () => name),
                        h(ui.TableCell, {}, () => role),
                        h(ui.TableCell, {}, () =>
                          h(
                            ui.Badge,
                            { variant: status === '已加入' ? 'success' : 'warning' },
                            () => status,
                          ),
                        ),
                        h(ui.TableCell, {}, () => date),
                      ]),
                    ),
                  ),
                ]);

              return () => {
                const o = options ?? defaultDemoOptions;
                const disabled = o.state === 'disabled';
                const invalid = o.state === 'invalid';
                const control = { controlSize: o.size, disabled, invalid };
                const error = invalid ? '请检查输入内容后重试。' : undefined;
                const withField = (label: string, child: VNodeChild, description?: string) =>
                  h(ui.Field, { label, description, error, class: 'demo-form' }, () => child);
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
                ) {
                  switch (kind) {
                    case 'button':
                      return h(
                        ui.Button,
                        {
                          size: o.size,
                          variant: o.variant as 'primary' | 'secondary' | 'ghost' | 'danger',
                          disabled,
                          loading: o.state === 'loading',
                          onClick: () => emitAction('按钮示例已响应'),
                        },
                        () => '保存更改',
                      );
                    case 'input':
                      return withField(
                        '工作邮箱',
                        h(ui.Input, { ...control, type: 'email', placeholder: 'you@company.com' }),
                      );
                    case 'textarea':
                      return withField(
                        '项目描述',
                        h(ui.Textarea, { ...control, rows: 4, placeholder: '介绍一下你的项目…' }),
                      );
                    case 'select':
                      return withField(
                        '团队角色',
                        h(
                          ui.Select,
                          {
                            ...control,
                            modelValue: role.value,
                            'onUpdate:modelValue': (value: string) => (role.value = value),
                          },
                          selectOptions,
                        ),
                      );
                    case 'checkbox':
                      return h(ui.Checkbox, {
                        label: '接收产品更新',
                        disabled,
                        modelValue: notifications.value,
                        'onUpdate:modelValue': (value: boolean) => (notifications.value = value),
                      });
                    case 'switch':
                      return h(ui.Switch, {
                        label: '邮件通知',
                        disabled,
                        modelValue: notifications.value,
                        'onUpdate:modelValue': (value: boolean) => (notifications.value = value),
                      });
                    case 'badge':
                      return h(
                        ui.Badge,
                        {
                          variant: o.variant as
                            'default' | 'success' | 'warning' | 'danger' | 'info',
                        },
                        () => '项目状态',
                      );
                    case 'alert':
                      return h(
                        ui.Alert,
                        {
                          variant: o.variant as 'success' | 'warning' | 'danger' | 'info',
                          title: '团队配置',
                          class: 'full-width',
                        },
                        () => '这里显示与当前任务相关的信息。',
                      );
                    case 'avatar':
                      return h(ui.Avatar, { name: '林晓', size: o.size });
                    case 'separator':
                      return h(
                        'div',
                        { class: 'demo-row', style: { width: '100%', minHeight: '64px' } },
                        [
                          h('span', {}, '项目设置'),
                          h(ui.Separator, { orientation: o.orientation }),
                          h('span', {}, '团队成员'),
                        ],
                      );
                    case 'progress':
                      return h(
                        'div',
                        { class: 'demo-form' },
                        h(ui.Progress, { value: o.progress, label: '文件上传示例' }),
                      );
                    case 'field':
                      return h(
                        ui.Field,
                        {
                          class: 'demo-form',
                          label: '工作邮箱',
                          description: '用于接收团队邀请',
                          error,
                          required: true,
                          disabled,
                        },
                        () =>
                          h(ui.Input, {
                            controlSize: o.size,
                            type: 'email',
                            placeholder: 'you@company.com',
                          }),
                      );
                    case 'input-group':
                      return withField(
                        '工作空间地址',
                        h(ui.InputGroup, {}, () => [
                          h(ui.InputAddon, {}, () => 'https://'),
                          h(ui.Input, { ...control, placeholder: 'my-team' }),
                          h(ui.InputAddon, {}, () => '.example.com'),
                        ]),
                      );
                    case 'radio-group':
                      return h(ui.RadioGroup, {
                        name: 'access-demo',
                        label: '访问权限',
                        orientation: o.orientation,
                        disabled,
                        modelValue: access.value,
                        'onUpdate:modelValue': (value: string) => (access.value = value),
                        options: [
                          { value: 'team', label: '团队可见', description: '仅组织成员可以访问' },
                          { value: 'private', label: '仅自己', description: '邀请后再开放访问' },
                          { value: 'public', label: '公开访问', disabled: true },
                        ],
                      });
                    case 'number-input':
                      return withField(
                        '成员席位',
                        h(ui.NumberInput, {
                          ...control,
                          modelValue: quantity.value,
                          'onUpdate:modelValue': (value: number | '') => (quantity.value = value),
                          min: 1,
                          max: 20,
                          step: 1,
                        }),
                        '可以设置 1 至 20 个席位',
                      );
                    case 'breadcrumb':
                      return h(ui.Breadcrumb, {
                        items: [
                          { label: '组件总览', href: '#/components' },
                          { label: '导航' },
                          { label: '面包屑' },
                        ],
                      });
                    case 'pagination':
                      return stack([
                        h(ui.Pagination, {
                          page: page.value,
                          total: 128,
                          pageSize: 10,
                          disabled,
                          'onUpdate:page': (value: number) => (page.value = value),
                        }),
                        h(
                          'p',
                          { class: 'demo-muted', role: 'status' },
                          `第 ${page.value} 页 · 共 128 条示例数据`,
                        ),
                      ]);
                    case 'empty-state':
                      return h(
                        ui.EmptyState,
                        { title: '还没有项目', description: '创建第一个项目，开始与团队协作。' },
                        {
                          action: () =>
                            h(
                              ui.Button,
                              {
                                onClick: () => {
                                  window.location.hash = '/lab';
                                },
                              },
                              () => '创建项目',
                            ),
                        },
                      );
                    case 'spinner':
                      return h(ui.Spinner, { label: '正在加载项目', size: o.size });
                  }
                }
                switch (kind.toLowerCase()) {
                  case 'login':
                    return h(
                      'form',
                      {
                        class: 'login-demo',
                        onSubmit: (event: Event) => {
                          event.preventDefault();
                          emitAction('登录表单验证通过。这是组件组合示例。');
                        },
                      },
                      [
                        h(
                          'span',
                          { class: 'login-symbol' },
                          h('span', { class: 'brand-mark', 'aria-hidden': 'true' }, [
                            h('i'),
                            h('i'),
                            h('i'),
                          ]),
                        ),
                        h('h2', {}, '欢迎回来'),
                        h('p', {}, '登录你的团队工作空间'),
                        field(
                          '工作邮箱',
                          h(ui.Input, {
                            type: 'email',
                            required: true,
                            placeholder: 'you@company.com',
                            modelValue: loginEmail.value,
                            autocomplete: 'username',
                            'onUpdate:modelValue': (value: string) => {
                              loginEmail.value = value;
                            },
                          }),
                        ),
                        field(
                          '密码',
                          h(ui.Input, {
                            type: 'password',
                            minlength: 8,
                            required: true,
                            placeholder: '至少 8 位字符',
                            modelValue: password.value,
                            autocomplete: 'current-password',
                            'onUpdate:modelValue': (value: string) => {
                              password.value = value;
                            },
                          }),
                        ),
                        h(ui.Checkbox, {
                          modelValue: remember.value,
                          label: '记住登录状态',
                          'onUpdate:modelValue': (value: boolean) => {
                            remember.value = value;
                          },
                        }),
                        h(ui.Button, { type: 'submit', class: 'full-width' }, () => '登录工作空间'),
                        h('small', {}, '示例表单，不会提交账号信息。'),
                      ],
                    );

                  case 'workspace':
                    return h('div', { class: 'workspace-demo' }, [
                      h('div', { class: 'workspace-heading' }, [
                        h('div', {}, [
                          h('span', { class: 'workspace-crumb' }, '工作空间 / 团队设置'),
                          h('h2', {}, '让协作自然发生。'),
                          h('p', {}, '管理你的团队，保持每个人步调一致。'),
                        ]),
                        h(
                          ui.Button,
                          {
                            size: 'sm',
                            onClick: () => {
                              inviteOpen.value = true;
                            },
                          },
                          () => '邀请成员',
                        ),
                      ]),
                      h('div', { class: 'workspace-tabs' }, [
                        h('strong', {}, '团队成员'),
                        h('span', {}, '工作空间'),
                        h(ui.Badge, {}, () => '示例'),
                      ]),
                      membersTable(),
                      h('form', { class: 'workspace-settings', onSubmit: save }, [
                        h('div', {}, [
                          h('h3', {}, '工作空间设置'),
                          h('p', {}, '属于你和团队的共同空间。'),
                        ]),
                        h('div', { class: 'demo-stack' }, [
                          h('div', { class: 'form-two' }, [
                            field(
                              '工作空间名称',
                              h(ui.Input, {
                                required: true,
                                maxlength: 80,
                                modelValue: workspaceName.value,
                                'onUpdate:modelValue': (value: string) => {
                                  workspaceName.value = value;
                                  saved.value = false;
                                },
                              }),
                            ),
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
                                  h('option', { value: 'engineering' }, '研发团队'),
                                  h('option', { value: 'brand' }, '品牌工作室'),
                                ],
                              ),
                            ),
                          ]),
                          h('div', { class: 'setting-line' }, [
                            h('div', {}, [
                              h('strong', {}, '成员活动通知'),
                              h('p', {}, '在成员加入工作空间时收到邮件。'),
                            ]),
                            h(ui.Switch, {
                              modelValue: notifications.value,
                              'aria-label': '成员活动通知',
                              'onUpdate:modelValue': (value: boolean) => {
                                notifications.value = value;
                                saved.value = false;
                              },
                            }),
                          ]),
                          h('div', { class: 'save-line' }, [
                            h(
                              'span',
                              { role: 'status' },
                              saved.value ? '已保存到本次预览' : '更改仅用于当前预览',
                            ),
                            h(ui.Button, { type: 'submit', size: 'sm' }, () => '保存更改'),
                          ]),
                        ]),
                      ]),
                      h(
                        ui.Dialog,
                        {
                          modelValue: inviteOpen.value,
                          'onUpdate:modelValue': (value: boolean) => {
                            inviteOpen.value = value;
                          },
                          title: '邀请团队成员',
                          description: '这是组件交互示例，不会发送真实邮件。',
                        },
                        () =>
                          h(
                            'form',
                            {
                              onSubmit: (event: Event) => {
                                event.preventDefault();
                                inviteOpen.value = false;
                                emitAction('邀请表单验证通过，没有发送邮件');
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
                                  'onUpdate:modelValue': (value: string) => {
                                    inviteEmail.value = value;
                                  },
                                }),
                              ),
                              h(
                                'div',
                                { class: 'dialog-actions' },
                                h(ui.Button, { type: 'submit' }, () => '确认邀请'),
                              ),
                            ],
                          ),
                      ),
                    ]);

                  case 'button':
                    return stack([
                      row([
                        h(
                          ui.Button,
                          { onClick: () => emitAction('已触发主要操作') },
                          () => '创建项目',
                        ),
                        h(
                          ui.Button,
                          { variant: 'secondary', onClick: () => emitAction('已取消操作') },
                          () => '取消',
                        ),
                        h(
                          ui.Button,
                          { variant: 'ghost', onClick: () => emitAction('已触发文字操作') },
                          () => '了解更多',
                        ),
                      ]),
                      row([
                        h(
                          ui.Button,
                          {
                            variant: 'danger',
                            onClick: () => emitAction('危险操作按钮示例，不会删除数据'),
                          },
                          () => '删除项目',
                        ),
                        h(ui.Button, { disabled: true }, () => '不可操作'),
                        h(ui.Button, { loading: true }, () => '正在保存'),
                      ]),
                    ]);

                  case 'input':
                    return stack([
                      field(
                        '工作邮箱',
                        h(ui.Input, {
                          type: 'email',
                          modelValue: email.value,
                          placeholder: 'you@company.com',
                          'onUpdate:modelValue': (value: string) => {
                            email.value = value;
                          },
                        }),
                      ),
                      field(
                        '组织名称',
                        h(ui.Input, { disabled: true, modelValue: 'BTDESIGN Team' }),
                      ),
                    ]);

                  case 'textarea':
                    return stack([
                      field(
                        '项目描述',
                        h(ui.Textarea, {
                          modelValue: description.value,
                          rows: 4,
                          maxlength: 160,
                          placeholder: '介绍一下你的项目…',
                          'onUpdate:modelValue': (value: string) => {
                            description.value = value;
                          },
                        }),
                      ),
                      h('span', { class: 'demo-muted' }, `${description.value.length} / 160`),
                    ]);

                  case 'select':
                    return stack([
                      field('团队角色', roleSelect()),
                      h('p', { class: 'demo-muted' }, '使用方向键选择，或点击展开选项。'),
                    ]);

                  case 'checkbox':
                    return stack([
                      h(ui.Checkbox, {
                        modelValue: notifications.value,
                        label: '接收产品更新',
                        'onUpdate:modelValue': (value: boolean) => {
                          notifications.value = value;
                        },
                      }),
                      h(ui.Checkbox, {
                        modelValue: newsletter.value,
                        label: '订阅设计灵感',
                        'onUpdate:modelValue': (value: boolean) => {
                          newsletter.value = value;
                        },
                      }),
                      h(ui.Checkbox, { modelValue: true, disabled: true, label: '必要的安全通知' }),
                    ]);

                  case 'switch':
                    return stack([
                      h(ui.Switch, {
                        modelValue: notifications.value,
                        label: '邮件通知',
                        'onUpdate:modelValue': (value: boolean) => {
                          notifications.value = value;
                        },
                      }),
                      h(ui.Switch, {
                        modelValue: newsletter.value,
                        label: '每周摘要',
                        'onUpdate:modelValue': (value: boolean) => {
                          newsletter.value = value;
                        },
                      }),
                      h(ui.Switch, { modelValue: true, disabled: true, label: '账户安全提醒' }),
                    ]);

                  case 'badge':
                    return row([
                      h(ui.Badge, {}, () => '草稿'),
                      h(ui.Badge, { variant: 'success' }, () => '已发布'),
                      h(ui.Badge, { variant: 'warning' }, () => '审核中'),
                      h(ui.Badge, { variant: 'info' }, () => '进行中'),
                      h(ui.Badge, { variant: 'danger' }, () => '未通过'),
                    ]);

                  case 'card':
                    return h(ui.Card, { class: 'example-card' }, () => [
                      h(ui.CardHeader, {}, () => [
                        h(ui.CardTitle, {}, () => '团队工作空间'),
                        h(ui.CardDescription, {}, () => '让设计与开发保持同步。'),
                      ]),
                      h(ui.CardContent, {}, () => '共同维护品牌规则与组件。'),
                      h(ui.CardFooter, {}, () =>
                        h(
                          ui.Button,
                          {
                            variant: 'secondary',
                            onClick: () => emitAction('工作空间卡片示例已响应'),
                          },
                          () => '进入工作空间',
                        ),
                      ),
                    ]);

                  case 'alert':
                    return stack([
                      h(
                        ui.Alert,
                        { variant: 'success', title: '配置已保存' },
                        () => '主题可以导出并应用到 React 或 Vue 项目。',
                      ),
                      h(
                        ui.Alert,
                        { variant: 'info', title: '团队提示' },
                        () => '发布前请检查浅色与深色模式下的组件状态。',
                      ),
                    ]);

                  case 'tabs':
                    return h(ui.Tabs, {
                      label: '资源类型',
                      modelValue: tab.value,
                      'onUpdate:modelValue': (value: string) => {
                        tab.value = value;
                      },
                      items: [
                        {
                          value: 'design',
                          label: '设计',
                          content: h('p', {}, '设计规范、语义变量与组件使用原则。'),
                        },
                        {
                          value: 'develop',
                          label: '开发',
                          content: h('p', {}, '组件 API、框架集成与可运行示例。'),
                        },
                        {
                          value: 'release',
                          label: '发布',
                          content: h('p', {}, '版本记录、变更说明与升级指南。'),
                        },
                      ],
                    });

                  case 'dialog':
                    return stack([
                      h(
                        ui.Button,
                        {
                          onClick: () => {
                            dialogOpen.value = true;
                          },
                        },
                        () => '新建项目',
                      ),
                      h(
                        ui.Dialog,
                        {
                          modelValue: dialogOpen.value,
                          'onUpdate:modelValue': (value: boolean) => {
                            dialogOpen.value = value;
                          },
                          title: '新建项目',
                          description: '为团队开启一个新的工作空间。',
                        },
                        {
                          default: () =>
                            field(
                              '项目名称',
                              h(ui.Input, {
                                modelValue: projectName.value,
                                autofocus: true,
                                maxLength: 60,
                                'onUpdate:modelValue': (value: string) => {
                                  projectName.value = value;
                                },
                              }),
                            ),
                          footer: () => [
                            h(
                              ui.Button,
                              {
                                variant: 'secondary',
                                onClick: () => {
                                  dialogOpen.value = false;
                                },
                              },
                              () => '取消',
                            ),
                            h(
                              ui.Button,
                              {
                                disabled: !projectName.value.trim(),
                                onClick: () => {
                                  dialogOpen.value = false;
                                  emitAction(`已完成「${projectName.value.trim()}」创建示例`);
                                },
                              },
                              () => '创建项目',
                            ),
                          ],
                        },
                      ),
                    ]);

                  case 'avatar':
                    return row([
                      h(ui.Avatar, { alt: '林晓', fallback: '林', size: 'sm' }),
                      h(ui.Avatar, { alt: 'Alex Chen', fallback: 'AC' }),
                      h(ui.Avatar, { alt: 'BTDESIGN', fallback: 'FD', size: 'lg' }),
                    ]);

                  case 'separator':
                    return stack([
                      h('div', {}, '项目设置'),
                      h(ui.Separator),
                      h('div', {}, '团队成员'),
                    ]);

                  case 'table':
                    return membersTable();

                  case 'skeleton':
                    return h(
                      'div',
                      { class: 'demo-stack', role: 'status', 'aria-label': '内容加载示例' },
                      [
                        row([
                          h(ui.Skeleton, {
                            style: { width: '44px', height: '44px', borderRadius: '50%' },
                          }),
                          h(ui.Skeleton, { style: { width: '140px', height: '18px' } }),
                        ]),
                        h(ui.Skeleton, { style: { width: '100%', height: '18px' } }),
                        h(ui.Skeleton, { style: { width: '72%', height: '18px' } }),
                      ],
                    );

                  case 'progress':
                    return stack([
                      h(ui.Progress, { value: progress.value, label: '文件上传' }),
                      h(
                        ui.Button,
                        {
                          variant: 'secondary',
                          size: 'sm',
                          onClick: () => {
                            progress.value =
                              progress.value >= 100 ? 0 : Math.min(100, progress.value + 10);
                          },
                        },
                        () => (progress.value >= 100 ? '重新演示' : '增加 10%'),
                      ),
                    ]);

                  default:
                    return h('p', { class: 'demo-muted' }, '暂未提供该组件的预览。');
                }
              };
            },
          }),
        );
        app.mount(host.current);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          app?.unmount();
          app = undefined;
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      app?.unmount();
    };
  }, [kind, attempt, options]);

  return (
    <div className="vue-demo-root">
      <div ref={host} aria-busy={status === 'loading'} />
      {status === 'loading' && (
        <p className="demo-muted" role="status">
          正在加载 Vue 组件…
        </p>
      )}
      {status === 'error' && (
        <div role="alert" className="demo-stack">
          <p>Vue 组件加载失败，请重试。</p>
          <button
            type="button"
            className="f-button f-button--secondary f-button--sm"
            onClick={() => setAttempt((value) => value + 1)}
          >
            重新加载
          </button>
        </div>
      )}
    </div>
  );
}

export default VueDemo;

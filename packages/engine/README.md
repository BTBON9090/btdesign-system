# @btdesign/engine

BTDESIGN 的框架无关行为层。React 与 Vue 组件共享同一份表单校验、日期运算、树选择和表格处理逻辑；该包不依赖 DOM、React、Vue 或设计主题。

## 安装

组件包依赖本包。使用网站下载的分发包时，将 `btdesign-engine-0.11.0.tgz` 与 tokens、所选框架的安装包一起安装。公开 npm 注册表发布状态以主仓库说明为准。

```sh
npm install ./btdesign-engine-0.11.0.tgz ./btdesign-tokens-0.11.0.tgz ./btdesign-react-0.11.0.tgz
```

## 校验

```ts
import { validateValues, type FormRules } from '@btdesign/engine';

const rules: FormRules = {
  email: [{ required: true }, { type: 'email' }],
  seats: [{ required: true }, { min: 1, max: 100 }],
};
const errors = validateValues({ email: 'team@example.com', seats: 5 }, rules);
```

支持必填、邮箱/网页 URL、数字上下限、字符或数组长度、正则及同步自定义校验。每个字段返回首条错误；`0` 与空值不同，`false` 不满足必填同意项。自定义函数可以读取其他字段，实现确认密码等关联校验。网络校验和异步提交属于应用层，不能把 Promise 当作同步校验成功。

## 日期

`parseDate` 严格校验 `YYYY-MM-DD`，返回 `{year, month, day}` 或 `null`。`formatDate`、`addDays`、`addMonths` 保持日期语义；月运算把 31 日收敛至目标月最后一天，不自动进入再下个月。日期字符串不代表 UTC 时间戳。

`calendarDays('2026-11', 1)` 返回连续六周、42 个日期单元：`value / day / month / currentMonth / weekday`。周起点为星期一（1）或星期日（0）。`isDateDisabled` 合并合法日期、边界和应用提供的禁用日期函数。`normalizeDateRange` 排序完整范围且保留部分输入，`selectDateRange` 实现先开始、再结束、再次点击重新开始。

## 树

`TreeNode` 使用全树唯一 `key`、`label`、可选 `children / disabled / selectable / description`。

- `flattenTree` 提供规范前序结构、根到自身路径、从 0 开始的 depth 与从 1 开始的 ARIA level。祖先禁用会传给后代。
- `filterTree` 保留搜索结果的祖先路径；命中父项时保留其后代。
- `toggleTreeSelection(nodes, selected, key, multiple, cascade)` 返回新的 key 数组，不修改输入。
- 独立选择保存具体节点；级联多选保存可选叶节点。`treeCheckState` 返回 `true / false / 'mixed'`，禁用后代不进入父项全选范围。
- 已选禁用项不会被其他项目的切换清除。未知 key 不成为新选择。重复 key 保留第一次，引用循环会终止。

筛选只改变可见结构，选择计算仍应传入完整原始树，避免遗漏隐藏后代。

## 高级表格

`leafColumns` 和 `buildHeaderRows` 将嵌套列定义转换为可见叶列及准确的 `rowSpan / colSpan`。隐藏所有子列后，空分组一同消失。

```ts
import { processTableRows } from '@btdesign/engine';

const view = processTableRows(data, columns, {
  rowKey: 'id',
  childrenKey: 'children',
  query: '设计',
  sort: { key: 'budget', direction: 'asc' },
  filters: { status: ['active'] },
  expandedKeys: ['department-design'],
  page: 1,
  pageSize: 10,
});
```

先递归筛选及同层排序，再按**根行**分页，最后展开当前页后代。匹配后代的祖先会保留，搜索或过滤时自动呈现匹配路径。`total` 是过滤后的根行数，`rows` 是实际渲染行，`allRows` 包含所有过滤后行（包括折叠或其他页）。每项保留原始 `record` 对象及 `key / depth / parentKey / hasChildren`。

`dataIndex` 读取同名自有属性，不解释点路径、不读原型。数字排序按数值、字符串按自然顺序，空值始终在末尾。输入数据不会被修改。请提供稳定且唯一的行 key；缺失时的路径回退仅适合静态展示，重复 key 只保留首项。

这是内存数据模型，不包含请求、数据库、虚拟化、权限或电子表格编辑引擎。服务端数据源应由应用完成处理或分页，不应把局部页数据当作全量数据再次统计。

## 其他工具

`safeHref` 过滤可执行和非网页 scheme，支持相对路径、锚点、HTTP(S)、mailto/tel 及文件预览 blob 链接。`formatFileSize` 使用 1024 进制。`toggleOption` 保留现有禁用选项、拒绝添加未知项并去重。

完整类型由包内 `.d.ts` 提供。运行 `npm run test -w @btdesign/engine` 可验证边界；测试不请求网络或业务服务。

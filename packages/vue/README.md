# @forma-ui/vue

Forma UI 的 Vue 3 组件实现。需要 Vue 3.4 或更新版本，使用与 React 包一致的语义变量和 CSS。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Switch } from '@forma-ui/vue';
import '@forma-ui/tokens/styles.css';

const name = ref('Acme');
const notifications = ref(true);
</script>

<template>
  <label for="company">企业名称</label>
  <Input id="company" v-model="name" />
  <Switch v-model="notifications" label="接收通知" />
  <Button @click="console.log(name)">保存</Button>
</template>
```

## 组件

| 组件                      | 主要属性 / 约定                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Button                    | `variant: primary / secondary / ghost / danger`，`size: sm / md / lg`，`loading`，`disabled`；默认 `type="button"`  |
| Input / Textarea / Select | `v-model`、`invalid`，原生属性和事件透传；Select 的默认插槽放置 `option`                                            |
| Checkbox                  | 布尔 `v-model`，`label`，`indeterminate`，`disabled`                                                                |
| Switch                    | 布尔 `v-model`，`label`，`disabled`，`name`；提供 `name` 时开启状态参与表单提交                                     |
| Badge                     | `variant: default / info / success / warning / danger`                                                              |
| Card                      | 默认插槽、HTML 属性                                                                                                 |
| Alert                     | `title`，`variant: info / success / warning / danger`；默认为 `role="status"`                                       |
| Tabs                      | `items: {value, label, content?, disabled?}[]`，`v-model` 或 `defaultValue`，可选 `id`，`label`；同名插槽提供各面板 |
| Dialog                    | 布尔 `v-model`，必填 `title`，可选 `description`、`closeLabel`；默认插槽为内容，`footer` 插槽为底部操作             |
| Avatar                    | `name`，`src`，`alt`，`fallback`，`size`；图片失败时显示 fallback 或姓名首字母                                      |
| Separator                 | 语义化 `hr`，`orientation: horizontal / vertical`                                                                   |
| Table                     | 原生 `caption` / `thead` / `tbody` 插槽；容器允许键盘横向滚动                                                       |
| Skeleton                  | `width`、`height` 支持数字（px）或 CSS 长度，始终对辅助技术隐藏                                                     |
| Progress                  | `value`、`max`、`label`；数值限制在有效范围内                                                                       |

Tabs 支持左右方向键、Home、End 和自动激活。服务端渲染场景可传入页面内唯一的 `id`，以便首屏即具备完整 ARIA 关联；未传入时会在挂载后生成。Dialog 使用浏览器原生 `showModal()`，由浏览器维护模态焦点约束，关闭时恢复触发点焦点；用户关闭会发出 `update:modelValue`。现代浏览器支持原生 dialog；旧版浏览器需由应用安装 polyfill。

可选全局注册：

```ts
import { FormaPlugin } from '@forma-ui/vue';
app.use(FormaPlugin); // FButton、FInput 等 16 个组件
```

主题配置通过 `@forma-ui/tokens` 的 `createTheme(config, mode)` 设置在组件共同祖先的 CSS 变量上，或导出 CSS 文件。Vue 包不自动覆盖页面主题。

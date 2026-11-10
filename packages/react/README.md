# @btdesign/react

React 18+ components backed by the same semantic CSS used by `@btdesign/vue`.

```tsx
import '@btdesign/tokens/styles.css';
import { Button, Input, Card, Switch } from '@btdesign/react';

function Preferences() {
  return (
    <Card>
      <label htmlFor="project">Project name</label>
      <Input id="project" name="project" placeholder="My workspace" />
      <Switch label="Email notifications" defaultChecked />
      <Button type="submit">Save changes</Button>
    </Card>
  );
}
```

## Components

| Component               | Extra props beyond native HTML props                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Button                  | `variant`: primary / secondary / ghost / danger; `size`: sm / md / lg; `loading`                      |
| Input, Textarea, Select | Native props and refs; `controlSize`: sm / md / lg; `invalid`; Select uses native `<option>` children |
| Checkbox                | `label`, `onCheckedChange(boolean)`; native checked/defaultChecked and onChange                       |
| Switch                  | `label`, `checked`, `defaultChecked`, `onCheckedChange(boolean)`, `name`, `value`                     |
| Badge                   | `variant`: default / success / warning / danger / info                                                |
| Card                    | Native div props and ref                                                                              |
| Alert                   | `variant`: info / success / warning / danger; `title`                                                 |
| Tabs                    | `items: {value,label,content,disabled?}[]`, `value`, `defaultValue`, `onValueChange`, `label`         |
| Dialog                  | `open`, `onOpenChange(boolean)`, `title`, `description`, `footer`, `closeLabel`                       |
| Avatar                  | `name`, `src`, `size`: sm / md / lg                                                                   |
| Separator               | Native hr props; `orientation`: horizontal / vertical                                                 |
| Table                   | Native table props and children, with scroll wrapper                                                  |
| Skeleton                | Native span props, `width`, `height`, and `style`                                                     |
| Progress                | `value`, `max` (default 100), `label`                                                                 |

`Button` defaults to `type="button"`; explicitly set `type="submit"` inside forms. Input/Select/Textarea require a visible `<label>` or an accessible label from the caller. `Tabs` supports Left/Right/Home/End keys and associates tab panels. `Dialog` uses native `showModal()` for modal focus containment and Escape handling; its open state must be updated via `onOpenChange`. Supply a descriptive title and keep the trigger mounted to allow native focus restoration.

## Composition and form states

Build small, reusable structures from the same token-governed parts:

```tsx
import {
  Field,
  InputGroup,
  InputAddon,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from '@btdesign/react';

<Card>
  <CardHeader>
    <CardTitle>Workspace</CardTitle>
    <CardDescription>Keep a stable address for your team.</CardDescription>
  </CardHeader>
  <CardContent>
    <Field id="workspace" label="Workspace address" description="Use lowercase letters." required>
      <InputGroup>
        <InputAddon id="workspace-prefix">https://</InputAddon>
        <Input name="workspace" aria-describedby="workspace-prefix" controlSize="md" />
        <InputAddon>.example.com</InputAddon>
      </InputGroup>
    </Field>
  </CardContent>
  <CardFooter>
    <Button type="submit">Save</Button>
  </CardFooter>
</Card>;
```

`Field` wraps **one control or one RadioGroup**, not an entire form. Its `id` identifies the control; omit a separate child `id` so the visible label focuses it. It automatically connects the label, `description`, `error`, `required` and `disabled` state to Input, Textarea, Select, NumberInput and RadioGroup. Explicit control attributes take precedence; `aria-describedby` merges the caller's IDs with the field's IDs. `controlSize` controls visual geometry without taking over the native HTML `size` attribute. Use `error` for a real validation message and preserve visible recovery instructions.

| Family      | Composition / contract                                                                                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field       | `label`, `description`, `error`, `required`, `disabled`, optional control `id`                                                                                                                                                                                          |
| InputGroup  | Native div; `InputAddon` is a span for prefixes and suffixes. Label the contained control with Field or a native label.                                                                                                                                                 |
| RadioGroup  | `options: {value,label,description?,disabled?}[]`, `value`, `defaultValue`, `onValueChange`, `name`, `label`, `orientation`. Native radios support keyboard navigation and form submission.                                                                             |
| NumberInput | `value` / `defaultValue`: finite number or `''`; `onValueChange`, `min`, `max`, `step`; native input props, `controlSize`, `invalid`. Empty remains empty until stepping; bounds apply on blur and stepping. Read-only and disabled controls disable both step buttons. |
| Breadcrumb  | `items: {label,href?}[]`, `label`; final item identifies the current page and is not linked.                                                                                                                                                                            |
| Pagination  | Controlled `page`, `total` **item count**, `pageSize` (10), `onPageChange`, `siblingCount` (1), `disabled`, `label`. The application slices/fetches the corresponding rows.                                                                                             |
| EmptyState  | `title`, `description`, decorative `icon`, recovery `action`, optional children. Does not automatically announce static empty content.                                                                                                                                  |
| Spinner     | `label` describing the loading task, `size`: sm / md / lg. Use Skeleton for a known content shape; Spinner for indeterminate work.                                                                                                                                      |
| Card        | CardHeader, CardTitle (`h3`), CardDescription, CardContent, CardFooter. Existing plain children remain supported.                                                                                                                                                       |
| Table       | TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead (`scope="col"` by default), TableCell. Native cell attributes such as `rowSpan`, `colSpan`, and `scope` pass through.                                                                            |

Pagination renders a bounded page range even for large totals; it does not sort, fetch, or virtualize data. NumberInput does not replace currency/decimal accounting libraries. Use appropriate validation and rounding rules for the application's domain.

## Themes

Import shared styles once, and then import the CSS exported from Design Lab. Set `data-theme="light"` or `data-theme="dark"` on a wrapper or the document element. For live configuration, apply `createTheme(config, mode)` from `@btdesign/tokens` as inline CSS variables to a wrapper. Inline variables take priority over theme selectors.

The v0.3 enterprise components below use the same theme rules. Form/section spacing, choice geometry, calendar cells, tree indentation, navigation items, lists and overlays all inherit Design Lab tokens; the advanced table inherits the existing table padding and row-height rules.

## Enterprise components

The complete library now contains 44 families and 63 public components. `@btdesign/engine` supplies shared validation, calendar, tree selection and table processing to both framework adapters.

| Family                                | Usage and behavior                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form                                  | `initialValues`, controlled `values / onValuesChange`, `rules`, `disabled`, `submitting`, `onSubmit(values)`, `onInvalid(errors)`. Validates before submission, collects custom controls' native validity, displays an error summary and focuses the first invalid control. `type="reset"` restores initial values. The application owns asynchronous submission and the `submitting` state. |
| FormField                             | `name`, `label`, `description`, `required`, `rules`, `disabled`, `type`, `options`. Types: text, email, password, number, textarea, select, checkbox, date. Custom children may be a function receiving `{value,setValue,id,disabled,required,invalid,describedBy}`. Keep the control connected to this state.                                                                               |
| FormSection / FormActions             | Native fieldset/legend with `title`, optional description and inherited disabled state; actions container for submit/reset buttons.                                                                                                                                                                                                                                                          |
| Calendar                              | ISO date `value / defaultValue / onValueChange`, displayed `month / onMonthChange`, `min`, `max`, `disabledDate`, `weekStartsOn`, `label`. Native buttons in a calendar grid; arrows, Home/End and PageUp/PageDown move focus, Enter/Space select.                                                                                                                                           |
| DatePicker / DateRangePicker          | Editable `YYYY-MM-DD` text with real calendar-date validation and bounds, a calendar popup, clear action and focus restoration. Range value is `[start,end]`; completed ranges are ordered. `label`, `name`, `required`, `disabled`. Visible labels are automatic outside Field; `showLabel` can explicitly request one.                                                                     |
| Radio / CheckboxGroup                 | Native controls, labels, names and disabled state. CheckboxGroup uses `options`, string-array values and `onValueChange`. Radio retains `checked / defaultChecked / onCheckedChange`.                                                                                                                                                                                                        |
| ToggleGroup / Segmented / ButtonGroup | ToggleGroup uses native radios or checkboxes styled as buttons, with `multiple`, `options` and values. Segmented is single selection. ButtonGroup is a labelled composition container, without implicit selection state.                                                                                                                                                                     |
| Tree / TreeSelect / OrgPicker         | `nodes`, single key or multiple keys, `multiple`, `cascade`, `disabled`, `name`, `label`; Tree also exposes expansion state. Cascade stores eligible leaf keys and derives parent mixed states. Disabled ancestors disable descendants. Search keeps matching paths. OrgPicker displays complete organization paths.                                                                         |
| Cascader                              | Single/multiple leaf-key selection through progressive columns; `changeOnSelect` allows a branch in single mode. Search, clear and selected paths are built in. It shares the TreeNode contract; it does not emit arrays of path segments.                                                                                                                                                   |
| Transfer                              | `options`, controlled target `value / onValueChange`, `titles`, `name`, `disabled`. Searches both panels, selects visible eligible options and moves checked items. Disabled selected options remain in their original panel.                                                                                                                                                                |
| SidebarNav / TopNav / DropdownMenu    | `items`, `label`, `disabled`, `onSelect(key)`. Navigation adds `activeKey` and collapsible groups; real destinations are links. DropdownMenu is a single-level action menu with disabled items, separators, arrow-key navigation and Escape/Tab dismissal.                                                                                                                                   |
| List / FileList                       | Compose ListItem, ListItemContent and ListItemActions. FileList accepts `files`, optional `onRemove(id)` and `onRetry(id)`, and displays supplied progress/status. Uploading, storage and authorization remain application responsibilities.                                                                                                                                                 |
| DataTable                             | `columns`, `data`, `rowKey`, `childrenKey`, `caption`, `loading`, `selectable`, `searchable`, `pagination`, `pageSize`. Supports multi-level headers, tree rows, sorting, per-column filters, global search, root-level pagination, page-row selection, column visibility, sticky headers/fixed columns, expanded details and basic cell editing.                                            |

```tsx
import { Form, FormField, FormSection, FormActions, DatePicker, Button } from '@btdesign/react';

<Form initialValues={{ name: '', due: '' }} onSubmit={(values) => console.log(values)}>
  <FormSection title="项目信息">
    <FormField name="name" label="项目名称" required />
    <FormField name="due" label="交付日期" required>
      {(field) => (
        <DatePicker
          id={field.id}
          value={String(field.value ?? '')}
          onValueChange={field.setValue}
          disabled={field.disabled}
          required={field.required}
        />
      )}
    </FormField>
  </FormSection>
  <FormActions>
    <Button type="submit">保存</Button>
    <Button type="reset" variant="secondary">
      重置
    </Button>
  </FormActions>
</Form>;
```

DataTable columns use `{key,title,dataIndex?,children?,sortable?,filterOptions?,width?,align?,fixed?,editable?,render?}`. Use `render(value,row)` for custom content. Editing emits `onCellChange({key,column,value})`; update the input `data` to accept the change. It also exposes controlled query, sort, filters, page, selectedKeys, expandedKeys and hiddenKeys with corresponding callbacks. `renderExpanded(row)` supplies an independent detail row. Filters keep matching ancestor paths expanded; pagination counts root records. Selection is independent of expansion. Fixed columns use explicit widths; the final non-fixed column absorbs remaining space.

The advanced table uses native table semantics and application-owned data. It does not provide spreadsheet keyboard navigation, drag-and-drop column ordering, virtualized rows, remote fetching, or automatic third-party API compatibility. Forms use synchronous rules; async validation belongs in application code. Date values represent calendar days rather than timestamps. Accessibility still depends on labels, content, colors, application interactions and assistive-technology testing in the consuming product; these components do not certify whole-product conformance.

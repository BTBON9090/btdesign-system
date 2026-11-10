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

The library is a foundation: it does not yet include complex data-grid virtualization, date pickers, or a tree component. Accessibility depends on labels, content, colors, application interactions, and testing in the consuming product; these primitives do not certify whole-product conformance.

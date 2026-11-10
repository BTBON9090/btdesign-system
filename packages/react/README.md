# @forma-ui/react

React 18+ components backed by the same semantic CSS used by `@forma-ui/vue`.

```tsx
import '@forma-ui/tokens/styles.css';
import { Button, Input, Card, Switch } from '@forma-ui/react';

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

| Component               | Extra props beyond native HTML props                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Button                  | `variant`: primary / secondary / ghost / danger; `size`: sm / md / lg; `loading`              |
| Input, Textarea, Select | Native props and refs; Select uses native `<option>` children                                 |
| Checkbox                | `label`, `onCheckedChange(boolean)`; native checked/defaultChecked and onChange               |
| Switch                  | `label`, `checked`, `defaultChecked`, `onCheckedChange(boolean)`, `name`, `value`             |
| Badge                   | `variant`: default / success / warning / danger / info                                        |
| Card                    | Native div props and ref                                                                      |
| Alert                   | `variant`: info / success / warning / danger; `title`                                         |
| Tabs                    | `items: {value,label,content,disabled?}[]`, `value`, `defaultValue`, `onValueChange`, `label` |
| Dialog                  | `open`, `onOpenChange(boolean)`, `title`, `description`, `footer`, `closeLabel`               |
| Avatar                  | `name`, `src`, `size`: sm / md / lg                                                           |
| Separator               | Native hr props; `orientation`: horizontal / vertical                                         |
| Table                   | Native table props and children, with scroll wrapper                                          |
| Skeleton                | Native span props, `width`, `height`, and `style`                                             |
| Progress                | `value`, `max` (default 100), `label`                                                         |

`Button` defaults to `type="button"`; explicitly set `type="submit"` inside forms. Input/Select/Textarea require a visible `<label>` or an accessible label from the caller. `Tabs` supports Left/Right/Home/End keys and associates tab panels. `Dialog` uses native `showModal()` for modal focus containment and Escape handling; its open state must be updated via `onOpenChange`. Supply a descriptive title and keep the trigger mounted to allow native focus restoration.

## Themes

Import shared styles once, and then import the CSS exported from Design Lab. Set `data-theme="light"` or `data-theme="dark"` on a wrapper or the document element. For live configuration, apply `createTheme(config, mode)` from `@forma-ui/tokens` as inline CSS variables to a wrapper. Inline variables take priority over theme selectors.

The library is a foundation: it does not yet include complex data-grid virtualization, date pickers, or a tree component. Accessibility depends on labels, content, colors, application interactions, and testing in the consuming product; these primitives do not certify whole-product conformance.

# @btdesign/tokens

Shared CSS and a deterministic, framework-independent theme engine.

```ts
import '@btdesign/tokens/styles.css';
import { defaultTheme, createTheme, themeToCSS } from '@btdesign/tokens';

const theme = { ...defaultTheme, primary: '#2563EB', radius: 6 };
// Set the returned variables on a wrapper or document.documentElement.
const variables = createTheme(theme, 'dark');
// Export both modes as a CSS file. Switch via data-theme="dark".
const css = themeToCSS(theme);
```

`normalizeTheme()` accepts untrusted JSON, bounds radius to 0–20, validates six-digit hex colors, and limits font/density to known values. Invalid values use defaults. `createTheme()` selects black or white foreground for primary buttons based on contrast. This check covers that pairing only and does not establish whole-product accessibility compliance.

`font: 'inter'` selects `"Inter Variable", Inter` but does not download either font. The documentation website bundles `@fontsource-variable/inter`; consuming applications must bundle their own licensed font file or accept the system fallback. Theme configuration is serializable; React and Vue consume exactly the same variables.

## Enterprise overrides and policy

```ts
import { applyThemePatch } from '@btdesign/tokens';

const draft = applyThemePatch(
  theme,
  {
    semantic: { dark: { background: '#111319', surface: '#191C24' } },
    components: { button: { radius: 12, height: 44 }, card: { padding: 24 } },
  },
  { locked: ['primary', 'font'] },
);
```

Semantic overrides support `background`, `surface`, `text`, `muted`, and `border` independently in light/dark modes. Component overrides support button/input radius and height, and card radius and padding. Values are whitelisted and bounded. `applyThemePatch` merges nested values, ignores locked keys, and never mutates its inputs. Passing `null` for an optional section or component clears that override unless its section is locked. Policy enforcement happens when applying a patch; consumers must keep and apply their policy, and enforce authorization on their own backend if multiple users share a brand configuration. This client-side mechanism is not an access-control boundary.

# hopper-style

A themeable [Panda CSS](https://panda-css.com) design system: a preset of design
tokens and recipes, plus the React components built on them.

Every colour in the system is a token that resolves to a bare CSS custom
property — `boxBgPrimary` is `var(--hopper-box-primary-bg)` and nothing more.
Your application defines those properties, from wherever you keep themes, and
the whole component set re-skins at runtime. No component here knows a colour.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

## Status

Early. The preset is complete (22 recipes, 43 colour tokens); the component set
is being extracted incrementally and currently covers the layout and typography
primitives. See [CLAUDE.md](./CLAUDE.md) for the architecture and the
contribution rules.

## Install

```bash
npm install hopper-style
```

Peer dependencies: `react` ≥18, `react-dom` ≥18, `@pandacss/dev` ≥1.9.

## Setup

**1 — add the preset to your `panda.config.ts`:**

```ts
import { defineConfig } from "@pandacss/dev";
import { hopperStylePreset } from "hopper-style/preset";

export default defineConfig({
  // Listing `presets` REPLACES Panda's defaults rather than adding to them,
  // so the two base presets must be named explicitly. Without them the recipes
  // lose the tokens they build on, and Panda drops those styles silently.
  presets: [
    "@pandacss/preset-base",
    "@pandacss/preset-panda",
    hopperStylePreset(),
  ],
  include: [
    "./src/**/*.{ts,tsx}",
    // Panda finds styles by parsing source. A package it never parses
    // contributes no CSS, and its components render unstyled.
    "./node_modules/hopper-style/src/**/*.tsx",
  ],
  outdir: "styled-system",
  jsxFramework: "react",
});
```

**2 — transpile the package.** It ships TypeScript source, not a bundle,
because Panda extracts styles statically at *your* build. In Next.js:

```js
// next.config.js
module.exports = { transpilePackages: ["hopper-style"] };
```

**3 — define the custom properties.** Every token reads one, and a token with
no property behind it renders as nothing. `requiredCssCustomProperties()`
returns the full list so you can assert you have them all:

```css
:root {
  --hopper-box-primary-bg: #1e293b;
  --hopper-box-primary-text: #f8fafc;
  /* … */
}
```

**4 — mount the provider** (optional; omitting it gives readable defaults):

```tsx
import { HopperStyleProvider } from "hopper-style";

<HopperStyleProvider fontSizeProfile="md" variant="solid">
  <App />
</HopperStyleProvider>;
```

## Use

```tsx
import { StyledBox, StyledHeading, StyledText, StyledVStack } from "hopper-style";

export function Panel() {
  return (
    <StyledBox p="4" header={<StyledHeading>Overview</StyledHeading>}>
      <StyledVStack gap="3">
        <StyledText>Colours come from the host's theme.</StyledText>
        <StyledText tooltip="Shown on hover and on keyboard focus">
          Hover me
        </StyledText>
      </StyledVStack>
    </StyledBox>
  );
}
```

## Theming

**Two settings** drive the system app-wide, both supplied by your app through
the provider:

- `fontSizeProfile` — `xs | sm | md | lg | xl`. The scale is rem-based, so it
  compounds with the browser's own font-size setting rather than overriding it.
  `StyledHeading` renders one tier above whatever body text is set to, so the
  hierarchy survives every profile.
- `variant` — `solid | outline | aurora | glass | matte`. Any call site may
  override it; `useResolvedVariant` applies the precedence (caller → app-wide →
  `solid`) and coerces anything the recipes have no case for.

**Your own namespace.** If `--hopper-*` does not suit, rename the whole
namespace at build time:

```ts
hopperStylePreset({ cssVarPrefix: "acme" }); // → var(--acme-box-primary-bg)
```

## Logging

Silent by default — a component that renders a few hundred times a second must
not decide your console should fill up. Opt in at startup:

```ts
import { setStyleLogger } from "hopper-style";
setStyleLogger(myLogger); // trace / debug / info / warn / error
```

## Icons — bring your own

**This package ships no icons, and that is the point.** `StyledIcon` is a
sizing-and-colouring wrapper that renders *whatever node you hand it*, so you
choose the icon set and nothing about it leaks into the library. Lucide,
Heroicons, Font Awesome, Material Symbols, your designer's SVGs — all equally
supported, and you can mix them.

```tsx
import { StyledIcon } from "hopper-style";
import { Home } from "lucide-react";

<StyledIcon icon={<Home />} size="lg" />;
```

### Building an icon set

An icon set is a few hundred near-identical wrappers, and hand-writing them is
how a set drifts — one forgets to forward `size`, another hardcodes a colour.
`createIcon` makes each one a line and forces them to agree:

```tsx
// icons.tsx — your own module, in your own repo
import { createIcon, createIconFromComponent } from "hopper-style";
import { Home, Trash2 } from "lucide-react";

export const StyledHome  = createIcon("StyledHome", <Home />);
export const StyledTrash = createIconFromComponent("StyledTrash", Trash2);
```

Use `createIconFromComponent` when the set exports one component per glyph
(Lucide, Heroicons, react-icons). It renders them at `width`/`height` 100% so
they fill the box `size` establishes — most sets default to 24px and would
otherwise ignore `size` entirely. Use `createIcon` when you have a node already.

### Sizing

`size` accepts `xs`, `sm`, `1x`, `md`, `lg`, `2x`, `xl`, `3x` … `10x` and sets a
square box in CSS px (`lg` → 24, `2x` → 32, default `2x`). It always wins over a
height or width in a spread `style` prop, so sizing stays predictable.

### Colouring

Two mechanisms, because icon libraries disagree about how they take a colour:

| Your icon set draws with… | What to do |
|---|---|
| `currentColor` — Lucide, Heroicons, Feather, Material Symbols, most SVGs | Nothing. `color` is set on the wrapper and inherits. |
| its own CSS variables — e.g. Font Awesome duotone | Map the published `--icon-*` properties, once. |

`StyledIcon` publishes `--icon-primary-color`, `--icon-secondary-color` and
`--icon-secondary-opacity` under **neutral names** so no icon library is baked
into this package. A set that wants different names needs one CSS rule:

```css
/* Font Awesome adapter — one rule, in your app */
.icon svg {
  --fa-primary-color:     var(--icon-primary-color);
  --fa-secondary-color:   var(--icon-secondary-color);
  --fa-secondary-opacity: var(--icon-secondary-opacity, 0.4);
}
```

Colours default to the theme tokens (`textMain`, `iconBgPrimary`), so an icon
with no explicit colour follows the host's theme and colour mode automatically.
Pass `color` / `secondaryColor` to override per call site.

### Accessibility

`title` is the whole interface, and the default is the one you want more often:

```tsx
<StyledIcon icon={<Trash2 />} />                  {/* decorative: aria-hidden */}
<StyledIcon icon={<Trash2 />} title="Delete" />   {/* meaningful: role="img" + name */}
```

Give `title` **only** when the icon carries meaning no adjacent text already
conveys — an icon-only button, for instance. An icon sitting next to its own
label must stay untitled, or screen readers announce the name twice.

### Why it works this way

The components were extracted from an app built on a per-seat commercial icon
set whose artwork cannot be redistributed under this licence. Rather than pick a
replacement and impose it on everyone, the artwork was cut out entirely. Your
licensed set can live in a private package while the components that lay it out
stay open — which is exactly the arrangement the original app now uses.

## Development

```bash
npm install       # also runs panda codegen
npm run gate      # codegen → typecheck → lint → tests. The merge bar.
npm test
```

`styled-system/` is generated and gitignored; regenerate with
`npm run panda:build`.

Tests run against the **real** generated `styled-system` rather than a mock, so
recipe output is assertable — see CLAUDE.md for why that took some doing.

## License

[Apache-2.0](./LICENSE). See [NOTICE](./NOTICE) for attribution.

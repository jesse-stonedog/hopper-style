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

**Not published to npm.** Consume it from git — either a plain dependency, or a
submodule if you want to develop against it:

```bash
# Option A — git dependency, pinned to a commit
npm install "git+https://github.com/jesse-stonedog/hopper-style.git#<sha>"

# Option B — submodule + file: dependency (use this in a monorepo)
git submodule add git@github.com:jesse-stonedog/hopper-style.git packages/hopper-style
#   then in the consuming app's package.json:
#   "hopper-style": "file:../../packages/hopper-style"
```

Pin to a commit rather than tracking a branch: this package ships source that
your build parses, so an unpinned bump changes your CSS without changing your
lockfile in any way you'd notice.

Peer dependencies: `react` ≥18, `react-dom` ≥18, `@pandacss/dev` ≥1.9.

## Setup

Four steps. **All four are required** — miss step 3 or 4 and the app renders,
but invisibly or unstyled, with no error anywhere to tell you why.

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

**3 — define the custom properties. This is the step that bites.** Every colour
token reads one, and **a token whose property is undefined renders as nothing** —
no fallback, no warning, no error. An app that skips this compiles, builds,
serves, and shows you a blank page.

There are **44** of them. Get the list at runtime rather than copying one:

```ts
import { requiredCssCustomProperties } from "hopper-style/preset";

requiredCssCustomProperties();           // --hopper-* (default)
requiredCssCustomProperties("maximus");  // --maximus-*, if you set cssVarPrefix
```

A complete starter theme — all 44, nothing elided. Dark, and every text/surface
pair clears WCAG AA (measured: worst 5.17:1, ten of thirteen pairs at AAA), so
it is a legitimate starting point rather than a placeholder. Replace the values;
keep every key.

```css
:root {
  /* Surfaces */
  --hopper-box-main-bg: #0f172a;
  --hopper-box-primary-bg: #1e293b;
  --hopper-box-secondary-bg: #334155;
  --hopper-box-accent-bg: #0b1220;
  --hopper-box-info-bg: #1e3a5f;

  /* Text on those surfaces */
  --hopper-box-main-text: #f8fafc;
  --hopper-box-primary-text: #f8fafc;
  --hopper-box-secondary-text: #f1f5f9;
  --hopper-box-accent-text: #e2e8f0;

  /* Text that carries meaning on its own */
  --hopper-text-pop-text: #38bdf8;
  --hopper-text-error-text: #f87171;
  --hopper-text-warning-text: #fbbf24;

  /* Borders */
  --hopper-box-primary-border: #475569;
  --hopper-box-secondary-border: #64748b;
  --hopper-box-accent-border: #334155;

  /* Shadows */
  --hopper-shadow-primary-bg: rgb(0 0 0 / 0.4);
  --hopper-shadow-secondary-bg: rgb(0 0 0 / 0.3);
  --hopper-shadow-accent-bg: rgb(0 0 0 / 0.5);

  /* Buttons */
  --hopper-button-primary-bg: #2563eb;
  --hopper-button-secondary-bg: #475569;
  --hopper-button-accent-bg: #1e293b;
  --hopper-button-primary-hover-bg: #1d4ed8;
  --hopper-button-secondary-hover-bg: #334155;
  --hopper-button-accent-hover-bg: #334155;
  --hopper-button-primary-text: #ffffff;
  --hopper-button-secondary-text: #f8fafc;
  --hopper-button-accent-text: #f8fafc;
  --hopper-button-primary-hover-text: #ffffff;
  --hopper-button-secondary-hover-text: #ffffff;
  --hopper-button-accent-hover-text: #ffffff;
  --hopper-button-plain-bg: transparent;
  --hopper-button-plain-text: #f8fafc;

  /* Icons */
  --hopper-icon-primary-bg: #94a3b8;
  --hopper-icon-secondary-bg: #64748b;
  --hopper-icon-accent-bg: #cbd5e1;
  --hopper-icon-primary-hover-bg: #cbd5e1;
  --hopper-icon-secondary-hover-bg: #94a3b8;
  --hopper-icon-accent-hover-bg: #e2e8f0;

  /* Arrows / carets */
  --hopper-arrow-primary-bg: #94a3b8;
  --hopper-arrow-secondary-bg: #64748b;
  --hopper-arrow-accent-bg: #cbd5e1;
  --hopper-arrow-primary-border: #475569;
  --hopper-arrow-secondary-border: #64748b;
  --hopper-arrow-accent-border: #334155;
}
```

Guard it with a test rather than trusting a checklist — the failure is invisible,
so nothing else will tell you:

```ts
it("defines every property the design system reads", () => {
  const css = readFileSync("src/theme.css", "utf8");
  for (const prop of requiredCssCustomProperties()) {
    expect(css).toContain(`${prop}:`);
  }
});
```

One optional extra, not in that list because it has a working fallback:
`--hopper-widget-base-height` (default `240px`) caps dropdown menus.

**4 — mount the provider** (optional; omitting it gives readable defaults):

```tsx
import { HopperStyleProvider } from "hopper-style";

<HopperStyleProvider fontSizeProfile="md" variant="solid">
  <App />
</HopperStyleProvider>;
```

### Check it actually worked

Three greps against your generated stylesheet, in order. Each isolates one of
the three ways this goes wrong silently:

```bash
npx panda cssgen --outfile styled-system/styles.css

# 1. Did the preset load? Expect ~44 matches, not 0.
grep -c 'var(--hopper-' styled-system/styles.css

# 2. Did Panda parse the package's source? Expect ~240 classes, not ~0.
#    A low number means your `include` glob is wrong (step 1).
grep -oE '\.[a-zA-Z][a-zA-Z0-9_-]+' styled-system/styles.css | sort -u | wc -l

# 3. Did you keep the base presets? Expect all six breakpoints.
grep 'BreakpointToken =' styled-system/tokens/tokens.d.ts
# -> "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
#    Only "3xl" means you dropped @pandacss/preset-base and preset-panda.
```

If all three pass and the UI is still blank, you are missing step 3.

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

The rename is total — every token re-points, and no `--hopper-*` reference
survives anywhere in the generated CSS. Choose it **before** you write a theme,
because it changes all 44 property names you have to define.

## Adopting it in a new app — a worked example

Verified end to end against a clean project. Substitute your own prefix and
paths; nothing else here is optional.

```bash
# 1. Take the dependency (see Install — it is not on npm)
npm install "git+https://github.com/jesse-stonedog/hopper-style.git#<sha>"
npm install -D @pandacss/dev @types/react @types/react-dom
```

`@types/react-dom` is not optional: the tooltip portals through `react-dom`,
and without the types your build fails on our source, not yours.

```ts
// 2. panda.config.ts — all four points below matter
import { defineConfig } from "@pandacss/dev";
import { hopperStylePreset } from "hopper-style/preset";

export default defineConfig({
  preflight: false,
  presets: [
    "@pandacss/preset-base",   // (a) REQUIRED — presets replaces, not merges
    "@pandacss/preset-panda",  // (b) REQUIRED — gray.*, radii, spacing
    hopperStylePreset({ cssVarPrefix: "acme" }),
  ],
  include: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/hopper-style/src/**/*.tsx",  // (c) REQUIRED
  ],
  exclude: ["./node_modules/hopper-style/src/**/__tests__/**/*"],  // (d)
  outdir: "styled-system",
  jsxFramework: "react",
});
```

```jsonc
// 3. tsconfig.json — so the generated `styled-system/*` imports resolve
{
  "compilerOptions": {
    // NOT `baseUrl`. TypeScript 6 removed it, and a project on a current
    // toolchain fails immediately with TS5102. This form does the same job
    // and works on both.
    "paths": { "*": ["./*"] },
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*", "styled-system/**/*.ts"]
}
```

```tsx
// 4. Your root — theme first, then the provider
import "./theme.css";                 // the 44 properties, from step 3 above
import { HopperStyleProvider } from "hopper-style";

export function Root({ children }) {
  return (
    <HopperStyleProvider fontSizeProfile="md" variant="solid">
      {children}
    </HopperStyleProvider>
  );
}
```

```bash
# 5. Generate, then run the three checks under "Check it actually worked"
npx panda codegen && npx panda cssgen --outfile styled-system/styles.css
```

**What each mistake looks like**, since none of them raise an error:

| Symptom | Cause |
|---|---|
| Page renders, everything invisible or unstyled colours | Step 3 — properties undefined |
| Components render but have no styling at all | `include` missing the package (c) |
| Some styles apply, spacing and radii look wrong | Dropped a base preset (a/b) |
| `md`/`lg` responsive props rejected by the type-checker | Dropped a base preset (a/b) |
| `Cannot find module 'styled-system/jsx'` | No `paths` mapping, or codegen not run |
| `TS5102: Option 'baseUrl' has been removed` | TypeScript 6+; use `paths` (step 3) |
| `Could not find a declaration file for 'react-dom'` | Missing `@types/react-dom` (step 1) |
| Works in dev, breaks in a Next.js build | Missing `transpilePackages` |

Every row is a failure this walkthrough actually hit on a clean project, not a
list of things that might go wrong.

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

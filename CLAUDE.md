# hopper-style — a portable Panda CSS design system

**Repo tier.** Machine-wide conventions (branching, PR rules, the Linear
protocol, Node/nvm) live in `~/.claude/CLAUDE.md` and apply here as written.
This file covers only what is true inside this repo.

**This repo is public and Apache-2.0.** Every commit is visible to the world,
permanently. Never commit a credential, a customer name, a screenshot of real
data, or anything under a licence that is not compatible with Apache-2.0 — see
"What may never land here".

## What this is

One themeable component library, shared by applications that are owned by
different companies and licensed differently. It is two things in one package:

| Entry point | What it is | Who imports it |
|---|---|---|
| `hopper-style/preset` | A **Panda CSS preset** — colour tokens, breakpoints, and 22 recipes | the consumer's `panda.config.ts`, at build time in Node |
| `hopper-style` | The **React components** built on those recipes | application code |

They are separate entry points on purpose: the config runs in Node during the
build, and dragging the whole component tree (and React with it) into that
context buys nothing.

Extracted from HopperGuard's `apps/web/src/app/components/Styled/`. That app
remains the largest consumer and the de-facto reference for how a component
should behave.

## The one idea everything else follows from

**No component in this package knows a single colour.**

Every colour is a Panda token whose *value* is a bare CSS custom property —
`boxBgPrimary` resolves to `var(--hopper-box-primary-bg)`, and nothing more.
The host application sets those properties at runtime, from wherever it keeps
themes. That indirection is the entire reason one component library can wear two
products' branding.

Consequences that bite if you forget them:

- **A token with no matching custom property renders as nothing.** There is no
  fallback colour, by design — an invisible element is a louder bug than a
  slightly-wrong shade, and it shows up in development rather than in
  production. `requiredCssCustomProperties()` exists so a host can assert it has
  defined them all.
- **Token names are public API.** Host theme data keys off them. Adding one is
  backwards-compatible; renaming or removing one silently breaks whatever was
  painting it, because CSS has no import errors.
- **Never write a literal colour in a component or a recipe.** Not `#fff`, not
  `rgba(...)`, not `"black"`. It will look right in one theme and wrong in every
  other, and it will ignore dark mode and high-contrast entirely. (The existing
  recipes have a few of these, inherited — see "Known inherited defects".)

## Layout

```
src/
  preset/
    index.ts               the definePreset() factory — the build-time entry point
    semantic-variables.ts  the token contract: token name → CSS custom property
    recipes/               22 Panda recipes; the visual definition of everything
  config/
    style-config.tsx       HopperStyleProvider / useStyleConfig / useResolvedVariant
    logger.ts              the injectable logger (no-op by default)
    font-size.ts           the rem-based type scale
    types.ts               variant + font-size vocabularies
  components/              the React components
  index.ts                 the public API
panda.config.ts            the package's OWN config, so it can test itself
```

`config/` is the seam that made this package portable at all. Keep it small:
**every field added to `StyleConfig` is a field a new host must supply before it
can render a single button.**

## How a consumer wires this up

Four steps. Steps 2 and 3 are the ones that get missed.

**1. Add the preset to `panda.config.ts`:**

```ts
import { defineConfig } from "@pandacss/dev";
import { hopperStylePreset } from "hopper-style/preset";

export default defineConfig({
  // Listing `presets` REPLACES Panda's defaults — it does not add to them.
  // Omit the two base presets and the recipes lose every token they lean on
  // (`gray.*`, `radii.xl`, the spacing scale), and Panda drops those
  // declarations SILENTLY: no build error, no console error, just wrong pixels.
  presets: [
    "@pandacss/preset-base",
    "@pandacss/preset-panda",
    hopperStylePreset(),          // or hopperStylePreset({ cssVarPrefix: "acme" })
  ],
  include: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/hopper-style/src/**/*.tsx",  // ← step 2
  ],
  outdir: "styled-system",
  jsxFramework: "react",
});
```

**2. Add this package's source to `include`** (above). Panda finds styles by
statically parsing source files. A package it never parses contributes no CSS,
and its components render with class names that have no rules behind them.

**3. Transpile the package.** It ships TypeScript source, not a bundle. In
Next.js: `transpilePackages: ["hopper-style"]`.

**4. Define the custom properties and mount the provider:**

```tsx
<HopperStyleProvider fontSizeProfile={profile} variant={variant}>
  <App />
</HopperStyleProvider>
```

The provider is optional — omitting it yields readable defaults — but the custom
properties are not.

### Why source and not a `dist/`

Because Panda extracts styles statically at the consumer's build. A pre-bundled
`dist/` would emit class names that the consumer's `panda cssgen` never saw and
therefore never wrote CSS for. Shipping source is the standard arrangement for a
Panda component library, and it is why steps 2 and 3 exist at all.

## Adding or changing a component

1. **Check it belongs here.** The test is: *would a completely different product
   want this, unchanged?* A generic disclosure widget, yes. Anything that knows
   about facilities, care teams, compliance rules, or a specific API, no — that
   belongs in the app. When unsure, leave it in the app; moving it in later is
   easy, and pulling a leaked concept back out is not.
2. **No new runtime dependencies** without a deliberate decision. The dependency
   list is currently `csstype`, and React as a peer. Every addition is a
   constraint imposed on every consumer.
3. **Colours come from tokens**, spacing from the scale, text through
   `StyledText`. Never a hardcoded `px` font size — the scale is rem-based so it
   honours the browser's own font setting, which is the affordance users with
   low vision actually reach for.
4. **Resolve variants with `useResolvedVariant`**, never by reading a variant
   prop directly. It applies the house precedence (caller → app-wide → `solid`)
   and coerces values the recipes have no case for. Skipping it is how a form
   ends up with three controls that each ignore the theme differently.
5. **Write the test.** See below — this package can test things the app it came
   from cannot.
6. **Export it from `src/index.ts`.** Named export; add a default export in the
   component's own module too, matching the existing pattern.

## Testing — and the one thing worth knowing

`npm run gate` runs codegen → typecheck → lint → tests, and is the merge bar.

**Tests here run against the REAL generated `styled-system`.** The application
this was extracted from mocks `styled-system/*` wholesale in Jest, which means
no unit test there can assert anything a recipe produces — documented as a hard
constraint in its PRD-0013. Here the actual generated output is transformed and
loaded, so recipe behaviour *is* testable. Use that: assert that two variants
produce different classes, that a token resolves, that `staticCss` covers what
runtime switching needs.

Two harness details that exist only to make the above work, both load-bearing:

- **`outExtension: "js"` in `panda.config.ts`.** TypeScript will downlevel a
  `.js` file to CommonJS for Jest but *never* a `.mjs` one — the extension forces
  ESM output whatever `module` says. Panda's default is `.mjs`, and with it every
  component test dies on `Unexpected token 'export'`, leaving mocking as the only
  way out. Consumers are unaffected; they generate their own.
- **`test/` is in the tsconfig `include`.** Solely so
  `@testing-library/jest-dom`'s module augmentation loads and `tsc` knows about
  `toBeInTheDocument`. Drop it and the suite runs green while the typecheck fails
  on every matcher.

## What may never land here

- **Any icon artwork at all.** Not Font Awesome Pro (per-seat licence, and
  HopperGuard's vendored subset contains actual Pro path data), and not a
  permissive set either — picking one would impose it on every consumer and add
  a dependency none of them asked for. `StyledIcon` renders whatever node it is
  handed, and `createIcon` / `createIconFromComponent` make building a set a
  line each. HopperGuard's licensed set lives in a private `hopper-icons`
  package; the README shows how anyone else brings their own.
- **Anything AGPL or copyleft.** One consumer is a proprietary SaaS. An AGPL
  dependency here would compromise its licence position, and unlike a bug that
  cannot be fixed after the fact.
- **A dependency on a private package.** `hopper-logger` was exactly this, at 195
  import sites, and was the single largest reason the library could not be
  shared. Route logging through `config/logger.ts`; if you need something else
  from the host, add a seam, not an import.
- **Application concepts.** No auth, no data fetching, no routing, no
  `next/*` imports. A component that fetches is a feature, not a primitive.

## Token compliance — the defect class this package keeps catching

Three separate bugs found during extraction shared one root cause: **a recipe
naming a CSS custom property directly instead of going through a token.** They
are fixed here (NEH-165, NEH-166, NEH-171) and guarded by a regression test that
greps the generated stylesheet, so the class cannot come back quietly.

Worth understanding rather than just obeying, because the failure mode is
uniquely nasty — none of the three produced a build error, a console warning, or
anything a type-checker could see:

- **`bg: "buttonBgHover"`** — a token that was never defined. Panda passes an
  unknown token through as a literal, so the stylesheet said
  `background: buttonBgHover`, which is not a valid CSS value, so the browser
  discarded it. The outline variant's hover background had **never rendered** in
  production. Now `buttonBgAccentHover`, matching that variant's base state.
- **`color: "var(--text-primary)"`**, 16 occurrences — a property in a namespace
  the token contract does not use, and which nothing defines. Those controls
  silently opted out of theming *and* of contrast validation. Now `textPrimary`.
- **`var(--hopper-box-accent-bg)` in a gradient, `var(--hopper-widget-base-height)`
  as a max-height** — correct inside HopperGuard, but they hardcode the default
  namespace, so they ignore `cssVarPrefix` entirely. Now token references; the
  max-height became a real `sizes` token, `widgetBaseHeight`.

**The rule: never write `var(--…)` in a recipe or component for anything the
host supplies.** Add a token instead — colours in `COLOR_TOKENS`, host-provided
layout values in `SIZE_TOKENS` — and reference it by name. The token layer is
the only thing that re-points under a custom prefix, so bypassing it is exactly
what breaks the second consumer while looking fine to the first.

Still outstanding, inherited and **not** fixed: literal `gray.*`, `rgba(...)`,
and `color: "black"` / `backgroundColor: "white"` in `recipes/input-text.ts`.
These misread under dark and high-contrast themes. Fixing them changes rendering
in a visible way, so it wants its own PR and a real look at the result.

## Accessibility is a floor, not a feature

The originating product serves an often-elderly, sometimes cognitively-impaired
audience, and the components carry that: WCAG 2.2 AA is the minimum and AAA the
aim. Concretely — ≥44×44 CSS px touch targets on anything clickable; never
colour as the only signal; every interactive element reachable and operable by
keyboard, not just by pointer; correct roles and accessible names, and exactly
one of each (a duplicated name is its own bug). `StyledTooltip` is worth reading
before writing anything that reveals content on hover: it opens on focus as well
as hover, moves `aria-describedby` onto whatever actually receives focus, and
declines to invent a name when an ancestor already provides one. All three are
there because the naive version was shipped first and was wrong.

**Known gap:** the tooltip has no touch trigger — hover and focus only.

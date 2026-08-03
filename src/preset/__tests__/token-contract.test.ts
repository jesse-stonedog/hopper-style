import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_CSS_VAR_PREFIX,
  TEXT_BACKGROUND_PAIRS,
  colorTokenNames,
  createSemanticColors,
  getBackgroundForText,
  requiredCssCustomProperties,
} from "../semantic-variables";
import { stonedogStylePreset, stonedogStyleRecipes } from "../index";

describe("the colour token contract", () => {
  it("maps every token to a bare custom property at the default prefix", () => {
    const colors = createSemanticColors();
    for (const [token, def] of Object.entries(colors)) {
      expect(def.value).toMatch(
        new RegExp(`^var\\(--${DEFAULT_CSS_VAR_PREFIX}-[a-z0-9-]+\\)$`),
      );
      // No literal colour may sneak in — a hardcoded value would be invisible
      // to the host's theme and would not change with the color mode.
      expect(def.value).not.toMatch(/#|rgb|hsl/i);
      expect(token).not.toMatch(/\s/);
    }
  });

  it("re-namespaces every property when a consumer picks its own prefix", () => {
    const colors = createSemanticColors("optima");
    const values = Object.values(colors).map((d) => d.value);
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((v) => v.startsWith("var(--optima-"))).toBe(true);
    expect(values.some((v) => v.includes("--hopper-"))).toBe(false);
  });

  it("names one required custom property per token", () => {
    expect(requiredCssCustomProperties()).toHaveLength(colorTokenNames().length);
    expect(requiredCssCustomProperties("optima")).toContain(
      "--optima-box-primary-bg",
    );
  });

  it("emits no duplicate custom properties", () => {
    // Two tokens pointing at one property is almost always a copy-paste slip,
    // and it is invisible until a theme change moves only one of them.
    const props = requiredCssCustomProperties();
    expect(new Set(props).size).toBe(props.length);
  });
});

describe("recipes honour the configurable prefix", () => {
  const recipeSource = readFileSync(
    join(__dirname, "..", "..", "..", "styled-system", "styles.css"),
    "utf8",
  );

  it("never hardcodes the default namespace anywhere a token would do", () => {
    // A literal `var(--hopper-…)` inside a recipe or component bypasses the
    // token layer entirely, so it paints NOTHING for a consumer that chose a
    // different prefix — silently, with no build error. Every such reference
    // must arrive via `--colors-*`, which the token layer re-points.
    //
    // The token DEFINITIONS are the one legitimate place the default namespace
    // appears — `--colors-x: var(--hopper-y)`, `--sizes-x: var(--hopper-y)` —
    // because that layer is precisely what re-points under a custom prefix.
    // Anything else (a `background:`, a `max-height:`) has bypassed it.
    const isTokenDefinition = /^\s*--[a-z]+-[a-z0-9-]+:\s*var\(--hopper-/;
    const offenders = recipeSource
      .split("\n")
      .filter((line) => line.includes("var(--hopper-"))
      .filter((line) => !isTokenDefinition.test(line));

    expect(offenders).toEqual([]);
  });

  it("resolves the outline hover background to a real token", () => {
    // Regression guard for a defect carried in from the extraction: both
    // button recipes named a `buttonBgHover` token that does not exist, so
    // Panda emitted `background: buttonBgHover` — not a valid CSS value, and
    // therefore dropped by the browser. That hover state never rendered.
    expect(recipeSource).not.toContain("background: buttonBgHover");
    expect(recipeSource).toContain("--colors-button-bg-accent-hover");
  });

  it("routes every colour through the token layer, not raw properties", () => {
    // Same defect class: `color: var(--text-primary)` referenced a property in
    // a namespace nothing defines, so those controls silently opted out of
    // theming AND of contrast validation.
    expect(recipeSource).not.toContain("var(--text-primary)");
  });

  /**
   * The general form of the `bg: "buttonBgHover"` bug, rather than one more
   * named instance of it.
   *
   * Panda passes an unknown token through as a literal, so a typo or a token
   * borrowed from another design system's vocabulary emits something like
   * `color: fg.muted` — not a valid CSS value, silently discarded by the
   * browser, invisible to the type-checker and to every behaviour test. Three
   * of these have now been found by hand, one of them (`fg.muted`, on
   * StyledSidebar's item descriptions) as recently as NEH-223. Grepping the
   * generated stylesheet is the only thing that sees them at all.
   *
   * The allowlist this carried is GONE as of NEH-301 — all nine pre-existing
   * offenders are fixed, so the assertion is now simply "none, ever". Do not
   * reintroduce it: an allowlist is how this defect class became normal enough
   * to survive an extraction, and the whole value of the guard is that there is
   * no way to make it pass except by making the declaration render.
   */
  it("never emits a colour value that is neither a token reference nor real CSS", () => {
    const COLOUR_PROPERTY =
      /^\s*(color|background|background-color|border-color|border-[a-z]+-color|fill|stroke|outline-color|scrollbar-color|caret-color|text-decoration-color|accent-color|column-rule-color)\s*:\s*([^;]+);/;
    // Everything a browser can actually paint from. A token reference is the
    // first case; the rest are literals, which the package bans separately but
    // which at least render.
    const REAL_CSS =
      /var\(|#|rgb|hsl|oklch|lab\(|gradient|^(transparent|currentColor|inherit|initial|unset|revert|none|auto|black|white|purple)$/i;

    const offenders = new Set<string>();
    for (const line of recipeSource.split("\n")) {
      const match = COLOUR_PROPERTY.exec(line);
      if (!match) continue;
      const [, property, rawValue] = match;
      const value = rawValue!.trim();
      if (REAL_CSS.test(value)) continue;
      offenders.add(`${property}: ${value}`);
    }

    expect([...offenders].sort()).toEqual([]);
  });

  /**
   * The same defect, one nesting level down — inside a gradient (NEH-301).
   *
   * The declaration-level guard above cannot see these: a value containing
   * `gradient` is real CSS as far as a regex is concerned, so
   * `linear-gradient(to right, "textPrimary", "secondary")` sails straight
   * past it. Three recipes shipped exactly that — a *quoted* token name, which
   * is a CSS string and never a colour, so the whole gradient was invalid and
   * every one of those `aurora` variants fell back to no background at all.
   * Two more named tokens unquoted (`linear-gradient(to right, boxBgAccent,
   * boxBgSecondary)`), which is equally dead: Panda only substitutes a token
   * inside an arbitrary value when it is written as `{colors.boxBgAccent}`.
   *
   * So the colour STOPS at a bare `var(...)` or a literal. Anything else
   * between the commas is a token name that did not resolve.
   */
  it("never leaves an unresolved token inside a gradient", () => {
    const offenders = new Set<string>();
    for (const line of recipeSource.split("\n")) {
      if (!/gradient\(/.test(line)) continue;
      // The colour stops of a gradient, minus the direction/position syntax.
      const args = line.slice(line.indexOf("gradient(") + "gradient(".length);
      for (const raw of args.split(",")) {
        const arg = raw.trim().replace(/\)+;?$/, "").trim();
        if (!arg) continue;
        // Direction/interpolation/position syntax, and real colour values.
        if (/^(to |from |at |in |\d|-?\d*\.?\d+(%|px|deg|rad|turn|rem)?$|circle|ellipsis|ellipse|closest|farthest|var\(|#|rgb|hsl|oklch|lab\(|transparent$|currentColor$|black$|white$)/i.test(arg)) continue;
        offenders.add(arg);
      }
    }
    expect([...offenders].sort()).toEqual([]);
  });
});

describe("contrast pairings", () => {
  it("pairs text tokens only with tokens that exist", () => {
    // A contrast checker fed a token name nothing defines silently passes.
    const known = new Set(colorTokenNames());
    for (const [text, background] of Object.entries(TEXT_BACKGROUND_PAIRS)) {
      expect(known.has(text)).toBe(true);
      expect(known.has(background)).toBe(true);
    }
  });

  it("resolves the surface a text token is read against", () => {
    expect(getBackgroundForText("textPrimary")).toBe("boxBgPrimary");
    // The pairing is not derivable from the name — plain button text sits on
    // the plain button, not on any box surface.
    expect(getBackgroundForText("buttonTextPlain")).toBe("buttonBgPlain");
    expect(getBackgroundForText("nonsense")).toBeUndefined();
  });
});

describe("the preset", () => {
  it("force-generates every variant of every recipe", () => {
    // The style variant is chosen by the user at runtime, so Panda's static
    // extractor never sees the concrete value. Without staticCss, switching
    // variants yields class names with no CSS behind them.
    const preset = stonedogStylePreset();
    const staticRecipes = preset.staticCss?.recipes ?? {};
    expect(Object.keys(staticRecipes).sort()).toEqual(
      Object.keys(stonedogStyleRecipes).sort(),
    );
    expect(Object.values(staticRecipes).every((v) => Array.isArray(v) && v[0] === "*")).toBe(true);
  });

  it("force-generates the flexbox alignment utilities", () => {
    // NEH-288. StyledHStack/StyledVStack rename `align`/`justify` to
    // `alignItems`/`justifyContent` at runtime, so the extractor — which only
    // reads source text — never sees the value it has to generate a rule for.
    // Without this the component emits `ai_baseline` and nothing defines it.
    const preset = stonedogStylePreset();
    const cssEntries = preset.staticCss?.css ?? [];
    const properties = cssEntries.flatMap((entry) =>
      Object.entries((entry as { properties?: Record<string, string[]> }).properties ?? {}),
    );
    const byName = Object.fromEntries(properties);

    expect(byName.alignItems).toEqual(expect.arrayContaining(["baseline", "stretch", "flex-start", "flex-end"]));
    expect(byName.justifyContent).toEqual(
      expect.arrayContaining(["space-between", "flex-start", "flex-end", "center"]),
    );
  });

  it("does not impose application-level decisions on its consumers", () => {
    // A preset that restyles `body` or forces a preflight is hard to adopt;
    // those belong to the app. Regression guard on the adoption story.
    const preset = stonedogStylePreset() as unknown as Record<string, unknown>;
    expect(preset.globalCss).toBeUndefined();
    expect(preset.preflight).toBeUndefined();
    expect(preset.include).toBeUndefined();
    expect(preset.outdir).toBeUndefined();
  });

  it("threads the prefix option through to the generated tokens", () => {
    const preset = stonedogStylePreset({ cssVarPrefix: "optima" });
    const colors = preset.theme?.extend?.tokens?.colors as
      | Record<string, { value: string }>
      | undefined;
    // Asserting the token EXISTS before reading it: `colors?.x.value` would
    // throw rather than fail helpfully if the prefix option stopped threading
    // through and the token vanished.
    expect(colors?.boxBgPrimary).toBeDefined();
    expect(colors?.boxBgPrimary?.value).toBe("var(--optima-box-primary-bg)");
  });
});

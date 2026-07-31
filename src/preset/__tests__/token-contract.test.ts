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
import { hopperStylePreset, hopperStyleRecipes } from "../index";

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
    const colors = createSemanticColors("maximus");
    const values = Object.values(colors).map((d) => d.value);
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((v) => v.startsWith("var(--maximus-"))).toBe(true);
    expect(values.some((v) => v.includes("--hopper-"))).toBe(false);
  });

  it("names one required custom property per token", () => {
    expect(requiredCssCustomProperties()).toHaveLength(colorTokenNames().length);
    expect(requiredCssCustomProperties("maximus")).toContain(
      "--maximus-box-primary-bg",
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
    const preset = hopperStylePreset();
    const staticRecipes = preset.staticCss?.recipes ?? {};
    expect(Object.keys(staticRecipes).sort()).toEqual(
      Object.keys(hopperStyleRecipes).sort(),
    );
    expect(Object.values(staticRecipes).every((v) => Array.isArray(v) && v[0] === "*")).toBe(true);
  });

  it("does not impose application-level decisions on its consumers", () => {
    // A preset that restyles `body` or forces a preflight is hard to adopt;
    // those belong to the app. Regression guard on the adoption story.
    const preset = hopperStylePreset() as unknown as Record<string, unknown>;
    expect(preset.globalCss).toBeUndefined();
    expect(preset.preflight).toBeUndefined();
    expect(preset.include).toBeUndefined();
    expect(preset.outdir).toBeUndefined();
  });

  it("threads the prefix option through to the generated tokens", () => {
    const preset = hopperStylePreset({ cssVarPrefix: "maximus" });
    const colors = preset.theme?.extend?.tokens?.colors as
      | Record<string, { value: string }>
      | undefined;
    expect(colors?.boxBgPrimary.value).toBe("var(--maximus-box-primary-bg)");
  });
});

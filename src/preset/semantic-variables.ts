/**
 * The token contract.
 *
 * Every colour in this design system is a Panda token whose *value* is a bare
 * CSS custom property — `boxBgPrimary` resolves to `var(--hopper-box-primary-bg)`.
 * Nothing here defines a colour. The host application is what sets those custom
 * properties at runtime (from a theme picker, a database, a `<style>` block, a
 * stylesheet — the system does not care), and that indirection is the whole
 * reason a single component library can wear two products' branding.
 *
 * Two consequences worth internalising before changing anything below:
 *
 * 1. **A token with no matching custom property renders as nothing.** There is
 *    no fallback colour by design — a silent black-on-black box is a louder bug
 *    than a silent wrong-shade box, and it surfaces during development instead
 *    of in production. Consumers MUST define every property this file names.
 *    `requiredCssCustomProperties()` exists so a consumer can assert that.
 *
 * 2. **The names are public API.** A host app's theme data keys off them. Adding
 *    a token is backwards-compatible; renaming or removing one silently breaks
 *    whatever was painting it, because CSS has no import errors.
 */

/** A Panda token name mapped to the CSS custom-property suffix it reads. */
type TokenMap = Record<string, string>;

/**
 * `<panda token name>` → `<custom property suffix>`.
 *
 * The suffix is everything after the prefix, so `"box-primary-bg"` becomes
 * `var(--hopper-box-primary-bg)` at the default prefix. The two naming schemes
 * differ on purpose and are not derivable from each other: token names are
 * camelCase and read component-first (`boxBgPrimary`), custom properties are
 * kebab-case and read scope-first (`box-primary-bg`). Keeping the mapping
 * explicit is what lets either side be renamed without touching the other.
 */
const COLOR_TOKENS: TokenMap = {
  // Text that carries meaning on its own — errors, warnings, emphasis.
  textPop: "text-pop-text",
  textError: "text-error-text",
  textWarning: "text-warning-text",

  // Text on each surface. Pair these with the matching `boxBg*` — see
  // TEXT_BACKGROUND_PAIRS for which goes with which.
  textMain: "box-main-text",
  textPrimary: "box-primary-text",
  textSecondary: "box-secondary-text",
  textAccent: "box-accent-text",

  // Arrows / carets.
  arrowBgPrimary: "arrow-primary-bg",
  arrowBgSecondary: "arrow-secondary-bg",
  arrowBgAccent: "arrow-accent-bg",
  arrowBorderPrimary: "arrow-primary-border",
  arrowBorderSecondary: "arrow-secondary-border",
  arrowBorderAccent: "arrow-accent-border",

  // Surfaces.
  boxBgMain: "box-main-bg",
  boxBgPrimary: "box-primary-bg",
  boxBgSecondary: "box-secondary-bg",
  boxBgAccent: "box-accent-bg",
  boxInfo: "box-info-bg",

  // Borders.
  borderBgPrimary: "box-primary-border",
  borderBgSecondary: "box-secondary-border",
  borderBgAccent: "box-accent-border",

  // Shadows.
  boxshadowBgPrimary: "shadow-primary-bg",
  boxshadowBgSecondary: "shadow-secondary-bg",
  boxshadowBgAccent: "shadow-accent-bg",

  // Buttons.
  buttonBgPrimary: "button-primary-bg",
  buttonBgSecondary: "button-secondary-bg",
  buttonBgAccent: "button-accent-bg",
  buttonBgPrimaryHover: "button-primary-hover-bg",
  buttonBgSecondaryHover: "button-secondary-hover-bg",
  buttonBgAccentHover: "button-accent-hover-bg",
  buttonTextPrimary: "button-primary-text",
  buttonTextSecondary: "button-secondary-text",
  buttonTextAccent: "button-accent-text",
  buttonTextPrimaryHover: "button-primary-hover-text",
  buttonTextSecondaryHover: "button-secondary-hover-text",
  buttonTextAccentHover: "button-accent-hover-text",
  buttonBgPlain: "button-plain-bg",
  buttonTextPlain: "button-plain-text",

  // Icons.
  iconBgPrimary: "icon-primary-bg",
  iconBgSecondary: "icon-secondary-bg",
  iconBgAccent: "icon-accent-bg",
  iconBgPrimaryHover: "icon-primary-hover-bg",
  iconBgSecondaryHover: "icon-secondary-hover-bg",
  iconBgAccentHover: "icon-accent-hover-bg",
};

/**
 * The default custom-property prefix.
 *
 * `hopper` rather than something neutral because HopperGuard's theme engine
 * already emits `--hopper-*` and a rename there would be a coordinated change
 * across a running product's stored theme data. A second consumer that wants
 * its own namespace passes `cssVarPrefix` — see `hopperStylePreset`.
 */
export const DEFAULT_CSS_VAR_PREFIX = "hopper";

/**
 * Text/background pairings, for contrast checking.
 *
 * A theme is only usable if each text token has enough contrast against the
 * surface it actually lands on, and that relationship is not inferable from the
 * names — `textMain` sits on `boxBgMain`, but `buttonTextPlain` sits on
 * `buttonBgPlain`, not on any `box*`. A contrast checker that guesses will pass
 * themes that are unreadable in practice.
 */
export const TEXT_BACKGROUND_PAIRS: Readonly<Record<string, string>> = {
  textMain: "boxBgMain",
  textPrimary: "boxBgPrimary",
  textSecondary: "boxBgSecondary",
  textAccent: "boxBgAccent",
  buttonTextPrimary: "buttonBgPrimary",
  buttonTextSecondary: "buttonBgSecondary",
  buttonTextAccent: "buttonBgAccent",
  buttonTextPrimaryHover: "buttonBgPrimaryHover",
  buttonTextSecondaryHover: "buttonBgSecondaryHover",
  buttonTextAccentHover: "buttonBgAccentHover",
  buttonTextPlain: "buttonBgPlain",
};

/** The surface token a given text token is meant to be read against. */
export function getBackgroundForText(textToken: string): string | undefined {
  return TEXT_BACKGROUND_PAIRS[textToken];
}

/** Every Panda colour token this preset defines. */
export function colorTokenNames(): string[] {
  return Object.keys(COLOR_TOKENS);
}

/**
 * Every CSS custom property a consumer must define for the system to render.
 *
 * Intended for a startup assertion or a theme-validation test: a theme missing
 * one of these paints nothing, with no error anywhere.
 */
export function requiredCssCustomProperties(
  prefix: string = DEFAULT_CSS_VAR_PREFIX,
): string[] {
  return Object.values(COLOR_TOKENS).map((suffix) => `--${prefix}-${suffix}`);
}

/** Panda colour-token definitions, bound to a custom-property prefix. */
export function createSemanticColors(
  prefix: string = DEFAULT_CSS_VAR_PREFIX,
): Record<string, { value: string }> {
  return Object.fromEntries(
    Object.entries(COLOR_TOKENS).map(([token, suffix]) => [
      token,
      { value: `var(--${prefix}-${suffix})` },
    ]),
  );
}

/**
 * The vocabulary shared by the recipes and the components.
 *
 * Ported from HopperGuard's `hopper-types` so this package depends on nothing
 * private. The tuples are the source of truth — the unions derive from them, so
 * a value can be validated at runtime and narrowed at compile time from one
 * declaration.
 */

/**
 * The five appearances a user can choose app-wide. Every recipe defines all
 * five, which is why `staticCss` force-generates them (see the preset).
 */
export const THEME_VARIANTS = [
  "solid",
  "outline",
  "aurora",
  "glass",
  "matte",
] as const;

/**
 * Appearances a *call site* can ask for but a user cannot select globally —
 * a `ghost` toolbar button stays ghost whatever the app-wide variant is.
 */
export const STYLE_VARIANTS = [
  "ghost",
  "none",
  "link",
  "unstyled",
  "selected",
] as const;

/** Semantic text treatments. Not appearances — meanings. */
export const TEXT_VARIANTS = ["unstyled", "error", "pop", "warning"] as const;

export const ALL_VARIANTS = [...THEME_VARIANTS, ...STYLE_VARIANTS] as const;

export type ThemeVariant = (typeof THEME_VARIANTS)[number];
export type StyleVariant = (typeof STYLE_VARIANTS)[number];
export type AllowedTextVariant = (typeof TEXT_VARIANTS)[number];
export type AllowedVariant = (typeof ALL_VARIANTS)[number];

/**
 * The user's app-wide text-size setting.
 *
 * Five tiers, not the thirteen `fontSizeMap` defines: the extra sizes exist so a
 * heading can step one above body text, but only these five are offerable as a
 * global preference.
 */
export const FONT_SIZE_PROFILES = ["xs", "sm", "md", "lg", "xl"] as const;
export type FontSizeProfile = (typeof FONT_SIZE_PROFILES)[number];

/** Every size key `fontSizeMap` understands, including the heading-only tiers. */
export const FONT_SIZE_KEYS = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl",
] as const;
export type FontSizeKey = (typeof FONT_SIZE_KEYS)[number];

export function isThemeVariant(value: unknown): value is ThemeVariant {
  return THEME_VARIANTS.includes(value as ThemeVariant);
}

export function isFontSizeProfile(value: unknown): value is FontSizeProfile {
  return FONT_SIZE_PROFILES.includes(value as FontSizeProfile);
}

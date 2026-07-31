import type { FontSizeKey } from "./types";

/**
 * Size key → CSS font-size.
 *
 * Every value is a `var(--font-sizes-*)` reference with a **rem** fallback, and
 * both halves matter. The custom property lets a host retune the scale without
 * touching this package; rem (never px) is what makes the whole UI respond to
 * the browser's own font-size setting, which is the accessibility affordance
 * that users with low vision actually reach for.
 *
 * The scale is intentionally shallow at the bottom and wide at the top: the
 * jump from `xs` to `sm` is larger than a typographic scale would suggest,
 * because the audience choosing `xs` is choosing density, and the audience
 * choosing `xl` needs a genuinely large step to benefit.
 */
export const fontSizeMap: Record<string, string> = {
  xs: "var(--font-sizes-xs, 0.75rem)",
  sm: "var(--font-sizes-sm, 1.0625rem)",
  md: "var(--font-sizes-md, 1.375rem)",
  lg: "var(--font-sizes-lg, 1.6875rem)",
  xl: "var(--font-sizes-xl, 2rem)",
  "2xl": "var(--font-sizes-2xl, 2.3125rem)",
  "3xl": "var(--font-sizes-3xl, 2.625rem)",
  "4xl": "var(--font-sizes-4xl, 2.9375rem)",
  "5xl": "var(--font-sizes-5xl, 3.25rem)",
  "6xl": "var(--font-sizes-6xl, 3.5625rem)",
  "7xl": "var(--font-sizes-7xl, 3.875rem)",
  "8xl": "var(--font-sizes-8xl, 4.1875rem)",
  "9xl": "var(--font-sizes-9xl, 4.5rem)",
};

/** Human-readable names for the five selectable profiles. */
const fontSizeLabelMap: Record<string, string> = {
  xs: "Extra Small",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra Large",
};

/** Friendly name for a font-size profile (falls back to the raw key). */
export function getFontSizeLabel(size: string): string {
  return fontSizeLabelMap[size] ?? size;
}

/**
 * The literal fallback inside a `fontSizeMap` entry, e.g. `"1.375rem"`.
 *
 * Used where a real length is needed rather than a CSS reference — measuring,
 * or a context that cannot resolve custom properties. Returns `"unknown"` for
 * an unrecognised key rather than throwing, because this feeds display code.
 */
export function getFontSizeValue(size: string): string {
  const sizeString = fontSizeMap[size];
  if (!sizeString) {
    return "unknown";
  }
  const parts = sizeString.split(",");
  if (parts.length > 1) {
    return parts[1].replace(")", "").trim();
  }
  return sizeString;
}

/** Order used to step a heading one tier above its base size. */
export const FONT_SIZE_ORDER: readonly FontSizeKey[] = [
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

/** The next size up, clamped at the top of the scale. */
export function stepUpFontSize(size: FontSizeKey, steps = 1): FontSizeKey {
  const index = FONT_SIZE_ORDER.indexOf(size);
  if (index === -1) return size;
  return FONT_SIZE_ORDER[
    Math.min(index + steps, FONT_SIZE_ORDER.length - 1)
  ];
}

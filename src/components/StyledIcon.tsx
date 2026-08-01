"use client";

import React from "react";
import { iconRecipe } from "styled-system/recipes";
import { log } from "../config/logger";
import { useIconSize } from "../config/style-config";
import type { IconSize } from "../config/types";

/**
 * The icon seam.
 *
 * This package ships **no icons**, on purpose: the components it was extracted
 * from used a per-seat commercial icon set whose artwork cannot be
 * redistributed under this licence. Rather than pick a replacement and impose
 * it on every consumer, `StyledIcon` is a sizing-and-colouring wrapper that
 * renders whatever node you hand it. Bring Lucide, Heroicons, Font Awesome,
 * Material Symbols, or your own SVGs — the system only cares that the result
 * lands in a consistently sized, theme-coloured box.
 *
 * Two mechanisms do the colouring, because icon libraries disagree about how
 * they take a colour:
 *
 * 1. **`color` is set on the wrapper**, so any icon drawn with
 *    `fill="currentColor"` or `stroke="currentColor"` inherits it. That covers
 *    Lucide, Heroicons, Feather, Material Symbols, and most hand-rolled SVGs —
 *    for those, nothing further is needed.
 * 2. **Custom properties are published** — `--icon-primary-color`,
 *    `--icon-secondary-color`, `--icon-secondary-opacity` — for sets that paint
 *    from variables instead, such as Font Awesome's duotone family. An adapter
 *    maps them in one line of CSS; see the README.
 *
 * Publishing neutral property names rather than any library's own is what keeps
 * this package free of a dependency it must not have.
 */

/**
 * Size vocabulary. Defined in `config/types` because `StyleConfig` names it
 * too — re-exported here so the long-standing import path keeps working.
 */
export type { IconSize };

/** Rendered box size, in CSS px, for each size name. */
const SIZE_TO_PX: Record<string, number> = {
  "2xs": 10,
  xs: 12,
  sm: 16,
  "1x": 20,
  md: 20,
  lg: 24,
  "2x": 32,
  xl: 32,
  "2xl": 40,
  "3x": 48,
  "4x": 64,
  "5x": 80,
  "6x": 96,
  "7x": 112,
  "8x": 128,
  "9x": 144,
  "10x": 160,
};

/** The recipe defines four size variants; the rest fall back to the base. */
const RECIPE_SIZES = new Set(["sm", "md", "lg", "xl"]);

export interface StyledIconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /**
   * The icon to render — any React node. Passing `children` instead is
   * equivalent; `icon` reads better at a call site that renders nothing else.
   */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  /**
   * Box size. Omit it and the app-wide default from `HopperStyleProvider`
   * applies (`"2x"` if the host sets nothing).
   *
   * **Prefer omitting it.** Setting the app-wide default once is what keeps an
   * application to a single icon scale; a size named at the call site opts that
   * icon out of ever being retuned. Pass it only where this specific icon must
   * differ from everything around it.
   */
  size?: IconSize;
  /** Primary colour. Defaults to the theme's main text colour. */
  color?: string;
  /** Secondary colour, for two-tone icon sets. Ignored by single-tone ones. */
  secondaryColor?: string;
  /** Opacity of the secondary tone, for sets that support it. */
  secondaryOpacity?: number;
  /**
   * Accessible label. **Omit it for a decorative icon** — one that sits beside
   * text already saying the same thing. An icon-only control needs one; an icon
   * next to its own label must not have one, or screen readers announce the
   * name twice.
   */
  title?: string;
}

/**
 * Defaults reference the token layer rather than literal colours, so an icon
 * with no explicit colour still follows the host's theme and colour mode.
 */
const DEFAULT_PRIMARY = "var(--colors-text-main)";
const DEFAULT_SECONDARY = "var(--colors-icon-bg-primary)";

const StyledIcon: React.FC<StyledIconProps> = ({
  icon,
  children,
  size: sizeProp,
  color,
  secondaryColor,
  secondaryOpacity,
  title,
  className,
  style,
  ...rest
}) => {
  log.trace("StyledIcon rendered");

  // Caller's size, else the app-wide default, else "2x". Same precedence rule
  // as `useResolvedVariant`, and shared for the same reason: when each control
  // picks its own default, the app quietly grows several scales at once.
  const appIconSize = useIconSize();
  const size = sizeProp ?? appIconSize;

  const recipeClass = iconRecipe(
    RECIPE_SIZES.has(size) ? { size: size as "sm" | "md" | "lg" | "xl" } : {},
  );
  const mergedClassName = [recipeClass, className].filter(Boolean).join(" ");

  const boxSize = SIZE_TO_PX[size] ?? 20;
  const primary = color ?? DEFAULT_PRIMARY;

  const mergedStyle = {
    // Published for icon sets that paint from variables. Neutral names, so no
    // particular library is baked in — adapters map them (see the README).
    "--icon-primary-color": primary,
    "--icon-secondary-color": secondaryColor ?? DEFAULT_SECONDARY,
    ...(secondaryOpacity != null
      ? { "--icon-secondary-opacity": secondaryOpacity }
      : {}),
    // For everything drawn with currentColor, which is most of them.
    color: primary,
    ...(typeof style === "object" && style !== null ? style : {}),
    // After the caller's style on purpose: `size` is the prop that exists to
    // control the box, so it must not be silently defeated by a stray height in
    // a spread style object.
    height: `${boxSize}px`,
    width: `${boxSize}px`,
  } as React.CSSProperties;

  return (
    <span
      {...rest}
      className={mergedClassName}
      style={mergedStyle}
      // A titled icon is being used AS the label for something, so it needs a
      // role to go with the name. An untitled one is decorative and is hidden,
      // rather than read out as an anonymous graphic.
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {icon ?? children}
    </span>
  );
};

StyledIcon.displayName = "StyledIcon";

export default StyledIcon;
export { StyledIcon };

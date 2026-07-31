"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { FontSizeProfile, ThemeVariant } from "./types";
import { THEME_VARIANTS } from "./types";

/**
 * Everything this component library needs to know about the host application.
 *
 * The components were extracted from an app where they read a 461-line Zustand
 * store holding auth, widgets, notes, services and config together. Depending on
 * that store is what made them unshareable, so the seam was drawn at the
 * narrowest possible place: **these two settings are all the styling actually
 * needs.** Anything a component wants beyond them belongs in a prop.
 *
 * Keeping this interface small is a load-bearing constraint, not tidiness. Every
 * field added here is a field a second host must supply before it can render a
 * single button.
 */
export interface StyleConfig {
  /**
   * The user's app-wide text size. Drives `StyledText`, and through it nearly
   * all visible text.
   */
  fontSizeProfile: FontSizeProfile;

  /**
   * The user's app-wide appearance. A component may override it per call site;
   * see `useResolvedVariant` for the precedence rule.
   */
  variant: ThemeVariant;
}

/**
 * What a host that supplies nothing gets.
 *
 * Both values are deliberately the middle/safest option rather than the
 * smallest or the flashiest: an unconfigured app should be readable and plain,
 * so that forgetting the provider degrades to "looks unstyled" rather than
 * "unreadable at 0.75rem".
 */
export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  fontSizeProfile: "md",
  variant: "solid",
};

const StyleConfigContext = createContext<StyleConfig>(DEFAULT_STYLE_CONFIG);

export interface HopperStyleProviderProps extends Partial<StyleConfig> {
  children: React.ReactNode;
}

/**
 * Supplies the styling settings to everything beneath it.
 *
 * Wrap the app once, near the root, and feed it from wherever the host keeps
 * user preferences. HopperGuard renders it inside its existing config provider
 * and passes the two values through from the Zustand store; a host with no such
 * store can pass literals, or omit the provider entirely and take the defaults.
 *
 * ```tsx
 * <HopperStyleProvider fontSizeProfile={profile} variant={variant}>
 *   <App />
 * </HopperStyleProvider>
 * ```
 *
 * Props are merged over the defaults individually, so a host that only cares
 * about font size does not have to name a variant it has no opinion on.
 */
export function HopperStyleProvider({
  children,
  fontSizeProfile,
  variant,
}: HopperStyleProviderProps) {
  const value = useMemo<StyleConfig>(
    () => ({
      fontSizeProfile:
        fontSizeProfile ?? DEFAULT_STYLE_CONFIG.fontSizeProfile,
      variant: variant ?? DEFAULT_STYLE_CONFIG.variant,
    }),
    [fontSizeProfile, variant],
  );

  return (
    <StyleConfigContext.Provider value={value}>
      {children}
    </StyleConfigContext.Provider>
  );
}

/** The current styling settings. Safe outside a provider — returns defaults. */
export function useStyleConfig(): StyleConfig {
  return useContext(StyleConfigContext);
}

/** The user's app-wide font-size profile. */
export function useFontSizeProfile(): FontSizeProfile {
  return useStyleConfig().fontSizeProfile;
}

/**
 * Resolve a control's appearance: **the caller's, else the user's app-wide
 * setting, else `solid`.**
 *
 * This is three lines, which is exactly why it is shared. In the originating
 * codebase each control picked its own default — a checkbox hard-coded `solid`,
 * a wheel picker defaulted to `outline`, a phone field to `solid` — each
 * plausible alone, and together they produced a form whose checkbox, phone
 * field and wheel ignored the theme every other control followed.
 *
 * The narrowing matters as much as the fallback: a caller may pass a variant the
 * theme recipes have no case for (`ghost`, `link`, or a value read from storage
 * written by an older release). Coercing to `solid` renders a plain control;
 * passing it through renders an *unstyled* one, because a recipe silently emits
 * nothing for a variant it does not define.
 */
export function useResolvedVariant(variant?: string): ThemeVariant {
  const globalVariant = useStyleConfig().variant;
  const candidate = variant ?? globalVariant;
  return THEME_VARIANTS.includes(candidate as ThemeVariant)
    ? (candidate as ThemeVariant)
    : "solid";
}

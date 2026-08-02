"use client";

import React, { createContext, useContext } from "react";

/**
 * The intent icon registry.
 *
 * This is what lets one `StyledDeleteButton` serve three products that draw a
 * trash can differently. The component knows it needs "the delete icon"; the
 * host says what that *is*, once, at the root:
 *
 * ```tsx
 * // HopperGuard — Font Awesome Pro, via hopper-icons
 * <StonedogStyleProvider icons={{ delete: <StyledTrash />, save: <StyledSave /> }}>
 *
 * // optima-filings — Lucide, via the same seam
 * <StonedogStyleProvider icons={{ delete: <Trash2 />, save: <Save /> }}>
 * ```
 *
 * ## Why a registry rather than an `icon` prop on every call site
 *
 * A prop would work, but it moves the decision to ~500 call sites and loses the
 * thing an intent button exists for: that *every* delete button in the product
 * looks the same. Registering once keeps that guarantee while leaving the
 * artwork entirely with the host — which is what allows this package to stay
 * public and Apache-2.0 while HopperGuard uses a per-seat licensed icon set.
 *
 * A per-call-site `icon` prop still overrides, for the rare one-off.
 *
 * ## Nothing is required
 *
 * An unregistered intent renders no icon rather than throwing — a missing icon
 * should not take down a page. `missingIntentIcons()` exists so a host can
 * assert it registered the ones it uses, the same way
 * `requiredCssCustomProperties()` works for the token contract.
 */

/**
 * Every intent the shared buttons ask for.
 *
 * Named for what the button DOES, not what the glyph looks like — `delete`, not
 * `trash`. A host that maps `delete` to a broom is free to; the components only
 * care about the meaning.
 *
 * **Exactly the intents the shipped buttons use — no more.** `missingIntentIcons`
 * is only meaningful if this list means "what a host must register for the
 * components to draw"; padding it with intents nothing renders would make that
 * function report work nobody needs to do. `close`, `copy`, `favorite` and
 * `help` are absent for that reason: those buttons stayed in the app, because
 * each carries app state or a stateful toggle rather than being a plain intent.
 */
export const ICON_INTENTS = [
  "add",
  "analytics",
  "back",
  "cancel",
  "clone",
  "delete",
  // Dictation. Only used by the text inputs, and only when a host passes them
  // a `dictation` adapter — a product with no speech support registers neither
  // and never renders either.
  "dictate",
  "edit",
  "emoji",
  "home",
  "load",
  "menu",
  "new",
  "next",
  "play",
  "redo",
  "rename",
  "resume",
  "save",
  "settings",
  "url",
] as const;

export type IconIntent = (typeof ICON_INTENTS)[number];
export type IntentIcons = Partial<Record<IconIntent, React.ReactNode>>;

const IntentIconContext = createContext<IntentIcons>({});

export function IntentIconProvider({
  icons,
  children,
}: {
  icons: IntentIcons;
  children: React.ReactNode;
}) {
  return (
    <IntentIconContext.Provider value={icons}>
      {children}
    </IntentIconContext.Provider>
  );
}

/** The whole registry. Empty outside a provider — never throws. */
export function useIntentIcons(): IntentIcons {
  return useContext(IntentIconContext);
}

/** One icon, or `undefined` if the host did not register it. */
export function useIntentIcon(intent: IconIntent): React.ReactNode {
  return useIntentIcons()[intent];
}

/**
 * Intents a host has not registered.
 *
 * For a startup assertion or a test. A missing icon is silent by design — the
 * button still renders and still works — so this is the only way to notice.
 */
export function missingIntentIcons(icons: IntentIcons): IconIntent[] {
  return ICON_INTENTS.filter((intent) => icons[intent] === undefined);
}

"use client";

import React from "react";
import StyledButton, { type StyledButtonProps } from "./StyledButton";
import { useDensity } from "../config/style-config";
import { useIntentIcon, type IconIntent } from "../config/intent-icons";

/**
 * Builds an "intent button" — Save, Delete, Edit and the rest.
 *
 * Each is a `StyledButton` that already knows three things a caller would
 * otherwise repeat: which icon to draw, what the label says, and what the
 * spinner says while it works. The point is not to save typing; it is that
 * every Delete button in a product is the same Delete button.
 *
 * The icon comes from the **intent registry**, not from a prop, so this package
 * ships no artwork and each host supplies its own set — Font Awesome in
 * HopperGuard, Lucide in maximus-compliance. A per-call-site `icon` prop still
 * wins for the rare one-off.
 *
 * ## Compact density drops the label — and that used to lose the name
 *
 * At `compact`, these render icon-only. In the originating app that produced a
 * button with **no text and no `aria-label`**, so a screen reader announced it
 * as "button" — the same defect as NEH-226, except this one appeared and
 * disappeared with a user preference, which is worse: it passes review at
 * `normal` and fails for the user who chose `compact`.
 *
 * So when the label is hidden it becomes the accessible name. The visible text
 * and the announced name are the same string either way, which is the point of
 * WCAG 2.5.3 (Label in Name).
 */

export interface IntentButtonProps
  extends Omit<StyledButtonProps, "leftIcon" | "children"> {
  children?: React.ReactNode;
  /**
   * Force icon-only, or force the label on. Defaults to icon-only at `compact`
   * density.
   */
  iconOnly?: boolean;
  /** Override the registry for this one call site. */
  icon?: React.ReactNode;
}

export interface IntentButtonSpec {
  /** Component name — shows in React DevTools and stack traces. */
  displayName: string;
  /** Which registry entry to draw. */
  intent: IconIntent;
  /** Visible text, and the accessible name when the label is hidden. */
  defaultLabel: string;
  /** What the spinner says while `loading`. Prefer naming the action. */
  loadText?: string;
  /**
   * Default hover/focus explanation.
   *
   * Deliberately more than the label repeated: "Delete" is the label, "Delete
   * the item" is what the tooltip adds. A caller's own `tooltip` overrides.
   */
  tooltip?: string;
}

export function createIntentButton({
  displayName,
  intent,
  defaultLabel,
  loadText,
  tooltip: defaultTooltip,
}: IntentButtonSpec) {
  const IntentButton = React.forwardRef<HTMLButtonElement, IntentButtonProps>(
    function IntentButton(
      { children = defaultLabel, iconOnly, icon, tooltip = defaultTooltip, ...props },
      ref,
    ) {
      const density = useDensity();
      const registered = useIntentIcon(intent);
      const glyph = icon ?? registered;

      const isIconOnly = iconOnly ?? density === "compact";

      // The label as a string, for the accessible name. A node child cannot be
      // flattened reliably, so fall back to the intent's own label rather than
      // rendering `[object Object]` into aria-label.
      const label = typeof children === "string" ? children : defaultLabel;

      if (isIconOnly) {
        return (
          <StyledButton
            ref={ref}
            loadText={loadText}
            // Without this the button has no text and no name at all — see the
            // note above. An explicit aria-label from the caller still wins,
            // because `props` is spread after.
            aria-label={label}
            tooltip={tooltip}
            {...props}
          >
            {glyph}
          </StyledButton>
        );
      }

      return (
        <StyledButton
          ref={ref}
          loadText={loadText}
          leftIcon={glyph}
          tooltip={tooltip}
          {...props}
        >
          {children}
        </StyledButton>
      );
    },
  );

  IntentButton.displayName = displayName;
  return IntentButton;
}

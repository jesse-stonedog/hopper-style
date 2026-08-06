"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import { formRecipe } from "styled-system/recipes";
import { useResolvedVariant } from "../config/style-config";
import { log } from "../config/logger";
import StyledFormLabel from "./StyledFormLabel";

/**
 * A group of related form controls, with a visible name.
 *
 * The `<fieldset>`/`<legend>` pair is the only markup that gives a *group* an
 * accessible name. Assistive tech announces the legend when focus enters the
 * group and, for radios in particular, that legend is the question the options
 * are answering — without it a screen reader meets "Yes / No" with no idea what
 * is being asked. That is the reason to reach for this rather than a heading
 * above a `<div>`, which looks identical and carries none of it.
 *
 * ```tsx
 * <StyledFieldset>
 *   <StyledFieldset.Legend>Contact preferences</StyledFieldset.Legend>
 *   <StyledFieldset.Content>
 *     <StyledFieldset.Field>
 *       <StyledFieldset.Label htmlFor="email">Email</StyledFieldset.Label>
 *       <StyledFieldset.Value><input id="email" /></StyledFieldset.Value>
 *     </StyledFieldset.Field>
 *   </StyledFieldset.Content>
 * </StyledFieldset>
 * ```
 *
 * ## Two defects fixed on the way across
 *
 * **No variant meant no styling at all.** The root read
 * `variant ? formRecipe({ variant }) : ""` — so a fieldset rendered without an
 * explicit `variant` prop got an empty class string: no surface, no border, no
 * padding, and no response to the app-wide appearance. Every other component in
 * this package treats an absent variant as "follow the app", and 18 HopperGuard
 * call sites were relying on a default that silently did nothing.
 *
 * It resolves through `useResolvedVariant` now, so an unset variant follows the
 * host's configuration and an unrecognised one falls back to `solid` rather
 * than to nothing. **This visibly changes existing fieldsets** — they gain the
 * surface they were always supposed to have, which is why it is called out here
 * rather than buried in the move.
 *
 * **`Label` was a second, divergent form label.** It was a bare `<label>` with
 * `display: block` and a margin — no colour token, no font-size profile, and no
 * `required`/`optional` markers. `StyledFormLabel` in this same package handles
 * all four, and having two labels in one design system is precisely how a
 * product ends up with form rows that do not match each other. `Label` now
 * delegates to it, so a field inside a fieldset and a field outside one are the
 * same control.
 *
 * The DOM shape is unchanged — both render a `<label>` — but the label now
 * follows the user's text-size setting, which it did not before.
 */

const PandaFieldsetLegend = styled("legend", {
  base: { fontWeight: "bold", paddingX: "0.5rem" },
});
const PandaFieldsetContent = styled("div", { base: { marginTop: "1rem" } });
const PandaFieldsetField = styled("div", {
  base: { width: "100%", marginBottom: "1rem" },
});
const PandaFieldsetValue = styled("div");

/** The appearances `formRecipe` defines. */
export const FIELDSET_VARIANTS = [
  "solid",
  "outline",
  "lines",
  "aurora",
  "glass",
  "matte",
  "none",
  "unstyled",
] as const;

export type FieldsetVariant = (typeof FIELDSET_VARIANTS)[number];

export type StyledFieldsetProps = React.ComponentProps<"fieldset"> & {
  /**
   * `| undefined` is spelled out because the repo runs
   * `exactOptionalPropertyTypes`: without it a caller holding a possibly-unset
   * variant cannot forward it, even though "unset" is exactly the case this
   * component handles by following the app.
   */
  variant?: FieldsetVariant | undefined;
};

const StyledFieldsetRoot = React.forwardRef<
  HTMLFieldSetElement,
  StyledFieldsetProps
>(({ children, variant, className, ...props }, ref) => {
  log.trace("StyledFieldset.Root rendered");

  const resolved = useResolvedVariant(variant, FIELDSET_VARIANTS);

  return (
    <fieldset
      ref={ref}
      className={[formRecipe({ variant: resolved }), className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </fieldset>
  );
});
StyledFieldsetRoot.displayName = "StyledFieldset.Root";

const StyledFieldsetLegend = React.forwardRef<
  HTMLLegendElement,
  React.ComponentProps<typeof PandaFieldsetLegend>
>((props, ref) => <PandaFieldsetLegend ref={ref} {...props} />);
StyledFieldsetLegend.displayName = "StyledFieldset.Legend";

const StyledFieldsetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof PandaFieldsetContent>
>((props, ref) => <PandaFieldsetContent ref={ref} {...props} />);
StyledFieldsetContent.displayName = "StyledFieldset.Content";

const StyledFieldsetField = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof PandaFieldsetField>
>((props, ref) => <PandaFieldsetField ref={ref} {...props} />);
StyledFieldsetField.displayName = "StyledFieldset.Field";

const StyledFieldsetValue = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof PandaFieldsetValue>
>((props, ref) => <PandaFieldsetValue ref={ref} {...props} />);
StyledFieldsetValue.displayName = "StyledFieldset.Value";

interface StyledFieldsetComponentType
  extends React.ForwardRefExoticComponent<
    StyledFieldsetProps & React.RefAttributes<HTMLFieldSetElement>
  > {
  Legend: typeof StyledFieldsetLegend;
  Content: typeof StyledFieldsetContent;
  Field: typeof StyledFieldsetField;
  /** `StyledFormLabel` — the same label used outside a fieldset. */
  Label: typeof StyledFormLabel;
  Value: typeof StyledFieldsetValue;
}

const StyledFieldset = StyledFieldsetRoot as StyledFieldsetComponentType;
StyledFieldset.Legend = StyledFieldsetLegend;
StyledFieldset.Content = StyledFieldsetContent;
StyledFieldset.Field = StyledFieldsetField;
StyledFieldset.Label = StyledFormLabel;
StyledFieldset.Value = StyledFieldsetValue;

export default StyledFieldset;

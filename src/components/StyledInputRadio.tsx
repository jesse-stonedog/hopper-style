"use client";

import React from "react";
import { inputRadioRootRecipe } from "styled-system/recipes";
import { useResolvedVariant } from "../config/style-config";

/**
 * A group of radio buttons — pick exactly one.
 *
 * Reach for this over a set of checkboxes when the options are mutually
 * exclusive, and over a select when there are few enough to show at once.
 * Radios put every choice in front of the reader, which matters most for
 * someone who finds a dropdown's hidden list hard to hold in mind.
 *
 * ## It is announced as a group (NEH-167)
 *
 * The originating version rendered bare labelled inputs. A shared `name` makes
 * the browser treat them as one group for arrow-key navigation, so it *worked*
 * — but nothing named the group, so a screen reader announced three unrelated
 * radios and never said what the choice was about. `role="radiogroup"` plus a
 * `label` fixes that, and the label is the one prop worth insisting on here.
 *
 * ## Two API repairs
 *
 * **`renderItem` is optional now.** It was required, and every call site passed
 * `(item) => item.label` — the identity function, written out. `RadioItem`
 * already carries a label, so that is the default; pass `renderItem` only when
 * an option needs more than its text (a price, a badge, a description).
 *
 * **The ref no longer goes to the inputs.** It was assigned inside the item
 * loop, so each item overwrote the last and a caller got a handle on the final
 * radio rather than the group or the selection — reliably the wrong element.
 * It now points at the group container. Nothing was using it.
 *
 * The container is a plain `<div>` rather than `StyledBox`, which is what the
 * original used. `StyledBox` wraps its children in an inner element unless told
 * not to, and that element would sit between the `radiogroup` and its radios —
 * a group whose children are not its children is exactly the shape assistive
 * tech mis-reports. The recipe's `root` slot supplies the layout either way.
 */

export interface RadioItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface StyledInputRadioProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: RadioItem[];
  /** Optional custom rendering. Defaults to the item's own label. */
  renderItem?: (item: RadioItem) => React.ReactNode;
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: RadioVariant;
  size?: "sm" | "md" | "lg";
  /**
   * What the choice is about — "Billing cycle", not "Monthly". Without it the
   * group has no accessible name. Use `aria-labelledby` instead when a visible
   * heading already says it.
   */
  label?: string;
}

/** What `inputRadioRootRecipe` defines. */
export const RADIO_VARIANTS = [
  "none",
  "outline",
  "solid",
  "aurora",
  "glass",
  "matte",
  "ghost",
] as const;

export type RadioVariant = (typeof RADIO_VARIANTS)[number];

const StyledInputRadio = React.forwardRef<HTMLDivElement, StyledInputRadioProps>(
  function StyledInputRadio(
    { items, renderItem, name, value, onChange, variant, size, label, ...props },
    ref,
  ) {
    const resolved = useResolvedVariant(variant, RADIO_VARIANTS);
    const { root, item, input, control, indicator } = inputRadioRootRecipe({
      variant: resolved,
      ...(size ? { size } : {}),
    });

    const id = React.useId();

    return (
      <div
        ref={ref}
        role="radiogroup"
        {...(label ? { "aria-label": label } : {})}
        {...props}
        className={root}
      >
        {items.map((radio, index) => {
          // The value can be anything, including whitespace, so it is not safe
          // as an id on its own. Index keeps it unique even for duplicates.
          const safeValue = (radio.value || "unknown").toString().replace(/\s+/g, "_");
          const inputId = `${id}-${index}-${safeValue}`;

          return (
            <label
              key={inputId}
              htmlFor={inputId}
              className={item}
              // The transparent input is absolutely positioned, so its label
              // has to be the containing block or it lands somewhere else on
              // the page entirely.
              style={{ position: "relative" }}
              data-checked={value === radio.value ? "" : undefined}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={radio.value}
                checked={value === radio.value}
                disabled={radio.disabled}
                onChange={onChange}
                className={input}
              />
              <div className={control}>
                <div className={indicator} />
              </div>
              {renderItem ? renderItem(radio) : radio.label}
            </label>
          );
        })}
      </div>
    );
  },
);

StyledInputRadio.displayName = "StyledInputRadio";

export default StyledInputRadio;

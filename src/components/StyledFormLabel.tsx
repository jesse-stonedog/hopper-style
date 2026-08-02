"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

/**
 * The label above a form control.
 *
 * Clicking it focuses the control, which is most of the point: it turns a
 * 14×14px checkbox into a target the size of its own text, and that is the
 * difference between usable and not for anyone with a tremor. Always pass
 * `htmlFor` — without it the association is lost and so is the tap target.
 *
 * ## Three hardcoded colours were fixed on the way in
 *
 * The originating version painted itself with literals — a dark grey label, a
 * `#e53e3e` required asterisk, a `#888` "(optional)". Each looks right on a
 * light theme and wrong on every other, and none of them respond to dark mode
 * or a high-contrast theme at all. They are now `textPrimary`, `textError` and
 * `textSecondary`, which is the same defect class as NEH-165/166/171.
 *
 * The label colour was the interesting one. It read
 * `var(--chakra-colors-gray-700, #2D3748)` — a **Chakra** custom property, in
 * an app that finished removing Chakra. Nothing had defined that property for
 * some time, so every label in the product was silently painted by the
 * fallback. It was invisible because it *worked*: the fallback is a reasonable
 * grey, so nothing looked broken, and the label simply sat outside theming.
 *
 * ## `required` and `optional` are not symmetric, deliberately
 *
 * `optional` renders visible text, because "(optional)" is information the
 * reader needs and there is no other channel carrying it.
 *
 * `required` renders an asterisk marked `aria-hidden`. That is correct **only
 * when the control itself is `required` or `aria-required`** — then assistive
 * tech announces the requirement from the input, and an announced "star" on top
 * of it is noise. If your control does not set that attribute, the asterisk is
 * decoration and screen-reader users are told nothing, so set it. This is the
 * one thing about this component worth checking at a call site.
 */

const PandaFormLabel = styled("label", {
  base: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "textPrimary",
    // Deliberately kept, though it is arguably wrong: a fixed 1rem means the
    // label ignores the app-wide font-size profile, so in a product tuned up
    // for low-vision readers the label stays small while its own field grows.
    // Left as-is because removing it resizes every label in every existing
    // consumer with nothing failing anywhere — the change wants its own PR and
    // someone actually looking at the result. Tracked in NEH-233.
    fontSize: "1rem",
    lineHeight: "1.25",
    cursor: "pointer",
  },
});

export interface StyledFormLabelProps extends HTMLStyledProps<"label"> {
  children: React.ReactNode;
  /** The `id` of the control this labels. Pass it — see above. */
  htmlFor?: string;
  /** Append a muted "(optional)". */
  optional?: boolean;
  /** Append a red asterisk. Mark the control `required` too — see above. */
  required?: boolean;
}

const StyledFormLabel: React.FC<StyledFormLabelProps> = ({
  children,
  htmlFor,
  optional,
  required,
  ...props
}) => (
  <PandaFormLabel htmlFor={htmlFor} {...props}>
    {children}
    {required && (
      <styled.span color="textError" marginLeft="0.25em" aria-hidden="true">
        *
      </styled.span>
    )}
    {optional && (
      <>
        {/* A real space, not a margin. The margin separated the words visually
            but not in the accessible name, which came out "Middle
            name(optional)" — the space has to be a text node to be announced. */}{" "}
        <styled.span fontWeight="normal" color="textSecondary" fontSize="0.95em">
          (optional)
        </styled.span>
      </>
    )}
  </PandaFormLabel>
);

StyledFormLabel.displayName = "StyledFormLabel";

export default StyledFormLabel;

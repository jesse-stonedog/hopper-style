"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";
import { useFontSizeProfile } from "../config/style-config";
import { fontSizeMap } from "../config/font-size";

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
 * ## It follows the app-wide text size (NEH-233)
 *
 * The label used to declare a flat `fontSize: "1rem"`, which opted it out of
 * the type scale. In a product whose default body text is 1.375rem that made
 * the label the *smaller* text — the caption under its own field — and, worse,
 * it did not move when a user raised their text-size setting. That setting is
 * the accommodation a low-vision reader actually reaches for, so a control
 * ignoring it is ignoring them.
 *
 * It now reads the profile the same way `StyledText` does. Note that plain
 * inheritance would NOT have worked: nothing puts a font size on the DOM, so
 * dropping the declaration just pinned the label to the browser's 16px — still
 * fixed, and no longer even declared. The profile has to be read.
 *
 * Callers wanting a specific size still pass `fontSize`, which wins. That is
 * the right way round: the deviation is visible at the call site instead of
 * baked into every label in every consumer.
 *
 * **This visibly resizes existing labels** — that was the whole reason it was
 * split out of the migration rather than smuggled into it.
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
    // No fontSize — the label inherits, so it follows the app-wide text size.
    // See the NEH-233 note above.
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
  fontSize,
  style,
  ...props
}) => {
  // Unconditional, at the top: inlining this into the expression below reads
  // fine and is a hooks-order violation the moment `fontSize` is passed.
  const profile = useFontSizeProfile();

  // An inline style, not a Panda prop — and this is the part that is easy to
  // get wrong twice. Panda extracts styles by parsing source at BUILD time, so
  // a prop whose value is only known at runtime produces a class name with no
  // rule behind it: the element renders at the browser default and nothing
  // errors. `StyledText` reaches for an inline style for exactly this reason.
  //
  // Applied only when the caller named no size, so their Panda `fontSize` class
  // is not beaten by an inline declaration.
  const sized = fontSize ? undefined : fontSizeMap[profile] ?? fontSizeMap.md;

  return (
  <PandaFormLabel
    htmlFor={htmlFor}
    fontSize={fontSize}
    style={{ ...(sized ? { fontSize: sized } : {}), ...style }}
    {...props}
  >
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
};

StyledFormLabel.displayName = "StyledFormLabel";

export default StyledFormLabel;

"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";
import { inputTextRecipe } from "styled-system/recipes";
import { useFontSizeProfile, useResolvedVariant } from "../config/style-config";
import { fontSizeMap } from "../config/font-size";
import DictationControls, { dictationPadding } from "./DictationControls";
import DictationPrompt from "./DictationPrompt";
import type { Dictation } from "./dictation";

/**
 * A single-line text field.
 *
 * Sized from the app-wide font-size profile rather than the browser default,
 * which matters more here than almost anywhere else: a field the user cannot
 * read is a field they cannot check before submitting.
 *
 * ## Dictation is supplied, never implemented
 *
 * Pass a `dictation` adapter and the field grows a microphone; omit it and the
 * field is exactly a field. This package holds no speech code — see
 * `dictation.ts` for why that seam is where it is.
 *
 * The originating component decided for itself whether a mic belonged, from a
 * feature flag, the input's `type`, and a "context" that also chose between a
 * browser engine and AWS Transcribe for PHI. All of that is product policy with
 * regulatory weight, and none of it survived the move — the host decides, and
 * says so by passing an adapter or not.
 *
 * That inverts one behaviour worth naming: the old component auto-enabled a mic
 * for any user with the feature flag, so opting a field OUT meant remembering
 * `showMic={false}`. A field that should never be dictated into — a PIN, a card
 * number — was one forgotten prop away from having a microphone. Now silence is
 * the default and dictation is the deliberate act.
 */

const PandaInput = styled("input", inputTextRecipe);

export interface StyledInputTextProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "color" | "content" | "height" | "translate" | "width" | "size"
    >,
    Omit<HTMLStyledProps<"input">, "size"> {
  ["data-testid"]?: string;
  variant?: InputTextVariant;
  isReadOnly?: boolean;
  size?: string | number;
  /**
   * Host-supplied dictation. Omit for no microphone — which is most fields.
   */
  dictation?: Dictation;
  /** Accessible name for the mic button. */
  micLabel?: string;
  /** Accessible name for the redo button. */
  redoLabel?: string;
  /** Wording for the "add or replace?" prompt a second recording raises. */
  continueQuestion?: string;
  continueLabel?: string;
  startOverLabel?: string;
}

/**
 * What `inputTextRecipe` defines. Wider than the five appearances selectable
 * app-wide, so it is passed to `useResolvedVariant` explicitly — otherwise
 * `ghost` and `none` are silently coerced to `solid`.
 */
export const INPUT_TEXT_VARIANTS = [
  "solid",
  "outline",
  "aurora",
  "glass",
  "matte",
  "ghost",
  "none",
] as const;

export type InputTextVariant = (typeof INPUT_TEXT_VARIANTS)[number];

const StyledInputText = React.forwardRef<HTMLInputElement, StyledInputTextProps>(
  function StyledInputText(
    {
      variant,
      isReadOnly,
      size: _size,
      style,
      dictation,
      micLabel = "Dictate",
      redoLabel = "Record again",
      continueQuestion = "Add to what you already wrote?",
      continueLabel = "Continue",
      startOverLabel = "Start over",
      ...props
    },
    ref,
  ) {
    const resolved = useResolvedVariant(variant, INPUT_TEXT_VARIANTS);
    const fontSize = fontSizeMap[useFontSizeProfile()] ?? fontSizeMap.md;
    const padding = dictationPadding(dictation);

    const field = (
      <PandaInput
        ref={ref}
        variant={resolved}
        data-testid={props["data-testid"]}
        readOnly={isReadOnly}
        style={{
          fontSize,
          // Reserve room so the value does not run underneath the buttons.
          ...(padding ? { paddingRight: padding } : {}),
          ...style,
        }}
        {...props}
      />
    );

    if (!dictation) return field;

    return (
      <>
        <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
          {field}
          <DictationControls
            dictation={dictation}
            micLabel={micLabel}
            redoLabel={redoLabel}
          />
        </div>
        {/* Below the field, outside the positioned wrapper — it is a question,
            not an affordance. */}
        <DictationPrompt
          dictation={dictation}
          question={continueQuestion}
          continueLabel={continueLabel}
          startOverLabel={startOverLabel}
        />
      </>
    );
  },
);

StyledInputText.displayName = "StyledInputText";

export default StyledInputText;

"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";
import { inputTextRecipe } from "styled-system/recipes";
import { useFontSizeProfile, useResolvedVariant } from "../config/style-config";
import { fontSizeMap } from "../config/font-size";
import DictationControls, { dictationPadding } from "./DictationControls";
import { INPUT_TEXT_VARIANTS, type InputTextVariant } from "./StyledInputText";
import type { Dictation } from "./dictation";

/**
 * A multi-line text field. `StyledInputText`'s sibling, sharing its recipe and
 * its dictation seam — read that file first; the reasoning is the same.
 *
 * The one deliberate difference is where the buttons sit. On a single-line
 * field they centre vertically, because there is only one line to centre
 * against. Here they pin to the **top**: a textarea grows, and a
 * vertically-centred button would drift down the field as the user typed,
 * ending up beside the middle of their text with no relationship to anything.
 *
 * Dictation matters more here than on the single-line field. Long-form entry is
 * where typing is most tiring, so this is the control an arthritic or tremoring
 * user is most likely to want — which is also why the buttons keep their full
 * 44×44 target rather than shrinking to stay out of the way.
 */

const PandaTextArea = styled("textarea", inputTextRecipe);

export interface StyledInputTextAreaProps
  extends Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "color" | "content" | "translate"
    >,
    HTMLStyledProps<"textarea"> {
  ["data-testid"]?: string;
  variant?: InputTextVariant;
  isReadOnly?: boolean;
  /** Host-supplied dictation. Omit for no microphone. */
  dictation?: Dictation;
  micLabel?: string;
  redoLabel?: string;
}

const StyledInputTextArea = React.forwardRef<
  HTMLTextAreaElement,
  StyledInputTextAreaProps
>(function StyledInputTextArea(
  {
    variant,
    isReadOnly,
    style,
    dictation,
    micLabel = "Dictate",
    redoLabel = "Record again",
    ...props
  },
  ref,
) {
  const resolved = useResolvedVariant(variant, INPUT_TEXT_VARIANTS);
  const fontSize = fontSizeMap[useFontSizeProfile()] ?? fontSizeMap.md;
  const padding = dictationPadding(dictation);

  const field = (
    <PandaTextArea
      ref={ref}
      variant={resolved}
      data-testid={props["data-testid"]}
      readOnly={isReadOnly}
      style={{
        fontSize,
        ...(padding ? { paddingRight: padding } : {}),
        ...style,
      }}
      {...props}
    />
  );

  if (!dictation) return field;

  return (
    <div
      style={{ position: "relative", display: "inline-block", width: "100%" }}
      // Pins the controls to the top of a growing field — see above.
      data-dictation-anchor="top"
    >
      {field}
      <DictationControls
        dictation={dictation}
        micLabel={micLabel}
        redoLabel={redoLabel}
        anchor="top"
      />
    </div>
  );
});

StyledInputTextArea.displayName = "StyledInputTextArea";

export default StyledInputTextArea;

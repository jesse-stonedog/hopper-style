"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import { useIntentIcon } from "../config/intent-icons";
import type { Dictation } from "./dictation";

/**
 * The mic (and optional redo) buttons that sit inside a dictatable field.
 *
 * Shared by `StyledInputText` and `StyledInputTextArea` so the two cannot
 * drift — they had already drifted in the app this came from, where only one
 * of them offered redo.
 *
 * ## Accessibility, which is most of what this component is
 *
 * - **`aria-pressed`, not a label that changes.** A toggle whose name flips
 *   between "Dictate" and "Stop" reads as a different control each time and
 *   breaks voice input ("click Dictate" stops matching once recording starts).
 *   The name stays put; the state is what changes.
 * - **Recording is not signalled by colour alone.** Colour drives the icon,
 *   `aria-pressed` drives assistive tech, and the two together mean the state
 *   survives both a screen reader and achromatopsia.
 * - **44×44 minimum.** These sit inside a field and the temptation is to make
 *   them small enough not to crowd the text. The floor wins; the field gets
 *   padding instead.
 */

export interface DictationControlsProps {
  dictation: Dictation;
  /** Accessible name for the mic. */
  micLabel: string;
  /** Accessible name for redo. */
  redoLabel: string;
  /**
   * Where the buttons sit vertically.
   *
   * `center` for a single-line field. `top` for a textarea, which grows — a
   * centred button would drift down the field as the user typed and end up
   * beside the middle of their text.
   */
  anchor?: "center" | "top";
}

/** Room the field must leave on its trailing edge so text clears the buttons. */
export function dictationPadding(dictation: Dictation | undefined): string | undefined {
  if (!dictation?.isSupported) return undefined;
  return dictation.showRedo ? "5.5em" : "3.5em";
}

const ControlButton = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    // WCAG 2.5.5. Non-negotiable even though these live inside a field —
    // the field pads itself to make room rather than shrinking them.
    minWidth: "48px",
    minHeight: "48px",
    background: "transparent",
    border: "none",
    padding: "0.25em",
    cursor: "pointer",
    lineHeight: "0",
    borderRadius: "md",
    color: "textPrimary",
    _hover: { color: "textAccent" },
  },
  variants: {
    recording: {
      // A token, not `var(--colors-red-500, #e53e3e)` as the originating code
      // had — that namespace is undefined under every prefix, so the literal
      // always won and the recording state ignored the theme entirely.
      true: { color: "textError" },
    },
  },
});

export default function DictationControls({
  dictation,
  micLabel,
  redoLabel,
  anchor = "center",
}: DictationControlsProps) {
  const micIcon = useIntentIcon("dictate");
  const redoIcon = useIntentIcon("redo");

  if (!dictation.isSupported) return null;

  const vertical: React.CSSProperties =
    anchor === "top"
      ? { top: "0.25em" }
      : { top: "50%", transform: "translateY(-50%)" };

  // ONE absolutely-positioned row, not two independently-offset buttons.
  //
  // The first version gave each button its own `right` offset — `3em` and
  // `0.25em` — and they overlapped by 7px at every viewport. `em` resolves
  // against inherited font size, so the gap between two 44px buttons was
  // expressed in a unit with no relationship to 44px, and any change to the
  // surrounding type scale would have moved them again. Flex owns the gap now
  // and the arithmetic is gone.
  //
  // Redo comes first in DOM order, so it sits inboard and the mic stays on the
  // edge where the user learned it — and tab order matches reading order.
  return (
    <div
      style={{
        position: "absolute",
        right: "0.25em",
        display: "flex",
        alignItems: "center",
        gap: "0.25em",
        ...vertical,
      }}
    >
      {/* Suppressed while the continue prompt is up — see `Dictation`. */}
      {dictation.showRedo && dictation.redo && !dictation.continuePrompt && (
        <ControlButton
          type="button"
          aria-label={redoLabel}
          data-testid="dictation-redo"
          onClick={dictation.redo}
        >
          {redoIcon}
        </ControlButton>
      )}
      <ControlButton
        type="button"
        aria-label={micLabel}
        // The name is constant and the STATE changes — see the note above.
        aria-pressed={dictation.isListening}
        recording={dictation.isListening}
        data-testid="dictation-mic"
        onClick={dictation.onMicClick}
      >
        {micIcon}
      </ControlButton>
    </div>
  );
}

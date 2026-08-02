"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import StyledButton from "./StyledButton";
import StyledText from "./StyledText";
import type { Dictation } from "./dictation";

/**
 * "Add to what you already wrote?" — the choice a second recording forces.
 *
 * Renders **below** the field, not inside it, and that is the whole design.
 * The mic and redo buttons are affordances: small, in the corner, ignorable.
 * This is a question with two answers and a wrong one that destroys work, so it
 * takes up room, sits in the reading path, and does not go away on its own.
 *
 * It exists because the alternative is guessing. A user who dictates a
 * paragraph, stops, thinks, and presses the mic again has not told anyone
 * whether they meant to add or replace — and silently replacing is a data-loss
 * bug wearing the costume of a UX preference.
 *
 * Announced as a `group` with an accessible name rather than a live region: it
 * appears in response to the user's own action, so they are already attending
 * to it, and an alert would interrupt a screen reader mid-sentence for
 * something they just asked for.
 */

export interface DictationPromptProps {
  dictation: Dictation;
  question: string;
  continueLabel: string;
  startOverLabel: string;
}

const PromptRow = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "2",
    marginTop: "2",
  },
});

export default function DictationPrompt({
  dictation,
  question,
  continueLabel,
  startOverLabel,
}: DictationPromptProps) {
  if (!dictation.continuePrompt) return null;
  if (!dictation.chooseContinue || !dictation.chooseStartOver) return null;

  return (
    <PromptRow role="group" aria-label={question} data-testid="dictation-continue-prompt">
      <StyledText>{question}</StyledText>
      {/* Real buttons, not bare styled elements — they inherit the 44px floor
          and the theme like every other control. Continue comes first because
          it is the non-destructive answer. */}
      <StyledButton
        type="button"
        variant="outline"
        data-testid="dictation-continue"
        onClick={dictation.chooseContinue}
      >
        {continueLabel}
      </StyledButton>
      <StyledButton
        type="button"
        variant="ghost"
        data-testid="dictation-start-over"
        onClick={dictation.chooseStartOver}
      >
        {startOverLabel}
      </StyledButton>
    </PromptRow>
  );
}

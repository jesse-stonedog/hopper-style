import React from "react";
import StyledFormLabel from "./StyledFormLabel";
import StyledText from "./StyledText";
import { HopperStyleProvider } from "../config/style-config";

/**
 * Mount targets for `StyledFormLabel.ct.tsx` (NEH-233).
 *
 * Separate module because Playwright resolves a mounted component by import,
 * and both fixtures put two things in ONE tree because a spec may only mount
 * once.
 */

/** The same label under two text-size profiles. */
export function SizedLabels() {
  return (
    <div>
      <HopperStyleProvider fontSizeProfile="sm">
        <StyledFormLabel data-testid="label-sm">Email address</StyledFormLabel>
      </HopperStyleProvider>
      <HopperStyleProvider fontSizeProfile="xl">
        <StyledFormLabel data-testid="label-xl">Email address</StyledFormLabel>
      </HopperStyleProvider>
    </div>
  );
}

/** A label next to ordinary body text, at the large default profile. */
export function LabelBesideText() {
  return (
    <HopperStyleProvider fontSizeProfile="md">
      <div>
        <StyledFormLabel data-testid="label">Email address</StyledFormLabel>
        <StyledText data-testid="body">We only use this to reach you.</StyledText>
      </div>
    </HopperStyleProvider>
  );
}

"use client";

import React from "react";
import StyledBox from "./StyledBox";
import StyledHStack from "./StyledHStack";
import StyledText from "./StyledText";

/**
 * A range slider with optional end labels and a live readout.
 *
 * The end labels are the reason to reach for this over a bare `<input
 * type="range">`: a slider with no anchors is a guess, and "Quiet"/"Loud" at
 * the ends costs nothing and tells the reader what the axis means.
 *
 * ## Two things were fixed on the way in
 *
 * **Fractional steps were being truncated.** The change handler ran
 * `parseInt(value, 10)`, so `step={0.5}` produced 2 where the user had chosen
 * 2.5 — the thumb would snap back as the value round-tripped. Now `Number`,
 * which reads the whole value. Callers on integer steps are unaffected.
 *
 * **The slider had no accessible name.** The visible readout is a separate
 * `<StyledText>`, so a screen reader met an unlabelled "slider, 40". When
 * `currentLabel` is set it now names the control too, which is nearly always
 * what the caller meant; an explicit `aria-label` or `aria-labelledby` wins.
 */

export interface StyledInputSliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "min" | "max" | "step" | "type"
  > {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Text at the low end of the track. */
  minLabel?: string;
  /** Text at the high end. */
  maxLabel?: string;
  /** Names the quantity — rendered as "`currentLabel`: value" beneath. */
  currentLabel?: string;
}

const StyledInputSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  currentLabel,
  ...props
}: StyledInputSliderProps) => (
  <StyledBox noWrap>
    <StyledHStack justifyContent="space-between" alignItems="center">
      {minLabel && <StyledText>{minLabel}</StyledText>}
      <input
        type="range"
        value={value}
        // `Number`, not `parseInt` — see above.
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        aria-label={currentLabel}
        {...props}
      />
      {maxLabel && <StyledText>{maxLabel}</StyledText>}
    </StyledHStack>
    {currentLabel && (
      <StyledText textAlign="center" mt={2}>
        {currentLabel}: {value}
      </StyledText>
    )}
  </StyledBox>
);

StyledInputSlider.displayName = "StyledInputSlider";

export default StyledInputSlider;

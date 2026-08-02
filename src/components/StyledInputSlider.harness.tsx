import React from "react";
import StyledInputSlider, { type StyledInputSliderProps } from "./StyledInputSlider";

/**
 * A controlled wrapper for `StyledInputSlider.ct.tsx`.
 *
 * Two reasons it exists, and neither is optional:
 *
 * 1. **The slider is controlled.** Mounted with a fixed `value` it cannot move,
 *    so a keyboard test would assert nothing. State has to live somewhere.
 * 2. **It has to be in its own module.** Playwright's component testing hands
 *    the mount call to Vite, which resolves the component by import — so a
 *    component *defined inside the spec file* fails at runtime with
 *    `Component "Harness" cannot be mounted`, not at compile time.
 *
 * Not exported from the package: it is test scaffolding.
 */
export function SliderHarness({
  initial = 50,
  ...props
}: Omit<StyledInputSliderProps, "value" | "onChange"> & { initial?: number }) {
  const [value, setValue] = React.useState(initial);
  return <StyledInputSlider value={value} onChange={setValue} {...props} />;
}

export default SliderHarness;

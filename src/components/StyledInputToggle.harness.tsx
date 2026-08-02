import React from "react";
import StyledInputToggle from "./StyledInputToggle";

/** Mount targets for StyledInputToggle.ct.tsx. */

export function ToggleHarness({
  initial = false,
  disabled = false,
  withIcon = false,
}: {
  initial?: boolean;
  disabled?: boolean;
  withIcon?: boolean;
}) {
  const [value, setValue] = React.useState(initial);
  return (
    <StyledInputToggle
      value={value}
      onChange={setValue}
      label="Notifications"
      disabled={disabled}
      {...(withIcon
        ? {
            iconOn: <svg width="20" height="20" data-testid="icon" />,
            iconOff: <svg width="20" height="20" data-testid="icon" />,
          }
        : {})}
    />
  );
}

export default ToggleHarness;

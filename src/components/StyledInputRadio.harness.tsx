import React from "react";
import StyledInputRadio from "./StyledInputRadio";

/** Mount target for StyledInputRadio.ct.tsx. */
export function RadioHarness({ long = false }: { long?: boolean }) {
  const [value, setValue] = React.useState("monthly");
  return (
    <div style={{ width: "100%" }}>
      <StyledInputRadio
        name="cycle"
        label="Billing cycle"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        items={
          long
            ? [
                { value: "monthly", label: "Bill me every month, cancel any time" },
                { value: "yearly", label: "Bill me once a year and save twenty percent" },
              ]
            : [
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]
        }
      />
    </div>
  );
}

export default RadioHarness;

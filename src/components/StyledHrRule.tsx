"use client";

import { log } from "../config/logger";
import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

/**
 * Modern styled `<hr>` — a thin horizontal rule with a subtle gradient
 * fade to transparent at each end. Inherits Panda style props so callers
 * can override `borderColor`, `my`, `opacity`, etc. as needed.
 */
const PandaHr = styled("hr", {
  base: {
    border: "0",
    height: "1px",
    width: "100%",
    margin: "0",

    opacity: 0.85,
  },
});

export type StyledHrRuleProps = HTMLStyledProps<"hr">;

export const StyledHrRule = React.forwardRef<HTMLHRElement, StyledHrRuleProps>(
  function StyledHrRule(props, ref) {
    log.trace("StyledHrRule rendered");
    return <PandaHr bg="boxBgSecondary" ref={ref} role="separator" {...props} />;
  },
);

export default StyledHrRule;

"use client";

import { log } from "../config/logger";
import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

const PandaScrollBox = styled("div", {
  base: {
    overflow: "auto",
    minHeight: 0,
    flex: "1",
    display: "flex",
    paddingRight: "0.5rem",
    flexDirection: "column",
    scrollbarWidth: "thick",
    // Via the token, not a literal `var(--hopper-…)`: the custom-property
    // prefix is configurable per consumer (see the preset), so a hardcoded
    // namespace paints nothing for any host that picked a different one.
    scrollbarColor: "{colors.boxBgSecondary} transparent",
  },
});

export interface StyledScrollbarProps extends HTMLStyledProps<"div"> {
  border?: string | number;
}

const StyledScrollbar: React.FC<StyledScrollbarProps> = ({
  children,
  border,
  ...rest
}) => {
  log.trace("StyledScrollbar rendered");
  const extraStyles: React.CSSProperties = {};
  if (border !== undefined) {
    if (border === "none" || border === "0") {
      extraStyles.borderWidth = "5px";
      extraStyles.borderStyle = "none";
      extraStyles.borderRadius = "0";
    }
  }
  return (
    <PandaScrollBox
      data-testid="styled-scrollbar"
      style={extraStyles}
      {...rest}
    >
      {children}
    </PandaScrollBox>
  );
};

export default StyledScrollbar;

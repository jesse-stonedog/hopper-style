"use client";

import { log } from "../config/logger";
import { styled } from "styled-system/jsx";
import {
  separatorHorizontalRecipe,
  separatorVerticalRecipe,
} from "styled-system/recipes";
import type { HTMLStyledProps } from "styled-system/types";

const HorizontalSeparator = styled("div", separatorHorizontalRecipe);
const VerticalSeparator = styled("div", separatorVerticalRecipe);

type Orientation = "horizontal" | "vertical";
type HorizontalVariant = "solid";
type VerticalVariant = "solid";

export interface StyledSeparatorProps extends HTMLStyledProps<"div"> {
  orientation?: Orientation;
  variant?: HorizontalVariant | VerticalVariant;
}

export const StyledSeparator = (props: StyledSeparatorProps) => {
  log.trace("StyledSeparator rendered");
  const { orientation = "horizontal", variant = "solid", ...rest } = props;

  if (orientation === "horizontal") {
    return (
      <HorizontalSeparator variant={variant as HorizontalVariant} {...rest} />
    );
  }

  return <VerticalSeparator variant={variant as VerticalVariant} {...rest} />;
};

StyledSeparator.displayName = "StyledSeparator";

export default StyledSeparator;

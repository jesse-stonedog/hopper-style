import React from "react";
import StyledHStack, { StyledHStackProps } from "./StyledHStack";
import StyledVStack, { StyledVStackProps } from "./StyledVStack";
import { ConditionalValue } from "styled-system/types";
import { Property } from "csstype";

export interface StyledStackProps
  extends Omit<StyledHStackProps, "direction">,
    Omit<StyledVStackProps, "direction"> {
  direction?: ConditionalValue<Property.FlexDirection>;
  divider?: React.ReactNode;
}

export const StyledStack: React.FC<StyledStackProps> = ({
  direction = "column",
  divider,
  children,
  ...rest
}) => {
  const isResponsive = typeof direction === "object";

  const childrenWithDividers = divider
    ? React.Children.toArray(children).flatMap((child, index) => {
        if (index === 0) {
          return [<React.Fragment key={`child-${index}`}>{child}</React.Fragment>];
        }
        return [
          <React.Fragment key={`divider-${index}`}>{divider}</React.Fragment>,
          <React.Fragment key={`child-${index}`}>{child}</React.Fragment>,
        ];
      })
    : children;

  if (isResponsive) {
    const responsiveDirections = direction as Record<string, string>;
    const baseDirection = responsiveDirections.base || "column";

    if (baseDirection === "column") {
      return (
        <StyledVStack {...rest} flexDirection={direction}>
          {childrenWithDividers}
        </StyledVStack>
      );
    } else {
      return (
        <StyledHStack {...rest} flexDirection={direction}>
          {childrenWithDividers}
        </StyledHStack>
      );
    }
  }

  if (direction === "row") {
    return <StyledHStack {...rest}>{childrenWithDividers}</StyledHStack>;
  }

  return <StyledVStack {...rest}>{childrenWithDividers}</StyledVStack>;
};

StyledStack.displayName = "StyledStack";

export default StyledStack;
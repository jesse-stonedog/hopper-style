"use client";

import { log } from "../config/logger";
import React from "react";
import { styled } from "styled-system/jsx";
import { css, cx } from "styled-system/css";
import StyledTooltip from "./StyledTooltip";
import { useFontSizeProfile } from "../config/style-config";
import { fontSizeMap } from "../config/font-size";
import type { AllowedTextVariant } from "../config/types";
import { textRecipe } from "styled-system/recipes";

const PandaText = styled("span", textRecipe);

export interface StyledTextProps
  extends React.ComponentProps<typeof PandaText> {
  children?: React.ReactNode | undefined;

  tooltip?: React.ReactNode | undefined;
  as?: React.ElementType | undefined; // Explicitly add the 'as' prop
  size?: keyof typeof fontSizeMap | undefined;
  fixedSize?: boolean | undefined;
  color?: string | undefined;
  ellipsis?: boolean | undefined;
  wrap?: boolean | undefined;

  variant?: AllowedTextVariant | undefined;
}

const StyledText = React.forwardRef<HTMLSpanElement, StyledTextProps>((props, ref) => {
  log.trace("StyledText rendered");
  const {
    children,
    tooltip,
    size,
    fixedSize,
    color = "textPrimary",
    variant,
    style,
    ellipsis,
    wrap,
    textAlign,
    className,
    ...rest
  } = props;
  const fontSizeProfile = useFontSizeProfile();

  let finalSize;
  if (size) {
    finalSize = size;
  } else if (fixedSize) {
    finalSize = "md";
  } else {
    finalSize = fontSizeProfile;
  }

  const fontSize = fontSizeMap[finalSize] || fontSizeMap.md;

  const extraStyles: React.CSSProperties = {};
  if (ellipsis) {
    extraStyles.textOverflow = "ellipsis";
    extraStyles.whiteSpace = "nowrap";
    extraStyles.overflow = "hidden";
    extraStyles.display = "block";
  }
  if (wrap === false) {
    extraStyles.whiteSpace = "nowrap";
  }

  const textAlignClass = textAlign ? css({ textAlign }) : "";
  const combinedClassName = cx(className, textAlignClass);

  const textElement = (
    <PandaText
      ref={ref}
      style={{ fontSize, ...extraStyles, ...style }}
      color={color}
      variant={variant}
      className={combinedClassName}
      {...rest}
    >
      {children}
    </PandaText>
  );

  return (
    <>
      {tooltip ? (
        <StyledTooltip tooltip={tooltip}>{textElement}</StyledTooltip>
      ) : (
        textElement
      )}
    </>
  );
});

StyledText.displayName = "StyledText";

export default StyledText;

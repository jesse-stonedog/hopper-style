import React from "react";
import { vstack } from "styled-system/patterns";
import type { ConditionalValue } from "styled-system/types";
import { cx } from "styled-system/css";
import { stripedRecipe } from "styled-system/recipes";
import { Property } from "csstype";

export interface StyledVStackProps
  extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: ConditionalValue<number> | undefined;
  gap?: ConditionalValue<string | number> | undefined;
  align?: ConditionalValue<string> | undefined;
  justify?: ConditionalValue<string> | undefined;
  width?: ConditionalValue<string> | undefined;
  w?: ConditionalValue<string> | undefined;
  marginBottom?: ConditionalValue<string> | undefined;
  mb?: ConditionalValue<string | number> | undefined;
  marginTop?: ConditionalValue<string | number> | undefined;
  mt?: ConditionalValue<string | number> | undefined;
  flexWrap?: ConditionalValue<string> | undefined;
  display?: ConditionalValue<string> | undefined;
  alignItems?: ConditionalValue<string> | undefined;
  justifyContent?: ConditionalValue<string> | undefined;
  p?: ConditionalValue<string | number> | undefined;
  py?: ConditionalValue<string | number> | undefined;
  px?: ConditionalValue<string | number> | undefined;
  pt?: ConditionalValue<string | number> | undefined;
  pb?: ConditionalValue<string | number> | undefined;
  pl?: ConditionalValue<string | number> | undefined;
  pr?: ConditionalValue<string | number> | undefined;
  minH?: ConditionalValue<string | number> | undefined;
  minHeight?: ConditionalValue<string | number> | undefined;
  minWidth?: ConditionalValue<string | number> | undefined;
  maxW?: ConditionalValue<string | number> | undefined;
  maxWidth?: ConditionalValue<string | number> | undefined;
  flex?: ConditionalValue<string | number> | undefined;
  position?: ConditionalValue<string> | undefined;
  textAlign?: ConditionalValue<string> | undefined;
  borderWidth?: ConditionalValue<string | number> | undefined;
  borderRadius?: ConditionalValue<string | number> | undefined;
  flexDirection?: ConditionalValue<Property.FlexDirection> | undefined;
  height?: ConditionalValue<string | number> | undefined;
  h?: ConditionalValue<string | number> | undefined;
  bg?: ConditionalValue<string> | undefined;
  backgroundColor?: ConditionalValue<string> | undefined;
  isStriped?: boolean | undefined;

}

export const StyledVStack: React.FC<StyledVStackProps> = ({
  gap = "2",
  align,
  justify,
  width,
  w,
  marginBottom,
  mb,
  marginTop,
  mt,
  flexWrap,
  display,
  alignItems,
  justifyContent,
  p,
  py,
  px,
  pt,
  pb,
  pl,
  pr,
  minH,
  minHeight,
  minWidth,
  maxW,
  maxWidth,
  flex,
  position,
  textAlign,
  borderWidth,
  borderRadius,
  flexDirection,
  height,
  h,
  bg,
  backgroundColor,
  isStriped,
  opacity,
  className,
  children,
  ...rest
}) => {  // Map React-style props to styled-system pattern props
  const mappedProps = {
    opacity,
    gap: typeof gap === "number" ? String(gap) : gap,
    alignItems: align || alignItems,
    justify: justify || justifyContent,
    width: width || w,
    marginBottom: marginBottom || mb,
    marginTop: marginTop || mt,
    flexWrap,
    display,
    p,
    py,
    px,
    pt,
    pb,
    pl,
    pr,
    minH,
    minHeight,
    minWidth,
    maxWidth: maxWidth || maxW,
    flex,
    position,
    textAlign,
    borderWidth,
    borderRadius,
    flexDirection,
    height: height || h,
    background: bg || backgroundColor,
  };

  // Remove undefined values
  Object.keys(mappedProps).forEach(
    (key) => mappedProps[key as keyof typeof mappedProps] === undefined && delete mappedProps[key as keyof typeof mappedProps],
  );

  const combinedClassName = cx(
    vstack(mappedProps as unknown as Parameters<typeof vstack>[0]),
    isStriped ? stripedRecipe() : undefined,
    className,
  );
  const { ...divProps } = rest;
  return (
    <div className={combinedClassName} {...divProps}>
      {children}
    </div>
  );
};

StyledVStack.displayName = "StyledVStack";

export default StyledVStack;

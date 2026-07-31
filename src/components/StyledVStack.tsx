import React from "react";
import { vstack } from "styled-system/patterns";
import type { ConditionalValue } from "styled-system/types";
import { cx } from "styled-system/css";
import { stripedRecipe } from "styled-system/recipes";
import { Property } from "csstype";

export interface StyledVStackProps
  extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: ConditionalValue<number>;
  gap?: ConditionalValue<string | number>;
  align?: ConditionalValue<string>;
  justify?: ConditionalValue<string>;
  width?: ConditionalValue<string>;
  w?: ConditionalValue<string>;
  marginBottom?: ConditionalValue<string>;
  mb?: ConditionalValue<string | number>;
  marginTop?: ConditionalValue<string | number>;
  mt?: ConditionalValue<string | number>;
  flexWrap?: ConditionalValue<string>;
  display?: ConditionalValue<string>;
  alignItems?: ConditionalValue<string>;
  justifyContent?: ConditionalValue<string>;
  p?: ConditionalValue<string | number>;
  py?: ConditionalValue<string | number>;
  px?: ConditionalValue<string | number>;
  pt?: ConditionalValue<string | number>;
  pb?: ConditionalValue<string | number>;
  pl?: ConditionalValue<string | number>;
  pr?: ConditionalValue<string | number>;
  minH?: ConditionalValue<string | number>;
  minHeight?: ConditionalValue<string | number>;
  minWidth?: ConditionalValue<string | number>;
  maxW?: ConditionalValue<string | number>;
  maxWidth?: ConditionalValue<string | number>;
  flex?: ConditionalValue<string | number>;
  position?: ConditionalValue<string>;
  textAlign?: ConditionalValue<string>;
  borderWidth?: ConditionalValue<string | number>;
  borderRadius?: ConditionalValue<string | number>;
  flexDirection?: ConditionalValue<Property.FlexDirection>;
  height?: ConditionalValue<string | number>;
  h?: ConditionalValue<string | number>;
  bg?: ConditionalValue<string>;
  backgroundColor?: ConditionalValue<string>;
  isStriped?: boolean;

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

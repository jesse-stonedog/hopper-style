import React from "react";
import { hstack } from "styled-system/patterns";
import type { ConditionalValue } from "styled-system/types";
import { Property } from "csstype";

export interface StyledHStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  as?: React.ElementType;
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
  minH?: ConditionalValue<string | number>;
  flexShrink?: ConditionalValue<string | number>;
  flexDirection?: ConditionalValue<Property.FlexDirection>;
  bg?: ConditionalValue<string>;
  backgroundColor?: ConditionalValue<string>;
  height?: ConditionalValue<string | number>;
  h?: ConditionalValue<string | number>;
  borderRadius?: ConditionalValue<string | number>;
  borderWidth?: ConditionalValue<string | number>;
  borderColor?: ConditionalValue<string>;
  border?: ConditionalValue<string>;
  opacity?: ConditionalValue<number>;
  color?: ConditionalValue<string>;
  _dark?: Record<string, unknown>;
  // Allow additional Panda CSS style props
  [key: string]: unknown;
}

export const StyledHStack: React.FC<StyledHStackProps> = ({
  as: Component = "div",
  gap = "2",
  align,
  justify,
  width,
  w,
  marginBottom,
  mb,
  flexWrap,
  display,
  alignItems,
  justifyContent,
  p,
  py,
  px,
  minH,
  pt,
  bg,
  backgroundColor,
  children,
  flexDirection,
  flexShrink,
  marginTop,
  mt,
  height,
  h,
  borderRadius,
  borderWidth,
  borderColor,
  border,
  opacity,
  color,
  _dark,
  className: _className,
  style: _style,
  ...rest
}) => {
  // Separate HTML attributes from style props
  const htmlAttrs: Record<string, unknown> = {};
  const extraStyleProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith("on") || key.startsWith("data-") || key.startsWith("aria-") || ["id", "ref", "role", "tabIndex", "draggable", "title"].includes(key)) {
      htmlAttrs[key] = value;
    } else {
      extraStyleProps[key] = value;
    }
  }

  // Map React-style props to styled-system pattern props
  const mappedProps: Record<string, unknown> = {
    gap: typeof gap === "number" ? String(gap) : gap,
    align: align || alignItems,
    justify: justify || justifyContent,
    width: width || w,
    marginBottom: marginBottom || mb,
    marginTop: marginTop || mt,
    flexWrap,
    display,
    p,
    py,
    px,
    minH,
    pt,
    background: bg || backgroundColor,
    flexDirection,
    flexShrink,
    height: height || h,
    borderRadius,
    borderWidth,
    borderColor,
    border,
    opacity,
    color,
    _dark,
    ...extraStyleProps,
  };

  // Remove undefined values
  Object.keys(mappedProps).forEach(
    (key) => mappedProps[key] === undefined && delete mappedProps[key],
  );

  return (
    <Component
      className={hstack(mappedProps as Parameters<typeof hstack>[0])}
      style={_style}
      {...htmlAttrs}
    >
      {children}
    </Component>
  );
};

StyledHStack.displayName = "StyledHStack";

export default StyledHStack;

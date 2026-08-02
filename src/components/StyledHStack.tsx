import React from "react";
import { hstack } from "styled-system/patterns";
import type { ConditionalValue } from "styled-system/types";
import { Property } from "csstype";

export interface StyledHStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  as?: React.ElementType | undefined;
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
  minH?: ConditionalValue<string | number> | undefined;
  flexShrink?: ConditionalValue<string | number> | undefined;
  flexDirection?: ConditionalValue<Property.FlexDirection> | undefined;
  bg?: ConditionalValue<string> | undefined;
  backgroundColor?: ConditionalValue<string> | undefined;
  height?: ConditionalValue<string | number> | undefined;
  h?: ConditionalValue<string | number> | undefined;
  borderRadius?: ConditionalValue<string | number> | undefined;
  borderWidth?: ConditionalValue<string | number> | undefined;
  borderColor?: ConditionalValue<string> | undefined;
  border?: ConditionalValue<string> | undefined;
  opacity?: ConditionalValue<number> | undefined;
  color?: ConditionalValue<string> | undefined;
  _dark?: Record<string, unknown> | undefined;
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

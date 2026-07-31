import React from "react";
import { styled } from "styled-system/jsx";
import { boxRecipe, type BoxRecipeVariantProps } from "styled-system/recipes";
import type { HTMLStyledProps, ConditionalValue } from "styled-system/types";
import { Property } from "csstype";
import { css, cx } from "styled-system/css";
import StyledGrid from "./StyledGrid";
import StyledVStack from "./StyledVStack";

interface StyledGridPanelProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
}

const StyledGridPanel: React.FC<StyledGridPanelProps> = ({
  leftPanel,
  rightPanel,
  children,
}) => {
  const hasPanels = leftPanel || rightPanel;

  if (!hasPanels) {
    return <div style={{ width: "100%", height: "100%" }}>{children}</div>;
  }

  return (
    <StyledGrid
      width="100%"
      height="100%"
      gap={0}
      templateColumns="min-content 1fr min-content"
      alignItems="stretch"
      data-testid="styled-grid-panel"
    >
      <StyledBox itemID="left-panel" mr="3" style={{ gridColumn: 1 }}>{leftPanel}</StyledBox>
      <StyledBox style={{ width: "100%", height: "100%", gridColumn: 2 }}>
        {children}
      </StyledBox>
      <StyledBox itemID="right-panel" ml="3" style={{ overflowY: "auto", height: "100%", gridColumn: 3 }}>
        {rightPanel}
      </StyledBox>
    </StyledGrid>
  );
};

export interface StyledBoxProps
  extends HTMLStyledProps<"div">,
  BoxRecipeVariantProps {
  as?: React.ElementType;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  topPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  mt?: ConditionalValue<Property.MarginTop | number>;
  mb?: ConditionalValue<Property.MarginBottom | number>;
  ml?: ConditionalValue<Property.MarginLeft | number>;
  mr?: ConditionalValue<Property.MarginRight | number>;
  p?: ConditionalValue<Property.Padding | number>;
  pt?: ConditionalValue<Property.PaddingTop | number>;
  pb?: ConditionalValue<Property.PaddingBottom | number>;
  pl?: ConditionalValue<Property.PaddingLeft | number>;
  pr?: ConditionalValue<Property.PaddingRight | number>;
  px?: ConditionalValue<Property.Padding | number>;
  py?: ConditionalValue<Property.Padding | number>;
  m?: ConditionalValue<Property.Margin | number>;
  mx?: ConditionalValue<Property.Margin | number>;
  my?: ConditionalValue<Property.Margin | number>;
  width?: ConditionalValue<Property.Width | number>;
  w?: ConditionalValue<Property.Width | number>;
  height?: ConditionalValue<Property.Height | number>;
  h?: ConditionalValue<Property.Height | number>;
  minH?: ConditionalValue<Property.MinHeight | number>;
  maxW?: ConditionalValue<Property.MaxWidth | number>;
  display?: ConditionalValue<Property.Display>;
  flexDirection?: ConditionalValue<Property.FlexDirection>;
  alignItems?: ConditionalValue<Property.AlignItems>;
  justifyContent?: ConditionalValue<Property.JustifyContent>;
  bg?: ConditionalValue<Property.Background>;
  background?: ConditionalValue<Property.Background>;
  color?: ConditionalValue<Property.Color>;
  borderRadius?: ConditionalValue<Property.BorderRadius | number>;
  border?: ConditionalValue<Property.Border | number>;
  borderWidth?: ConditionalValue<Property.BorderWidth | number>;
  borderColor?: ConditionalValue<Property.BorderColor>;
  boxShadow?: ConditionalValue<Property.BoxShadow>;
  position?: ConditionalValue<Property.Position>;
  top?: ConditionalValue<Property.Top | number>;
  right?: ConditionalValue<Property.Right | number>;
  bottom?: ConditionalValue<Property.Bottom | number>;
  left?: ConditionalValue<Property.Left | number>;
  zIndex?: ConditionalValue<Property.ZIndex | number>;
  overflow?: ConditionalValue<Property.Overflow>;
  overflowX?: ConditionalValue<Property.OverflowX>;
  overflowY?: ConditionalValue<Property.OverflowY>;
  textAlign?: ConditionalValue<Property.TextAlign>;
  gap?: ConditionalValue<Property.Gap | number>;
  noWrap?: boolean;
  scrollbar?: "auto" | "on" | "off";
}

const StyledBoxRoot = styled("div", boxRecipe);

const StyledBox = React.forwardRef<HTMLDivElement, StyledBoxProps>(
  ({
    as,
    children,
    leftPanel,
    rightPanel,
    topPanel,
    bottomPanel,
    header,
    footer,
    noWrap,
    scrollbar,
    textAlign,
    zIndex,
    className,
    ...rest
  },
    ref,
  ) => {

    // Create class for filtered properties
    const filteredPropsClass = css({
      // Only include if defined to avoid overriding with undefined
      ...(textAlign && { textAlign }),
      ...(zIndex !== undefined && { zIndex })
    });
    const combinedClassName = cx(className, filteredPropsClass);

    const resolvedHeader = topPanel || header;
    const resolvedFooter = bottomPanel || footer;

    // scrollbar prop controls inner content overflow
    const innerOverflow: Property.Overflow = scrollbar === "auto" ? "auto" : scrollbar === "on" ? "scroll" : "hidden";

    if (noWrap) {
      if (resolvedHeader || resolvedFooter) {
        return (
          <StyledBoxRoot ref={ref} {...(as ? { as } : {})} className={combinedClassName} display="flex" flexDirection="column" {...rest}>
            {resolvedHeader}
            <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
            {resolvedFooter}
          </StyledBoxRoot>
        );
      }
      return (
        <StyledBoxRoot ref={ref} {...(as ? { as } : {})} className={combinedClassName} {...rest}>
          {children}
        </StyledBoxRoot>
      );
    }
    return (
      <StyledBoxRoot ref={ref} {...(as ? { as } : {})} className={combinedClassName} {...rest}>
        <StyledVStack gap="0" width="100%" height="100%" style={{ overflow: innerOverflow }}>
          {resolvedHeader}
          <div style={{ flex: 1, minHeight: 0, width: "100%", overflow: innerOverflow }}>
            <StyledGridPanel leftPanel={leftPanel} rightPanel={rightPanel}>
              {children}
            </StyledGridPanel>
          </div>
          {resolvedFooter}
        </StyledVStack>
      </StyledBoxRoot>
    );
  },
);

StyledBox.displayName = "StyledBox";
export default StyledBox;
export { StyledBox };

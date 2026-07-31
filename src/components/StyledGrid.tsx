import { styled, type HTMLStyledProps } from "styled-system/jsx";
import { cx, css } from "styled-system/css";
import { stripedRecipe } from "styled-system/recipes";
import React from "react";
import { log } from "../config/logger";
import type { ConditionalValue } from "styled-system/types";

const PandaGrid = styled("div", {
  base: {
    display: "grid",
  },
});

export interface StyledGridProps extends Omit<HTMLStyledProps<"div">, "columns"> {
  children?: React.ReactNode;
  isStriped?: boolean;
  showGridLines?: boolean;
  templateColumns?: ConditionalValue<string>;
  templateRows?: ConditionalValue<string>;
  templateAreas?: ConditionalValue<string>;
  columns?: ConditionalValue<number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number }>;
}

const StyledGrid = React.forwardRef<HTMLDivElement, StyledGridProps>(
  ({
    isStriped,
    showGridLines,
    className,
    templateColumns,
    templateRows,
    templateAreas,
    columns, ...props }, ref) => {
    const combinedClassName = cx(
      isStriped ? stripedRecipe() : undefined,
      showGridLines
        ? css({
          "& > *": {
            outline: "1px solid",
            outlineColor: "borderBgPrimary",
            backgroundColor: "boxBgPrimary",
            borderRadius: "15px",
          },
        })
        : undefined,
      className,
    );

    // Map shorthand props to CSS grid properties
    const gridTemplateColumns = props.gridTemplateColumns ?? templateColumns;
    const gridTemplateRows = props.gridTemplateRows ?? templateRows;
    const gridTemplateAreas = props.gridTemplateAreas ?? templateAreas;
    delete props.gridTemplateColumns;
    delete props.gridTemplateRows;
    delete props.gridTemplateAreas;

    // Handle columns prop (responsive column count)
    let resolvedColumns = gridTemplateColumns;
    if (columns !== undefined && !resolvedColumns) {
      if (typeof columns === "number") {
        resolvedColumns = `repeat(${columns}, 1fr)`;
      } else if (typeof columns === "object" && columns !== null) {
        const colObj = columns as { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
        // For responsive objects, we need to generate a responsive value
        const responsive: Record<string, string> = {};
        if (colObj.base !== undefined) responsive.base = `repeat(${colObj.base}, 1fr)`;
        if (colObj.sm !== undefined) responsive.sm = `repeat(${colObj.sm}, 1fr)`;
        if (colObj.md !== undefined) responsive.md = `repeat(${colObj.md}, 1fr)`;
        if (colObj.lg !== undefined) responsive.lg = `repeat(${colObj.lg}, 1fr)`;
        if (colObj.xl !== undefined) responsive.xl = `repeat(${colObj.xl}, 1fr)`;
        resolvedColumns = responsive as ConditionalValue<string>;
      }
    }

    const childrenDetails = React.Children.map(props.children, (child) => {
      if (React.isValidElement(child)) {
        const element = child as React.ReactElement<{ id?: string }>;
        const params = element.props;
        return {
          key: child.key,
          id: params?.id,
          type: typeof child.type === 'string' ? child.type : (child.type as React.FunctionComponent).displayName || (child.type as React.FunctionComponent).name || 'Unknown',
          isNull: child === null
        };
      }
      return "Non-Element Child";
    });

    log.debug("[StyledGrid] Rendering Grid", {
      childCount: React.Children.count(props.children),
      showGridLines,
      childrenDetails
    });

    return (
      <PandaGrid
        ref={ref}
        className={combinedClassName}
        gridTemplateColumns={resolvedColumns}
        gridTemplateRows={gridTemplateRows}
        gridTemplateAreas={gridTemplateAreas}
        {...props}
      />
    );
  },
);

StyledGrid.displayName = "StyledGrid";

export default StyledGrid;

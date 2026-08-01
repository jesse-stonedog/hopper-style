"use client";

import React, { useState, useEffect, useCallback } from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

// Panda CSS breakpoints (in px)
const BREAKPOINTS: Record<string, number> = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

interface StyledSimpleGridProps extends Omit<HTMLStyledProps<"div">, "columns"> {
  columns?: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gridTemplateRows?: string;
  gap?: string | number;
}

const PandaSimpleGrid = styled("div", {
  base: {
    display: "grid",
  },
});

/**
 * Resolve a responsive columns object to the correct value for the current window width.
 * Walks breakpoints from largest to smallest, returning the first match.
 */
function resolveResponsiveColumns(
  columns: { base?: number; sm?: number; md?: number; lg?: number; xl?: number },
  windowWidth: number,
): number {
  const ordered = ["xl", "lg", "md", "sm", "base"] as const;
  for (const bp of ordered) {
    // Read once and narrow, rather than testing then re-indexing with `!`. The
    // non-null assertion was hiding the fact that BREAKPOINTS[bp] is also an
    // indexed read and equally unchecked.
    const columnsAtBreakpoint = columns[bp];
    const minimumWidth = BREAKPOINTS[bp];
    if (columnsAtBreakpoint !== undefined && minimumWidth !== undefined) {
      if (windowWidth >= minimumWidth) return columnsAtBreakpoint;
    }
  }
  return columns.base ?? 1;
}

const StyledSimpleGrid: React.FC<StyledSimpleGridProps> = ({
  columns,
  gridTemplateRows,
  gap,
  style,
  children,
  ...rest
}) => {
  const [resolvedCols, setResolvedCols] = useState<number>(() => {
    if (typeof columns === "number") return columns;
    if (typeof columns === "object" && columns !== null) {
      return columns.base ?? 1;
    }
    return 1;
  });

  const recalculate = useCallback(() => {
    if (typeof columns === "number") {
      setResolvedCols(columns);
    } else if (typeof columns === "object" && columns !== null) {
      setResolvedCols(resolveResponsiveColumns(columns, window.innerWidth));
    }
  }, [columns]);

  useEffect(() => {
    recalculate();
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }, [recalculate]);

  // Runtime-computed grid values MUST use inline style — Panda CSS drops them at build time
  const gridStyles: React.CSSProperties = {
    ...style,
    gridTemplateColumns: `repeat(${resolvedCols}, 1fr)`,
    gridTemplateRows,
    gap,
  };

  return (
    <PandaSimpleGrid
      {...rest}
      style={gridStyles}
    >
      {children}
    </PandaSimpleGrid>
  );
};

export default StyledSimpleGrid;
export { StyledSimpleGrid };

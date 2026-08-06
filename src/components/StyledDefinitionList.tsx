"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import { dlRecipe } from "styled-system/recipes";
import { useResolvedVariant } from "../config/style-config";
import { ALL_VARIANTS, type AllowedVariant } from "../config/types";

/**
 * Term-and-definition pairs in two columns — the shape a details panel wants.
 *
 * `<dl>` rather than a table because these are *pairs*, not a grid: there is
 * one value per label, no column headers, and nothing to sort. A screen reader
 * announces "list, 6 items" and reads each term with its definition, which a
 * two-column table of unheaded cells does not.
 *
 * ```tsx
 * <StyledDefinitionList.Root>
 *   <StyledDefinitionList.Term>Admitted</StyledDefinitionList.Term>
 *   <StyledDefinitionList.Definition>4 March</StyledDefinitionList.Definition>
 * </StyledDefinitionList.Root>
 * ```
 *
 * ## Two defects fixed on the way across
 *
 * **It ignored the app-wide appearance.** The variant defaulted to a literal
 * `"solid"` and never consulted the host's configuration, so a product set to
 * `glass` or `matte` got one panel that stayed solid regardless. Every other
 * component in this package resolves through `useResolvedVariant`; this one
 * predated it. It does now, which means an unset variant follows the app
 * rather than overriding it.
 *
 * **The row separators never rendered.** `dlRecipe` drew them with
 * `& > li:not(:last-child)` — but a `<dl>` contains `<dt>` and `<dd>`, never
 * `<li>`, so the selector matched nothing in the only element the recipe is
 * ever applied to. The rule was present, valid, and dead. It is `& > dd` now,
 * which puts a line after each pair rather than between a term and its own
 * definition.
 *
 * That fix is in the recipe rather than here, so it reaches any consumer using
 * `dlRecipe` directly. Nothing consumed it before this component, so no
 * existing surface changes.
 *
 * ## The `link` / `selected` coercion is gone
 *
 * The originating version silently mapped `link`, `ghost` and `selected` onto
 * `solid`. A coerced variant still renders, so a call site asking for `ghost`
 * saw a solid panel and no warning — the same silent-coercion failure NEH-234
 * documented. `useResolvedVariant`'s allow-list makes the supported set
 * explicit instead: `DL_VARIANTS` is what the recipe actually defines.
 */

const PandaDefinitionList = styled("dl", {
  base: {
    display: "grid",
    gridTemplateColumns: "max-content 1fr",
    gap: "0.5rem 1.5rem",
    padding: "1rem",
  },
});

const PandaTerm = styled("dt", {
  base: {
    fontWeight: "bold",
    gridColumn: 1,
  },
});

const PandaDescription = styled("dd", {
  base: {
    margin: 0,
    gridColumn: 2,
  },
});

/** The appearances `dlRecipe` actually defines. */
export const DL_VARIANTS = [
  "solid",
  "outline",
  "aurora",
  "glass",
  "matte",
  "none",
  "unstyled",
] as const;

export type DlVariant = (typeof DL_VARIANTS)[number];

export type StyledDefinitionListProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDListElement> & {
    /**
     * `undefined` is spelled out because the repo runs
     * `exactOptionalPropertyTypes`: without it a caller holding a
     * possibly-unset variant cannot forward it, even though "unset" is
     * precisely the case this component handles by following the app.
     */
    variant?: AllowedVariant | DlVariant | undefined;
  }
>;

const StyledDefinitionListRoot = React.forwardRef<
  HTMLDListElement,
  StyledDefinitionListProps
>(({ children, variant, className, ...rest }, ref) => {
  const resolved = useResolvedVariant(variant, DL_VARIANTS);

  return (
    <PandaDefinitionList
      ref={ref}
      className={[dlRecipe({ variant: resolved }), className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </PandaDefinitionList>
  );
});

StyledDefinitionListRoot.displayName = "StyledDefinitionList.Root";

const StyledDefinitionList = {
  Root: StyledDefinitionListRoot,
  Term: PandaTerm,
  Definition: PandaDescription,
};

/**
 * Re-exported so a consumer can validate a variant before passing it — the
 * same vocabulary `useResolvedVariant` gates on.
 */
export { ALL_VARIANTS };

export default StyledDefinitionList;

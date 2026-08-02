"use client";

import React from "react";
import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";
import { inputDropdownRecipe } from "styled-system/recipes";
import { useFontSizeProfile, useResolvedVariant } from "../config/style-config";
import { fontSizeMap } from "../config/font-size";

/**
 * A dropdown, built on the **native** `<select>`.
 *
 * ## Why native, when the originating app has a custom one
 *
 * HopperGuard ships a compound dropdown built on `@floating-ui/react` — a
 * portal, a focus manager, twelve exported sub-components. It was not ported,
 * and the reasons compound:
 *
 * - **It costs every consumer a positioning library.** This package has exactly
 *   one runtime dependency (`csstype`), and each addition is a constraint
 *   imposed on three products to serve one.
 * - **The native control is more accessible than a good reimplementation.** It
 *   is the platform's own listbox: type-ahead, `Home`/`End`, screen-reader
 *   announcement of "3 of 12", and on a phone the OS picker rather than a
 *   scrolling div. A custom dropdown has to rebuild all of that and usually
 *   rebuilds most of it.
 * - **It submits.** A native select inside a `<form>` posts its value with no
 *   JavaScript. optima-filings's forms are server actions, so a custom
 *   dropdown there would need a hidden mirror input — machinery whose only
 *   purpose is to undo the choice to be custom.
 *
 * What you give up is styling the open list, which CSS cannot reach on a native
 * select. That is a real limit and the honest reason to build the custom one —
 * when a product needs icons or two-line entries in the options, not before.
 * The closed control is fully styled here, from the same surface the text input
 * uses, so the two match in a form.
 */

const PandaSelect = styled("select", inputDropdownRecipe);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface StyledInputSelectProps
  extends Omit<
      React.SelectHTMLAttributes<HTMLSelectElement>,
      "color" | "content" | "translate" | "size"
    >,
    Omit<HTMLStyledProps<"select">, "size"> {
  ["data-testid"]?: string;
  variant?: SelectVariant;
  /**
   * The choices. Alternatively pass `<option>` children directly — needed for
   * `<optgroup>`, which this prop deliberately does not model.
   */
  options?: SelectOption[];
  /**
   * Leading entry for "nothing chosen". Its value is the empty string, so a
   * `required` select rejects it — which is the point of naming it rather than
   * letting the first real option be silently pre-selected.
   */
  placeholder?: string;
}

/** What `inputDropdownRecipe` defines — wider than the five app-wide ones. */
export const SELECT_VARIANTS = [
  "solid",
  "outline",
  "aurora",
  "glass",
  "matte",
  "ghost",
  "none",
] as const;

export type SelectVariant = (typeof SELECT_VARIANTS)[number];

const StyledInputSelect = React.forwardRef<
  HTMLSelectElement,
  StyledInputSelectProps
>(function StyledInputSelect(
  { variant, options, placeholder, children, style, ...props },
  ref,
) {
  const resolved = useResolvedVariant(variant, SELECT_VARIANTS);
  const fontSize = fontSizeMap[useFontSizeProfile()] ?? fontSizeMap.md;

  return (
    <PandaSelect
      ref={ref}
      variant={resolved}
      data-testid={props["data-testid"]}
      // Inline, not a Panda prop: the value is only known at runtime, and Panda
      // extracts styles by parsing source at build time — a runtime value
      // yields a class with no rule behind it (NEH-233).
      style={{ fontSize, ...style }}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options?.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
      {children}
    </PandaSelect>
  );
});

StyledInputSelect.displayName = "StyledInputSelect";

export default StyledInputSelect;

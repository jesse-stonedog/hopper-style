"use client";

import React from "react";
import StyledText from "./StyledText";
import StyledHStack from "./StyledHStack";
import { styled } from "styled-system/jsx";
import { inputBoolRecipe } from "styled-system/recipes";
import { useResolvedVariant } from "../config/style-config";


/**
 * A checkbox with its label.
 *
 * The whole thing is a `<label>`, so the text is part of the target rather than
 * something next to it. A bare checkbox is roughly 14×14 CSS px — far under the
 * 44×44 floor — and wrapping is what makes it hittable without demanding fine
 * motor control. It is also why the label is not optional in practice: pass
 * one, or the control has no accessible name and no usable target.
 *
 * Styling comes from `inputBoolRecipe`, which paints the box, the tick and the
 * label as three slots. The variant resolves through `useResolvedVariant`, so a
 * call site that says nothing inherits the app-wide choice.
 */

/**
 * What `inputBoolRecipe` actually defines — wider than the five a user can pick
 * app-wide, because `ghost` and `none` are reachable per call site.
 *
 * Passed to `useResolvedVariant` explicitly. Without it the default gate is the
 * theme five and `variant="ghost"` silently becomes `solid`.
 *
 * `button` is omitted deliberately: the recipe defines it, but it restyles the
 * checkbox as a push button, which is a different control rather than a
 * different appearance of this one.
 */
export const INPUT_BOOL_VARIANTS = [
  "solid",
  "outline",
  "aurora",
  "glass",
  "matte",
  "ghost",
  "none",
] as const;

export type InputBoolVariant = (typeof INPUT_BOOL_VARIANTS)[number];

export interface StyledInputBoolProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  ["data-testid"]?: string;
  isReadOnly?: boolean;
  variant?: InputBoolVariant;
}

const StyledInputBool = React.forwardRef<
  HTMLInputElement,
  StyledInputBoolProps
>(function StyledInputBool({ label, isReadOnly, variant, ...props }, ref) {
  const slots = inputBoolRecipe({
    variant: useResolvedVariant(variant, INPUT_BOOL_VARIANTS),
  });

  return (
    <StyledHStack as="label" className={slots.root}>
      <styled.input
        type="checkbox"
        ref={ref}
        data-testid={props["data-testid"]}
        readOnly={isReadOnly}
        {...props}
        className={slots.control}
      />
      {label && <StyledText className={slots.label}>{label}</StyledText>}
    </StyledHStack>
  );
});

StyledInputBool.displayName = "StyledInputBool";

export default StyledInputBool;

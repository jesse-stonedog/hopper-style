import { defineRecipe } from "@pandacss/dev";
import { inputSurfaceBase, inputSurfaceVariants } from "./input-surface";

/**
 * Text-like controls: `input`, `textarea`, the date input, the phone input.
 *
 * The surface is shared with `inputDropdownRecipe` — see `input-surface.ts`
 * for why (NEH-84). Anything specific to a text control belongs here; anything
 * that should also be true of a dropdown belongs in the shared surface.
 */
export const inputTextRecipe = defineRecipe({
  className: "input-text",
  base: inputSurfaceBase,
  variants: {
    variant: inputSurfaceVariants,
  },
});

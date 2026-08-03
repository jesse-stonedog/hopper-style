import { defineRecipe } from "@pandacss/dev";

export const textRecipe = defineRecipe({
  className: "text",
  description: "The styles for the Text component",
  base: {
    color: "textPrimary",
    // The theme's body face (NEH-289). StyledHeading renders through this
    // recipe too and asks for the heading face at its call site instead.
    fontFamily: "body",
  },
  variants: {
    variant: {
      unstyled: {
        color: "inherit",
      },
      pop: {
        color: "textPop",
      },
      warning: {
        bg: "textPop",
        py: "6",
        px: {
          base: "3",
          md: "6",
        },
        color: "textWarning",
        fontWeight: "bold",
      },
      error: {
        bg: "textPop",
        py: "2",
        px: {
          base: "1",
          md: "3",
        },
        color: "textError",
      },
    },
  },
});

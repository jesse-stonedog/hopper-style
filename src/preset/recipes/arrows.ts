import { defineRecipe } from "@pandacss/dev";

export const arrowRecipe = defineRecipe({
  className: "arrow",
  description: "The style for an arrow",
  base: {
    width: "0",
    height: "0",
  },
  variants: {
    variant: {
      solid: {
        "--arrow-color": "red",
      },
      outline: {
        "--arrow-color": "red",
      },
      aurora: {
        "--arrow-color": "red",
      },
      glass: {
        "--arrow-color": "red",
      },
      matte: {
        "--arrow-color": "red",
      },
    },
  },
});

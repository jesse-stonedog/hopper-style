import { defineRecipe } from "@pandacss/dev";

export const stripedRecipe = defineRecipe({
  className: "striped",
  description: "A recipe for applying striped styles to a list of items",
  base: {
    "& > *:nth-child(odd)": {
      background: "boxBgSecondary",
      height: "100%",
      width: "100%",
    },
    "& > *:nth-child(even)": {
      background: "boxBgSecondary",
      color: "textAccent",
    },
  },
  variants: {
    // Optional: Add a variant if you sometimes want to stripe odd rows instead
    stripe: {
      odd: {
        "& > *:nth-child(even)": {
          background: "transparent",
        },
        "& > *:nth-child(odd)": {
          background: "boxBgSecondary",
        },
      },
      even: {}, // This is the default behavior from 'base'
    },
  },
  defaultVariants: {
    stripe: "even",
  },
});

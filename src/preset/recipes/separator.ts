import { defineRecipe } from "@pandacss/dev";

export const separatorVerticalRecipe = defineRecipe({
  className: "separator-v",
  description: "The vertical styles for the StyledSeparator component",
  base: {
    width: "1px",
    height: "full",
  },
  variants: {
    variant: {
      solid: {
        backgroundColor: "gray.800",
        _dark: { backgroundColor: "gray.200" },
      },
      glass: {
        backgroundColor: "whiteAlpha.500",
        _dark: { backgroundColor: "blackAlpha.500" },
      },
      outline: {
        backgroundColor: "transparent",
        borderLeft: "1px dashed",
        borderColor: "gray.400",
      },
      aurora: {
        bgGradient: "linear(to-b, purple.400, cyan.400)",
      },
      matte: {
        backgroundColor: "gray.700",
        _dark: { backgroundColor: "gray.300" },
      },
      ghost: {
        backgroundColor: "gray.800/20",
        _dark: { backgroundColor: "gray.200/20" },
      },
      none: {
        backgroundColor: "transparent",
      },
    },
  },
});

export const separatorHorizontalRecipe = defineRecipe({
  className: "separator-h",
  description: "The horizontal styles for the StyledSeparator component",
  base: {
    height: "1px",
    width: "full",
  },
  variants: {
    variant: {
      solid: {
        backgroundColor: "gray.800",
        _dark: { backgroundColor: "gray.200" },
      },
      glass: {
        backgroundColor: "whiteAlpha.500",
        _dark: { backgroundColor: "blackAlpha.500" },
      },
      outline: {
        backgroundColor: "transparent",
        borderTop: "1px dashed",
        borderColor: "gray.400",
      },
      aurora: {
        bgGradient: "linear(to-r, purple.400, cyan.400)",
      },
      matte: {
        backgroundColor: "gray.700",
        _dark: { backgroundColor: "gray.300" },
      },
      ghost: {
        backgroundColor: "gray.800/20",
        _dark: { backgroundColor: "gray.200/20" },
      },
      none: {
        backgroundColor: "transparent",
      },
    },
  },
});

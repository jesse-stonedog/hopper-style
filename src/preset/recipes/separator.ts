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
        // `whiteAlpha.500` / `blackAlpha.500` were Chakra vocabulary this
        // package never defined, so the glass separator was invisible in both
        // colour modes (NEH-301). Panda's `/50` modifier keeps the
        // translucency the alpha scale was there for — it emits a
        // `color-mix(…, transparent)` over the token, and falls back to the
        // solid token where `color-mix` is unsupported, so the separator is
        // never invisible again.
        backgroundColor: "borderBgPrimary/50",
        _dark: { backgroundColor: "borderBgSecondary/50" },
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
        // See the vertical recipe above — same defect, same fix (NEH-301).
        backgroundColor: "borderBgPrimary/50",
        _dark: { backgroundColor: "borderBgSecondary/50" },
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

import { defineRecipe } from "@pandacss/dev";

export const boxRecipe = defineRecipe({
  className: "box",
  description: "The styles for the Box component",
  base: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  variants: {
    variant: {
      none: {
        border: "none",
        backgroundColor: "transparent",
      },
      unstyled: {
        border: "none",
        backgroundColor: "transparent",
      },
      solid: {
        px: { base: 6, md: 8 },
        py: { base: 2, md: 4 },
        bg: "boxBgPrimary",
        color: "textPrimary",
      },
      outline: {
        px: { base: 6, md: 8 },
        py: { base: 2, md: 4 },
        border: "1px solid",
        borderColor: "borderBgSecondary",
        color: "textPrimary",
        bg: "boxBgPrimary",
      },
      link: {
        bg: "boxBgPrimary",
        _hover: {
          textDecoration: "underline",
        },
      },
      aurora: {
        px: { base: 6, md: 8 },
        py: { base: 2, md: 4 },
        border: "1px solid",
        borderRadius: "md",
        backgroundImage: "linear-gradient(to right, #ff7e5f, #feb47b)",
        color: "textPrimary",
        borderColor: "borderBgSecondary",
      },
      glass: {
        px: { base: 6, md: 8 },
        py: { base: 2, md: 4 },
        position: "relative",
        overflow: "hidden",
        borderRadius: "2xl", // more rounded for curved glass effect
        borderWidth: "2px",
        borderStyle: "solid",
        bg: "boxBgSecondary/60",
        color: "textPrimary",
        boxShadow: "xl",
        fontWeight: "bold",
        borderColor: "borderBgPrimary/10",
        _before: {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "inherit",
          bgGradient:
            "linear(to-br, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          zIndex: -1,
        },
      },
      matte: {
        px: { base: 6, md: 8 },
        py: { base: 2, md: 4 },
        bgGradient: "linear(to-b, gray.800, gray.900)",
        borderColor: "gray.700",
        borderWidth: "1px",
        boxShadow: "md",
        color: "whiteAlpha.900",
        borderRadius: "lg",
        fontWeight: "bold",
      },
      ghost: {
        px: { base: 6, md: 8 },
        py: { base: 2, md: 4 },
        color: "textSecondary",
        bg: "boxBgSecondary",
      },
    },
    layout: {
      vertical: {}, // Base is already vertical
      horizontal: {
        flexDirection: { base: "column", lg: "row" },
        gap: 4,
        alignItems: "center",
      },
    },
    clickable: {
      true: {
        cursor: "pointer",
      },
    },
  },
});

import { defineRecipe } from "@pandacss/dev";

export const tooltipRecipe = defineRecipe({
  className: "tooltip",
  base: {
    position: "absolute",
    zIndex: 9999,
    pointerEvents: "none",
    color: "buttonTextSecondary",
    padding: "2px",
    borderRadius: "md",
    fontSize: "var(--font-sizes-lg, 1rem)",
    boxShadow: "lg",
    whiteSpace: "pre-line",
    maxWidth: {
      base: "340px",
      md: "550px",
    },
    left: "50%",
    top: "100%",
    transformOrigin: "top center",
    bg: "boxBgPrimary"
  },
  variants: {
    variant: {
      solid: {
        bg: "boxBgPrimary",
        color: "buttonTextSecondary",
        borderColor: "borderBgPrimary",
      },
      outline: {
        bg: "boxBgPrimary",
        color: "textPrimary",
        borderColor: "borderBgPrimary",
        border: "1px solid",
      },
      aurora: {
        bg: "boxBgPrimary",
        color: "textSecondary",
        borderColor: "borderBgSecondary",
        border: "1px solid",
      },
      glass: {
        bg: "boxBgPrimary",
        color: "buttonTextPrimary",
        border: "1px solid",
        borderColor: "borderBgPrimary",
      },
      matte: {
        bg: "boxBgPrimary",
        color: "textSecondary",
        borderColor: "borderBgSecondary",
        border: "1px solid",
      },
      ghost: {
        bg: "boxBgPrimary",
        color: "buttonTextSecondary",
      },
      link: {
        bg: "boxBgPrimary",
        color: "textPrimary",
        border: "1px solid",
        borderColor: "borderBgPrimary",
      },
      none: {
        bg: "boxBgPrimary",
        color: "textMain",
        border: "1px solid",
        borderColor: "borderBgPrimary",
      },
      unstyled: {
        bg: "boxBgPrimary",
        color: "textMain",
      },
    },
  },
});

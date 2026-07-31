import { defineRecipe } from "@pandacss/dev";

export const iconRecipe = defineRecipe({
  className: "icon",
  base: {
    display: "inline-block",
    verticalAlign: "middle",
    lineHeight: 1,
    fontSize: "var(--font-sizes-2xl, 1.5rem)",
    "& .fa-secondary": {
      color: "iconBgPrimary",
    },
    "& .fa-primary": {
      color: "iconBgSecondary",
    },
    _hover: {
      fontSize: "var(--font-sizes-2xl, 1.5rem)",
      "& .fa-secondary": {
        color: "iconBgSecondary",
      },
      "& .fa-primary": {
        color: "iconBgPrimary",
      },
    },
  },
  variants: {
    size: {
      sm: { fontSize: "1em" },
      md: { fontSize: "1.5em" },
      lg: { fontSize: "2em" },
      xl: { fontSize: "3em" },
    },
  },
});

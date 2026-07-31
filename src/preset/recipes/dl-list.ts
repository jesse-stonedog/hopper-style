import { defineRecipe } from "@pandacss/dev";

export const dlRecipe = defineRecipe({
  className: "dl-list",
  base: {
    border: "1px solid",
    borderRadius: "md",
    borderColor: "purple",
    // Add vertical padding and margin between dt/dd pairs
    "& > dt, & > dd": {
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
    },
    "& > dt:not(:first-child), & > dd:not(:first-child)": {
      marginTop: "0.5rem",
    },
    "& > dd:not(:last-child)": {
      marginBottom: "0.5rem",
    },
    "& > li:not(:last-child)": {
      borderBottom: "1px solid",
      borderColor: "borderBgPrimary",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "bgAccent",
        color: "textPrimary",
        borderColor: "borderBgPrimary",
      },
      outline: {
        borderColor: "borderBgSecondary",
        color: "textPrimary",
        "& > li:not(:last-child)": {
          borderBottom: "1px solid",
          borderColor: "borderBgSecondary",
        },
      },
      aurora: {
        backgroundImage: `linear-gradient(to right, "textPrimary", "secondary")`,
        color: "textPrimary",
        borderColor: "transparent",
        "& > li:not(:last-child)": {
          borderBottom: "1px solid",
          borderColor: "borderBgPrimary",
        },
      },
      glass: {
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: "textPrimary",
        "& > li:not(:last-child)": {
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
      matte: {
        bg: "secondary",
        color: "textPrimary",
        borderColor: "borderBgPrimary",
        "& > li:not(:last-child)": {
          borderBottom: "1px solid",
          borderColor: "borderBgPrimary",
        },
      },
      none: {
        border: "none",
        backgroundColor: "inherit",
        "& > li:not(:last-child)": {
          borderBottom: "1px solid",
          borderColor: "borderBgPrimary",
        },
      },
      unstyled: {
        border: "none",
        p: "0",
        m: "0",
        backgroundColor: "inherit",
        "& > li:not(:last-child)": {
          borderBottom: "none",
        },
      },
    },
  },
});

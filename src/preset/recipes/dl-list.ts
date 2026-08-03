import { defineRecipe } from "@pandacss/dev";

export const dlRecipe = defineRecipe({
  className: "dl-list",
  base: {
    border: "1px solid",
    borderRadius: "md",
    // Was a literal `purple` (NEH-301): it rendered, but it was the same
    // purple in every theme and in every colour mode. The row separators
    // below already use this token — the outer border had simply never been
    // moved onto it.
    borderColor: "borderBgPrimary",
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
        // `bgAccent` was Chakra vocabulary this package never defined, so the
        // surface never painted (NEH-301). `textAccent` rather than
        // `textPrimary` because TEXT_BACKGROUND_PAIRS is what a host's
        // contrast check reads: text on `boxBgAccent` must be `textAccent`, or
        // the pair that gets validated is not the pair that renders.
        bg: "boxBgAccent",
        color: "textAccent",
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
        // The token names were QUOTED, so they were CSS strings, so the whole
        // gradient was invalid and this variant had no background at all
        // (NEH-301). `{colors.X}` is the syntax that actually substitutes a
        // token inside an arbitrary value — see drawerRecipe, the one aurora
        // that has been rendering. Surface tokens, not `textPrimary`: this is
        // a background.
        backgroundImage: `linear-gradient(to right, {colors.boxBgAccent}, {colors.boxBgSecondary})`,
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
        // `secondary` was undefined vocabulary — the surface never painted
        // (NEH-301). Paired text, per TEXT_BACKGROUND_PAIRS.
        bg: "boxBgSecondary",
        color: "textSecondary",
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

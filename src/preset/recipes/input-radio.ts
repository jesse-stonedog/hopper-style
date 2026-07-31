import { defineSlotRecipe } from "@pandacss/dev";

export const inputRadioRootRecipe = defineSlotRecipe({
  className: "input-radio",
  slots: ["root", "item", "input", "control", "indicator"],
  base: {
    root: {
      display: "flex",
    },
    item: {
      display: "inline-flex",
      alignItems: "center",
      cursor: "pointer",
      padding: "var(--panda-density-padding, 8px)",
      margin: "var(--panda-density-margin, 8px)",
      minHeight: "44px",
      borderRadius: "md",
      borderWidth: "1px",
      borderColor: "transparent",
      "&[data-checked]": {
        borderColor: "boxBgSecondary",
        bg: "rgba(0, 123, 255, 0.2)",
      },
    },
    input: {
      display: "none",
    },
    control: {
      width: "1.25rem",
      height: "1.25rem",
      borderRadius: "50%",
      border: "2px solid",
      borderColor: "gray.400",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "0.5rem",
      transition: "border-color 0.2s",
      [`.input-radio__item[data-checked] > &,
      &[data-checked]`]: {
        borderColor: "boxBgSecondary",
      },
    },
    indicator: {
      width: "0.75rem",
      height: "0.75rem",
      borderRadius: "50%",
      backgroundColor: "textPop",
      transform: "scale(0)",
      transition: "transform 0.2s",
      [`.input-radio__item[data-checked] &,
      &[data-checked]`]: {
        transform: "scale(1)",
      },
    },
  },
  variants: {
    variant: {
      solid: {
        item: {
          bg: "boxBgAccent",
          color: "textPrimary",
          borderColor: "borderBgPrimary",
        },
      },
      outline: {
        item: {
          borderColor: "borderBgSecondary",
          color: "textPrimary",
          borderRadius: "0",
        },
      },
      aurora: {
        item: {
          backgroundImage:
            "linear-gradient(to right, boxBgAccent, boxBgSecondary)",
          color: "textPrimary",
          borderColor: "transparent",
        },
      },
      glass: {
        item: {
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1px solid",
          borderColor: "borderBgPrimary",
          color: "textPrimary",
        },
      },
      matte: {
        item: {
          bg: "buttonBgSecondary",
          color: "textAccent",
        },
      },
      ghost: {
        item: {
          color: "textSecondary",
          bg: "buttonBgSecondary",
          border: "none",
        },
      },
      none: {
        item: {
          border: "none",
          backgroundColor: "white",
        },
      },
    },
    size: {
      sm: {
        control: { width: "4", height: "4" },
        indicator: { width: "2", height: "2" },
        item: { fontSize: "sm", marginLeft: "2" },
      },
      md: {
        control: { width: "5", height: "5" },
        indicator: { width: "2.5", height: "2.5" },
        item: { fontSize: "md", marginLeft: "2.5" },
      },
      lg: {
        control: { width: "6", height: "6" },
        indicator: { width: "3", height: "3" },
        item: { fontSize: "lg", marginLeft: "3" },
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
});

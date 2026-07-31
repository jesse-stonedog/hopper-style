import { defineSlotRecipe } from "@pandacss/dev";

export const inputBoolRecipe = defineSlotRecipe({
  className: "input-bool",
  slots: ["root", "control", "label"],
  base: {
    root: {
      display: "flex",
      alignItems: "center",
      gap: "2",
    },
    control: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--panda-density-padding, 8px)",
      margin: "var(--panda-density-margin, 8px)",
      minHeight: "44px",
      width: "44px",
      border: "1px solid var(--colors-gray-300, #e2e8f0)",
      borderRadius: "md",
      backgroundColor: "white",
      cursor: "pointer",
      "&:focus": {
        outline: "2px solid var(--colors-blue-500, #3182ce)",
        outlineOffset: "2px",
      },
      boxShadow: "none",
      _hover: {
        cursor: "pointer",
      },
      _checked: {
        bg: "primary",
        borderColor: "primary",
      },
    },
    label: {},
  },
  variants: {
    variant: {
      solid: {
        control: {
          bg: "buttonBgAccent",
          color: "var(--text-primary)",
        },
      },
      outline: {
        control: {
          bg: "buttonBgAccent",
          color: "var(--text-primary)",
        },
      },
      aurora: {
        control: {
          backgroundImage: "linear-gradient(to right, #ff7e5f, #feb47b)",
          color: "buttonTextPrimary",
        },
      },
      glass: {
        control: {
          position: "relative",
          overflow: "hidden",
          bg: "buttonBgPrimary/20",
          color: "textPrimary/10",
          boxShadow: "xl",
          backdropFilter: "blur(8px)",
          fontWeight: "bold",
          lineHeight: "shorter",
          _before: {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgGradient:
              "linear(to-br, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
            zIndex: -1,
          },
        },
      },
      matte: {
        control: {
          bgGradient: "linear(to-b, gray.800, gray.900)",
          color: "whiteAlpha.900",
          fontWeight: "bold",
        },
      },
      ghost: {
        control: {
          color: "textSecondary",
          bg: "buttonBgSecondary",
        },
      },
      none: {
        control: {
          color: "buttonTextPrimary",
          bg: "gray.300",
        },
      },
      button: {
        control: {
          bg: "gray.200",
          color: "gray.800",
          _checked: {
            bg: "primary",
            color: "white",
            _hover: {
              bg: "primary.600",
            },
          },
          _hover: {
            bg: "gray.300",
          },
        },
      },
    },
  },
});

import { defineRecipe } from "@pandacss/dev";

export const buttonIconRecipe = defineRecipe({
  className: "iconButton",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "full",
    padding: "calc(.1rem + var(--panda-density-padding, 8px))",
    _hover: {
      cursor: "pointer",
    },
  },
  variants: {
    size: {
      "1x": {
        padding: "2px",
        fontSize: "0.75rem",
      },
      sm: {
        padding: "4px",
        fontSize: "0.875rem",
      },
      md: {},
      lg: {
        padding: "12px",
        fontSize: "1.25rem",
      },
    },
    variant: {
      solid: {
        bg: "buttonBgAccent",
        color: "var(--text-primary)",
        _hover: {
          bg: "buttonBgSecondary",
          color: "var(--text-primary)",
        },
      },
      outline: {
        bg: "buttonBgAccent",
        color: "var(--text-primary)",
        border: "1px solid",
        borderColor: "borderBgSecondary",
        borderRadius: 0,
        _hover: {
          border: "2px solid",
          bg: "buttonBgHover",
        },
      },
      aurora: {
        backgroundImage: "linear-gradient(to right, #ff7e5f, #feb47b)",
        color: "buttonTextPrimary",
        borderColor: "transparent",
        _hover: {
          opacity: 0.9,
        },
      },
      glass: {
        position: "relative",
        overflow: "hidden",
        border: "2px solid",
        borderColor: "black",
        borderRadius: "xl",
        bg: "buttonBgAccent",
        color: "var(--text-primary)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        fontWeight: "bold",
        lineHeight: "shorter",
        transition: "all 0.3s ease",
        _hover: {
          bg: "buttonBgSecondary",
          borderColor: "rgba(255,255,255,0.4)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.1)",
          transform: "translateY(-1px)",
          textDecoration: "none",
        },
        _active: {
          transform: "translateY(0)",
          bg: "rgba(255,255,255,0.15)",
        },
        _before: {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "50%",
          borderRadius: "inherit",
          bg: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)",
          zIndex: 0,
          pointerEvents: "none",
        },
      },
      matte: {
        bgGradient: "linear(to-b, gray.800, gray.900)",
        borderColor: "gray.700",
        borderWidth: "1px",
        boxShadow: "md",
        bg: "buttonBgAccent",
        color: "var(--text-primary)",
        borderRadius: "lg",
        fontWeight: "bold",
      },
      ghost: {
        bg: "buttonBgAccent/50",
        color: "var(--text-primary)",
        _hover: {
          bg: "buttonBgAccent",
          color: "var(--text-primary)",
          border: "1px solid",
          borderColor: "gray.700",
        },
      },
      none: {
        color: "textMain",
        bg: "gray.300",
        _hover: {
          bg: "gray.100",
        },
      },
    },
  },
});

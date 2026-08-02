import { defineRecipe } from "@pandacss/dev";

export const buttonRecipe = defineRecipe({
  className: "button",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "semibold",
    padding: "calc(.2rem + var(--panda-density-padding, 8px))",
    /**
     * The tap-target floor, enforced structurally (NEH-220, NEH-251).
     *
     * Until now this recipe set no minimum and the button's size *emerged*
     * from padding plus the inherited font size. That looked fine and was not:
     * a short label produced a 42.375px-tall control against a 44px
     * requirement, and the two component tests asserting the floor were marked
     * `test.fail()` — the requirement was documented, visible, and unmet.
     *
     * Emergent sizing is also fragile in a way a constant is not. The font
     * scale is host-tunable and just moved (md 1.375rem -> 1rem), which drops
     * every button that depends on font size for its height. A floor that
     * survives a typography change has to be stated, not derived.
     */
    minHeight: "48px",
    minWidth: "48px",
    _hover: {
      cursor: "pointer",
    },
    border: "1px solid",
    borderColor: "borderBgPrimary",
    borderRadius: "var(--radii-md, 0.375rem)",
  },
  variants: {
    variant: {
      solid: {
        bg: "buttonBgAccent",
        color: "textPrimary",
        _hover: {
          bg: "buttonBgSecondary",
          color: "textPrimary",
        },
      },
      outline: {
        bg: "buttonBgAccent",
        border: "2px solid",
        borderRadius: 0,
        _hover: {
          border: "2px solid",
          bg: "buttonBgAccentHover",
        },
      },
      aurora: {
        backgroundImage: "linear-gradient(to right, #ff7e5f, #feb47b)",
        color: "buttonTextPrimary",
        _hover: {
          opacity: 0.9,
        },
      },
      glass: {
        position: "relative",
        overflow: "hidden",
        border: "2px solid",
        borderRadius: "xl",
        bg: "buttonBgAccent",
        color: "textPrimary",
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
        color: "textPrimary",
        borderRadius: "lg",
        fontWeight: "bold",
      },
      ghost: {
        bg: "boxBgSecondary/90",
        color: "textPrimary",
        _hover: {
          bg: "boxBgSecondary",
        },
      },
      selected: {
        color: "textPrimary",
        border: "3px dashed black",
        borderRadius: "xl",
        bg: "boxBgAccent",
      },
      none: {
        color: "textMain",
        bg: "white"
      },
      unstyled: {
        color: "inherit",
        border: "none",
        backgroundColor: "transparent",
      },
      link: {
        color: "textMain",
        border: "1px solid transparent",
        textDecoration: "underline",
        _hover: {
          color: "buttonTextAccent",
        },
        _active: {
          color: "buttonTextSecondary",
        },
      },
    },
  },
});

import { defineRecipe } from "@pandacss/dev";

export const buttonIconRecipe = defineRecipe({
  className: "iconButton",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    // A `<button>` does not inherit the page font — see input-surface (NEH-289).
    fontFamily: "body",
    borderRadius: "full",
    padding: "calc(.1rem + var(--panda-density-padding, 8px))",
    /**
     * The tap-target floor (NEH-220, NEH-251). See `button.ts` for why this is
     * a stated constant rather than something padding happens to produce.
     *
     * It applies to the BASE, so the `size` variants below shrink the padding
     * and the glyph but not the hit area. That is deliberate and is the whole
     * point: `size="1x"` exists to make an icon look small in a dense toolbar,
     * not to make it hard to hit. A 20px control is a WCAG 2.5.5 failure
     * whatever it is called, and this audience has elevated rates of motor
     * impairment.
     */
    minHeight: "48px",
    minWidth: "48px",
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
      /**
       * `md` states its font size rather than inheriting (NEH-251).
       *
       * It used to be `{}`. That does not mean "the base size" — the base sets
       * no `font-size`, so a `<button>` fell through to the USER-AGENT
       * stylesheet, which in Chrome is `13.3333px`. Three consequences, none
       * of them visible without measuring:
       *
       *   - `md` rendered SMALLER than `sm` (13.33px vs 14px), so the size
       *     scale ran 12, 14, 13.33, 20 — non-monotonic in the middle
       *   - the default icon button was the one control in the system not
       *     using the type scale at all
       *   - it was a px value, so it ignored the browser's own font setting
       *
       * Found by the component tier the moment it started asserting glyph size
       * instead of box size; the old assertion only required two distinct box
       * heights, which a broken middle satisfies.
       */
      md: {
        fontSize: "1rem",
      },
      lg: {
        padding: "12px",
        fontSize: "1.25rem",
      },
    },
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
        color: "textPrimary",
        border: "1px solid",
        borderColor: "borderBgSecondary",
        borderRadius: 0,
        _hover: {
          border: "2px solid",
          bg: "buttonBgAccentHover",
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
        bg: "buttonBgAccent/50",
        color: "textPrimary",
        _hover: {
          bg: "buttonBgAccent",
          color: "textPrimary",
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

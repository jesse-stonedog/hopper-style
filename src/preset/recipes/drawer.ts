import { defineRecipe } from "@pandacss/dev";

export const drawerRecipe = defineRecipe({
  className: "drawer",
  base: {
    position: "fixed",
    zIndex: "modal",
    border: "1px solid",
    borderColor: "borderBgPrimary",
    px: { base: 2, md: 4 },
    py: { base: 2, md: 4 },
    background: "boxBgAccent",
    color: "textPrimary",
    boxShadow: "lg", // Use token for shadow
    outline: "none",
    transition: "transform 0.3s ease-in-out", // Smooth transition
    display: "flex",
    flexDirection: "column",
    _focusVisible: {
      outline: "3px solid token(colors.accent)",
      outlineOffset: "2px",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "boxBgSecondary",
        color: "textSecondary", // Updated to match tokens
      },
      outline: {
        bg: "boxBgPrimary", // Changed from inherit to a specific background to avoid transparency issue if that's the intent, or keep inherit if it should be transparent but with border. User complained about transparency. Let's try matching solid but with border.
        color: "textPrimary",
        border: "1px solid",
        borderColor: "borderBgPrimary",
      },
      aurora: {
        // Token references, not literal `var(--hopper-…)`: the custom-property
        // prefix is configurable per consumer, so a hardcoded namespace paints
        // nothing for any host that chose a different one.
        backgroundImage:
          "linear-gradient(to right, {colors.boxBgAccent}, {colors.boxBgSecondary})",
        color: "white",
        borderColor: "transparent",
        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
      },
      glass: {
        bg: "boxBgSecondary",
        color: "textSecondary",
        backdropFilter: "blur(15px)",
        borderWidth: "1px",
        borderColor: "borderBgSecondary/20",
        boxShadow: "2xl",
        lineHeight: "base",
      },
      matte: {
        bg: "boxBgSecondary",
        color: "textSecondary",
        borderColor: "borderBgSecondary",
      },
      none: {},
    },
    placement: {
      left: {
        top: 0,
        left: 0,
        height: "100dvh",
        width: { base: "100%", sm: "375px", md: "450px", lg: "600px" },
      },
      right: {
        top: 0,
        right: 0,
        height: "100dvh",
        width: { base: "100%", sm: "375px", md: "450px", lg: "600px" },
      },
      top: {
        top: 0,
        left: 0,
        right: 0,
        width: "100vw",
        height: "auto",
      },
      bottom: {
        bottom: 0,
        left: 0,
        right: 0,
        width: "100vw",
        height: "auto",
      },
    },
    open: {
      true: {
        transform: "none", // Drawer is visible
      },
      false: {}, // Handled by compound variants
    },
  },
  // Use compound variants to combine placement and state for a clean API
  compoundVariants: [
    {
      placement: "left",
      open: false,
      css: { transform: "translateX(-100%)" },
    },
    {
      placement: "right",
      open: false,
      css: { transform: "translateX(100%)" },
    },
    {
      placement: "top",
      open: false,
      css: { transform: "translateY(-100%)" },
    },
    {
      placement: "bottom",
      open: false,
      css: { transform: "translateY(100%)" },
    },
  ],
  defaultVariants: {
    variant: "solid",
    placement: "right",
    open: false,
  },
});

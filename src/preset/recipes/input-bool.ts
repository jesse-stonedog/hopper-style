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
      minHeight: "48px",
      width: "48px",
      /**
       * This slot is a native `<input type="checkbox">` at `appearance: auto`,
       * which changes what styling it is even possible to express (NEH-234).
       *
       * Verified in the component-test harness rather than assumed: a raw
       * checkbox given a red 2px border and a slate background paints as the
       * default white box. The UA draws the widget and discards
       * `background-color`, `border-*` and `border-radius` — while
       * `getComputedStyle` cheerfully reports all of them, which is what made
       * this recipe look styled for so long.
       *
       * The three it DOES honour, and therefore the only levers here:
       * `accent-color` (the checked fill and tick), `box-shadow` (painted
       * outside the widget) and `outline` (the focus ring).
       *
       * The `border`/`background` declarations are kept and pointed at real
       * tokens anyway: they cost nothing, they say what the control means, and
       * they are what would render if a consumer ever sets `appearance: none`.
       */
      border: "1px solid",
      borderColor: "borderBgPrimary",
      borderRadius: "md",
      backgroundColor: "boxBgMain",
      // Carries the host's theme into the tick. Without it a checked box is
      // Chromium's own blue in every theme this package can wear.
      accentColor: "buttonBgPrimary",
      cursor: "pointer",
      "&:focus": {
        // Was `2px solid var(--colors-blue-500, #3182ce)` — Panda's blue, fixed
        // in every theme including dark and high-contrast, which is exactly
        // where a keyboard user cannot afford to lose the focus ring.
        outline: "2px solid",
        outlineColor: "textPop",
        outlineOffset: "2px",
      },
      boxShadow: "none",
      _hover: {
        cursor: "pointer",
      },
      // `primary` was undefined vocabulary, so a ticked checkbox got no fill
      // of its own and fell back to the UA's (NEH-301).
      _checked: {
        bg: "buttonBgPrimary",
        borderColor: "borderBgPrimary",
      },
    },
    label: {},
  },
  variants: {
    variant: {
      /**
       * solid vs outline (NEH-234).
       *
       * These were declared identically — same `buttonBgAccent`, same
       * `textPrimary` — so two of the five appearances a user can pick app-wide
       * rendered the same checkbox. Worse, neither declaration painted at all
       * (see the note in `base`), so the variant was doubly a lie.
       *
       * `buttonRecipe` expresses outline as a 2px edge with squared corners.
       * A native checkbox discards `border`, so the same reading is carried by
       * a `box-shadow` ring, which it does paint — squared to match, and
       * themed. `solid` states `none` explicitly rather than by omission, so
       * switching between them cannot leave a ring behind.
       */
      solid: {
        control: {
          bg: "buttonBgAccent",
          color: "textPrimary",
          accentColor: "buttonBgPrimary",
          boxShadow: "none",
        },
      },
      outline: {
        control: {
          bg: "buttonBgAccent",
          color: "textPrimary",
          /**
           * The SAME checked fill as `solid`, deliberately.
           *
           * Giving outline a recessive `accentColor` did make the two more
           * different — and made a ticked outline checkbox a dark box on a dark
           * surface, which is the checked state, the one thing the control
           * exists to communicate. Distinguishing an appearance must not cost
           * state legibility, so the difference is carried entirely by the ring
           * and the corners.
           */
          accentColor: "buttonBgPrimary",
          boxShadow: "0 0 0 2px {colors.borderBgPrimary}",
          borderRadius: "0",
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
          // `whiteAlpha.900` never painted (NEH-301). `white` rather than a
          // token for the same reason as boxRecipe's matte: the surface above
          // is a FIXED dark gradient, so themed text on it risks dark-on-dark.
          color: "white",
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
          // `primary` / `primary.600` were undefined vocabulary, so the
          // checked and checked-hover fills never painted (NEH-301). The
          // hover step is the matching `*Hover` token rather than an invented
          // darker shade — this package holds no colour scales to step along.
          _checked: {
            bg: "buttonBgPrimary",
            color: "buttonTextPrimary",
            _hover: {
              bg: "buttonBgPrimaryHover",
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

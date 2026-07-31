/**
 * The one definition of what a form control looks like.
 *
 * A text input and a dropdown that sit next to each other in a form are the
 * same object to the person filling it in, so they must be pixel-identical
 * apart from the dropdown's indicator. They stopped being identical because
 * `input-text.ts` and `input-dropdown.ts` were copy-pasted and then edited
 * separately: the dropdown grew a per-variant `borderColor` and the text input
 * did not, so their borders diverged at `outline`, `aurora`, and `glass` — and
 * `glass` is the app-wide default (`lib/slices/configSlice.ts`). Everything
 * else — padding, the 44px minimum target, the focus ring, the disabled
 * treatment — was duplicated verbatim and would have drifted next (NEH-84).
 *
 * Both recipes now spread these. A control that needs to differ should say so
 * in its own recipe, deliberately, rather than by having been forked.
 */

/**
 * Everything true of a control regardless of variant.
 *
 * `minHeight: 44px` is the WCAG 2.5.5 (AAA) target size and is not negotiable
 * downward — see the UX & accessibility floor in CLAUDE.md. Padding keys off
 * `--panda-density-padding` so the control tracks Settings → Density.
 */
export const inputSurfaceBase = {
  width: "100%",
  minWidth: 0,
  display: "block",
  boxSizing: "border-box",
  outline: "none",
  border: "1px solid",
  borderColor: "borderBgPrimary",
  borderRadius: "var(--radii-md, 0.375rem)",
  padding:
    "calc(var(--panda-density-padding, 8px) + 4px) calc(var(--panda-density-padding, 8px) + 8px)",
  margin: 0,
  minHeight: "44px",
  fontSize: "var(--font-sizes-xl, 1.25rem)",
  transition: "box-shadow 0.2s, border-color 0.2s",
  // A token, not `black`: the base has to be legible on whatever the variant
  // paints, and in dark mode. The one variant that hard-codes a white
  // background states its own colour.
  color: "textPrimary",
  _hover: {
    cursor: "pointer",
  },
  "&:focus": {
    borderColor: "borderBgSecondary",
    boxShadow: "0 0 0 1px boxBgSecondary",
  },
  "&:disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  "&::placeholder": {
    color: "textPrimary",
    opacity: 1,
  },
} as const;

/**
 * The variant map. Every variant states its own `bg`, `color`, and
 * `borderColor` rather than inheriting some and not others — that asymmetry is
 * what let the two recipes disagree without either looking wrong on its own.
 */
export const inputSurfaceVariants = {
  solid: {
    bg: "boxBgAccent",
    color: "textPrimary",
    borderColor: "borderBgPrimary",
  },
  outline: {
    // Stated, not omitted. An outline control is meant to show whatever is
    // behind it, and saying so is what stops the next editor from "fixing" the
    // missing background with a colour.
    bg: "transparent",
    color: "textPrimary",
    borderColor: "borderBgSecondary",
    borderRadius: "0",
  },
  aurora: {
    backgroundImage: "linear-gradient(to right, boxBgAccent, boxBgSecondary)",
    color: "textPrimary",
    borderColor: "borderBgAccent",
  },
  glass: {
    position: "relative",
    overflow: "hidden",
    borderWidth: "2px",
    borderStyle: "solid",
    borderRadius: "xl",
    bg: "boxBgAccent",
    color: "textPrimary",
    borderColor: "borderBgSecondary",
    backdropFilter: "blur(12px)",
    fontWeight: "normal",
    _placeholder: {
      color: "textPrimary",
      opacity: 0.8,
    },
    _focusVisible: {
      borderColor: "borderBgPrimary",
      boxShadow: "borderBgPrimary",
      zIndex: 1,
    },
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      boxShadow: "none",
    },
    _before: {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      bgGradient:
        "linear(to-br, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      zIndex: -1,
    },
  },
  matte: {
    bg: "buttonBgSecondary",
    color: "textSecondary",
    borderColor: "borderBgPrimary",
  },
  ghost: {
    color: "textSecondary",
    bg: "buttonBgSecondary",
    borderColor: "borderBgPrimary",
    "&::placeholder": {
      color: "textSecondary/60",
    },
  },
  none: {
    border: "none",
    backgroundColor: "white",
    // Explicit because the background is a literal white that no theme can
    // change; inheriting the base token would put light text on it in dark
    // mode. The hard-coded white itself is NEH-86's to remove.
    color: "black",
  },
} as const;

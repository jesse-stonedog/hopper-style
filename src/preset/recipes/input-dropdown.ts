import { defineRecipe } from "@pandacss/dev";
import { inputSurfaceBase, inputSurfaceVariants } from "./input-surface";

// Trigger / closed-state appearance.
//
// The surface is shared with `inputTextRecipe` — see `input-surface.ts` for
// why the two must not be maintained separately (NEH-84). Anything specific to
// a dropdown trigger belongs here; anything that should also be true of a text
// input belongs in the shared surface.
export const inputDropdownRecipe = defineRecipe({
  className: "input-dropdown",
  base: inputSurfaceBase,
  variants: {
    variant: inputSurfaceVariants,
  },
});

// Expanded-state appearance: content container, groups, and group labels
export const inputDropdownContentRecipe = defineRecipe({
  className: "input-dropdown-content",
  base: {},
  variants: {
    part: {
      content: {
        borderRadius: "md",
        boxShadow: "lg",
        maxHeight: "widgetBaseHeight",
        overflowY: "auto",
      },
      item: {
        bg: "boxBgPrimary",
        borderBottom: "1px solid",
        borderColor: "borderBgSecondary",
        padding: "var(--panda-density-padding, 8px)",
        borderRadius: "sm",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "boxBgSecondary",
        },
        "&[data-highlighted]": {
          backgroundColor: "boxBgSecondary",
        },
      },
      itemGroup: {
        zIndex: 30020,
      },
      itemGroupLabel: {
        zIndex: 30020,
        fontWeight: "bold",
        // A token, not gray.500: the label sits on boxBgPrimary, whose colour
        // the theme decides, so a fixed mid-grey is an unverified contrast bet
        // in every palette but the one it was picked against.
        color: "textSecondary",
        fontSize: "sm",
        padding: "calc(var(--panda-density-padding, 8px) * 0.5)",
      },
    },
  },
});

// Individual dropdown item styling
export const inputDropdownItemRecipe = defineRecipe({
  className: "input-dropdown-item",
  base: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "var(--font-sizes-lg, 0.95rem)",
    color: "textPrimary",
    bg: "boxBgPrimary",
    transition: "background 0.15s ease, color 0.15s ease",
    "&:hover": {
      bg: "boxBgSecondary",
    },
    "&[data-highlighted]": {
      bg: "boxBgSecondary",
    },
    "&:not(:last-child)": {
      borderBottom: "1px solid",
      borderColor: "borderBgSecondary/40",
    },
    "&:active": {
      bg: "boxBgSecondary",
      opacity: 0.85,
    },
  },
  variants: {
    part: {
      item: {},
    },
  },
});
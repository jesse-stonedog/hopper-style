import { definePreset } from "@pandacss/dev";

import { arrowRecipe } from "./recipes/arrows";
import { boxRecipe } from "./recipes/box";
import { buttonRecipe } from "./recipes/button";
import { buttonIconRecipe } from "./recipes/icon-button";
import { dlRecipe } from "./recipes/dl-list";
import { drawerRecipe } from "./recipes/drawer";
import { formRecipe } from "./recipes/form";
import { iconRecipe } from "./recipes/icon";
import { inputBoolRecipe } from "./recipes/input-bool";
import {
  inputDropdownContentRecipe,
  inputDropdownItemRecipe,
  inputDropdownRecipe,
} from "./recipes/input-dropdown";
import { inputRadioRootRecipe } from "./recipes/input-radio";
import { inputTextRecipe } from "./recipes/input-text";
import { listRecipe } from "./recipes/list";
import { menuRecipe } from "./recipes/menu";
import {
  separatorHorizontalRecipe,
  separatorVerticalRecipe,
} from "./recipes/separator";
import { stackRecipe } from "./recipes/stack";
import { stripedRecipe } from "./recipes/striped";
import { textRecipe } from "./recipes/text";
import { tooltipRecipe } from "./recipes/tooltip";

import {
  DEFAULT_CSS_VAR_PREFIX,
  createSemanticColors,
  createSemanticSizes,
} from "./semantic-variables";

export interface StonedogStylePresetOptions {
  /**
   * Namespace for the CSS custom properties the colour tokens read.
   *
   * `"hopper"` yields `var(--hopper-box-primary-bg)`; `"optima"` yields
   * `var(--optima-box-primary-bg)`. Only change this if the host application
   * emits its theme under a different namespace — the value must match whatever
   * writes those properties at runtime, and a mismatch renders every colour as
   * nothing at all (see semantic-variables.ts).
   *
   * @default "hopper"
   */
  cssVarPrefix?: string;
}

/**
 * Every recipe, keyed by the name it is exported under in `styled-system/recipes`.
 *
 * Four of these (`listRecipe`, `menuRecipe`, `inputBoolRecipe`,
 * `inputRadioRootRecipe`) are slot recipes declared with `defineSlotRecipe`.
 * Panda accepts them here rather than under `slotRecipes` and generates them
 * correctly — verified against HopperGuard's own generated output. Moving them
 * to `slotRecipes` would be more "correct" by the docs and would change the
 * generated surface, so it is deliberately not done during extraction.
 */
const recipes = {
  arrowRecipe,
  boxRecipe,
  buttonRecipe,
  buttonIconRecipe,
  dlRecipe,
  drawerRecipe,
  formRecipe,
  iconRecipe,
  inputBoolRecipe,
  inputDropdownRecipe,
  inputDropdownContentRecipe,
  inputDropdownItemRecipe,
  inputRadioRootRecipe,
  inputTextRecipe,
  listRecipe,
  menuRecipe,
  separatorHorizontalRecipe,
  separatorVerticalRecipe,
  stackRecipe,
  stripedRecipe,
  textRecipe,
  tooltipRecipe,
};

/**
 * Force every variant of every recipe into the stylesheet.
 *
 * The style variant (`solid | outline | aurora | glass | matte`) is chosen by
 * the *user* at runtime, not by the code, so Panda's static extractor has no way
 * to know which classes will be needed — it only ever sees `variant={variant}`.
 * Without this, switching variants at runtime yields elements with class names
 * that have no corresponding CSS, which fails as an unstyled component rather
 * than as an error.
 */
const staticCssRecipes = Object.fromEntries(
  Object.keys(recipes).map((name) => [name, ["*"]]),
) as Record<keyof typeof recipes, ["*"]>;

/**
 * The stonedog-style Panda preset: colour tokens, breakpoints, keyframes, and
 * the 22 recipes the component library is built on.
 *
 * Deliberately does NOT set `globalCss`, `preflight`, `include`, or `outdir` —
 * those are application decisions, and a preset that quietly restyles `body` is
 * a preset that is hard to adopt. The consuming app owns them. See CLAUDE.md.
 */
export function stonedogStylePreset(options: StonedogStylePresetOptions = {}) {
  const { cssVarPrefix = DEFAULT_CSS_VAR_PREFIX } = options;

  return definePreset({
    name: "stonedog-style",
    theme: {
      extend: {
        /**
         * The full responsive scale, declared here rather than only the one
         * value that differs from Panda's default.
         *
         * The originating app declared only `3xl` and inherited `sm`–`2xl` from
         * `@pandacss/preset-panda`. That works right up until a consumer passes
         * a `presets` array — which **replaces** Panda's defaults rather than
         * adding to them — at which point `md` silently stops being a valid
         * breakpoint and every responsive prop in the library becomes a type
         * error, or worse, a dropped style. Restating all six makes the preset
         * self-sufficient for the values its components actually reference.
         *
         * The base presets are still required for tokens and utilities — see
         * the consumer wiring in CLAUDE.md.
         */
        breakpoints: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
          "3xl": "1600px",
        },
        tokens: {
          colors: createSemanticColors(cssVarPrefix),
          sizes: createSemanticSizes(cssVarPrefix),
        },
        keyframes: {
          spin: {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
          // The disabled strike-through on StyledInputToggle. A keyframe rather
          // than a transition because it plays once on appearance, and there is
          // no "before" state to transition from.
          stonedogStrikeIn: {
            "0%": { transform: "scaleX(0)" },
            "100%": { transform: "scaleX(1)" },
          },
        },
        recipes,
      },
    },
    staticCss: {
      recipes: staticCssRecipes,
    },
  });
}

export {
  DEFAULT_CSS_VAR_PREFIX,
  TEXT_BACKGROUND_PAIRS,
  colorTokenNames,
  createSemanticColors,
  createSemanticSizes,
  getBackgroundForText,
  requiredCssCustomProperties,
} from "./semantic-variables";

export { recipes as stonedogStyleRecipes };

/* ------------------------------------------------------------------------- *
 * Deprecated `hopper*` aliases — NEH-251.
 *
 * The package renamed hopper-style → stonedog-style. These re-exports exist so
 * each consumer can bump its submodule pointer on its own schedule instead of
 * every repo having to move in one lockstep sweep, which is what would make an
 * ordered set of PRs impossible.
 *
 * They are a migration seam with an end date, not a compatibility promise.
 * Remove them once HopperGuard, optima-filings and optima-cloud-saas have all
 * landed their consumer PRs.
 * ------------------------------------------------------------------------- */

/** @deprecated Renamed to `stonedogStylePreset`. Removed once every consumer has migrated (NEH-251). */
export const hopperStylePreset = stonedogStylePreset;

/** @deprecated Renamed to `StonedogStylePresetOptions`. Removed once every consumer has migrated (NEH-251). */
export type HopperStylePresetOptions = StonedogStylePresetOptions;

/** @deprecated Renamed to `stonedogStyleRecipes`. Removed once every consumer has migrated (NEH-251). */
export { recipes as hopperStyleRecipes };

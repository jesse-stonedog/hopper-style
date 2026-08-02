import { DENSITY_PROFILES, type DensityProfile } from "./types";

/**
 * How tightly the UI packs — **one ladder, read from two places** (NEH-251).
 *
 * The proposal that led here had two vocabularies: an app-level preset
 * (`Compact | Standard | Spacious`) and the user-facing profile this package
 * already shipped (`compact | normal | comfortable`). Two axes sharing the word
 * "compact" is how a call site ends up asking for one and getting the other.
 *
 * They are not two axes. They are a position and an offset on the same scale:
 *
 * ```
 *   tight ── compact ── standard ── spacious ── airy
 *     0         1           2          3         4
 *
 *   the APP picks a rung           (densityBase)
 *   the USER shifts it by one      (density: compact -1 / normal 0 / comfortable +1)
 * ```
 *
 * So HopperGuard sits at `spacious` and its density button moves a user between
 * `standard`, `spacious` and `airy`; Optima sits at `compact` and the same
 * button moves between `tight`, `compact` and `standard`. One control, one
 * scale, and the app's choice of baseline is the only thing that differs.
 *
 * ## The numbers are not new
 *
 * HopperGuard already shipped `compact: 4px`, `normal: 8px`, `comfortable: 16px`.
 * Those are exactly the `compact`, `standard` and `spacious` rungs below — the
 * ladder was extracted from what the product already did, then extended by one
 * step at each end, rather than invented.
 *
 * `standard` is also this package's long-standing fallback (`8px`), which is why
 * `DEFAULT_STYLE_CONFIG.densityBase` is `"standard"`: a host that says nothing
 * gets exactly what it got before.
 */
export const DENSITY_STEPS = [
  "tight",
  "compact",
  "standard",
  "spacious",
  "airy",
] as const;
export type DensityStep = (typeof DENSITY_STEPS)[number];

/**
 * The rungs an application may sit on.
 *
 * Deliberately the middle three, not all five: `tight` and `airy` exist so that
 * a user at either extreme still has somewhere to go. An app based at `airy`
 * would give its "comfortable" users nothing, which is a worse failure than not
 * offering the rung at all.
 */
export const DENSITY_BASES = ["compact", "standard", "spacious"] as const;
export type DensityBase = (typeof DENSITY_BASES)[number];

/** How far each user profile shifts the app's baseline. */
const PROFILE_OFFSET: Record<DensityProfile, number> = {
  compact: -1,
  normal: 0,
  comfortable: 1,
};

/**
 * Spacing per rung, in the two custom properties the recipes read.
 *
 * `--panda-density-padding` and `--panda-density-margin` are an existing seam:
 * six recipes already fold them into their own padding
 * (`calc(.2rem + var(--panda-density-padding, 8px))`). This table gives hosts a
 * single source for what to write into them, instead of each one keeping its
 * own copy — which is what HopperGuard was doing.
 *
 * These do **not** affect the tap-target floor. That is a `min-height` stated in
 * the recipes, so no density can push a control under it; the two compose
 * rather than compete.
 */
export const DENSITY_METRICS: Record<
  DensityStep,
  { readonly padding: string; readonly margin: string }
> = {
  tight: { padding: "2px", margin: "2px" },
  compact: { padding: "4px", margin: "4px" },
  standard: { padding: "8px", margin: "8px" },
  spacious: { padding: "16px", margin: "16px" },
  airy: { padding: "24px", margin: "24px" },
};

export function isDensityStep(value: unknown): value is DensityStep {
  return DENSITY_STEPS.includes(value as DensityStep);
}

export function isDensityBase(value: unknown): value is DensityBase {
  return DENSITY_BASES.includes(value as DensityBase);
}

/**
 * Where the app's baseline and the user's preference land, together.
 *
 * Clamped at both ends rather than wrapping or throwing: a user at the bottom
 * of the scale choosing "compact" again should stay put, not silently jump to
 * the loosest setting. Both inputs are validated, because at least one of them
 * usually arrives from storage or an API and may predate a rename.
 */
export function resolveDensityStep(
  base: DensityBase,
  profile: DensityProfile,
): DensityStep {
  const safeBase: DensityBase = isDensityBase(base) ? base : "standard";
  const safeProfile: DensityProfile = DENSITY_PROFILES.includes(profile)
    ? profile
    : "normal";

  const index = DENSITY_STEPS.indexOf(safeBase);
  const shifted = index + (PROFILE_OFFSET[safeProfile] ?? 0);
  const clamped = Math.min(Math.max(shifted, 0), DENSITY_STEPS.length - 1);

  // The index is clamped into range, so this cannot miss — returning the base
  // rather than asserting keeps the function total.
  return DENSITY_STEPS[clamped] ?? safeBase;
}

/**
 * The custom properties a host should write for a given rung.
 *
 * Returned as data rather than applied here on purpose: this package does not
 * touch the document. Where those properties get written — `documentElement`, a
 * wrapper's inline style, a server-rendered `<style>` — is a host decision, and
 * a library that reaches for `document` breaks server rendering for everyone.
 */
export function densityCustomProperties(
  step: DensityStep,
): Record<string, string> {
  const metrics = DENSITY_METRICS[step];
  return {
    "--panda-density-padding": metrics.padding,
    "--panda-density-margin": metrics.margin,
  };
}

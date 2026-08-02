import {
  DENSITY_BASES,
  DENSITY_METRICS,
  DENSITY_STEPS,
  densityCustomProperties,
  isDensityBase,
  isDensityStep,
  resolveDensityStep,
} from "../density";
import { DENSITY_PROFILES } from "../types";
import { DEFAULT_STYLE_CONFIG } from "../style-config";

describe("the density ladder", () => {
  it("keeps the app baseline and the user preference on ONE scale", () => {
    // The whole point of the design. If these ever become independent axes,
    // "compact" means two different things and a call site can ask for one and
    // get the other — which is the collision this replaced.
    for (const base of DENSITY_BASES) {
      expect(DENSITY_STEPS).toContain(base);
    }
  });

  it("leaves room to move at both ends", () => {
    // `tight` and `airy` exist so a user at an extreme base still has somewhere
    // to go. An app based at the top would give its "comfortable" users
    // nothing — a worse failure than not offering the rung.
    for (const base of DENSITY_BASES) {
      const index = DENSITY_STEPS.indexOf(base);
      expect(index).toBeGreaterThan(0);
      expect(index).toBeLessThan(DENSITY_STEPS.length - 1);
    }
  });

  describe("resolution", () => {
    it("moves one rung per user preference, in the right direction", () => {
      expect(resolveDensityStep("standard", "compact")).toBe("compact");
      expect(resolveDensityStep("standard", "normal")).toBe("standard");
      expect(resolveDensityStep("standard", "comfortable")).toBe("spacious");
    });

    it("gives each product the range NEH-251 specified", () => {
      // HopperGuard: spacious by default, still able to tighten.
      expect(resolveDensityStep("spacious", "compact")).toBe("standard");
      expect(resolveDensityStep("spacious", "normal")).toBe("spacious");
      expect(resolveDensityStep("spacious", "comfortable")).toBe("airy");
      // Optima: compact by default, still able to loosen.
      expect(resolveDensityStep("compact", "compact")).toBe("tight");
      expect(resolveDensityStep("compact", "normal")).toBe("compact");
      expect(resolveDensityStep("compact", "comfortable")).toBe("standard");
    });

    it("clamps rather than wrapping at the ends", () => {
      // Wrapping would send a user asking for tighter to the loosest setting —
      // the most surprising possible response to that request.
      const tightest = resolveDensityStep("compact", "compact");
      expect(tightest).toBe("tight");
      expect(DENSITY_STEPS.indexOf(tightest)).toBe(0);
    });

    it("falls back instead of throwing on values from storage", () => {
      // Both inputs usually arrive from localStorage or an API and may predate
      // a rename. A styling preference is never worth crashing a render over.
      expect(resolveDensityStep("nonsense" as never, "normal")).toBe("standard");
      expect(resolveDensityStep("standard", "nonsense" as never)).toBe("standard");
    });

    it("resolves every base/profile pair to a real step", () => {
      for (const base of DENSITY_BASES) {
        for (const profile of DENSITY_PROFILES) {
          expect(isDensityStep(resolveDensityStep(base, profile))).toBe(true);
        }
      }
    });
  });

  describe("metrics", () => {
    it("covers every step", () => {
      // A step with no metrics resolves to `undefined` padding, which CSS drops
      // silently — the failure mode this package keeps relearning.
      expect(Object.keys(DENSITY_METRICS).sort()).toEqual([...DENSITY_STEPS].sort());
    });

    it("increases monotonically", () => {
      const px = DENSITY_STEPS.map((s) => parseFloat(DENSITY_METRICS[s].padding));
      expect(px).toEqual([...px].sort((a, b) => a - b));
      expect(new Set(px).size).toBe(px.length);
    });

    it("emits the two properties the recipes actually read", () => {
      // Six recipes fold these into their own padding. A typo here is invisible
      // until someone measures a control.
      expect(densityCustomProperties("standard")).toEqual({
        "--panda-density-padding": "8px",
        "--panda-density-margin": "8px",
      });
    });
  });

  it("defaults to exactly what the recipes already fell back to", () => {
    // `calc(.2rem + var(--panda-density-padding, 8px))` is the fallback baked
    // into the recipes. If the unconfigured default ever stops matching it,
    // adding the provider would silently change spacing in every host that
    // previously relied on the fallback.
    const step = resolveDensityStep(
      DEFAULT_STYLE_CONFIG.densityBase,
      DEFAULT_STYLE_CONFIG.density,
    );
    expect(DENSITY_METRICS[step].padding).toBe("8px");
  });

  it("recognises its own vocabularies and rejects the other's extras", () => {
    expect(isDensityBase("standard")).toBe(true);
    expect(isDensityStep("airy")).toBe(true);
    // `airy` is a real step but not a base an app may sit on.
    expect(isDensityBase("airy")).toBe(false);
    expect(isDensityStep("nonsense")).toBe(false);
  });
});

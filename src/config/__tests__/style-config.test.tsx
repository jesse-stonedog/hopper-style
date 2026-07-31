import { renderHook } from "@testing-library/react";
import React from "react";
import {
  HopperStyleProvider,
  useResolvedVariant,
  useStyleConfig,
  DEFAULT_STYLE_CONFIG,
  type StyleConfig,
} from "../style-config";

/** A provider wrapper preset with the given (partial) settings. */
function withConfig(config: Partial<StyleConfig>) {
  return function ConfigWrapper({ children }: { children: React.ReactNode }) {
    return <HopperStyleProvider {...config}>{children}</HopperStyleProvider>;
  };
}

describe("useStyleConfig", () => {
  it("returns the defaults when no provider is mounted", () => {
    // Rendering outside the provider must not throw: a host that forgets to
    // wrap should get a plain, readable UI rather than a crash.
    const { result } = renderHook(() => useStyleConfig());
    expect(result.current).toEqual(DEFAULT_STYLE_CONFIG);
  });

  it("fills in only the settings the host did not supply", () => {
    const { result } = renderHook(() => useStyleConfig(), {
      wrapper: withConfig({ fontSizeProfile: "xl" }),
    });
    expect(result.current.fontSizeProfile).toBe("xl");
    expect(result.current.variant).toBe(DEFAULT_STYLE_CONFIG.variant);
  });
});

describe("useResolvedVariant", () => {
  it("prefers the caller's variant over the app-wide one", () => {
    const { result } = renderHook(() => useResolvedVariant("glass"), {
      wrapper: withConfig({ variant: "matte" }),
    });
    expect(result.current).toBe("glass");
  });

  it("falls back to the app-wide variant when the caller has no opinion", () => {
    const { result } = renderHook(() => useResolvedVariant(undefined), {
      wrapper: withConfig({ variant: "matte" }),
    });
    expect(result.current).toBe("matte");
  });

  it("falls back to solid when neither is set", () => {
    const { result } = renderHook(() => useResolvedVariant(undefined));
    expect(result.current).toBe("solid");
  });

  it.each(["ghost", "selected", "link", "unstyled", "none"])(
    "coerces the non-theme variant %s to solid",
    (variant) => {
      // These are real values elsewhere in the vocabulary, but the theme
      // recipes define no case for them. Passing one through renders an
      // *unstyled* control, which is worse than rendering a plain one.
      const { result } = renderHook(() => useResolvedVariant(variant));
      expect(result.current).toBe("solid");
    },
  );

  it("coerces an unrecognised persisted value to solid", () => {
    // e.g. a variant name written to storage by an older release.
    const { result } = renderHook(() => useResolvedVariant("art-deco"));
    expect(result.current).toBe("solid");
  });
});

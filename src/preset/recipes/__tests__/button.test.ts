/**
 * A `<button>` is not a blank box.
 *
 * With no CSS reset the user agent paints its own `ButtonFace` — an
 * uncontrolled system grey that ignores the theme entirely and changes between
 * light and dark mode and between browsers. This package sets
 * `preflight: false` and does not impose a reset on its consumers, and the
 * largest consumer declares an `@layer reset` it never populates, so a variant
 * that states no background does not render "unstyled": it renders on the
 * browser's grey.
 *
 * `link` was the one variant of ten that stated none (NEH-307). Every other
 * variant gets this guard for free by having a background at all; the point of
 * writing it down is that the ONLY thing standing between this recipe and the
 * UA's paint is the declaration itself, so its absence has to be a test
 * failure rather than something a reader has to notice.
 *
 * The browser-level half of this — proving the declaration actually paints, and
 * that the result no longer follows the UA's colour scheme — lives in
 * `StyledButton.ct.tsx`, because jsdom has no rendering engine and would agree
 * that a discarded declaration took effect.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buttonRecipe } from "../button";

type StyleObject = Record<string, unknown>;

const VARIANTS = [
  "solid",
  "outline",
  "aurora",
  "glass",
  "matte",
  "ghost",
  "selected",
  "none",
  "unstyled",
  "link",
] as const;

const variants = (buttonRecipe.variants?.variant ?? {}) as Record<
  string,
  StyleObject
>;

describe("the button recipe declares a background on every variant (NEH-307)", () => {
  it("offers exactly the variants under test", () => {
    // If a variant is added, it must be added here too — otherwise the guard
    // below silently stops covering it, which is the failure mode this whole
    // file exists to prevent.
    expect(Object.keys(variants).sort()).toEqual([...VARIANTS].sort());
  });

  it.each(VARIANTS)("%s states its own background", (name) => {
    const v = variants[name];
    const paints =
      "bg" in v || "background" in v || "backgroundColor" in v ||
      "backgroundImage" in v || "bgGradient" in v;

    expect({ variant: name, paints }).toEqual({ variant: name, paints: true });
  });

  it("link paints transparent rather than inheriting the UA's ButtonFace", () => {
    // Transparent is the right answer for a link-styled button — the surface
    // behind it should show through — but it has to be SAID. Saying nothing
    // yields the browser's grey, not transparency. `unstyled` already gets
    // this right and is the shape being copied.
    expect(variants.link.backgroundColor).toBe("transparent");
    expect(variants.unstyled.backgroundColor).toBe("transparent");
  });
});

describe("the generated stylesheet carries those declarations (NEH-307)", () => {
  // Asserting on the recipe object alone would repeat NEH-288: a declaration
  // can be present in the source and absent from the emitted CSS, and the
  // class name still applies cleanly with no rule behind it. Read what Panda
  // actually wrote.
  const css = readFileSync(
    join(__dirname, "..", "..", "..", "..", "styled-system", "styles.css"),
    "utf8",
  );

  function ruleFor(variant: string): string {
    const match = css.match(
      new RegExp(`\\.button--variant_${variant}\\s*\\{([^}]*)\\}`),
    );
    expect(match).not.toBeNull();
    return match![1];
  }

  it.each(VARIANTS)("emits a background declaration for %s", (name) => {
    const declares = /(^|[\s;])(background|background-color|background-image)\s*:/.test(
      ruleFor(name),
    );

    expect({ variant: name, declares }).toEqual({
      variant: name,
      declares: true,
    });
  });

  it("emits link's background as a real, theme-controlled value", () => {
    // `transparent` must survive the token layer as CSS the browser accepts.
    // A token name that does not resolve is passed through as a literal, which
    // the browser discards — leaving the UA grey exactly as before, with the
    // declaration present and the bug intact.
    expect(ruleFor("link")).toMatch(
      /background(-color)?:\s*(transparent|var\(--colors-transparent\))/,
    );
  });
});

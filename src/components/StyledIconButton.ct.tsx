import { test, expect } from "@playwright/experimental-ct-react";
import StyledIconButton from "./StyledIconButton";

/**
 * Inline JSX, not a local component. Playwright CT mounts by importing the
 * module a component lives in, so anything DEFINED IN A TEST FILE fails with
 * "Component X cannot be mounted". A plain element has no such problem.
 */
const icon = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="currentColor" />
  </svg>
);

test.describe("tap target", () => {
  // Was NEH-220, same root cause as StyledButton: the recipe set no minimum, so
  // the box was whatever padding plus a 16px icon produced. An icon button is
  // the WORST case for it, having no text to prop the box open — and it is the
  // control most often used for destructive actions.
  //
  // `buttonIconRecipe` now states the floor on its BASE, so the `size` variants
  // shrink the glyph and the padding but never the hit area.

  test("meets the 48x48 CSS px floor", async ({ mount }) => {
    const component = await mount(
      <StyledIconButton aria-label="Delete">{icon}</StyledIconButton>,
    );
    const box = (await component.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(48);
    expect(box.width).toBeGreaterThanOrEqual(48);
  });
});

test.describe("sizes", () => {
  /**
   * `size` scales the GLYPH, not the hit area — a change of meaning (NEH-251).
   *
   * It used to scale the box, and the old test here asserted exactly that: the
   * four variants had to produce at least two distinct heights, because "a size
   * prop that maps two names to the same box is a silently broken knob."
   *
   * That was right while the box was the target. Now `buttonIconRecipe` states
   * a 48px floor on its base, so every variant clamps to 48 and the box can no
   * longer carry the distinction. Keeping the old assertion would have meant
   * exempting `1x` and `sm` from the floor — which is precisely the sub-48
   * target the floor exists to eliminate, and on the control most often used
   * for destructive actions.
   *
   * So the knob still works, it just moved: padding and font-size shrink, the
   * hit area does not. Both halves are asserted, because either alone is
   * satisfiable by a broken implementation — a constant box with a constant
   * glyph passes "the target is big enough", and a growing glyph with a growing
   * box passes "the knob does something".
   */
  test("scale the glyph while the hit area stays put", async ({ mount }) => {
    const measured: { size: string; height: number; font: number }[] = [];
    for (const size of ["1x", "sm", "md", "lg"] as const) {
      const c = await mount(
        <StyledIconButton size={size} aria-label="Go">{icon}</StyledIconButton>,
      );
      measured.push({
        size,
        height: (await c.boundingBox())!.height,
        font: await c.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      });
      await c.unmount();
    }

    // The knob does something: at least two distinct glyph sizes.
    const fonts = measured.map((m) => m.font);
    expect(new Set(fonts).size).toBeGreaterThan(1);
    // ...and it only ever grows.
    expect(fonts).toEqual([...fonts].sort((a, b) => a - b));

    // The target never shrinks below the floor, at any size, at any viewport.
    for (const m of measured) {
      expect(m.height, `size="${m.size}" fell under the floor`).toBeGreaterThanOrEqual(48);
    }
  });
});

test.describe("variants paint", () => {
  for (const variant of ["solid", "outline", "aurora", "glass", "matte"] as const) {
    test(`${variant} resolves to a real background`, async ({ mount }) => {
      const c = await mount(
        <StyledIconButton variant={variant} aria-label="Go">{icon}</StyledIconButton>,
      );
      const bg = await c.evaluate((el) => getComputedStyle(el).background);
      expect(bg).not.toBe("");
      expect(bg).not.toMatch(/^rgba\(0, 0, 0, 0\)(\s|$)/);
    });
  }

  test("the three coerced variants still paint rather than rendering bare", async ({ mount }) => {
    // unstyled/link/selected have no rules in this recipe. Coercion is what
    // stops them rendering as an unstyled box — this asserts the coercion works
    // rather than merely that it is written down.
    for (const variant of ["unstyled", "link", "selected"] as const) {
      const c = await mount(
        <StyledIconButton variant={variant} aria-label="Go">{icon}</StyledIconButton>,
      );
      const box = (await c.boundingBox())!;
      expect(box.width).toBeGreaterThan(16);
      await c.unmount();
    }
  });
});

test.describe("accessibility", () => {
  test("is announced by its label, not as a bare button", async ({ mount, page }) => {
    await mount(<StyledIconButton aria-label="Delete note">{icon}</StyledIconButton>);
    await expect(page.getByRole("button", { name: "Delete note" })).toBeVisible();
  });

  test("is named by its tooltip when no aria-label is given", async ({ mount, page }) => {
    // The fix carried in with this migration. Upstream a tooltip named the
    // trigger only when the child was NOT focusable — a button always is, so
    // it got aria-describedby and no name at all.
    await mount(<StyledIconButton tooltip="Delete note">{icon}</StyledIconButton>);
    await expect(page.getByRole("button", { name: "Delete note" })).toBeVisible();
  });

  test("is reachable by Tab and activates on Enter", async ({ mount, page }) => {
    let clicked = false;
    await mount(
      <StyledIconButton aria-label="Go" onClick={() => { clicked = true; }}>{icon}</StyledIconButton>,
    );
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button")).toBeFocused();
    await page.keyboard.press("Enter");
    expect(clicked).toBe(true);
  });
});

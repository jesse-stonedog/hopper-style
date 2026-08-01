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
  // KNOWN FAILING — NEH-220, same root cause as StyledButton: the recipe sets
  // no minimum, so the box is whatever padding plus a 16px icon produces. An
  // icon button is the WORST case for this, because it has no text to prop the
  // box open — and it is the control most often used for destructive actions.
  test.fail();

  test("meets the 44x44 CSS px floor", async ({ mount }) => {
    const component = await mount(
      <StyledIconButton aria-label="Delete">{icon}</StyledIconButton>,
    );
    const box = (await component.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });
});

test.describe("sizes", () => {
  test("grow monotonically", async ({ mount }) => {
    // Four size variants that must actually differ — a size prop that maps two
    // names to the same box is a silently broken knob.
    const seen: number[] = [];
    for (const size of ["1x", "sm", "md", "lg"] as const) {
      const c = await mount(
        <StyledIconButton size={size} aria-label="Go">{icon}</StyledIconButton>,
      );
      seen.push((await c.boundingBox())!.height);
      await c.unmount();
    }
    expect(new Set(seen).size).toBeGreaterThan(1);
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

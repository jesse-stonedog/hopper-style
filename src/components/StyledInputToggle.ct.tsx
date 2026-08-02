import { test, expect } from "@playwright/experimental-ct-react";
import { ToggleHarness } from "./StyledInputToggle.harness";

/**
 * The tap target and the movement — neither observable in jsdom, and the tap
 * target is the defect this migration fixed.
 */

test.describe("StyledInputToggle", () => {
  test("meets the 48x48 tap-target floor", async ({ mount }) => {
    // It was 60x30 against the 48x48 house minimum. The button pads out
    // around the track rather than the track growing, so this passes without
    // the switch looking any different.
    const component = await mount(<ToggleHarness />);
    const box = await component.getByTestId("toggle-switch").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);
  });

  test("the visible track still reads as a switch", async ({ mount }) => {
    // The other half of that fix: padding the button must not have stretched
    // the track into something that no longer looks like a switch.
    const component = await mount(<ToggleHarness />);
    const track = await component.getByTestId("toggle-switch").locator("span").first().boundingBox();
    expect(Math.round(track!.width)).toBe(60);
    expect(Math.round(track!.height)).toBe(30);
  });

  test("the handle actually moves when toggled", async ({ mount }) => {
    // The framer-motion replacement. `translateX`, not `margin-left: auto` —
    // a margin change is not animatable, which is why the original needed a
    // layout animation to move at all.
    const component = await mount(<ToggleHarness />);
    const handle = component.getByTestId("toggle-switch").locator("span span");

    const before = await handle.boundingBox();
    await component.getByTestId("toggle-switch").click();
    await expect(component.getByTestId("toggle-switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // Settled position, after the 200ms ease.
    await expect(async () => {
      const after = await handle.boundingBox();
      expect(after!.x - before!.x).toBeGreaterThan(20);
    }).toPass();
  });

  test("the track repaints, so state is not carried by position alone", async ({ mount }) => {
    const component = await mount(<ToggleHarness />);
    const track = component.getByTestId("toggle-switch").locator("span").first();
    const off = await track.evaluate((el) => getComputedStyle(el).backgroundColor);

    await component.getByTestId("toggle-switch").click();
    await expect(async () => {
      const on = await track.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(on).not.toBe(off);
    }).toPass();
  });

  test("is reachable and operable by keyboard", async ({ mount, page }) => {
    // Free, because it is a real button. The original hand-wrote this.
    const component = await mount(<ToggleHarness />);
    await page.keyboard.press("Tab");
    await expect(component.getByTestId("toggle-switch")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(component.getByTestId("toggle-switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("Enter works too", async ({ mount, page }) => {
    const component = await mount(<ToggleHarness />);
    await component.getByTestId("toggle-switch").focus();
    await page.keyboard.press("Enter");
    await expect(component.getByTestId("toggle-switch")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("a disabled switch cannot be reached by keyboard", async ({ mount, page }) => {
    // A native disabled button leaves the tab order. The original set
    // tabIndex={-1} by hand and left the element focusable by script.
    const component = await mount(<ToggleHarness disabled />);
    await page.keyboard.press("Tab");
    await expect(component.getByTestId("toggle-switch")).not.toBeFocused();
  });

  test("honours prefers-reduced-motion", async ({ mount, page }) => {
    // Motion is a vestibular trigger, not only a preference.
    await page.emulateMedia({ reducedMotion: "reduce" });
    const component = await mount(<ToggleHarness />);
    const handle = component.getByTestId("toggle-switch").locator("span span");
    const transition = await handle.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    expect(transition).toBe("0s");
  });
});

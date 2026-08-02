import { test, expect } from "@playwright/experimental-ct-react";
import {
  SelectBesideInput,
  LongOptionSelect,
  SearchHarness,
} from "./StyledInputSelect.harness";

/**
 * The pixels, which is where the whole "share one surface" claim is either true
 * or not. jsdom will confirm both controls got a class name and has no idea
 * whether they render as the same control.
 */

test.describe("StyledInputSelect", () => {
  test("matches the text input beside it", async ({ mount }) => {
    // NEH-84 was exactly this going wrong: the dropdown painted its surface
    // twice, nested, so it never quite matched the field next to it. The two
    // recipes share `input-surface.ts` to stop that, and this is the assertion
    // that notices if they stop sharing.
    const component = await mount(<SelectBesideInput />);
    const box = (testId: string) =>
      component.getByTestId(testId).evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          height: el.getBoundingClientRect().height,
          border: s.borderWidth,
          radius: s.borderRadius,
          bg: s.backgroundColor,
        };
      });

    const select = await box("select");
    const text = await box("text");

    expect(select.border).toBe(text.border);
    expect(select.radius).toBe(text.radius);
    expect(select.bg).toBe(text.bg);
    // Same surface, so the same height — a 2px drift reads as misalignment.
    expect(Math.abs(select.height - text.height)).toBeLessThanOrEqual(2);
  });

  test("clears the 48px target floor", async ({ mount }) => {
    const component = await mount(<SelectBesideInput />);
    const box = await component.getByTestId("select").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
  });

  test("is reachable and operable by keyboard", async ({ mount, page }) => {
    const component = await mount(<SelectBesideInput />);
    await page.keyboard.press("Tab");
    await expect(component.getByTestId("select")).toBeFocused();
  });

  test("a long option does not stretch it past the viewport", async ({ mount, page }) => {
    // A native select sizes to its widest option unless constrained. At 375px
    // that is how a form ends up scrolling sideways.
    const component = await mount(<LongOptionSelect />);
    const box = await component.getByTestId("select").boundingBox();
    const viewport = page.viewportSize();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
  });
});

test.describe("StyledSearch", () => {
  test("does not span a wide screen", async ({ mount, page }) => {
    // Deliberate: a search field the width of a desktop is harder to use, not
    // easier — the eye travels from the field back to results at the left.
    const component = await mount(<SearchHarness />);
    const box = await component.boundingBox();
    const viewport = page.viewportSize();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    if (viewport!.width >= 1280) expect(box!.width).toBeLessThanOrEqual(520);
  });

  test("accepts typing and reports it", async ({ mount }) => {
    const component = await mount(<SearchHarness />);
    await component.getByTestId("search-input").fill("annual report");
    await expect(component.getByTestId("search-input")).toHaveValue("annual report");
  });
});

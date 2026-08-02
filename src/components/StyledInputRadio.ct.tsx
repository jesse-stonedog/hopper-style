import { test, expect } from "@playwright/experimental-ct-react";
import { RadioHarness } from "./StyledInputRadio.harness";

test.describe("StyledInputRadio", () => {
  test("each option clears the 44px target floor", async ({ mount }) => {
    // The label is the target, not the 13px dot inside it — which is what
    // wrapping the input in a <label> buys.
    const component = await mount(<RadioHarness />);
    const labels = component.locator("label");
    for (const box of await labels.all()) {
      const rect = await box.boundingBox();
      expect(rect!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("arrow keys move the selection", async ({ mount, page }) => {
    // Free from the platform because these are real radios sharing a `name`.
    // A custom implementation has to rebuild it and usually rebuilds it badly.
    const component = await mount(<RadioHarness />);
    await component.getByRole("radio", { name: "Monthly" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(component.getByRole("radio", { name: "Yearly" })).toBeChecked();
  });

  test("Tab enters the group once, not once per option", async ({ mount, page }) => {
    // Radio-group semantics: the group is one tab stop. Getting this wrong
    // means a keyboard user tabs through every option of every group on a page.
    const component = await mount(<RadioHarness />);
    await page.keyboard.press("Tab");
    await expect(component.getByRole("radio", { name: "Monthly" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(component.getByRole("radio", { name: "Yearly" })).not.toBeFocused();
  });

  test("long options wrap rather than overflowing", async ({ mount, page }) => {
    const component = await mount(<RadioHarness long />);
    const box = await component.locator("[role=radiogroup]").boundingBox();
    const viewport = page.viewportSize();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
  });

  test("the selected option is distinguishable by more than colour", async ({ mount }) => {
    // WCAG 1.4.1. The indicator dot is a shape cue that appears on selection,
    // so the state survives achromatopsia.
    const component = await mount(<RadioHarness />);
    const indicators = component.locator("[role=radiogroup] label > div > div");
    const sizes = await Promise.all(
      (await indicators.all()).map(async (i) =>
        i.evaluate((el) => el.getBoundingClientRect().width * el.getBoundingClientRect().height),
      ),
    );
    // Exactly one indicator is drawn — the checked one.
    expect(sizes.filter((s) => s > 0)).toHaveLength(1);
  });
});

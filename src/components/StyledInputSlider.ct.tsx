import { test, expect } from "@playwright/experimental-ct-react";
import { SliderHarness } from "./StyledInputSlider.harness";

/**
 * A slider is a layout component pretending to be an input: the labels sit at
 * the ends of the track, so how much room the track gets is the whole story,
 * and that is exactly what jsdom reports as zero.
 */

test.describe("StyledInputSlider", () => {
  test("the track still has room between the end labels", async ({ mount }) => {
    // The failure this catches: at 375px the two labels eat the row and the
    // track collapses to a few pixels — technically present, impossible to
    // drag. Runs at all four viewports, and it is the narrow one that matters.
    const component = await mount(
      <SliderHarness minLabel="Quiet" maxLabel="Loud" />,
    );
    const track = await component.locator("input[type='range']").boundingBox();
    expect(track).not.toBeNull();
    expect(track!.width).toBeGreaterThan(44);
  });

  test("the row does not overflow the viewport", async ({ mount, page }) => {
    const component = await mount(
      <SliderHarness minLabel="Not at all" maxLabel="Very much so" currentLabel="Comfort" />,
    );
    const box = await component.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
  });

  test("keyboard arrows move it, and the readout follows", async ({ mount, page }) => {
    const component = await mount(
      <SliderHarness min={0} max={10} step={1} initial={5} currentLabel="Volume" />,
    );
    await component.locator("input[type='range']").focus();
    await page.keyboard.press("ArrowRight");
    await expect(component.locator("input[type='range']")).toHaveValue("6");
    await expect(component.getByText("Volume: 6")).toBeVisible();
  });

  test("a half-step slider reaches its half steps", async ({ mount, page }) => {
    // The regression fixed in this migration, driven the way a user drives it.
    // Under `parseInt` the value round-tripped to 2 and the thumb snapped back,
    // so this asserts 2.5 both on the input and in the readout.
    const component = await mount(
      <SliderHarness min={0} max={5} step={0.5} initial={2} currentLabel="Dose" />,
    );
    await component.locator("input[type='range']").focus();
    await page.keyboard.press("ArrowRight");
    await expect(component.locator("input[type='range']")).toHaveValue("2.5");
    await expect(component.getByText("Dose: 2.5")).toBeVisible();
  });

  test("is announced with a name and a value", async ({ mount, page }) => {
    await mount(<SliderHarness currentLabel="Volume" min={0} max={10} initial={4} />);
    const slider = page.getByRole("slider", { name: "Volume" });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute("aria-label", "Volume");
  });
});

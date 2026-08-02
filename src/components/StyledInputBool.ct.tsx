import { test, expect } from "@playwright/experimental-ct-react";
import StyledInputBool from "./StyledInputBool";

/**
 * The tap-target question, which is the whole reason this component wraps its
 * label rather than sitting beside it — and which jsdom reports as 0×0.
 */

test.describe("StyledInputBool", () => {
  test("the label is part of the clickable target", async ({ mount, page }) => {
    // A bare checkbox is ~14×14 CSS px, far under the 44×44 floor (WCAG 2.5.5).
    // Clicking the *text* must toggle it — that is what makes the control
    // usable for someone with a tremor.
    const component = await mount(<StyledInputBool label="Send me email" />);
    await page.getByText("Send me email").click();
    await expect(component.locator("input")).toBeChecked();
  });

  test("the target spans the label, not just the box", async ({ mount }) => {
    const component = await mount(<StyledInputBool label="Send me email" />);
    // `component` IS the label: StyledHStack renders `as="label"`, and a
    // locator searches DESCENDANTS, so `.locator("label")` finds nothing here.
    const target = await component.boundingBox();
    const box = await component.locator("input").boundingBox();
    expect(target).not.toBeNull();
    expect(box).not.toBeNull();
    // Materially wider than the checkbox alone — the assertion that would fail
    // if someone unwrapped the label into a sibling.
    expect(target!.width).toBeGreaterThan(box!.width * 2);
  });

  test("is reachable and operable by keyboard", async ({ mount, page }) => {
    const component = await mount(<StyledInputBool label="Send me email" />);
    await page.keyboard.press("Tab");
    await expect(component.locator("input")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(component.locator("input")).toBeChecked();
  });

  test("carries a visible focus indicator", async ({ mount, page }) => {
    // Keyboard reachability is worth nothing if the user cannot see where they
    // are.
    const component = await mount(<StyledInputBool label="Send me email" />);
    await page.keyboard.press("Tab");
    const outline = await component
      .locator("input")
      .evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("a long label wraps rather than overflowing the viewport", async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <StyledInputBool label="Send me a reminder before every scheduled appointment" />,
    );
    const box = await component.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
  });

  test("the variant reaches the control", async ({ mount }) => {
    // A variant that does not change a pixel means the recipe is not reaching
    // the element — the failure mode that made NEH-165 invisible for months.
    //
    // Both in ONE mount: a second `mount()` in the same test fails with
    // "container that already has a React root". Side by side is better anyway,
    // since it compares them under identical layout.
    //
    // `solid` vs `ghost`, NOT `solid` vs `outline`. The recipe defines those
    // two identically — same `buttonBgAccent`, same `textPrimary` — so an
    // outline checkbox is pixel-for-pixel a solid one, and asserting otherwise
    // pins a bug rather than a behaviour. Filed as NEH-234.
    const component = await mount(
      <>
        <StyledInputBool label="solid" variant="solid" data-testid="solid" />
        <StyledInputBool label="ghost" variant="ghost" data-testid="ghost" />
      </>,
    );
    const bg = (testId: string) =>
      component
        .getByTestId(testId)
        .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(await bg("solid")).not.toBe(await bg("ghost"));
  });

  test("solid and outline are currently indistinguishable", async ({ mount }) => {
    // Pinning a DEFECT, deliberately, so the fix is noticed rather than
    // silently absorbed: two of the five app-wide appearances render a checkbox
    // identically, so choosing "outline" does nothing here. Delete this test
    // when NEH-234 lands.
    const component = await mount(
      <>
        <StyledInputBool label="solid" variant="solid" data-testid="solid" />
        <StyledInputBool label="outline" variant="outline" data-testid="outline" />
      </>,
    );
    const bg = (testId: string) =>
      component
        .getByTestId(testId)
        .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(await bg("solid")).toBe(await bg("outline"));
  });
});

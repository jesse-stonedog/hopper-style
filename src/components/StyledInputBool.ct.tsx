import { test, expect } from "@playwright/experimental-ct-react";
import type { Locator } from "@playwright/test";
import StyledInputBool from "./StyledInputBool";

/**
 * The tap-target question, which is the whole reason this component wraps its
 * label rather than sitting beside it — and which jsdom reports as 0×0.
 */

test.describe("StyledInputBool", () => {
  test("the label is part of the clickable target", async ({ mount, page }) => {
    // A bare checkbox is ~14×14 CSS px, far under the 48×48 floor (WCAG 2.5.5 AAA is 44; the house floor is 48).
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

  /**
   * These assert only on properties a native checkbox actually PAINTS, and
   * that distinction is the whole lesson of NEH-234.
   *
   * The control is `<input type="checkbox">` at `appearance: auto`, so the
   * widget is drawn by the UA. Chromium *computes* `background-color` and
   * `border-*` on it and then paints neither — verified in this harness by
   * screenshotting a raw input with a red border and a slate background and
   * getting back the default white box. So the obvious assertion is worse than
   * no assertion: the previous version of this test read `backgroundColor` off
   * solid and ghost, saw two different values, and passed, while both
   * checkboxes were drawn identically on screen. A green test measuring
   * something invisible is how this defect survived long enough to be filed,
   * attempted, and filed again.
   *
   * What the same probe showed the widget DOES honour, and what these therefore
   * assert on: `box-shadow`, `accent-color`, and `outline`.
   */
  const painted = (component: Locator, testId: string) =>
    component.getByTestId(testId).evaluate((el) => {
      const s = getComputedStyle(el);
      return `${s.boxShadow} | ${s.accentColor}`;
    });

  test("the variant reaches the control", async ({ mount }) => {
    // Both in ONE mount: a second `mount()` in the same test fails with
    // "container that already has a React root". Side by side is better anyway,
    // since it compares them under identical layout.
    const component = await mount(
      <>
        <StyledInputBool label="solid" variant="solid" data-testid="solid" />
        <StyledInputBool label="outline" variant="outline" data-testid="outline" />
      </>,
    );
    expect(await painted(component, "solid")).not.toBe(
      await painted(component, "outline"),
    );
  });

  test("solid and outline are visually distinct", async ({ mount }) => {
    // NEH-234: these two of the five app-wide appearances were declared
    // identically, so a user switching the whole app from solid to outline
    // watched every other control change and every checkbox stay put.
    //
    // `outline` earns its name through a ring the UA does paint, since the
    // `border` that would express it on any other recipe is discarded here.
    const component = await mount(
      <>
        <StyledInputBool label="solid" variant="solid" data-testid="solid" />
        <StyledInputBool label="outline" variant="outline" data-testid="outline" />
      </>,
    );
    const ring = (testId: string) =>
      component.getByTestId(testId).evaluate((el) => getComputedStyle(el).boxShadow);

    expect(await ring("solid")).toBe("none");
    expect(await ring("outline")).not.toBe("none");
    // Themed, not a literal — the ring has to follow the host like everything
    // else. This is the harness theme's `--hopper-box-primary-border`.
    expect(await ring("outline")).toContain("rgb(71, 85, 105)");
  });

  test("the checked state is themed rather than the browser's default blue", async ({
    mount,
  }) => {
    // `accent-color` is one of the few properties the native widget honours,
    // and it is what carries the host's theme into the tick. Without it a
    // checked box is Chromium's blue in every theme this package can wear.
    const component = await mount(
      <StyledInputBool label="on" defaultChecked data-testid="on" />,
    );
    const accent = await component
      .getByTestId("on")
      .evaluate((el) => getComputedStyle(el).accentColor);
    expect(accent).not.toBe("auto");
  });

  test("the focus ring follows the theme", async ({ mount, page }) => {
    // It was a hardcoded `#3182ce` — Panda's blue, fixed in every theme
    // including dark and high-contrast, where it is the one thing a keyboard
    // user cannot afford to lose (NEH-234).
    const component = await mount(<StyledInputBool label="on" data-testid="on" />);
    await page.keyboard.press("Tab");
    const ring = await component
      .getByTestId("on")
      .evaluate((el) => getComputedStyle(el).outlineColor);
    // The harness theme's `--hopper-text-pop-text`.
    expect(ring).toBe("rgb(56, 189, 248)");
  });
});

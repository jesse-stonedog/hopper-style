import { test, expect } from "@playwright/experimental-ct-react";
import StyledButton from "./StyledButton";
import StyledBox from "./StyledBox";

/**
 * Everything here needs a layout engine, so none of it can live in the jest
 * suite. Tap-target size in particular is a WCAG floor this product treats as
 * non-negotiable, and it is measured in CSS pixels — a number jsdom always
 * reports as zero.
 */

test.describe("tap target", () => {
  // Was NEH-220: `buttonRecipe` set no min-height, so a short label produced a
  // 42.375px-tall button against a 44px floor, and these two were marked
  // `test.fail()` so the unmet requirement stayed visible without reddening CI.
  //
  // The recipe now states `minHeight`/`minWidth: 48px`, so they assert rather
  // than document. Raising the floor makes every button in a live product
  // taller, which is why it waited for an explicit product decision (NEH-251)
  // instead of riding along with a refactor.

  test("meets the 48x48 CSS px floor", async ({ mount }) => {
    // WCAG 2.5.5 Level AAA, and the house floor for this audience — elevated
    // rates of motor impairment mean a small target is a real barrier, not a
    // polish item. A short label is the worst case, so it is the one asserted.
    const component = await mount(<StyledButton>OK</StyledButton>);
    const box = (await component.boundingBox())!;

    expect(box.height).toBeGreaterThanOrEqual(48);
    expect(box.width).toBeGreaterThanOrEqual(48);
  });

  test("still meets it with only an icon and no label", async ({ mount }) => {
    // The narrowest thing a caller can produce with this component.
    const component = await mount(
      <StyledButton leftIcon={<svg width="16" height="16" />} aria-label="Close" />,
    );
    const box = (await component.boundingBox())!;

    expect(box.height).toBeGreaterThanOrEqual(48);
    expect(box.width).toBeGreaterThanOrEqual(48);
  });
});

test.describe("layout", () => {
  test("keeps the icon and label on one row", async ({ mount }) => {
    const component = await mount(
      <StyledButton leftIcon={<svg data-testid="ico" width="16" height="16" />}>
        Save
      </StyledButton>,
    );

    const icon = (await component.getByTestId("ico").boundingBox())!;
    const label = (await component.getByText("Save").boundingBox())!;

    expect(Math.abs(icon.y + icon.height / 2 - (label.y + label.height / 2))).toBeLessThan(2);
    expect(icon.x).toBeLessThan(label.x);
  });

  test("a long label does not overflow a narrow screen", async ({ mount, page }) => {
    await mount(
      <StyledBox p="4">
        <StyledButton>Save these changes and continue</StyledButton>
      </StyledBox>,
    );

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("noWrap keeps the label on one line", async ({ mount }) => {
    const component = await mount(
      <StyledButton noWrap>Save these changes and continue</StyledButton>,
    );

    const height = (await component.boundingBox())!.height;
    const lineHeight = await component.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize) * 2,
    );

    // One line: the button is not taller than roughly two font-sizes of
    // padding plus a single line of text.
    expect(height).toBeLessThan(lineHeight + 48);
  });
});

test.describe("variants paint", () => {
  // Every variant must resolve to a real background. A variant the recipe does
  // not define renders transparent — the failure that shipped as `buttonBgHover`
  // and went unnoticed because nothing errors.
  for (const variant of ["solid", "outline", "aurora", "glass", "matte"] as const) {
    test(`${variant} resolves to a real background`, async ({ mount }) => {
      const component = await mount(<StyledButton variant={variant}>Go</StyledButton>);
      const bg = await component.evaluate((el) => getComputedStyle(el).background);

      expect(bg).not.toBe("");
      // `aurora` and `glass` paint with gradients/backdrop filters rather than a
      // flat colour, so assert *something* is painted rather than a colour.
      expect(bg).not.toMatch(/^rgba\(0, 0, 0, 0\)(\s|$)/);
    });
  }
});

test.describe("states", () => {
  test("hover changes the background", async ({ mount, page }) => {
    // The regression that shipped: `outline`'s hover named a token that did not
    // exist, so the declaration was invalid and browsers dropped it — the state
    // never rendered, silently, for as long as the app existed.
    const component = await mount(<StyledButton variant="outline">Go</StyledButton>);

    // Park the cursor away from the component first. Playwright's mouse starts
    // at (0,0) and the component mounts at the origin, so without this the
    // "before" sample is already the hover colour and the assertion compares
    // hover to hover — passing or failing by viewport size, which is exactly
    // how this showed up as an iphone-se-only failure.
    await page.mouse.move(0, 0);
    await page.mouse.move(2000, 2000);
    const before = await component.evaluate((el) => getComputedStyle(el).backgroundColor);
    await component.hover();
    const after = await component.evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(after).not.toBe(before);
  });

  test("a disabled button is not clickable", async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <StyledButton disabled onClick={() => { clicked = true; }}>Go</StyledButton>,
    );

    await component.click({ force: true }).catch(() => {});
    expect(clicked).toBe(false);
  });

  test("a loading button shows its status and is inert", async ({ mount, page }) => {
    const component = await mount(<StyledButton loading loadText="Saving">Go</StyledButton>);

    await expect(page.getByRole("status")).toContainText("Saving");
    await expect(component).toBeDisabled();
  });
});

test.describe("keyboard", () => {
  test("is reachable by Tab and activates on Enter", async ({ mount, page }) => {
    // Hover-only affordances exclude keyboard and touch users; this is the
    // floor check that the control is genuinely operable.
    let clicked = false;
    await mount(<StyledButton onClick={() => { clicked = true; }}>Go</StyledButton>);

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button")).toBeFocused();
    await page.keyboard.press("Enter");
    expect(clicked).toBe(true);
  });
});

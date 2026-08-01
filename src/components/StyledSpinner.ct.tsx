import { test, expect } from "@playwright/experimental-ct-react";
import StyledSpinner from "./StyledSpinner";
import StyledBox from "./StyledBox";

/**
 * A spinner's whole job is to appear inside something else without disturbing
 * it. These measure that, which jsdom cannot: there, a label and its dots both
 * report a zero-sized box, so "does the text jump when a dot is added" and
 * "does this fit a phone" are unanswerable.
 */

test.describe("layout", () => {
  test("stays on one line rather than wrapping", async ({ mount }) => {
    // Two StyledText children in an HStack. If the gap or flex-wrap regresses,
    // the dots drop below the label and the spinner becomes two lines tall —
    // which shifts everything under it in a page that is already loading.
    const component = await mount(<StyledSpinner loadText="Loading" />);

    const label = (await component.getByText("Loading").boundingBox())!;
    const dots = (await component.getByText(".", { exact: true }).boundingBox())!;

    // Same visual row: their vertical centres line up within a pixel.
    expect(Math.abs(label.y + label.height / 2 - (dots.y + dots.height / 2))).toBeLessThan(1.5);
    expect(dots.x).toBeGreaterThan(label.x);
  });

  test("does not overflow a narrow container", async ({ mount, page }) => {
    // A long label is the realistic case — "Loading your medicines" is better
    // copy than "Loading", and it is what will be passed.
    await mount(
      <StyledBox p="4">
        <StyledSpinner loadText="Loading your medicine history" />
      </StyledBox>,
    );

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("keeps a stable width as the dots animate", async ({ mount, page }) => {
    // The dots cycle . -> .. -> ... every 500ms. If the container is sized by
    // its content, the whole spinner grows and shrinks twice a second, and
    // anything laid out beside it jitters. Worth pinning because it is the kind
    // of thing nobody notices in review and everybody notices in use.
    const component = await mount(<StyledSpinner loadText="Loading" />);

    const widths: number[] = [];
    for (let i = 0; i < 3; i++) {
      widths.push((await component.boundingBox())!.width);
      await page.waitForTimeout(520);
    }

    // The label dominates; the dots contribute a few px at most. Assert the
    // spread is small rather than zero — a monospace assumption would be wrong.
    const spread = Math.max(...widths) - Math.min(...widths);
    expect(spread).toBeLessThan(12);
  });
});

test.describe("theming", () => {
  test("paints its text with a real colour from the token layer", async ({ mount }) => {
    // A spinner rendered in an unthemed host is invisible, and an invisible
    // element still passes every DOM assertion. This is the check that a token
    // actually resolved.
    const component = await mount(<StyledSpinner loadText="Loading" />);
    const colour = await component
      .getByText("Loading")
      .evaluate((el) => getComputedStyle(el).color);

    expect(colour).not.toBe("");
    expect(colour).not.toBe("rgba(0, 0, 0, 0)");
  });
});

test.describe("accessibility", () => {
  test("exposes a status role that carries the label", async ({ mount, page }) => {
    await mount(<StyledSpinner loadText="Saving" />);
    // `page`, not `component`. In component testing the mounted root IS the
    // status element, and a locator searches DESCENDANTS — so
    // `component.getByRole("status")` looks past the very thing it wants and
    // finds nothing. jsdom's screen.getByRole searches the whole container and
    // hides the distinction, which is why this passed in jest and failed here.
    await expect(page.getByRole("status")).toContainText("Saving");
  });

  test("does not expose the dots to the accessibility tree", async ({ mount }) => {
    // getByText with an accessible-name query would still find them if they
    // leaked; aria-hidden is asserted directly.
    const component = await mount(<StyledSpinner />);
    const hidden = component.locator('[aria-hidden="true"]');
    await expect(hidden).toHaveCount(1);
  });
});

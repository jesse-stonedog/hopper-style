import { test, expect } from "@playwright/experimental-ct-react";
import StyledBox from "./StyledBox";
import StyledText from "./StyledText";

/**
 * Layout assertions for StyledBox, in a real browser.
 *
 * Everything here is deliberately something jsdom cannot answer. jsdom has no
 * layout engine — every element reports a zero-sized box — so it will happily
 * agree that content fits a 375px screen when it overflows by 200px. These
 * tests measure.
 */

test.use({ viewport: { width: 375, height: 667 } });

test.describe("StyledBox at the narrowest supported screen", () => {
  test("does not overflow the viewport horizontally", async ({ mount, page }) => {
    // The failure this catches: a fixed width, a min-width, or a non-wrapping
    // row that pushes the page wider than the screen. On a phone that is a
    // horizontal scrollbar on the whole document, which is the single most
    // common responsive regression.
    await mount(
      <StyledBox p="4">
        <StyledText>
          A reasonably long sentence that has to wrap rather than push the
          document sideways on a small screen.
        </StyledText>
      </StyledBox>,
    );

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("header and footer stay inside the box, above and below the content", async ({
    mount,
  }) => {
    // Asserts the actual stacking order in pixels, not just that all three
    // rendered. A flex-direction regression puts them side by side and every
    // DOM-order assertion still passes.
    const component = await mount(
      <StyledBox
        header={<StyledText>Head</StyledText>}
        footer={<StyledText>Foot</StyledText>}
      >
        <StyledText>Body</StyledText>
      </StyledBox>,
    );

    const head = await component.getByText("Head").boundingBox();
    const body = await component.getByText("Body").boundingBox();
    const foot = await component.getByText("Foot").boundingBox();

    expect(head).not.toBeNull();
    expect(body).not.toBeNull();
    expect(foot).not.toBeNull();
    expect(head!.y).toBeLessThan(body!.y);
    expect(body!.y).toBeLessThan(foot!.y);
  });
});

test.describe("StyledBox side panels", () => {
  test("places left and right panels either side of the content", async ({ mount }) => {
    // The grid is `min-content 1fr min-content`. This asserts the columns
    // actually resolve in that order rather than collapsing or reversing.
    const component = await mount(
      <StyledBox
        leftPanel={<StyledText>Nav</StyledText>}
        rightPanel={<StyledText>Aside</StyledText>}
      >
        <StyledText>Main</StyledText>
      </StyledBox>,
    );

    const nav = (await component.getByText("Nav").boundingBox())!;
    const main = (await component.getByText("Main").boundingBox())!;
    const aside = (await component.getByText("Aside").boundingBox())!;

    expect(nav.x).toBeLessThan(main.x);
    expect(main.x).toBeLessThan(aside.x);
  });
});

test.describe("theme tokens actually paint", () => {
  test("resolves a background token to a real colour, not an empty string", async ({
    mount,
  }) => {
    // The whole token contract in one assertion. A token whose custom property
    // is undefined resolves to nothing and the element paints transparent —
    // silently, with no error anywhere. jsdom cannot see this because it does
    // not compute styles from a stylesheet.
    const component = await mount(
      <StyledBox bg="boxBgPrimary" p="4">
        <StyledText>Painted</StyledText>
      </StyledBox>,
    );

    const bg = await component.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    expect(bg).not.toBe("");
    expect(bg).not.toBe("transparent");
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });
});

import { test, expect } from "@playwright/experimental-ct-react";
import StyledText from "./StyledText";

/**
 * Block promotion, in a real browser (NEH-490).
 *
 * These exist because the jsdom tier cannot answer the question that matters.
 * It asserts the style attribute — which is fine as far as it goes — but jsdom
 * has no layout engine, so it reports `margin-bottom: 8px` on an inline box
 * just as happily as on a block one, while the browser silently discards the
 * former. A jsdom-only guard would have passed against the original defect.
 *
 * The failure being pinned shipped in two products: two paragraphs rendering
 * as one welded run, because a `<span>` ignores vertical margins and JSX drops
 * the whitespace between sibling elements.
 */

test.describe("vertical spacing on StyledText", () => {
  test("a vertical margin actually separates two paragraphs", async ({ mount }) => {
    const component = await mount(
      // A BARE div, deliberately. StyledBox lays its children out in a flex
      // column, which blockifies them — so this test would pass with or
      // without the fix and prove nothing. The defect only appears in ordinary
      // inline flow, so that is what has to be under it.
      <div>
        <StyledText marginBottom="4" data-testid="first">
          No dates to show yet
        </StyledText>
        <StyledText data-testid="second">This does not mean nothing is due.</StyledText>
      </div>,
    );

    const first = component.getByTestId("first");
    const second = component.getByTestId("second");

    const firstBox = await first.boundingBox();
    const secondBox = await second.boundingBox();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();

    // THE ASSERTION. Welded together they share a line, so the second box
    // starts at the same y and to the right. Separated, it starts below the
    // first — and below it by at least the margin.
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 1);
    expect(secondBox!.y - (firstBox!.y + firstBox!.height)).toBeGreaterThanOrEqual(4);
  });

  test("without a vertical margin they stay on one line, as inline text should", async ({
    mount,
  }) => {
    const component = await mount(
      <div>
        <StyledText data-testid="a">one </StyledText>
        <StyledText data-testid="b">two</StyledText>
      </div>,
    );

    const a = await component.getByTestId("a").boundingBox();
    const b = await component.getByTestId("b").boundingBox();

    // Inline flow is the DEFAULT and must stay that way — text inside a
    // sentence is the commonest use of this component. If this ever fails, the
    // promotion has become too eager and every inline usage is now a line
    // break the author did not ask for.
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
  });

  test("a horizontal margin does not force a line break", async ({ mount }) => {
    const component = await mount(
      <div>
        <StyledText data-testid="a">one</StyledText>
        <StyledText marginLeft="4" data-testid="b">
          two
        </StyledText>
      </div>,
    );

    const a = await component.getByTestId("a").boundingBox();
    const b = await component.getByTestId("b").boundingBox();

    // `margin-left` works on an inline box, so it must not promote. Getting
    // this wrong turns every spaced-out inline label into its own line.
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
    expect(b!.x).toBeGreaterThan(a!.x + a!.width);
  });
});

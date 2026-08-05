import { test, expect } from "@playwright/experimental-ct-react";
import StyledFooter from "./StyledFooter";

/**
 * The claims about StyledFooter that only a real browser can settle (NEH-394).
 *
 * Everything structural — what renders, what is announced, what is unmounted —
 * is in the jest suite. These four are here because jsdom has no layout engine
 * and reports a zero-sized box for every element, so it would agree with:
 *
 *   - two lines "stacked" while actually sharing one (the NEH-388 defect, which
 *     this component reproduces exactly if the legend is left inline);
 *   - a 48px tap target that is really 21px (NEH-220, where recipes set no
 *     minimum and a short label produced a 42.375px button);
 *   - actions "on the collapsed bar" that are in fact below the fold.
 */

const COPY = "© 2026 Example L.L.C. All rights reserved.";
const LEGEND = "Example, EXAMPLE and Example Elders are trademarks of Example L.L.C.";

test("each line is its own block box, so neither can rejoin the other's line", async ({
  mount,
}) => {
  // The MECHANISM, and the assertion that actually bites. `StyledText` renders
  // a <span>; two inline siblings share a line however their container is
  // styled, so the stacked layout the markup intends never happens and no
  // margin would produce it. That is NEH-388, and this component inherits the
  // same trap.
  //
  // ASSERTED ON `display`, NOT ON GEOMETRY — and that choice was measured, not
  // assumed. A bounding-box comparison ("the legend's top is below the
  // copyright's bottom") looks like the more meaningful assertion and is in
  // fact vacuous here: the bar is a flex container, so the text column
  // shrink-wraps and the two lines wrap onto separate rows whether or not
  // either is a block. With `display="block"` removed, that geometry assertion
  // still passed at all four viewports while this one failed at all four.
  //
  // So the geometry version was written, shown to be insensitive, and deleted.
  // A green test that cannot fail is worse than no test.
  const component = await mount(<StyledFooter copyright={COPY} legend={LEGEND} />);

  for (const id of ["footer-copyright", "footer-legend"]) {
    const display = await component
      .getByTestId(id)
      .evaluate((el) => getComputedStyle(el).display);
    expect(display, `${id} must not be inline`).not.toBe("inline");
  }
});

test("the toggle meets the 48px tap-target floor", async ({ mount }) => {
  // Above WCAG 2.5.5 AAA's 44 deliberately: this audience mis-aims more. The
  // recipe states minHeight/minWidth rather than letting the box emerge from
  // padding, so no font scale can erode it — measured, not asserted from CSS.
  const component = await mount(<StyledFooter copyright={COPY} />);

  const box = await component.getByTestId("footer-toggle").boundingBox();
  if (!box) throw new Error("the toggle must be laid out");

  expect(box.height).toBeGreaterThanOrEqual(48);
  expect(box.width).toBeGreaterThanOrEqual(48);
});

test("the actions stay on the collapsed bar, beside the toggle", async ({ mount }) => {
  // The point of the collapsed state: a product's one control must be reachable
  // without expanding anything. "Beside" is geometry — same line as the toggle.
  const component = await mount(
    <StyledFooter
      copyright={COPY}
      actions={<button type="button" data-testid="probe-action">Dark mode</button>}
    />,
  );

  const toggle = await component.getByTestId("footer-toggle").boundingBox();
  const action = await component.getByTestId("probe-action").boundingBox();
  if (!toggle || !action) throw new Error("both controls must be laid out");

  // Vertical overlap rather than equal `y`: the two have different heights and
  // are centred against each other, so equality would be a brittle proxy.
  const sharesALine =
    action.y < toggle.y + toggle.height && toggle.y < action.y + action.height;
  expect(sharesALine, "the action must sit on the bar, not below it").toBe(true);
});

test("opening the panel does not displace the bar's controls off-screen", async ({
  mount,
}) => {
  // The footer lives in a fixed three-row app shell, so a panel that pushed the
  // bar upward would move the controls out from under the reader's finger
  // mid-reach. The bar must stay put; only the panel is new.
  const component = await mount(<StyledFooter copyright={COPY} version={{ build: "1.2.3" }} />);

  const before = await component.getByTestId("footer-toggle").boundingBox();
  await component.getByTestId("footer-toggle").click();
  const after = await component.getByTestId("footer-toggle").boundingBox();
  const panel = await component.getByTestId("footer-panel").boundingBox();
  if (!before || !after || !panel) throw new Error("everything must be laid out");

  expect(after.y).toBe(before.y);
  expect(panel.y, "the panel opens below the bar").toBeGreaterThanOrEqual(
    before.y + before.height - 1,
  );
});

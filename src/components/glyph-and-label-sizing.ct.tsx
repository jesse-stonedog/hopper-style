import { test, expect } from "@playwright/experimental-ct-react";
import StyledBox from "./StyledBox";
import StyledText from "./StyledText";
import StyledHeading from "./StyledHeading";
import StyledIcon from "./StyledIcon";
import StyledIconButton from "./StyledIconButton";
import { StonedogStyleProvider } from "../config/style-config";
import {
  StyledEditButton,
  StyledAnalyticsButton,
  StyledSaveButton,
  StyledDeleteButton,
  StyledAddButton,
  StyledSettingsButton,
} from "./intent-buttons";

/**
 * A control's glyph and its label must be PINNED, not inherited by accident.
 *
 * Both halves of that sentence produced a bug, and both are invisible to jest:
 *
 * - **NEH-290** — a two-letter label was dropped into a fixed 32px `StyledBox`
 *   at a font size of 32px. jsdom has no layout engine, so every element there
 *   reports a zero-sized box and it agrees the text fits. It does not; it is
 *   cropped on both axes.
 * - **NEH-182** — two intent buttons rendered side by side at different sizes,
 *   because one pinned its icon size internally and the other inherited the
 *   app-wide default. A class-name assertion cannot tell those apart.
 *
 * So everything below measures, in a real browser, at four viewports.
 */

/**
 * HopperGuard's font scale, inline.
 *
 * This package's fallbacks are the conventional web ramp (`md` = 1rem). The
 * host that hit NEH-290 pins the elder scale in its own `globals.css`, where
 * `md` is 1.375rem (22px) and `xl` is 2rem (32px) — and the 32px is half the
 * bug. Reproducing the numeric scale here is what makes these assertions about
 * the reported failure rather than about a smaller one that happens to fit.
 *
 * Inline JSX, not a local wrapper component: Playwright CT mounts by importing
 * the module a component lives in, so anything DEFINED IN A TEST FILE fails to
 * mount. A plain `<div>` has no such problem.
 */
const elderScale = {
  "--font-sizes-xs": "0.75rem",
  "--font-sizes-sm": "1.0625rem",
  "--font-sizes-md": "1.375rem",
  "--font-sizes-lg": "1.6875rem",
  "--font-sizes-xl": "2rem",
  "--font-sizes-2xl": "2.3125rem",
} as React.CSSProperties;

/**
 * Stand-ins for the host's artwork. Two visibly different glyphs on purpose —
 * registering one node for both intents would make the NEH-182 assertion
 * tautological.
 */
const pencil = (
  <StyledIcon
    icon={
      <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true">
        <path d="M2 14l1-4 8-8 3 3-8 8z" fill="currentColor" />
      </svg>
    }
  />
);

const chartLine = (
  <StyledIcon
    icon={
      <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true">
        <path d="M1 15V1h1v13h13v1z M4 11l3-4 3 2 4-6" fill="currentColor" />
      </svg>
    }
  />
);

const intentIcons = {
  edit: pencil,
  analytics: chartLine,
  save: pencil,
  delete: chartLine,
  add: pencil,
  settings: chartLine,
};

/* ------------------------------------------------------------------ *
 * NEH-290 — a fixed-size StyledBox crops, and a text label overflows it
 * ------------------------------------------------------------------ */

test.describe("a fixed-size StyledBox crops its children (NEH-290)", () => {
  /**
   * The mechanism half of NEH-290, asserted as a StyledBox contract.
   *
   * Without `noWrap`, StyledBox wraps children in a `StyledVStack` AND an inner
   * `div`, both `overflow: hidden`. So `h="32px" w="32px"` is not a hint about
   * preferred size — it is a hard crop, and anything larger is silently cut.
   * That is the half of the bug a font-size assertion alone would not catch,
   * and the half that would return the moment someone reintroduces a wrapper.
   *
   * Measured here, on the shape the app shipped: the inner clipping div is
   * 32x32 and its content is **41x58**, so 9px of the glyph is sliced off the
   * right and 26px off the vertical. "XL" is 40.9px wide at 32px bold.
   */
  test("32px text in a 32px box overflows on both axes and is clipped", async ({
    mount,
  }) => {
    const component = await mount(
      <div style={elderScale}>
        <StyledIconButton aria-label="Cycle text size">
          <StyledBox h="32px" w="32px" data-testid="crop-box">
            <StyledHeading size="lg">XL</StyledHeading>
          </StyledBox>
        </StyledIconButton>
      </div>,
    );

    const label = component.getByText("XL");

    // StyledHeading steps one tier up, so size="lg" renders `xl` = 2rem = 32px.
    // The trap recorded on the issue: changing "lg" to "md" renders `lg`
    // (27px) — smaller, still wider than the crop. Assert the number.
    const fontSize = await label.evaluate(
      (el) => getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("32px");

    const box = component.getByTestId("crop-box");

    /**
     * Check the box is really 32px before concluding anything about cropping.
     *
     * `h="32px"` is an ARBITRARY Panda value, and Panda extracts those by
     * statically parsing source at build time — including this file. Run the
     * suite without `pretest:ct` (`panda:build`) and the element still carries
     * `h_32px w_32px` with no rule behind it, so it sizes to content and
     * nothing crops. That failure mode is silent by nature, so name it.
     */
    const outer = await box.evaluate((el) => ({
      w: el.clientWidth,
      h: el.clientHeight,
    }));
    expect(
      outer,
      "the 32px box did not size — run panda:build so the arbitrary value is extracted",
    ).toEqual({ w: 32, h: 32 });

    const clipped = await box.evaluate((el) => {
      // The crop is on the descendants StyledBox inserts, not on the root, so
      // measure whichever element in the subtree actually hides overflow.
      const nodes = [el, ...Array.from(el.querySelectorAll("*"))];
      return nodes
        .filter((n) => getComputedStyle(n).overflow === "hidden")
        .map((n) => ({
          scrollWidth: n.scrollWidth,
          clientWidth: n.clientWidth,
          scrollHeight: n.scrollHeight,
          clientHeight: n.clientHeight,
        }));
    });

    // There is at least one overflow:hidden ancestor, and the label does not
    // fit inside it — horizontally and vertically.
    expect(clipped.length).toBeGreaterThan(0);
    expect(
      clipped.some((c) => c.scrollWidth > c.clientWidth),
      `no horizontal crop seen in ${JSON.stringify(clipped)}`,
    ).toBe(true);
    expect(
      clipped.some((c) => c.scrollHeight > c.clientHeight),
      `no vertical crop seen in ${JSON.stringify(clipped)}`,
    ).toBe(true);
  });
});

test.describe("an icon button's text label fits (NEH-290)", () => {
  /**
   * The fixed shape. `StyledText` + `fixedSize` pins the label at `md` with no
   * step-up and no dependence on the user's font-size profile — which matters
   * because this particular label exists to *display* that profile, so binding
   * it to the profile would make it grow with the very setting it reports.
   *
   * No wrapper box: `buttonIconRecipe` already centres content in a 48px
   * minimum, so the wrapper bought nothing except the crop.
   */
  test("a fixedSize label renders at md and is not clipped", async ({
    mount,
  }) => {
    const component = await mount(
      <div style={elderScale}>
        <StyledIconButton aria-label="Cycle text size">
          <StyledText fixedSize fontWeight="bold">
            XL
          </StyledText>
        </StyledIconButton>
      </div>,
    );

    const label = component.getByText("XL");

    // --font-sizes-md = 1.375rem = 22px on the elder scale.
    expect(await label.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
      "22px",
    );

    // Nothing between the label and the button crops it.
    const overflowing = await label.evaluate((el) => {
      let node: HTMLElement | null = el as HTMLElement;
      while (node && node.tagName !== "BUTTON") {
        if (
          getComputedStyle(node).overflow === "hidden" &&
          (node.scrollWidth > node.clientWidth ||
            node.scrollHeight > node.clientHeight)
        ) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    });
    expect(overflowing).toBe(false);

    // And the drawn text really is inside the button's box, not merely
    // un-cropped by an element that happens to be scrollable.
    const button = (await component.locator("button").boundingBox())!;
    const text = (await label.boundingBox())!;
    expect(text.x).toBeGreaterThanOrEqual(button.x - 0.5);
    expect(text.y).toBeGreaterThanOrEqual(button.y - 0.5);
    expect(text.x + text.width).toBeLessThanOrEqual(
      button.x + button.width + 0.5,
    );
    expect(text.y + text.height).toBeLessThanOrEqual(
      button.y + button.height + 0.5,
    );

    // The label shrinks to fit the button, never the reverse — the 48px floor
    // is the WCAG 2.5.5 target this audience needs (NEH-220, NEH-251).
    expect(button.height).toBeGreaterThanOrEqual(48);
    expect(button.width).toBeGreaterThanOrEqual(48);
  });

  /**
   * All five states, because the reported symptom was that cycling the profile
   * never changed the (equally clipped) label. `fixedSize` means the label is
   * the same size in all five; the assertion is that each of them FITS.
   */
  test("every profile initial fits, at every viewport", async ({ mount }) => {
    for (const initials of ["XS", "SM", "MD", "LG", "XL"]) {
      const component = await mount(
        <div style={elderScale}>
          <StyledIconButton aria-label="Cycle text size">
            <StyledText fixedSize fontWeight="bold">
              {initials}
            </StyledText>
          </StyledIconButton>
        </div>,
      );

      const label = component.getByText(initials);
      const fits = await label.evaluate((el) => {
        const parent = el.parentElement!;
        return (
          parent.scrollWidth <= parent.clientWidth &&
          parent.scrollHeight <= parent.clientHeight
        );
      });
      expect(fits, `${initials} must not be cropped`).toBe(true);
      await component.unmount();
    }
  });
});

/* ------------------------------------------------------ *
 * NEH-182 — the intent buttons all draw one icon size
 * ------------------------------------------------------ */

test.describe("intent buttons agree on icon size (NEH-182)", () => {
  /**
   * NEH-182 was Edit rendering larger than Analytics beside it, because
   * `StyledAnalyticsButton` pinned `size={size ?? "1x"}` on its glyph while
   * `StyledEditButton` inherited `StyledIcon`'s default. The registry move
   * (NEH-167) removed both hard-coded sizes: every intent button now draws
   * whatever the host registered, at the app-wide icon size.
   *
   * That is a *convention*, and a convention with nothing asserting it is how
   * the next pair drifts the same way. So this measures the whole family
   * rather than the two that were reported.
   */
  test("Edit and Analytics render the same size side by side", async ({
    mount,
  }) => {
    const component = await mount(
      <StonedogStyleProvider icons={intentIcons}>
        <StyledEditButton />
        <StyledAnalyticsButton />
      </StonedogStyleProvider>,
    );

    const boxes = await component.evaluate((root) =>
      Array.from(root.querySelectorAll("button span[aria-hidden]")).map((n) => {
        const r = n.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      }),
    );

    expect(boxes).toHaveLength(2);
    expect(boxes[0]).toEqual(boxes[1]);
    // The app-wide default is "2x" = 32px, and it is a real size rather than a
    // collapsed zero box.
    expect(boxes[0]!.w).toBe(32);
    expect(boxes[0]!.h).toBe(32);
  });

  /**
   * Every density, because `compact` switches these to icon-only. That is
   * exactly the state where a size divergence is most visible — there is no
   * label left to disguise it — and it is a state a reviewer at the default
   * density never sees.
   *
   * These are the three values the `density` PROP takes — a user preference
   * relative to whatever rung the host based on — not the rung names
   * (`compact`/`standard`/`spacious`/`airy`) that `densityBase` takes. Passing
   * a rung name here type-errors, and before it was caught it silently left the
   * icon-only path untested: the assertion still passed, on the labelled
   * rendering, three times over.
   */
  for (const density of ["compact", "normal", "comfortable"] as const) {
    test(`the whole family draws one icon size at ${density} density`, async ({
      mount,
    }) => {
      const component = await mount(
        <StonedogStyleProvider icons={intentIcons} density={density}>
          <StyledEditButton />
          <StyledAnalyticsButton />
          <StyledSaveButton />
          <StyledDeleteButton />
          <StyledAddButton />
          <StyledSettingsButton />
        </StonedogStyleProvider>,
      );

      // Prove the density actually took, rather than trusting the prop. An
      // ignored value here is not loud: the assertion below still passes, on
      // the labelled rendering, once per density.
      const labelled = await component.evaluate((root) =>
        Array.from(root.querySelectorAll("button")).filter(
          (b) => (b.textContent ?? "").trim().length > 0,
        ).length,
      );
      expect(labelled, `at ${density} density`).toBe(
        density === "compact" ? 0 : 6,
      );

      const sizes = await component.evaluate((root) =>
        Array.from(root.querySelectorAll("button span[aria-hidden]")).map(
          (n) => {
            const r = n.getBoundingClientRect();
            return `${Math.round(r.width)}x${Math.round(r.height)}`;
          },
        ),
      );

      expect(sizes).toHaveLength(6);
      expect(new Set(sizes).size, `saw ${sizes.join(", ")}`).toBe(1);

      // Tap targets survive the agreement — the floor is stated on the recipe
      // base so the glyph can shrink without the hit area following.
      const buttons = await component.locator("button").all();
      for (const button of buttons) {
        const box = (await button.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(48);
        expect(box.width).toBeGreaterThanOrEqual(48);
      }
    });
  }
});

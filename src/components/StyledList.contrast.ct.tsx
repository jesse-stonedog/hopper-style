import { test, expect } from "@playwright/experimental-ct-react";
import { ListHarness } from "./StyledList.harness";

/**
 * A surface that paints a background must also state its text colour.
 *
 * `listRecipe`'s `solid` variant set `bg: boxBgPrimary` and no `color`, so the
 * rows inherited whatever the page had. On a dark `boxBgPrimary` that is
 * dark-on-dark — the NEH-278 defect class, and completely unreadable.
 *
 * **No existing test could have caught it, including the browser tier**, because
 * every assertion so far asked about the properties a recipe *sets*. This one
 * asks about the property it *fails* to set, which only has an observable value
 * once a real engine has resolved inheritance. It was found by screenshotting
 * the component and looking, which is worth remembering: the tests were all
 * green and the component was illegible.
 *
 * `outline` and `none` are deliberately absent below — they paint no background,
 * so inheriting is correct there and pinning a colour would be the bug.
 */

const PAINTED_VARIANTS = ["solid", "matte"] as const;

test.describe("StyledList — text is paired with its surface", () => {
  for (const variant of PAINTED_VARIANTS) {
    test(`${variant} states a text colour rather than inheriting`, async ({
      mount,
    }) => {
      const component = await mount(<ListHarness variant={variant} />);

      const { color, background } = await component
        .locator("li")
        .first()
        .evaluate((el) => {
          const s = getComputedStyle(el);
          // The row is transparent; the surface is painted by the root.
          const root = el.parentElement!;
          return {
            color: s.color,
            background: getComputedStyle(root).backgroundColor,
          };
        });

      // The harness page is black-on-white. An inherited colour therefore comes
      // out as pure black, which is exactly the failure: it means the recipe
      // said nothing and the page decided.
      expect(color).not.toBe("rgb(0, 0, 0)");
      expect(color).not.toBe(background);
    });
  }

  test("the text is legible against the surface it sits on", async ({
    mount,
  }) => {
    // Not a full WCAG ratio — the harness theme is not a product theme, so an
    // exact threshold would pin this suite to one palette. This asserts the
    // thing that actually went wrong: text and surface at the same end of the
    // scale, which is what dark-on-dark and light-on-light both look like.
    const component = await mount(<ListHarness variant="solid" />);

    const luminances = await component
      .locator("li")
      .first()
      .evaluate((el) => {
        const parse = (v: string) =>
          (v.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
        // Rec. 709 relative luminance, close enough to rank light vs dark.
        const lum = (rgb: number[]) =>
          (0.2126 * (rgb[0] ?? 0) +
            0.7152 * (rgb[1] ?? 0) +
            0.0722 * (rgb[2] ?? 0)) /
          255;
        return {
          text: lum(parse(getComputedStyle(el).color)),
          surface: lum(
            parse(getComputedStyle(el.parentElement!).backgroundColor),
          ),
        };
      });

    // Light text on a dark surface, or dark on light — but not both the same.
    expect(Math.abs(luminances.text - luminances.surface)).toBeGreaterThan(0.3);
  });
});

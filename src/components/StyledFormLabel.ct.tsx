import { test, expect } from "@playwright/experimental-ct-react";
import type { Page } from "@playwright/test";
import StyledFormLabel from "./StyledFormLabel";

/**
 * The questions jsdom cannot answer about a label: what colour it actually
 * paints, and what a screen reader would actually call the field.
 *
 * Runs at all four viewports (see playwright-ct.config.ts), which is the point
 * for the wrapping assertion — a long label is fine at 1920 and wraps at 375.
 *
 * **Note the property names.** They are not derived from the token names:
 * `textPrimary` is `--hopper-box-primary-text`, not `--hopper-text-primary`.
 * Guessing produced three tests that failed for five seconds each while
 * Playwright retried a colour that was never going to change — which is the
 * same trap the package documents for consumers, met from the inside.
 * `semantic-variables.ts` is the map.
 */

/**
 * Re-theme by redefining a custom property at `:root`, which is where a host
 * defines them.
 *
 * It has to be `:root` and not a wrapper div, and the reason is worth knowing.
 * Panda declares its own token variable there —
 * `--hopper-colors-text-error: var(--hopper-text-error-text)` — and a custom
 * property's value is substituted at the element that DECLARES it. So the
 * indirection is already resolved by the time anything inherits it, and
 * overriding the theme property further down the tree changes nothing. The
 * first version of these tests did exactly that and spent five seconds each
 * retrying a colour that was never going to move.
 */
const retheme = (page: Page, property: string, value: string) =>
  page.addStyleTag({ content: `:root { ${property}: ${value}; }` });

test.describe("StyledFormLabel", () => {
  test("paints the required marker from a token", async ({ mount, page }) => {
    // The strong version of "it uses a token" is that changing the token
    // changes the pixels. A hardcoded `#e53e3e` would sail through every other
    // check in this repo.
    const component = await mount(<StyledFormLabel required>Password</StyledFormLabel>);
    await retheme(page, "--hopper-text-error-text", "rgb(0, 128, 0)");
    await expect(component.locator("span[aria-hidden='true']")).toHaveCSS(
      "color",
      "rgb(0, 128, 0)",
    );
  });

  test("paints the optional marker from a token", async ({ mount, page }) => {
    const component = await mount(<StyledFormLabel optional>Middle name</StyledFormLabel>);
    await retheme(page, "--hopper-box-secondary-text", "rgb(0, 0, 255)");
    await expect(component.getByText("(optional)")).toHaveCSS(
      "color",
      "rgb(0, 0, 255)",
    );
  });

  test("paints the label text from a token", async ({ mount, page }) => {
    // This one had been painted by a dead Chakra property's fallback for as
    // long as Chakra had been gone.
    const component = await mount(<StyledFormLabel>Email address</StyledFormLabel>);
    await retheme(page, "--hopper-box-primary-text", "rgb(255, 0, 0)");
    // `component` IS the <label>.
    await expect(component).toHaveCSS("color", "rgb(255, 0, 0)");
  });

  test("the asterisk stays out of the accessible name", async ({ mount, page }) => {
    // A real browser applies the accessible-name spec, which excludes
    // aria-hidden content. "Password *" would break voice control: the user
    // says "Password" and nothing matches (WCAG 2.5.3).
    await mount(
      <>
        <StyledFormLabel htmlFor="pw" required>
          Password
        </StyledFormLabel>
        <input id="pw" type="password" />
      </>,
    );
    await expect(page.locator("#pw")).toHaveAccessibleName("Password");
  });

  test("the optional marker IS part of the accessible name", async ({ mount, page }) => {
    // The deliberate asymmetry: nothing else carries "optional", so it has to
    // be announced.
    await mount(
      <>
        <StyledFormLabel htmlFor="mn" optional>
          Middle name
        </StyledFormLabel>
        <input id="mn" />
      </>,
    );
    await expect(page.locator("#mn")).toHaveAccessibleName("Middle name (optional)");
  });

  test("clicking the label focuses the control", async ({ mount, page }) => {
    // The reason `htmlFor` matters: it turns the label into part of the target.
    await mount(
      <>
        <StyledFormLabel htmlFor="email">Email address</StyledFormLabel>
        <input id="email" />
      </>,
    );
    await page.getByText("Email address").click();
    await expect(page.locator("#email")).toBeFocused();
  });

  test("a long label wraps instead of overflowing", async ({ mount, page }) => {
    // Fails first at 375px, which is why this suite runs at four widths.
    const component = await mount(
      <div style={{ width: "100%" }}>
        <StyledFormLabel>
          What name would you like the care team to use when they greet you?
        </StyledFormLabel>
      </div>,
    );
    const box = await component.locator("label").boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
  });
});

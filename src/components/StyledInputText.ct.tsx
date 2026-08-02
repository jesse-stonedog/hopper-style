import { test, expect } from "@playwright/experimental-ct-react";
import { DictationField, ProfiledFields } from "./StyledInputText.harness";

/**
 * What jsdom cannot answer about a dictatable field: whether the buttons are
 * actually big enough to hit, whether they actually sit inside the field, and
 * whether the text actually clears them.
 *
 * The padding assertions are the point. jsdom will happily confirm that
 * `paddingRight: "5.5em"` was set and has no idea whether 5.5em is enough — and
 * "enough" is the only part that matters to someone reading their own dictated
 * text.
 *
 * Runs at all four viewports. The narrow one is where a 48px button inside a
 * 375px-wide field stops leaving room for anything else.
 */

const FIELDS = [
  { name: "single-line", multiline: false },
  { name: "textarea", multiline: true },
] as const;

for (const { name, multiline } of FIELDS) {
  test.describe(`dictation controls — ${name}`, () => {
    test("the mic meets the 48x48 target floor", async ({ mount }) => {
      // WCAG 2.5.5. These sit inside a field, where the temptation is to shrink
      // them so they do not crowd the text; the field pads itself instead.
      const component = await mount(<DictationField multiline={multiline} />);
      const box = await component.getByTestId("dictation-mic").boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(48);
      expect(box!.height).toBeGreaterThanOrEqual(48);
    });

    test("the mic sits inside the field, not beside it", async ({ mount }) => {
      const component = await mount(<DictationField multiline={multiline} />);
      const field = await component.getByTestId("field").boundingBox();
      const mic = await component.getByTestId("dictation-mic").boundingBox();
      expect(field).not.toBeNull();
      expect(mic).not.toBeNull();
      // Right edge of the mic is within the field's right edge.
      expect(mic!.x + mic!.width).toBeLessThanOrEqual(field!.x + field!.width + 1);
      expect(mic!.x).toBeGreaterThan(field!.x);
    });

    test("the value clears the buttons", async ({ mount, page }) => {
      // The assertion jsdom cannot make. Type a long value, then check the
      // field's text area stops before the mic starts — otherwise the user's
      // own words render underneath a button.
      const component = await mount(<DictationField multiline={multiline} />);
      const field = component.getByTestId("field");
      await field.fill("a value long enough to reach the trailing edge of the field");

      const padding = await field.evaluate(
        (el) => parseFloat(getComputedStyle(el).paddingRight),
      );
      const mic = await component.getByTestId("dictation-mic").boundingBox();
      const box = await field.boundingBox();
      const textEndsAt = box!.x + box!.width - padding;

      expect(textEndsAt).toBeLessThanOrEqual(mic!.x + 1);
      await expect(page.getByTestId("dictation-mic")).toBeVisible();
    });

    test("revealing redo widens the reserved room", async ({ mount }) => {
      const component = await mount(<DictationField multiline={multiline} />);
      const field = component.getByTestId("field");
      const before = await field.evaluate(
        (el) => parseFloat(getComputedStyle(el).paddingRight),
      );

      // Start, then stop — stopping produces a result, which reveals redo.
      await component.getByTestId("dictation-mic").click();
      await component.getByTestId("dictation-mic").click();
      await expect(component.getByTestId("dictation-redo")).toBeVisible();

      const after = await field.evaluate(
        (el) => parseFloat(getComputedStyle(el).paddingRight),
      );
      expect(after).toBeGreaterThan(before);
    });

    test("redo and the mic do not overlap", async ({ mount }) => {
      const component = await mount(<DictationField multiline={multiline} withRedo />);
      const redo = await component.getByTestId("dictation-redo").boundingBox();
      const mic = await component.getByTestId("dictation-mic").boundingBox();
      expect(redo!.x + redo!.width).toBeLessThanOrEqual(mic!.x + 1);
    });

    test("recording is signalled by more than colour", async ({ mount }) => {
      // Colour repaints for sighted users, aria-pressed carries it to everyone
      // else. Colour alone would leave the state invisible under achromatopsia
      // and silent to a screen reader.
      const component = await mount(<DictationField multiline={multiline} />);
      const mic = component.getByTestId("dictation-mic");

      const idleColour = await mic.evaluate((el) => getComputedStyle(el).color);
      await expect(mic).toHaveAttribute("aria-pressed", "false");

      await mic.click();

      await expect(mic).toHaveAttribute("aria-pressed", "true");
      const recordingColour = await mic.evaluate((el) => getComputedStyle(el).color);
      expect(recordingColour).not.toBe(idleColour);
    });

    test("is reachable and operable by keyboard", async ({ mount, page }) => {
      const component = await mount(<DictationField multiline={multiline} />);
      await component.getByTestId("field").focus();
      await page.keyboard.press("Tab");
      await expect(component.getByTestId("dictation-mic")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(component.getByTestId("dictation-mic")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    test("no adapter means no buttons and no reserved room", async ({ mount }) => {
      const component = await mount(
        <DictationField multiline={multiline} withoutDictation />,
      );
      await expect(component.getByTestId("dictation-mic")).toHaveCount(0);
      const padding = await component
        .getByTestId("field")
        .evaluate((el) => parseFloat(getComputedStyle(el).paddingRight));
      // Whatever the recipe's own padding is, it is nowhere near button-sized.
      // Bound left at 44 rather than raised with the floor: it only has to be
      // well below a button, and the stricter number keeps saying that.
      expect(padding).toBeLessThan(44);
    });

    test("an unsupported engine renders nothing", async ({ mount }) => {
      const component = await mount(
        <DictationField multiline={multiline} isSupported={false} />,
      );
      await expect(component.getByTestId("dictation-mic")).toHaveCount(0);
    });

    test("the field does not overflow the viewport", async ({ mount, page }) => {
      const component = await mount(<DictationField multiline={multiline} withRedo />);
      const box = await component.getByTestId("field").boundingBox();
      const viewport = page.viewportSize();
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    });
  });
}

test.describe("font size follows the app-wide profile", () => {
  // Unanswerable in jsdom: the declared value is `var(--font-sizes-xl, 2rem)`,
  // which jsdom rejects outright. A browser resolves it to pixels, so this
  // checks the thing that matters — the field is actually bigger — rather than
  // that a particular string was written.
  test("a larger profile renders larger text", async ({ mount }) => {
    // Both in ONE mount — a second mount() in the same test fails with
    // "container that already has a React root", and the symptom is a 20s
    // locator timeout rather than anything that names the real problem.
    const component = await mount(<ProfiledFields />);
    const px = (testId: string) =>
      component
        .getByTestId(testId)
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    expect(await px("field-xl")).toBeGreaterThan(await px("field-sm"));
  });
});

test.describe("textarea-specific placement", () => {
  test("the buttons pin to the top of a growing field", async ({ mount }) => {
    // A centred button drifts down as the textarea grows, ending up beside the
    // middle of the user's text with no relationship to anything.
    const component = await mount(<DictationField multiline />);
    const field = component.getByTestId("field");
    await field.evaluate((el) => {
      (el as HTMLTextAreaElement).style.height = "300px";
    });

    const box = await field.boundingBox();
    const mic = await component.getByTestId("dictation-mic").boundingBox();
    // Comfortably in the upper portion, rather than near the vertical middle.
    expect(mic!.y).toBeLessThan(box!.y + box!.height / 3);
  });
});

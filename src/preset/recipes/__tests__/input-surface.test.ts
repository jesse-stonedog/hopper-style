/**
 * A text input and a dropdown that sit next to each other in a form are one
 * object to the person filling it in. They must be identical apart from the
 * dropdown's indicator.
 *
 * They stopped being identical because `input-text.ts` and `input-dropdown.ts`
 * were copy-pasted and then maintained separately: the dropdown grew a
 * per-variant `borderColor`, the text input did not, and their borders
 * diverged at `outline`, `aurora`, and `glass` — `glass` being the app-wide
 * default. Nothing failed; the two files simply drifted, and the product got a
 * form whose controls did not match (NEH-84).
 *
 * These assertions fail on the pre-fix recipes. They exist so the next
 * copy-paste is caught by the gate rather than by a user noticing that one box is a
 * different colour from the box beside it.
 */
import { inputTextRecipe } from "../input-text";
import { inputDropdownRecipe } from "../input-dropdown";
import { inputSurfaceBase, inputSurfaceVariants } from "../input-surface";

type StyleObject = Record<string, unknown>;

const VARIANTS = [
  "solid",
  "outline",
  "aurora",
  "glass",
  "matte",
  "ghost",
  "none",
] as const;

/** The properties that decide whether two controls look like the same object. */
const SURFACE_KEYS = [
  "bg",
  "backgroundColor",
  "backgroundImage",
  "color",
  "borderColor",
  "borderWidth",
  "borderRadius",
  "border",
] as const;

function variantOf(
  recipe: { variants?: { variant?: Record<string, StyleObject> } },
  name: string,
): StyleObject {
  const v = recipe.variants?.variant?.[name];
  expect(v).toBeDefined();
  return v as StyleObject;
}

describe("input surface parity (NEH-84)", () => {
  it("both recipes are built from the shared base", () => {
    expect(inputTextRecipe.base).toBe(inputSurfaceBase);
    expect(inputDropdownRecipe.base).toBe(inputSurfaceBase);
  });

  it("both recipes offer the same variants", () => {
    const text = Object.keys(inputTextRecipe.variants?.variant ?? {}).sort();
    const dropdown = Object.keys(
      inputDropdownRecipe.variants?.variant ?? {},
    ).sort();

    expect(text).toEqual(dropdown);
    expect(text).toEqual([...VARIANTS].sort());
  });

  it.each(VARIANTS)(
    "text input and dropdown paint the same surface at %s",
    (name) => {
      const text = variantOf(inputTextRecipe, name);
      const dropdown = variantOf(inputDropdownRecipe, name);

      for (const key of SURFACE_KEYS) {
        expect({ variant: name, key, value: text[key] }).toEqual({
          variant: name,
          key,
          value: dropdown[key],
        });
      }
    },
  );

  it("every variant states its own background, colour, and border", () => {
    // The pre-fix bug was asymmetry, not a wrong value: the dropdown set
    // borderColor per variant and the text input inherited it from the base,
    // so the two disagreed while each looked self-consistent.
    for (const name of VARIANTS) {
      const v = inputSurfaceVariants[name] as StyleObject;
      const paints =
        "bg" in v || "backgroundColor" in v || "backgroundImage" in v;
      const borders = "borderColor" in v || "border" in v;

      expect({ variant: name, paints, borders }).toEqual({
        variant: name,
        paints: true,
        borders: true,
      });
    }
  });
});

describe("input surface base (NEH-84)", () => {
  it("keeps the 48px target size", () => {
    // WCAG 2.5.5 (AAA). Shrinking this is an accessibility regression, not a
    // style choice — see the UX & accessibility floor in CLAUDE.md.
    expect(inputSurfaceBase.minHeight).toBe("48px");
  });

  it("takes its padding from the density variable", () => {
    expect(String(inputSurfaceBase.padding)).toContain(
      "--panda-density-padding",
    );
  });

  it("uses a colour token rather than literal black", () => {
    // `color: "black"` was invisible only because every variant except `none`
    // overrode it. A control that falls through to the base must still be
    // legible in dark mode.
    expect(inputSurfaceBase.color).toBe("textPrimary");
  });
});

import { test, expect } from "@playwright/experimental-ct-react";
import StyledHStack from "./StyledHStack";

/**
 * NEH-288 — `alignItems` on StyledHStack was a no-op, and only a real browser
 * could say so.
 *
 * The generated `hstack` pattern hard-codes `alignItems: "center"` and spreads
 * the caller's remaining props over it. The component used to forward the prop
 * under the name `align`, which is not a Panda utility: it survived into `css()`
 * as an unknown key, emitted a class name with no rule behind it, and left the
 * hard-coded centre untouched. Every value — `baseline`, `stretch`,
 * `flex-start`, `flex-end` — laid out as `center`.
 *
 * That is invisible to jsdom, which has no layout engine and reports no computed
 * `align-items` worth reading, and it is invisible to a grep of the stylesheet:
 * Panda's static extractor harvests `alignItems="baseline"` off the JSX and
 * writes `.ai_baseline` into `styles.css`, so the rule looks present. The
 * element just never receives that class. Only the computed style disagrees,
 * which is why this assertion lives here.
 */

const ALIGNMENTS = ["flex-start", "flex-end", "baseline", "stretch", "center"] as const;

test("every alignItems value reaches the DOM as its own computed align-items", async ({
  mount,
}) => {
  // Written out literally rather than mapped over ALIGNMENTS: Panda extracts
  // styles by reading source text, so a value it can only know at runtime is a
  // different code path (covered below via `align`). This is the path a
  // consumer's own JSX takes.
  const component = await mount(
    <div>
      <StyledHStack data-testid="a-flex-start" alignItems="flex-start">
        <span>x</span>
      </StyledHStack>
      <StyledHStack data-testid="a-flex-end" alignItems="flex-end">
        <span>x</span>
      </StyledHStack>
      <StyledHStack data-testid="a-baseline" alignItems="baseline">
        <span>x</span>
      </StyledHStack>
      <StyledHStack data-testid="a-stretch" alignItems="stretch">
        <span>x</span>
      </StyledHStack>
      <StyledHStack data-testid="a-center" alignItems="center">
        <span>x</span>
      </StyledHStack>
    </div>,
  );

  const computed: string[] = [];
  for (const value of ALIGNMENTS) {
    computed.push(
      await component
        .getByTestId(`a-${value}`)
        .evaluate((node) => getComputedStyle(node).alignItems),
    );
  }

  // The pre-fix failure is exactly `["center", "center", "center", "center", "center"]`.
  expect(computed).toEqual([...ALIGNMENTS]);
  expect(new Set(computed).size).toBe(ALIGNMENTS.length);
});

test("alignItems changes where the children actually sit", async ({ mount }) => {
  // The computed style above could still be a lie if the class carried no rule.
  // This measures the consequence: with `flex-start` two differently-sized
  // children share a top edge; with `flex-end` they share a bottom edge.
  const rows = (
    <div>
      <StyledHStack data-testid="row-start" alignItems="flex-start">
        <span style={{ fontSize: "12px" }}>small</span>
        <span style={{ fontSize: "48px" }}>BIG</span>
      </StyledHStack>
      <StyledHStack data-testid="row-end" alignItems="flex-end">
        <span style={{ fontSize: "12px" }}>small</span>
        <span style={{ fontSize: "48px" }}>BIG</span>
      </StyledHStack>
    </div>
  );

  const component = await mount(rows);

  const boxes = async (testId: string) => {
    const row = component.getByTestId(testId);
    const small = (await row.getByText("small").boundingBox())!;
    const big = (await row.getByText("BIG").boundingBox())!;
    return { small, big };
  };

  const start = await boxes("row-start");
  const end = await boxes("row-end");

  // flex-start: top edges align, bottom edges do not.
  expect(start.small.y).toBeCloseTo(start.big.y, 0);
  expect(start.small.y + start.small.height).not.toBeCloseTo(
    start.big.y + start.big.height,
    0,
  );

  // flex-end: bottom edges align, top edges do not.
  expect(end.small.y + end.small.height).toBeCloseTo(end.big.y + end.big.height, 0);
  expect(end.small.y).not.toBeCloseTo(end.big.y, 0);
});

test("a value Panda's extractor never sees still has a rule behind it", async ({
  mount,
}) => {
  // `align` is a runtime rename — the extractor reads `align="baseline"` off the
  // JSX, finds no such utility, and generates nothing, yet the component emits
  // `ai_baseline`. That is the "class exists, rule does not" failure this
  // package keeps catching, and the preset's `staticCss` is what closes it.
  const alignment = ALIGNMENTS[2]; // baseline, chosen at runtime
  const component = await mount(
    <div>
      <StyledHStack data-testid="aliased" align={alignment}>
        <span>x</span>
      </StyledHStack>
    </div>,
  );

  const computed = await component
    .getByTestId("aliased")
    .evaluate((node) => getComputedStyle(node).alignItems);

  expect(computed).toBe("baseline");
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { requiredCssCustomProperties } from "../semantic-variables";

/**
 * The component tests render in a real browser against `playwright/theme.css`.
 * A token added to the preset but missing from that theme resolves to nothing,
 * so the element paints transparent — and a layout assertion still passes,
 * because an invisible box still has a bounding box.
 *
 * This fails the fast suite instead, at the moment the token is added.
 */
describe("the component-test theme", () => {
  const theme = readFileSync(
    join(__dirname, "..", "..", "..", "playwright", "theme.css"),
    "utf8",
  );

  it("defines every custom property the token contract requires", () => {
    const missing = requiredCssCustomProperties().filter(
      (prop) => !theme.includes(`${prop}:`),
    );
    expect(missing).toEqual([]);
  });

  it("defines nothing the contract does not require", () => {
    // A stale property left behind after a token is renamed reads as coverage
    // that is not really there.
    const required = new Set(requiredCssCustomProperties());
    // A capture group that did not participate is `undefined`; filtering keeps
    // the comparison honest rather than asserting the regex shape.
    const declared = [...theme.matchAll(/(--hopper-[a-z0-9-]+)\s*:/g)]
      .map((m) => m[1])
      .filter((name): name is string => name !== undefined);
    expect(declared.filter((p) => !required.has(p))).toEqual([]);
  });
});

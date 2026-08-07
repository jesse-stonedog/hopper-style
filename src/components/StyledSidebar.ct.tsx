import { test, expect } from "@playwright/experimental-ct-react";
import {
  SidebarBasic,
  SidebarScrolling,
  SidebarPaging,
  SidebarLongLabels,
  SidebarIconOnly,
} from "./StyledSidebar.harness";

/**
 * StyledSidebar in a real browser.
 *
 * Everything NEH-223 asks for that jsdom structurally cannot answer lives here:
 * target sizes, overflow, whether scroll mode scrolls, whether selection is
 * visible, and whether a keypress on a native button does what a keypress does.
 * The jest suite next door owns the wiring — which callback fired, which ARIA
 * attribute is set — and neither tier can stand in for the other.
 *
 * Worth stating plainly: jsdom reports every box as 0×0, so a "48px floor" test
 * there passes on a control that renders 12px tall. That is the whole reason
 * this file exists.
 */

/** The floors from PRD-0001 §A4: 48 everywhere, 60 for a tool row. */
const ITEM_FLOOR = 60;
const CONTROL_FLOOR = 48;

test.describe("target sizes", () => {
  test("every tool row clears the 60px row floor", async ({ mount }) => {
    const component = await mount(<SidebarBasic />);
    const rows = component.getByTestId(/^sidebar-item-/);
    const count = await rows.count();
    expect(count).toBe(4);

    for (let i = 0; i < count; i++) {
      const box = (await rows.nth(i).boundingBox())!;
      expect(box.height, `row ${i} fell under the row floor`).toBeGreaterThanOrEqual(ITEM_FLOOR);
      // Width is not the interesting axis for a full-width row, but a rail that
      // collapsed to nothing would still pass a height-only assertion.
      expect(box.width).toBeGreaterThanOrEqual(CONTROL_FLOOR);
    }
  });

  test("the help control clears the 48px floor and is not clipped by the row", async ({ mount, page }) => {
    const component = await mount(<SidebarBasic />);
    const help = component.getByRole("button", { name: "What does Calendar do?" });
    const box = (await help.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(CONTROL_FLOOR);
    expect(box.width).toBeGreaterThanOrEqual(CONTROL_FLOOR);

    // It sits beside a row that used to claim `width: 100%`, which pushed it
    // off the rail entirely at 375px. Assert it is actually inside.
    const rail = (await page.getByTestId("rail").boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(rail.x + rail.width + 1);
  });

  test("the pager and collapse controls clear the 48px floor", async ({ mount }) => {
    const component = await mount(<SidebarPaging />);
    for (const testId of ["sidebar-prev", "sidebar-next", "sidebar-collapse"]) {
      const box = (await component.getByTestId(testId).boundingBox())!;
      expect(box.height, `${testId} fell under the floor`).toBeGreaterThanOrEqual(CONTROL_FLOOR);
      expect(box.width, `${testId} fell under the floor`).toBeGreaterThanOrEqual(CONTROL_FLOOR);
    }
  });
});

test.describe("overflow", () => {
  test("scroll mode actually scrolls once the host constrains the height", async ({ mount }) => {
    // 30 tools in a 400px rail. Before this, nothing asserted that the scroll
    // container could scroll at all — the jest suite could only see that a pager
    // was absent, which is true of a rail that silently cuts tools off (§D17).
    const component = await mount(<SidebarScrolling />);
    const scroller = component.getByTestId("sidebar-scroll");

    const metrics = await scroller.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      overflowY: getComputedStyle(el).overflowY,
    }));

    expect(metrics.overflowY).toBe("auto");
    expect(metrics.clientHeight).toBeGreaterThan(0);
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);

    // And it moves. A container that reports overflow but refuses to scroll
    // hides the remaining tools just as completely.
    await scroller.evaluate((el) => el.scrollBy(0, 200));
    expect(await scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });

  test("paging shows a bounded page and never overflows the rail", async ({ mount, page }) => {
    const component = await mount(<SidebarPaging />);
    await expect(component.getByTestId("sidebar-page-status")).toHaveText("Page 1 of 8");
    await expect(component.getByTestId(/^sidebar-item-/)).toHaveCount(4);

    const rail = await page.getByTestId("rail").evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    // 1px of tolerance for sub-pixel rounding; anything more is a real spill.
    expect(rail.scrollWidth).toBeLessThanOrEqual(rail.clientWidth + 1);
  });

  test("a long tool name wraps instead of spilling out of the rail", async ({ mount, page }) => {
    // PRD §A3. `min-width: 0` on the label column is what makes this true —
    // a flex child defaults to `min-width: auto` and refuses to shrink below
    // its longest word, so the row grows and the rail scrolls sideways.
    const component = await mount(<SidebarLongLabels />);
    const rail = await page.getByTestId("rail").evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(rail.scrollWidth).toBeLessThanOrEqual(rail.clientWidth + 1);

    // It wrapped rather than being cut off: the row is taller than one line.
    const box = (await component.getByTestId("sidebar-item-long").boundingBox())!;
    expect(box.height).toBeGreaterThan(ITEM_FLOOR);
  });
});

test.describe("selection", () => {
  test("is drawn, and not by colour alone", async ({ mount }) => {
    const component = await mount(<SidebarBasic />);
    const read = (testId: string) =>
      component.getByTestId(testId).evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          borderColor: s.borderTopColor,
          background: s.backgroundColor,
          // The label carries the non-colour half of the signal.
          weight: getComputedStyle(el.querySelector("span span")!).fontWeight,
        };
      });

    const selected = await read("sidebar-item-calendar");
    const plain = await read("sidebar-item-notes");

    // The colours resolved — an unresolved token would leave these at the
    // initial value, which is exactly how `color: fg.muted` went unnoticed.
    expect(selected.borderColor).not.toBe(plain.borderColor);
    expect(selected.borderColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(selected.background).not.toBe(plain.background);
    expect(selected.background).not.toBe("rgba(0, 0, 0, 0)");

    // WCAG 1.4.1: greyscale, high contrast and colour blindness all keep this.
    expect(Number(selected.weight)).toBeGreaterThan(Number(plain.weight));
  });

  test("moves on Enter, so the rail is usable without a pointer", async ({ mount, page }) => {
    const component = await mount(<SidebarBasic />);
    await component.getByTestId("sidebar-item-notes").focus();
    await page.keyboard.press("Enter");
    await expect(component.getByTestId("sidebar-item-notes")).toHaveAttribute("aria-current", "true");
    await expect(component.getByTestId("sidebar-item-calendar")).not.toHaveAttribute("aria-current", "true");
  });
});

test.describe("keyboard", () => {
  test("tabs through every control in reading order", async ({ mount, page }) => {
    // §G24. The order matters as much as the reachability: a help control that
    // lands after the whole list is a help control nobody finds.
    const component = await mount(<SidebarBasic />);
    await component.getByTestId("sidebar-item-calendar").focus();

    await page.keyboard.press("Tab");
    await expect(component.getByRole("button", { name: "What does Calendar do?" })).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(component.getByTestId("sidebar-item-notes")).toBeFocused();
  });

  test("opens help with a keypress, closes it with Escape, and gives focus back", async ({ mount, page }) => {
    // §B7. Escape has to work or a keyboard user is stuck with the panel open;
    // focus has to return or they resume at the top of the document.
    const component = await mount(<SidebarBasic />);
    const help = component.getByRole("button", { name: "What does Calendar do?" });

    await help.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("tooltip")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(help).toBeFocused();
  });

  test("shows a focus indicator that is not just the cursor", async ({ mount }) => {
    // A rail operated by keyboard with no visible focus ring is unusable for
    // exactly the readers this component is built for.
    const component = await mount(<SidebarBasic />);
    const row = component.getByTestId("sidebar-item-tasks");
    await row.focus();
    const outline = await row.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(outline.style).not.toBe("none");
    expect(outline.width).toBeGreaterThan(0);
  });
});

/**
 * The §20a icon-only rail.
 *
 * jsdom said the labels are gone and the aria-label is present, which is the
 * wiring. It cannot say whether the rail actually got narrower — its whole
 * point — nor whether an item stripped of its label still presents a target a
 * shaky hand can hit. Both are only answerable here.
 */
test.describe("icon-only collapse (§20a)", () => {
  test("survives a rail too narrow for labels — the component does NOT narrow itself", async ({
    mount,
  }) => {
    // The finding this test exists to pin. `iconOnlyWhenCollapsed` recovers NO
    // horizontal space on its own: the sidebar fills whatever width the host
    // gives it, so a host that flips the flag and leaves its container at 260px
    // has given up the visible names for nothing — silently, with no build
    // error. Narrowing the container is the host's half.
    //
    // So what the component owes is weaker and testable: it must survive being
    // narrowed. Nothing inside may force a minimum width that makes a 72px rail
    // overflow.
    // `component` IS the rail — it is the harness's root element, so looking
    // for the rail's testid *inside* it finds nothing and times out.
    const component = await mount(<SidebarIconOnly />);
    const rail = (await component.boundingBox())!;
    const sidebar = (await component.getByTestId("styled-sidebar").boundingBox())!;

    expect(rail.width).toBeLessThanOrEqual(80);
    expect(
      sidebar.width,
      "the sidebar overflowed a rail narrow enough to be worth collapsing for",
    ).toBeLessThanOrEqual(rail.width + 1);
  });

  test("keeps a hittable target after losing the label", async ({ mount }) => {
    const component = await mount(<SidebarIconOnly />);
    const rows = component.getByTestId(/^sidebar-item-/);
    const count = await rows.count();
    expect(count).toBe(4);

    for (let i = 0; i < count; i++) {
      const box = (await rows.nth(i).boundingBox())!;
      // The row floor still applies: the label was what gave these rows their
      // width, so this is exactly where a target quietly collapses to the size
      // of a glyph.
      expect(box.height, `row ${i} fell under the row floor`).toBeGreaterThanOrEqual(ITEM_FLOOR);
      expect(box.width, `row ${i} fell under the control floor`).toBeGreaterThanOrEqual(
        CONTROL_FLOOR,
      );
    }
  });

  test("expanding brings the names back", async ({ mount }) => {
    const component = await mount(<SidebarIconOnly />);
    await expect(component.getByText("Calendar")).toBeHidden();

    await component.getByTestId("sidebar-collapse").click();

    // Uncontrolled, so the component owns this — a host that only wanted
    // "start collapsed" must not end up with a rail it cannot open.
    await expect(component.getByText("Calendar")).toBeVisible();
  });
});

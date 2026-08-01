import { defineConfig, devices } from "@playwright/experimental-ct-react";

/**
 * Component tests — real browsers, real CSS, real layout.
 *
 * The jest suite renders into jsdom, which has **no layout engine**: it will
 * happily report that a 400px sidebar and a 400px panel both fit inside a
 * 375px viewport. Every question this design system actually has to answer —
 * does this wrap, does it overflow, is the tap target big enough, does the
 * recipe's `_hover` fire — is invisible there.
 *
 * So the two suites own different failure modes and neither replaces the other:
 *
 * | jest (jsdom)                    | Playwright CT (Chromium/WebKit)     |
 * |---------------------------------|-------------------------------------|
 * | props, wiring, ARIA, callbacks  | computed styles, layout, overflow   |
 * | fast, runs on every save        | slower, catches what jsdom cannot    |
 *
 * Component testing rather than a demo app: this is a library with no pages,
 * and standing up a Next app just to click a button would test the app as much
 * as the component.
 */

/**
 * The viewport matrix.
 *
 * Chosen as the boundaries where layout actually breaks, not as a list of
 * popular phones:
 *
 * - **iphone-se** (375×667) — the narrowest screen still in meaningful use, and
 *   the one this audience is most likely to hold. If a control wraps or
 *   overflows anywhere, it does so here first.
 * - **tablet** (768×1024) — exactly the `md` breakpoint, so it catches an
 *   off-by-one in a responsive prop that both neighbours would hide.
 * - **laptop** (1280×800) — the `xl` breakpoint and the commonest desktop size.
 * - **desktop-wide** (1920×1080) — where max-width and centering bugs show up;
 *   a component that looks fine at 1280 can stretch absurdly here.
 *
 * `3xl` (1600px) is deliberately not its own project: it sits between laptop and
 * desktop-wide and nothing in the system changes at it that 1920 does not also
 * exercise. Add it the day a component uses that breakpoint.
 */
export const VIEWPORTS = {
  "iphone-se": { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  "desktop-wide": { width: 1920, height: 1080 },
} as const;

export default defineConfig({
  testDir: "./src",
  testMatch: "**/*.ct.tsx",
  // Component tests mount in-process; a long timeout hides a hang rather than
  // tolerating a slow machine.
  timeout: 20_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],

  use: {
    trace: "retain-on-failure",
    ctPort: 3101,
  },

  projects: Object.entries(VIEWPORTS).map(([name, viewport]) => ({
    name,
    use: { ...devices["Desktop Chrome"], viewport },
  })),
});

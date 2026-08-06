import { execFileSync } from "node:child_process"
import path from "node:path"

/**
 * What actually ships to npm (NEH-370).
 *
 * This asserts `npm pack`'s own listing, NOT the `files` array in
 * package.json. That distinction is the whole point of the test: `files`
 * accepts negation patterns, npm decides what they mean, and the file listing
 * is the only place the real contents ever appear. A test that read the array
 * back would agree with a pattern npm silently ignored.
 *
 * The thing being guarded is not the bytes. A consumer's Panda run parses
 * whatever its `include` glob matches inside this package, so every file we
 * ship that nobody imports is a file some consumer has to write an `exclude`
 * for — and an `exclude` that is subtly wrong is silent, the same failure
 * class as the include glob that matched nothing in optima-cloud-saas#25.
 */
describe("the published tarball", () => {
  const repoRoot = path.resolve(__dirname, "../..")

  // `--ignore-scripts` skips the `prepare` hook (panda codegen). The hook
  // generates styled-system/, which is not in `files` and so cannot change
  // this listing — running it would cost seconds per suite and prove nothing.
  const listing: string[] = (() => {
    const raw = execFileSync(
      "npm",
      ["pack", "--dry-run", "--json", "--ignore-scripts"],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    )
    // npm prints notices before the JSON even on a clean run.
    const parsed = JSON.parse(raw.slice(raw.indexOf("[")))
    return parsed[0].files.map((f: { path: string }) => f.path)
  })()

  it.each([
    ["unit tests", (f: string) => f.includes("__tests__/")],
    ["Playwright component tests", (f: string) => f.endsWith(".ct.tsx")],
    ["component-test harnesses", (f: string) => f.endsWith(".harness.tsx")],
  ])("ships no %s", (_label, matches) => {
    expect(listing.filter(matches)).toEqual([])
  })

  // The negations above are broad enough to take the package with them if one
  // is mistyped, and an empty tarball publishes perfectly happily.
  it("still ships both entry points and the licence files", () => {
    expect(listing).toEqual(
      expect.arrayContaining([
        "src/index.ts",
        "src/preset/index.ts",
        "LICENSE",
        "NOTICE",
        "README.md",
      ]),
    )
  })

  it("still ships the components a consumer imports", () => {
    const components = listing.filter(
      (f) => f.startsWith("src/components/") && f.endsWith(".tsx"),
    )
    // 40 at the time of writing. A floor rather than an exact count, so adding
    // a component does not fail this; the point is that the negations did not
    // sweep the directory.
    expect(components.length).toBeGreaterThanOrEqual(30)
  })
})

import React from "react";
import StyledList from "./StyledList";
import StyledSparkLine from "./StyledSparkLine";

/**
 * Mount targets for StyledList.ct.tsx.
 *
 * These live here rather than in the test file because Playwright CT cannot
 * mount a component declared inside the spec — the mount call is hoisted and
 * evaluated in the browser bundle, which never sees the test module's scope.
 */

/** Three rows, optionally gapped. */
export function ListHarness({ gap }: { gap?: string | undefined }) {
  return (
    <StyledList.Root gap={gap}>
      <StyledList.Item>Blood pressure</StyledList.Item>
      <StyledList.Item>Weight</StyledList.Item>
      <StyledList.Item>Temperature</StyledList.Item>
    </StyledList.Root>
  );
}

/** One direct row and one inside a fragment — the case cloning used to break. */
export function ListFragmentHarness() {
  return (
    <StyledList.Root>
      <StyledList.Item>Direct</StyledList.Item>
      <>
        <StyledList.Item>Fragmented</StyledList.Item>
      </>
    </StyledList.Root>
  );
}

/** A row long enough to overflow a 375px viewport if box-sizing is wrong. */
export function ListOverflowHarness() {
  return (
    <StyledList.Root>
      <StyledList.Item>
        A row with enough text in it to want more width than an iPhone SE has
        available to give, which is where a border-box mistake shows up first
      </StyledList.Item>
    </StyledList.Root>
  );
}

/** A sparkline inside a flex row — where a shrinking svg collapses. */
export function ListWithSparkLineHarness() {
  return (
    <StyledList.Root>
      <StyledList.Item>
        Blood pressure <StyledSparkLine data={[1, 4, 2, 8]} label="Trend" />
      </StyledList.Item>
    </StyledList.Root>
  );
}

export default ListHarness;

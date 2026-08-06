import React from "react";
import StyledDefinitionList from "./StyledDefinitionList";

/**
 * Mount target for StyledDefinitionList.ct.tsx.
 *
 * Here rather than in the spec because Playwright CT cannot mount a component
 * declared inside the test file.
 */
export function DefinitionListHarness() {
  return (
    <StyledDefinitionList.Root>
      <StyledDefinitionList.Term>Admitted</StyledDefinitionList.Term>
      <StyledDefinitionList.Definition>4 March</StyledDefinitionList.Definition>
      <StyledDefinitionList.Term>Discharged</StyledDefinitionList.Term>
      <StyledDefinitionList.Definition>11 March</StyledDefinitionList.Definition>
    </StyledDefinitionList.Root>
  );
}

export default DefinitionListHarness;
